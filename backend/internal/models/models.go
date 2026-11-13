package models

import "time"

type Device struct {
	ID            int        `json:"id"`
	Hostname      string     `json:"hostname"`
	IPAddress     string     `json:"ip_address"`
	SNMPVersion   string     `json:"snmp_version"`
	SNMPCommunity string     `json:"snmp_community,omitempty"`
	SNMPPort      int        `json:"snmp_port"`
	SNMPUser      string     `json:"snmp_user,omitempty"`
	SNMPAuthProto string     `json:"snmp_auth_proto,omitempty"`
	SNMPAuthPass  string     `json:"snmp_auth_pass,omitempty"`
	SNMPPrivProto string     `json:"snmp_priv_proto,omitempty"`
	SNMPPrivPass  string     `json:"snmp_priv_pass,omitempty"`
	OS            string     `json:"os"`
	Version       string     `json:"version"`
	Hardware      string     `json:"hardware"`
	SysName       string     `json:"sys_name"`
	SysDescr      string     `json:"sys_descr"`
	Location      string     `json:"location"`
	Status        bool       `json:"status"`
	LastPingMs    float64    `json:"last_ping_ms"`
	LastPolledAt  *time.Time `json:"last_polled_at"`
	UptimeSeconds int64      `json:"uptime_seconds"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type Port struct {
	ID            int        `json:"id"`
	DeviceID      int        `json:"device_id"`
	IfIndex       int        `json:"if_index"`
	IfName        string     `json:"if_name"`
	IfDescr       string     `json:"if_descr"`
	IfAlias       string     `json:"if_alias"`
	IfType        string     `json:"if_type"`
	IfSpeed       int64      `json:"if_speed"`
	IfOperStatus  string     `json:"if_oper_status"`
	IfAdminStatus string     `json:"if_admin_status"`
	IfInOctets    int64      `json:"if_in_octets"`
	IfOutOctets   int64      `json:"if_out_octets"`
	IfInErrors    int64      `json:"if_in_errors"`
	IfOutErrors   int64      `json:"if_out_errors"`
	IfInRateBps   int64      `json:"if_in_rate_bps"`
	IfOutRateBps  int64      `json:"if_out_rate_bps"`
	LastPolledAt  *time.Time `json:"last_polled_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type Sensor struct {
	ID           int        `json:"id"`
	DeviceID     int        `json:"device_id"`
	SensorClass  string     `json:"sensor_class"`
	SensorType   string     `json:"sensor_type"`
	SensorDescr  string     `json:"sensor_descr"`
	SensorOID    string     `json:"sensor_oid"`
	CurrentValue float64    `json:"current_value"`
	Unit         string     `json:"unit"`
	WarningLow   *float64   `json:"warning_low"`
	WarningHigh  *float64   `json:"warning_high"`
	CriticalLow  *float64   `json:"critical_low"`
	CriticalHigh *float64   `json:"critical_high"`
	Status       string     `json:"status"`
	LastPolledAt *time.Time `json:"last_polled_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type Alert struct {
	ID         int        `json:"id"`
	DeviceID   int        `json:"device_id"`
	Severity   string     `json:"severity"`
	Message    string     `json:"message"`
	RuleName   string     `json:"rule_name"`
	Status     string     `json:"status"`
	FiredAt    time.Time  `json:"fired_at"`
	ResolvedAt *time.Time `json:"resolved_at"`
}

type MetricPoint struct {
	DeviceID   int       `json:"device_id"`
	MetricType string    `json:"metric_type"`
	EntityID   *int      `json:"entity_id,omitempty"`
	Val1       float64   `json:"val_1"`
	Val2       float64   `json:"val_2"`
	RecordedAt time.Time `json:"recorded_at"`
}

type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"` // "superadmin", "operator", "viewer"
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string `json:"token"`
	TokenType string `json:"token_type"`
	ExpiresIn int64  `json:"expires_in"` // seconds
	User      User   `json:"user"`
}
