# LibreNMS Existing System Deep Architectural Review

This document contains a comprehensive analysis of the existing **LibreNMS** codebase to guide its full transformation into **V-Nms (Go + React + PostgreSQL)**.

---

## 1. High-Level System Anatomy

LibreNMS is built on a hybrid architecture:
- **Core Framework**: Laravel 10/11 (PHP 8.x) for routing, ORM (Eloquent), and web controllers.
- **Legacy Engine (includes/)**: Procedural PHP code responsible for SNMP polling, device discovery, RRD chart data writes, and device parsing.
- **Database & Storage**: MySQL/MariaDB for relational metadata; disk-bound **RRDTool (.rrd) files** for all historical metrics (traffic, CPU, memory, ping).
- **Background Dispatcher**: Python wrapper (poller-wrapper.py) and cron jobs (cronic, daily.sh) invoking PHP scripts in batch.

`
+--------------------------------------------------------------------------+
|                            LibreNMS System                               |
+--------------------------------------------------------------------------+
|  Web & API: Laravel Routes (api.php, web.php) -> Controllers             |
|  Database:  MySQL/MariaDB (145+ Eloquent Models in app/Models/)          |
|  Polling:   poller-wrapper.py -> poller.php -> includes/polling/*.inc.php |
|  Discovery: discovery-wrapper.py -> discovery.php -> includes/discovery/ |
|  Metrics:   RRDTool binaries writing binary .rrd files on local disk     |
+--------------------------------------------------------------------------+
`

---

## 2. Core Functional Pillars & How They Work

### A. Device Discovery Engine (includes/discovery/ & discovery.php)
- **OS Detection**: Reads sysObjectID and sysDescr from devices via SNMP. Matches them against YAML definitions in esources/definitions/os_detection/.
- **Entity Discovery**:
  - ports.inc.php: Discovers network interfaces (ifIndex, ifDescr, ifAlias, ifSpeed, ifType).
  - sensors.inc.php: Finds temperature, fan speed, voltage, power, and state sensors.
  - processors.inc.php: Finds CPU cores / processor tables (UCD-SNMP-MIB, HOST-RESOURCES-MIB).
  - mempools.inc.php: Finds RAM and Virtual Memory pools.
  - lans.inc.php & rp.inc.php: Network layer mappings.

### B. Device Polling Engine (includes/polling/ & poller.php)
- **Ping / Availability**: Runs fping/fping6 to determine latency and device status (1 = UP, 0 = DOWN).
- **SNMP Counter Gathering**:
  - includes/polling/ports.inc.php: Queries ifInOctets, ifOutOctets, ifInErrors, ifOutErrors, ifHCInOctets (64-bit).
  - Calculates delta rates (bps/pps) from the previous poll time.
- **RRD Metric Storage**: Feeds data into rdtool update <device_ip>/port-<id>.rrd <timestamp>:<in>:<out>.

### C. Alerting & Notification Engine (pp/Models/Alert* & lerts.php)
- **Rule Evaluator**: Evaluates user-defined SQL-like rules against the database (e.g., macros.device_down = 1, ports.ifOperStatus != 'up').
- **Transport System**: Supports Webhooks, Slack, Email, Telegram, PagerDuty (found in pp/Notifications/ and LibreNMS/Alert/Transport/).
- **State Tracking**: lert_log, lert_rules, and lerts tables keep fault status and downtime duration.

### D. API Layer (outes/api.php & pp/Api/Controllers/)
- Exposes ~150 endpoints:
  - /api/v0/devices (List, Filter, Add, Delete)
  - /api/v0/devices/{id}/ports
  - /api/v0/devices/{id}/graphs/port/{port_id} (generates RRD graphs)
  - /api/v0/alerts & /api/v0/logs
- Uses Bearer API tokens (pi_tokens table).

---

## 3. Key Flaws & Bottlenecks in Existing LibreNMS

| Bottleneck | Problem in Existing LibreNMS | How V-Nms Fixes It |
| :--- | :--- | :--- |
| **Heavy Process Overhead** | Forking hundreds of php poller.php processes via Python wrappers consumes huge CPU and memory. | **Go Goroutines**: 10,000+ goroutines can poll concurrently in a single lightweight binary consuming < 50MB RAM. |
| **RRD Storage Fragility** | Metrics stored in filesystem .rrd files cannot be queried via SQL, cannot do cross-device analytics, and struggle with disk I/O. | **PostgreSQL (TimescaleDB / Partitioned Tables)**: Real SQL queries, aggregation, instant time-series slicing. |
| **Legacy Hybrid Code** | Mixture of 10-year-old procedural includes/*.inc.php and Laravel MVC creates technical debt. | **Clean Architecture in Go**: Domain models, interfaces, clean modular structure. |
| **Static Monolithic Frontend** | Blade + jQuery pages require full page reloads, making dashboards feel sluggish. | **React 18/19 SPA**: Instant transitions, real-time WebSocket state streaming, interactive canvas charts. |

---

## 4. V-Nms Blueprint: Mapping Legacy to New

| LibreNMS Component | Old Location | V-Nms Destination | Tech |
| :--- | :--- | :--- | :--- |
| Device Models & Schema | pp/Models/Device.php, Port.php | V-Nms/backend/internal/models/ | Go Structs + PG Schema |
| Poller Engine | includes/polling/*.php, poller.php | V-Nms/backend/internal/poller/ | GoSNMP + Goroutines |
| Ping Engine | ping.php / fping wrapper | V-Nms/backend/internal/ping/ | Native Go ICMP / Raw Sockets |
| Auto-Discovery | includes/discovery/*.php | V-Nms/backend/internal/discovery/ | Go OID Walkers |
| REST API | outes/api.php, Controllers | V-Nms/backend/internal/api/ | Go Gin / Chi HTTP Router |
| Live Push Engine | *None (Polling AJAX)* | V-Nms/backend/internal/ws/ | Go WebSockets Hub |
| UI & Dashboards | esources/views/ (Blade) | V-Nms/frontend/src/ | React + TypeScript + Vite |
| Database | MySQL + RRD Files | V-Nms/backend/migrations/ | PostgreSQL 16+ Partitioned |
