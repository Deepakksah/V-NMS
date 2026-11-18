package database

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// EnsureDatabaseCreated connects to the default postgres database if vnms doesn't exist, and creates it
func EnsureDatabaseCreated(connStr string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Try pinging the target db directly first
	cfg, err := pgxpool.ParseConfig(connStr)
	if err == nil {
		testPool, err := pgxpool.NewWithConfig(ctx, cfg)
		if err == nil {
			if pingErr := testPool.Ping(ctx); pingErr == nil {
				testPool.Close()
				return nil // Database exists and is accessible
			}
			testPool.Close()
		}
	}

	// Derive default postgres connection string
	targetDB := "vnms"
	maintConnStr := connStr
	if idx := strings.LastIndex(connStr, "/"); idx != -1 {
		rest := connStr[idx+1:]
		qIdx := strings.Index(rest, "?")
		if qIdx != -1 {
			targetDB = rest[:qIdx]
			maintConnStr = connStr[:idx+1] + "postgres" + rest[qIdx:]
		} else {
			targetDB = rest
			maintConnStr = connStr[:idx+1] + "postgres"
		}
	}

	log.Printf("[DB Init] Checking if database %q exists via maintenance connection...", targetDB)
	conn, err := pgx.Connect(ctx, maintConnStr)
	if err != nil {
		return fmt.Errorf("unable to connect to PostgreSQL maintenance database: %w", err)
	}
	defer conn.Close(ctx)

	var exists bool
	checkQuery := "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)"
	if err := conn.QueryRow(ctx, checkQuery, targetDB).Scan(&exists); err != nil {
		return fmt.Errorf("failed checking database existence: %w", err)
	}

	if !exists {
		log.Printf("[DB Init] Database %q does not exist. Creating now...", targetDB)
		createQuery := fmt.Sprintf("CREATE DATABASE %s", targetDB)
		if _, err := conn.Exec(ctx, createQuery); err != nil {
			return fmt.Errorf("failed to create database %q: %w", targetDB, err)
		}
		log.Printf("[DB Init] Database %q created successfully!", targetDB)
	}

	return nil
}

// RunAutoMigrations creates all required tables and indexes if they do not exist
func RunAutoMigrations() error {
	if Pool == nil {
		return fmt.Errorf("database pool is not initialized")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	schemaSQL := `
	-- 1. Users Table
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(100) UNIQUE NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		role VARCHAR(50) DEFAULT 'user',
		full_name VARCHAR(150),
		phone VARCHAR(50),
		department VARCHAR(100),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	-- 2. Devices Table
	CREATE TABLE IF NOT EXISTS devices (
		id SERIAL PRIMARY KEY,
		hostname VARCHAR(255) NOT NULL,
		ip_address VARCHAR(64) NOT NULL,
		snmp_version VARCHAR(10) DEFAULT 'v2c',
		snmp_community VARCHAR(100) DEFAULT 'public',
		snmp_port INT DEFAULT 161,
		snmp_user VARCHAR(100),
		snmp_auth_proto VARCHAR(20),
		snmp_auth_pass VARCHAR(255),
		snmp_priv_proto VARCHAR(20),
		snmp_priv_pass VARCHAR(255),
		os VARCHAR(100),
		version VARCHAR(100),
		hardware VARCHAR(255),
		sys_name VARCHAR(255),
		sys_descr TEXT,
		location VARCHAR(255),
		device_type VARCHAR(100) DEFAULT 'server',
		vendor VARCHAR(100) DEFAULT 'Generic',
		mac_address VARCHAR(100),
		status BOOLEAN DEFAULT false,
		last_ping_ms FLOAT DEFAULT 0,
		last_polled_at TIMESTAMP WITH TIME ZONE,
		uptime_seconds BIGINT DEFAULT 0,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	-- 3. Ports Table
	CREATE TABLE IF NOT EXISTS ports (
		id SERIAL PRIMARY KEY,
		device_id INT REFERENCES devices(id) ON DELETE CASCADE,
		if_index INT NOT NULL,
		if_name VARCHAR(255),
		if_descr VARCHAR(255),
		if_alias VARCHAR(255),
		if_type VARCHAR(100),
		if_speed BIGINT DEFAULT 0,
		if_oper_status VARCHAR(20) DEFAULT 'down',
		if_admin_status VARCHAR(20) DEFAULT 'down',
		if_in_octets BIGINT DEFAULT 0,
		if_out_octets BIGINT DEFAULT 0,
		if_in_errors BIGINT DEFAULT 0,
		if_out_errors BIGINT DEFAULT 0,
		if_in_rate_bps BIGINT DEFAULT 0,
		if_out_rate_bps BIGINT DEFAULT 0,
		last_polled_at TIMESTAMP WITH TIME ZONE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT unique_device_port UNIQUE(device_id, if_index)
	);

	-- 4. Sensors Table
	CREATE TABLE IF NOT EXISTS sensors (
		id SERIAL PRIMARY KEY,
		device_id INT REFERENCES devices(id) ON DELETE CASCADE,
		sensor_class VARCHAR(50) NOT NULL,
		sensor_type VARCHAR(100),
		sensor_descr VARCHAR(255),
		sensor_oid VARCHAR(255),
		current_value FLOAT DEFAULT 0,
		unit VARCHAR(20),
		warning_low FLOAT,
		warning_high FLOAT,
		critical_low FLOAT,
		critical_high FLOAT,
		status VARCHAR(20) DEFAULT 'ok',
		last_polled_at TIMESTAMP WITH TIME ZONE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	-- 5. Alerts Table
	CREATE TABLE IF NOT EXISTS alerts (
		id SERIAL PRIMARY KEY,
		device_id INT REFERENCES devices(id) ON DELETE CASCADE,
		severity VARCHAR(20) DEFAULT 'warning',
		message TEXT NOT NULL,
		rule_name VARCHAR(100),
		status VARCHAR(20) DEFAULT 'active',
		fired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		resolved_at TIMESTAMP WITH TIME ZONE
	);

	-- 6. Partitioned Metrics Table
	CREATE TABLE IF NOT EXISTS device_metrics (
		id BIGSERIAL,
		device_id INT NOT NULL,
		metric_type VARCHAR(50) NOT NULL,
		entity_id INT,
		val_1 FLOAT NOT NULL,
		val_2 FLOAT DEFAULT 0,
		recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (id, recorded_at)
	) PARTITION BY RANGE (recorded_at);

	CREATE TABLE IF NOT EXISTS device_metrics_default PARTITION OF device_metrics DEFAULT;

	CREATE INDEX IF NOT EXISTS idx_device_metrics_query 
	ON device_metrics (device_id, metric_type, recorded_at DESC);

	-- 7. Personnel & Alert Recipients Table
	CREATE TABLE IF NOT EXISTS alert_recipients (
		id SERIAL PRIMARY KEY,
		name VARCHAR(150) NOT NULL,
		email VARCHAR(255) NOT NULL,
		phone VARCHAR(50) NOT NULL,
		department VARCHAR(100),
		role VARCHAR(100),
		on_call_status VARCHAR(50) DEFAULT 'active',
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	-- 8. Recipient Device Routing Rules Table
	CREATE TABLE IF NOT EXISTS recipient_device_rules (
		id SERIAL PRIMARY KEY,
		recipient_id INT REFERENCES alert_recipients(id) ON DELETE CASCADE,
		device_id INT REFERENCES devices(id) ON DELETE CASCADE,
		send_email BOOLEAN DEFAULT true,
		send_sms BOOLEAN DEFAULT false,
		alert_types VARCHAR(255) DEFAULT 'all',
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT unique_recipient_device UNIQUE (recipient_id, device_id)
	);

	-- 9. Password Resets & Mobile/Email OTP Verification Table
	CREATE TABLE IF NOT EXISTS password_resets (
		id SERIAL PRIMARY KEY,
		user_id INT REFERENCES users(id) ON DELETE CASCADE,
		otp_code VARCHAR(10) NOT NULL,
		method VARCHAR(20) NOT NULL DEFAULT 'both',
		destination VARCHAR(255) NOT NULL,
		expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
		used BOOLEAN DEFAULT false,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_password_resets_lookup 
	ON password_resets (user_id, otp_code, used);

	-- Drop email unique constraint if present so administrator accounts can share notification mailboxes
	ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

	-- Self-healing: Ensure all Windows Enterprise Servers (WIN-* and win-node-*) are typed as servers
	UPDATE devices 
	SET device_type = 'server', 
	    hardware = CASE 
	        WHEN vendor ILIKE '%supermicro%' THEN 'Supermicro Production Server' 
	        WHEN vendor ILIKE '%microsoft%' THEN 'Microsoft Production Server'
	        ELSE 'Dell Production Server' 
	    END,
	    os = 'Windows Server'
	WHERE (hostname ILIKE 'win-%' OR hostname ILIKE 'win-node-%')
	  AND hostname NOT ILIKE 'win-client-%'
	  AND hostname NOT ILIKE 'desktop-%'
	  AND hostname NOT ILIKE 'laptop-%'
	  AND device_type != 'server';

	-- Self-healing: Ensure D-Link managed switch is properly typed as switch
	UPDATE devices
	SET hostname = 'dlink-sw-31',
	    device_type = 'switch',
	    vendor = 'D-Link',
	    hardware = 'D-Link DGS-1210-10/ME Gigabit Switch',
	    os = 'D-Link Managed Switch OS'
	WHERE (ip_address = '172.168.1.31' OR hostname ILIKE '%dlink%')
	  AND device_type != 'switch';

	-- Self-healing: Ensure TP-Link managed switch is properly typed as switch
	UPDATE devices
	SET hostname = 'tplink-sw-30',
	    device_type = 'switch',
	    vendor = 'TP-Link',
	    hardware = 'TP-Link JetStream 8-Port Gigabit Smart Switch',
	    os = 'TP-Link Enterprise Switch OS'
	WHERE (ip_address = '172.168.1.30' OR mac_address ILIKE 'c0-c9-e3%' OR mac_address ILIKE 'c0:c9:e3%')
	  AND device_type != 'switch';
	`

	_, err := Pool.Exec(ctx, schemaSQL)
	if err != nil {
		return fmt.Errorf("auto-migration error: %w", err)
	}

	log.Println("[DB Init] All 9 enterprise database tables & indexes verified/created successfully.")

	return nil
}

