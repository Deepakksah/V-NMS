-- V-Nms PostgreSQL Initial Schema
-- Supports relational entities + Partitioned time-series metric measurements

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
    status BOOLEAN DEFAULT false,
    last_ping_ms FLOAT DEFAULT 0,
    last_polled_at TIMESTAMP WITH TIME ZONE,
    uptime_seconds BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    device_id INT REFERENCES devices(id) ON DELETE CASCADE,
    sensor_class VARCHAR(50) NOT NULL, -- temperature, voltage, fan, power, state
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

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    device_id INT REFERENCES devices(id) ON DELETE CASCADE,
    severity VARCHAR(20) DEFAULT 'warning', -- critical, warning, info
    message TEXT NOT NULL,
    rule_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active', -- active, acknowledged, cleared
    fired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Time-Series Metric Table for high-performance chart querying
CREATE TABLE IF NOT EXISTS device_metrics (
    id BIGSERIAL,
    device_id INT NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- ping, cpu, memory, port_traffic
    entity_id INT, -- port_id or sensor_id
    val_1 FLOAT NOT NULL, -- latency or in_bps or cpu_pct
    val_2 FLOAT DEFAULT 0, -- out_bps or memory_used
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- Initial partition for current year/month
CREATE TABLE IF NOT EXISTS device_metrics_default PARTITION OF device_metrics DEFAULT;

CREATE INDEX IF NOT EXISTS idx_device_metrics_query 
ON device_metrics (device_id, metric_type, recorded_at DESC);
