package database

import (
	"context"
	"fmt"
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
		       status, last_ping_ms, last_polled_at, uptime_seconds, created_at, updated_at
		FROM devices ORDER BY id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []models.Device
	for rows.Next() {
		var d models.Device
		err := rows.Scan(
			&d.ID, &d.Hostname, &d.IPAddress, &d.SNMPVersion, &d.SNMPCommunity, &d.SNMPPort,
			&d.OS, &d.Version, &d.Hardware,
			&d.SysName, &d.SysDescr, &d.Location,
			&d.Status, &d.LastPingMs, &d.LastPolledAt, &d.UptimeSeconds, &d.CreatedAt, &d.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		devices = append(devices, d)
	}
	return devices, nil
}

// InsertDevice inserts a new device into PostgreSQL
func InsertDevice(d *models.Device) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO devices (hostname, ip_address, snmp_version, snmp_community, snmp_port, os, status, last_ping_ms)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`
	err := Pool.QueryRow(ctx, query,
		d.Hostname, d.IPAddress, d.SNMPVersion, d.SNMPCommunity, d.SNMPPort, d.OS, d.Status, d.LastPingMs,
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
		SELECT id, username, email, password_hash, role, created_at, updated_at
		FROM users
		WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
		LIMIT 1
	`
	var u models.User
	err := Pool.QueryRow(ctx, query, identifier).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// GetUserByID retrieves a user by their primary key
func GetUserByID(id int) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, username, email, password_hash, role, created_at, updated_at
		FROM users
		WHERE id = $1
		LIMIT 1
	`
	var u models.User
	err := Pool.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// CreateUser inserts a new user record
func CreateUser(u *models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO users (username, email, password_hash, role, created_at, updated_at)
		VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		RETURNING id, created_at, updated_at
	`
	return Pool.QueryRow(ctx, query, u.Username, u.Email, u.PasswordHash, u.Role).
		Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
}

// SeedDefaultUsers seeds default SuperAdmin and Operator accounts if the users table is empty
func SeedDefaultUsers() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var count int
	if err := Pool.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&count); err != nil {
		return fmt.Errorf("checking users table: %w", err)
	}

	if count > 0 {
		return nil // Users already exist
	}

	log.Println("Seeding default authentication accounts into PostgreSQL...")

	// 1. SuperAdmin: deepak.sah / admin123
	adminHash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	adminUser := models.User{
		Username:     "deepak.sah",
		Email:        "deepak.sah@vnms.local",
		PasswordHash: string(adminHash),
		Role:         "superadmin",
	}
	if err := CreateUser(&adminUser); err != nil {
		log.Printf("Warning: Failed to seed admin user: %v", err)
	} else {
		log.Printf("Seeded SuperAdmin user: %s (id: %d)", adminUser.Username, adminUser.ID)
	}

	// 2. NOC Operator: operator / operator123
	opHash, err := bcrypt.GenerateFromPassword([]byte("operator123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	opUser := models.User{
		Username:     "operator",
		Email:        "operator@vnms.local",
		PasswordHash: string(opHash),
		Role:         "operator",
	}
	if err := CreateUser(&opUser); err != nil {
		log.Printf("Warning: Failed to seed operator user: %v", err)
	} else {
		log.Printf("Seeded Operator user: %s (id: %d)", opUser.Username, opUser.ID)
	}

	return nil
}
