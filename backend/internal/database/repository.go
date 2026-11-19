package database

import (
	"context"
	"log"
	"time"
	"v-nms/internal/models"

	"golang.org/x/crypto/bcrypt"
)

// GetAllDevices loads all devices from PostgreSQL
func GetAllDevices() ([]models.Device, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := Pool.Query(ctx, `
		SELECT id, hostname, ip_address, snmp_version, snmp_community, snmp_port, 
		       COALESCE(os, ''), COALESCE(version, ''), COALESCE(hardware, ''), 
		       COALESCE(sys_name, ''), COALESCE(sys_descr, ''), COALESCE(location, ''), 
		       COALESCE(device_type, 'server'), COALESCE(vendor, 'Generic'), COALESCE(mac_address, ''),
		       status, last_ping_ms, last_polled_at, uptime_seconds, created_at, updated_at
		FROM devices 
		ORDER BY CASE 
			WHEN ip_address ~ '^([0-9]{1,3}\.){3}[0-9]{1,3}$' 
			THEN string_to_array(ip_address, '.')::int[] 
			ELSE ARRAY[999,999,999,999] 
		END ASC, id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	devices := make([]models.Device, 0)
	for rows.Next() {
		var d models.Device
		err := rows.Scan(
			&d.ID, &d.Hostname, &d.IPAddress, &d.SNMPVersion, &d.SNMPCommunity, &d.SNMPPort,
			&d.OS, &d.Version, &d.Hardware,
			&d.SysName, &d.SysDescr, &d.Location,
			&d.DeviceType, &d.Vendor, &d.MACAddress,
			&d.Status, &d.LastPingMs, &d.LastPolledAt, &d.UptimeSeconds, &d.CreatedAt, &d.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		devices = append(devices, d)
	}
	return devices, nil
}

// UpsertDiscoveredDevice inserts or updates a discovered device by IP address
func UpsertDiscoveredDevice(d *models.Device) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var existingID int
	err := Pool.QueryRow(ctx, "SELECT id FROM devices WHERE ip_address = $1 LIMIT 1", d.IPAddress).Scan(&existingID)
	if err == nil && existingID > 0 {
		updateQuery := `
			UPDATE devices 
			SET hostname = $1, os = $2, hardware = $3, location = $4, 
			    device_type = $5, vendor = $6, mac_address = $7, status = $8, 
			    last_ping_ms = $9, last_polled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
			WHERE id = $10
		`
		_, updateErr := Pool.Exec(ctx, updateQuery, d.Hostname, d.OS, d.Hardware, d.Location, d.DeviceType, d.Vendor, d.MACAddress, d.Status, d.LastPingMs, existingID)
		return existingID, updateErr
	}

	insertQuery := `
		INSERT INTO devices (hostname, ip_address, snmp_version, snmp_community, snmp_port, os, hardware, location, device_type, vendor, mac_address, status, last_ping_ms, last_polled_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
		RETURNING id
	`
	var newID int
	insertErr := Pool.QueryRow(ctx, insertQuery,
		d.Hostname, d.IPAddress, d.SNMPVersion, d.SNMPCommunity, d.SNMPPort, d.OS, d.Hardware, d.Location, d.DeviceType, d.Vendor, d.MACAddress, d.Status, d.LastPingMs,
	).Scan(&newID)
	return newID, insertErr
}

// InsertDevice inserts a new device into PostgreSQL with all categorization metadata
func InsertDevice(d *models.Device) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if d.DeviceType == "" {
		d.DeviceType = "server"
	}
	if d.Vendor == "" {
		d.Vendor = "Generic"
	}
	if d.SNMPVersion == "" {
		d.SNMPVersion = "v2c"
	}
	if d.SNMPCommunity == "" {
		d.SNMPCommunity = "public"
	}
	if d.SNMPPort == 0 {
		d.SNMPPort = 161
	}

	query := `
		INSERT INTO devices (
			hostname, ip_address, snmp_version, snmp_community, snmp_port, 
			os, hardware, location, device_type, vendor, mac_address, status, last_ping_ms, last_polled_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
		RETURNING id, created_at, updated_at
	`
	err := Pool.QueryRow(ctx, query,
		d.Hostname, d.IPAddress, d.SNMPVersion, d.SNMPCommunity, d.SNMPPort,
		d.OS, d.Hardware, d.Location, d.DeviceType, d.Vendor, d.MACAddress, d.Status, d.LastPingMs,
	).Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
	return err
}

// UpdateDeviceStatus updates ping/uptime and live status
func UpdateDeviceStatus(id int, status bool, latency float64, uptime int64, sysDescr string, sysName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		UPDATE devices 
		SET status = $1, last_ping_ms = $2, uptime_seconds = $3, 
		    sys_descr = CASE WHEN $4 != '' THEN $4 ELSE sys_descr END,
		    sys_name = CASE WHEN $5 != '' THEN $5 ELSE sys_name END,
		    last_polled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
		WHERE id = $6
	`
	_, err := Pool.Exec(ctx, query, status, latency, uptime, sysDescr, sysName, id)
	return err
}

// InsertMetric stores time-series measurement into partitioned device_metrics table
func InsertMetric(deviceID int, metricType string, val1 float64, val2 float64) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO device_metrics (device_id, metric_type, val_1, val_2, recorded_at)
		VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
	`
	_, err := Pool.Exec(ctx, query, deviceID, metricType, val1, val2)
	return err
}

// GetRecentMetrics fetches recent data points for device charts
func GetRecentMetrics(deviceID int, metricType string, limit int) ([]models.MetricPoint, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT device_id, metric_type, val_1, val_2, recorded_at 
		FROM device_metrics 
		WHERE device_id = $1 AND metric_type = $2 
		ORDER BY recorded_at DESC LIMIT $3
	`
	rows, err := Pool.Query(ctx, query, deviceID, metricType, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var points []models.MetricPoint
	for rows.Next() {
		var p models.MetricPoint
		if err := rows.Scan(&p.DeviceID, &p.MetricType, &p.Val1, &p.Val2, &p.RecordedAt); err != nil {
			return nil, err
		}
		points = append(points, p)
	}
	// reverse to chronological order
	for i, j := 0, len(points)-1; i < j; i, j = i+1, j-1 {
		points[i], points[j] = points[j], points[i]
	}
	return points, nil
}

// InsertAlert creates an active alert record in PostgreSQL
func InsertAlert(deviceID int, severity string, ruleName string, message string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Check if active alert already exists to prevent duplicate spam
	var existingID int
	checkQuery := `
		SELECT id FROM alerts 
		WHERE device_id = $1 AND rule_name = $2 AND status = 'active'
		LIMIT 1
	`
	err := Pool.QueryRow(ctx, checkQuery, deviceID, ruleName).Scan(&existingID)
	if err == nil && existingID > 0 {
		return nil // Alert already active
	}

	insertQuery := `
		INSERT INTO alerts (device_id, severity, rule_name, message, status, fired_at)
		VALUES ($1, $2, $3, $4, 'active', CURRENT_TIMESTAMP)
	`
	_, err = Pool.Exec(ctx, insertQuery, deviceID, severity, ruleName, message)
	return err
}

// ClearAlert marks active alerts as cleared
func ClearAlert(deviceID int, ruleName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		UPDATE alerts 
		SET status = 'cleared', resolved_at = CURRENT_TIMESTAMP 
		WHERE device_id = $1 AND rule_name = $2 AND status = 'active'
	`
	_, err := Pool.Exec(ctx, query, deviceID, ruleName)
	return err
}

// AcknowledgeAlert marks an active alert as acknowledged
func AcknowledgeAlert(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `UPDATE alerts SET status = 'acknowledged' WHERE id = $1`
	_, err := Pool.Exec(ctx, query, id)
	return err
}

// ResolveAlertByID marks an alert as cleared / resolved
func ResolveAlertByID(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `UPDATE alerts SET status = 'cleared', resolved_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err := Pool.Exec(ctx, query, id)
	return err
}

// GetActiveAlerts fetches all current active alerts
func GetActiveAlerts() ([]models.Alert, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, device_id, severity, rule_name, message, status, fired_at, resolved_at 
		FROM alerts 
		ORDER BY id DESC LIMIT 50
	`
	rows, err := Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []models.Alert
	for rows.Next() {
		var a models.Alert
		if err := rows.Scan(&a.ID, &a.DeviceID, &a.Severity, &a.RuleName, &a.Message, &a.Status, &a.FiredAt, &a.ResolvedAt); err != nil {
			return nil, err
		}
		alerts = append(alerts, a)
	}
	return alerts, nil
}

// UpsertPorts batch-inserts or updates network ports for a device
func UpsertPorts(deviceID int, ports []models.Port) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		INSERT INTO ports (
			device_id, if_index, if_name, if_descr, if_alias, if_type, if_speed, 
			if_oper_status, if_admin_status, if_in_octets, if_out_octets, 
			last_polled_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
		)
		ON CONFLICT (device_id, if_index) DO UPDATE SET
			if_name = EXCLUDED.if_name,
			if_descr = EXCLUDED.if_descr,
			if_speed = EXCLUDED.if_speed,
			if_oper_status = EXCLUDED.if_oper_status,
			if_in_octets = EXCLUDED.if_in_octets,
			if_out_octets = EXCLUDED.if_out_octets,
			last_polled_at = CURRENT_TIMESTAMP,
			updated_at = CURRENT_TIMESTAMP
	`
	for _, p := range ports {
		_, _ = Pool.Exec(ctx, query,
			deviceID, p.IfIndex, p.IfName, p.IfDescr, p.IfAlias, p.IfType, p.IfSpeed,
			p.IfOperStatus, p.IfAdminStatus, p.IfInOctets, p.IfOutOctets,
		)
	}
	return nil
}

// GetDevicePorts retrieves all ports for a specific device
func GetDevicePorts(deviceID int) ([]models.Port, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, device_id, if_index, COALESCE(if_name, ''), COALESCE(if_descr, ''), 
		       COALESCE(if_alias, ''), COALESCE(if_type, ''), if_speed, 
		       if_oper_status, if_admin_status, if_in_octets, if_out_octets, 
		       if_in_errors, if_out_errors, if_in_rate_bps, if_out_rate_bps, 
		       last_polled_at, created_at, updated_at
		FROM ports 
		WHERE device_id = $1 
		ORDER BY if_index ASC
	`
	rows, err := Pool.Query(ctx, query, deviceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ports []models.Port
	for rows.Next() {
		var p models.Port
		err := rows.Scan(
			&p.ID, &p.DeviceID, &p.IfIndex, &p.IfName, &p.IfDescr,
			&p.IfAlias, &p.IfType, &p.IfSpeed,
			&p.IfOperStatus, &p.IfAdminStatus, &p.IfInOctets, &p.IfOutOctets,
			&p.IfInErrors, &p.IfOutErrors, &p.IfInRateBps, &p.IfOutRateBps,
			&p.LastPolledAt, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		ports = append(ports, p)
	}
	return ports, nil
}

// GetUserByUsernameOrEmail finds a user by username or email
func GetUserByUsernameOrEmail(identifier string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, username, email, password_hash, role, 
		       COALESCE(full_name, ''), COALESCE(phone, ''), COALESCE(department, ''),
		       created_at, updated_at
		FROM users
		WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
		LIMIT 1
	`
	var u models.User
	err := Pool.QueryRow(ctx, query, identifier).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Role,
		&u.FullName, &u.Phone, &u.Department,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// GetUserByIdentifier finds a user by username, email, or mobile phone
func GetUserByIdentifier(identifier string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, username, email, password_hash, role, 
		       COALESCE(full_name, ''), COALESCE(phone, ''), COALESCE(department, ''),
		       created_at, updated_at
		FROM users
		WHERE LOWER(username) = LOWER($1) 
		   OR LOWER(email) = LOWER($1) 
		   OR phone = $1 
		   OR REPLACE(REPLACE(phone, ' ', ''), '-', '') = REPLACE(REPLACE($1, ' ', ''), '-', '')
		   OR (LENGTH($1) >= 10 AND RIGHT(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', ''), 10) = RIGHT(REPLACE(REPLACE(REPLACE($1, ' ', ''), '-', ''), '+', ''), 10))
		LIMIT 1
	`
	var u models.User
	err := Pool.QueryRow(ctx, query, identifier).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Role,
		&u.FullName, &u.Phone, &u.Department,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// UpdateUserPassword updates the password hash for a given user ID
func UpdateUserPassword(userID int, newPasswordHash string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
	_, err := Pool.Exec(ctx, query, newPasswordHash, userID)
	return err
}

// UpdateUserProfile updates user contact and profile information
func UpdateUserProfile(id int, email, phone, fullName, department, role string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		UPDATE users 
		SET email = COALESCE(NULLIF($1, ''), email),
		    phone = COALESCE(NULLIF($2, ''), phone),
		    full_name = COALESCE(NULLIF($3, ''), full_name),
		    department = COALESCE(NULLIF($4, ''), department),
		    role = COALESCE(NULLIF($5, ''), role),
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $6
	`
	_, err := Pool.Exec(ctx, query, email, phone, fullName, department, role, id)
	return err
}

// CreatePasswordResetOTP stores a 6-digit OTP code in PostgreSQL for mobile and email verification
func CreatePasswordResetOTP(userID int, otpCode string, method string, destination string, duration time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Invalidate previous active OTPs for this user
	_, _ = Pool.Exec(ctx, "UPDATE password_resets SET used = true WHERE user_id = $1 AND used = false", userID)

	expiresAt := time.Now().Add(duration)
	query := `
		INSERT INTO password_resets (user_id, otp_code, method, destination, expires_at, used, created_at)
		VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)
	`
	_, err := Pool.Exec(ctx, query, userID, otpCode, method, destination, expiresAt)
	return err
}

// VerifyPasswordResetOTP validates whether the submitted OTP code is valid and unexpired
func VerifyPasswordResetOTP(userID int, otpCode string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id FROM password_resets 
		WHERE user_id = $1 AND otp_code = $2 AND used = false AND expires_at > CURRENT_TIMESTAMP
		ORDER BY id DESC LIMIT 1
	`
	var resetID int
	err := Pool.QueryRow(ctx, query, userID, otpCode).Scan(&resetID)
	if err != nil {
		return false, nil // Invalid or expired
	}

	// Mark used
	_, _ = Pool.Exec(ctx, "UPDATE password_resets SET used = true WHERE id = $1", resetID)
	return true, nil
}

// GetUserByID retrieves a user by their primary key
func GetUserByID(id int) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, username, email, password_hash, role, 
		       COALESCE(full_name, ''), COALESCE(phone, ''), COALESCE(department, ''),
		       created_at, updated_at
		FROM users
		WHERE id = $1
		LIMIT 1
	`
	var u models.User
	err := Pool.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Role,
		&u.FullName, &u.Phone, &u.Department,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// GetAllUsers lists all registered system users
func GetAllUsers() ([]models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, username, email, role, 
		       COALESCE(full_name, ''), COALESCE(phone, ''), COALESCE(department, ''),
		       created_at, updated_at
		FROM users
		ORDER BY id ASC
	`
	rows, err := Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(
			&u.ID, &u.Username, &u.Email, &u.Role,
			&u.FullName, &u.Phone, &u.Department,
			&u.CreatedAt, &u.UpdatedAt,
		); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// CreateUser inserts a new user record
func CreateUser(u *models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO users (username, email, password_hash, role, full_name, phone, department, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		RETURNING id, created_at, updated_at
	`
	return Pool.QueryRow(ctx, query, u.Username, u.Email, u.PasswordHash, u.Role, u.FullName, u.Phone, u.Department).
		Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
}

// DeleteUser removes a user by ID
func DeleteUser(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := Pool.Exec(ctx, "DELETE FROM users WHERE id = $1", id)
	return err
}

// GetAllAlertRecipients retrieves all configured notification recipients with their subscriptions
func GetAllAlertRecipients() ([]models.AlertRecipient, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, name, email, phone, COALESCE(department, ''), COALESCE(role, ''), COALESCE(on_call_status, 'active'), created_at
		FROM alert_recipients
		ORDER BY id ASC
	`
	rows, err := Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recipients []models.AlertRecipient
	for rows.Next() {
		var r models.AlertRecipient
		if err := rows.Scan(&r.ID, &r.Name, &r.Email, &r.Phone, &r.Department, &r.Role, &r.OnCallStatus, &r.CreatedAt); err != nil {
			return nil, err
		}
		recipients = append(recipients, r)
	}

	// Fetch subscriptions for each recipient
	for i := range recipients {
		subs, err := GetRecipientSubscriptions(recipients[i].ID)
		if err == nil {
			recipients[i].Subscriptions = subs
		}
	}
	return recipients, nil
}

// CreateAlertRecipient inserts a new notification contact
func CreateAlertRecipient(r *models.AlertRecipient) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO alert_recipients (name, email, phone, department, role, on_call_status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
		RETURNING id, created_at
	`
	return Pool.QueryRow(ctx, query, r.Name, r.Email, r.Phone, r.Department, r.Role, r.OnCallStatus).
		Scan(&r.ID, &r.CreatedAt)
}

// DeleteAlertRecipient deletes a contact
func DeleteAlertRecipient(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := Pool.Exec(ctx, "DELETE FROM alert_recipients WHERE id = $1", id)
	return err
}

// GetRecipientSubscriptions retrieves device subscriptions for a contact
func GetRecipientSubscriptions(recipientID int) ([]models.RecipientDeviceRule, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT r.id, r.recipient_id, r.device_id, r.send_email, r.send_sms, r.alert_types, r.created_at,
		       COALESCE(d.hostname, 'Unknown Device'), COALESCE(d.ip_address, ''), COALESCE(d.device_type, 'server')
		FROM recipient_device_rules r
		LEFT JOIN devices d ON r.device_id = d.id
		WHERE r.recipient_id = $1
		ORDER BY r.id ASC
	`
	rows, err := Pool.Query(ctx, query, recipientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []models.RecipientDeviceRule
	for rows.Next() {
		var rule models.RecipientDeviceRule
		if err := rows.Scan(
			&rule.ID, &rule.RecipientID, &rule.DeviceID, &rule.SendEmail, &rule.SendSMS, &rule.AlertTypes, &rule.CreatedAt,
			&rule.DeviceName, &rule.DeviceIP, &rule.DeviceType,
		); err != nil {
			return nil, err
		}
		rules = append(rules, rule)
	}
	return rules, nil
}

// SaveRecipientSubscriptions saves or replaces device rules for a contact
func SaveRecipientSubscriptions(recipientID int, rules []models.RecipientDeviceRule) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	tx, err := Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Clear existing rules for this recipient
	if _, err := tx.Exec(ctx, "DELETE FROM recipient_device_rules WHERE recipient_id = $1", recipientID); err != nil {
		return err
	}

	for _, rule := range rules {
		query := `
			INSERT INTO recipient_device_rules (recipient_id, device_id, send_email, send_sms, alert_types, created_at)
			VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
		`
		types := rule.AlertTypes
		if types == "" {
			types = "all"
		}
		if _, err := tx.Exec(ctx, query, recipientID, rule.DeviceID, rule.SendEmail, rule.SendSMS, types); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

// ClearAllDevices truncates all devices, metrics, ports, and sensors for a fresh scan
func ClearAllDevices() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := Pool.Exec(ctx, "TRUNCATE TABLE device_metrics, ports, sensors, alerts, recipient_device_rules, devices RESTART IDENTITY CASCADE;")
	return err
}

// SeedDefaultUsers seeds default SuperAdmin and Operator accounts
func SeedDefaultUsers() error {
	log.Println("Verifying standard authentication accounts in PostgreSQL...")

	// 1. Standard SuperAdmin: admin / admin123 (and allows 'admin')
	if existingAdmin, _ := GetUserByUsernameOrEmail("admin"); existingAdmin == nil {
		adminPassHash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err == nil {
			adminAcc := models.User{
				Username:     "admin",
				Email:        "dpkshah99@gmail.com",
				FullName:     "System Administrator",
				Phone:        "+91 9430268457",
				Department:   "NOC Global Administration",
				PasswordHash: string(adminPassHash),
				Role:         "superadmin",
			}
			if err := CreateUser(&adminAcc); err == nil {
				log.Printf("Seeded default SuperAdmin account: %s / admin123", adminAcc.Username)
			}
		}
	} else {
		_ = UpdateUserProfile(existingAdmin.ID, "dpkshah99@gmail.com", "+91 9430268457", "System Administrator", "NOC Global Administration", "superadmin")
	}

	// 2. Named SuperAdmin: deepak.sah / admin123 (configured with user's mobile & email)
	if existingDeepak, _ := GetUserByUsernameOrEmail("deepak.sah"); existingDeepak == nil {
		deepakHash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err == nil {
			deepakAcc := models.User{
				Username:     "deepak.sah",
				Email:        "dpkshah99@gmail.com",
				FullName:     "Deepak Sah",
				Phone:        "+91 9430268457",
				Department:   "NOC Operations & Architecture",
				PasswordHash: string(deepakHash),
				Role:         "superadmin",
			}
			if err := CreateUser(&deepakAcc); err == nil {
				log.Printf("Seeded SuperAdmin account: %s / admin123", deepakAcc.Username)
			}
		}
	} else {
		_ = UpdateUserProfile(existingDeepak.ID, "dpkshah99@gmail.com", "+91 9430268457", "Deepak Sah", "NOC Operations & Architecture", "superadmin")
	}

	// 3. Ensure Alert Recipient for Deepak Sah exists
	var recipientCount int
	_ = Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM alert_recipients WHERE email = 'dpkshah99@gmail.com'").Scan(&recipientCount)
	if recipientCount == 0 {
		_, _ = Pool.Exec(context.Background(), `
			INSERT INTO alert_recipients (name, email, phone, department, role, on_call_status, created_at)
			VALUES ('Deepak Sah', 'dpkshah99@gmail.com', '+91 9430268457', 'NOC Operations & Architecture', 'Primary Incident Commander', 'active', CURRENT_TIMESTAMP)
		`)
	}

	// 3. NOC Operator: operator / operator123
	if existingOp, _ := GetUserByUsernameOrEmail("operator"); existingOp == nil {
		opHash, err := bcrypt.GenerateFromPassword([]byte("operator123"), bcrypt.DefaultCost)
		if err == nil {
			opAcc := models.User{
				Username:     "operator",
				Email:        "operator@vnms.local",
				FullName:     "Enterprise Operator",
				Phone:        "+91 9876543211",
				Department:   "Infrastructure Monitoring",
				PasswordHash: string(opHash),
				Role:         "operator",
			}
			if err := CreateUser(&opAcc); err == nil {
				log.Printf("Seeded Operator account: %s / operator123", opAcc.Username)
			}
		}
	}

	return nil
}
