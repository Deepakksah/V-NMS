# V-Nms Architecture & Migration Master Plan
**From Legacy LibreNMS (PHP / Laravel / MySQL) to Modern V-Nms (Go + React + PostgreSQL)**

---

## 1. Executive Summary & Vision

**V-Nms** is a next-generation, high-performance Network Management System written in **Go (Golang)** for blazing-fast concurrent SNMP polling/discovery, **React (TypeScript + Vite)** for a reactive and aesthetic user dashboard, and **PostgreSQL (with TimescaleDB / partitioned tables)** for robust relational data and ultra-fast metric time-series queries.

### Tech Stack Comparison
| Layer | Old LibreNMS | New V-Nms | Benefit in V-Nms |
| :--- | :--- | :--- | :--- |
| **Backend / Core** | PHP 8.x + Laravel | **Go (Golang 1.22+)** | Sub-millisecond execution, goroutines for concurrent SNMP polling thousands of devices, minimal CPU/memory footprint |
| **API** | Laravel REST API (LegacyApiController) | **Go REST API (Gin or Chi) + WebSockets** | Real-time device status alerts, instant metric updates, type-safe models |
| **Frontend** | Blade Templates + jQuery / Mixed Vue | **React 18/19 (TypeScript, Vite, Modern Dashboard UI)** | Fast SPA, interactive topology maps, dark/light sleek themes, live charts |
| **Database** | MySQL / MariaDB + RRDTool files | **PostgreSQL 16+ (Partitioning / TimescaleDB)** | Unified storage (no brittle .rrd files on disk), rich JSONB querying, fast metric aggregation |
| **Queue / Workers** | Python wrapper + Cron + Redis | **Go Worker Pools (Native Goroutines & Channels)** | Self-contained single binary, no Python/cron dependencies |

---

## 2. Phased Milestones

We will execute this project systematically in **6 sequential milestones**:

### **Milestone 1: Foundation & Database Layer (Go + PostgreSQL)**
- [ ] Initialize Go backend module and folder structure in V-Nms/backend.
- [ ] Design and generate PostgreSQL schema & migrations (devices, ports, sensors, lerts, users, device_metrics).
- [ ] Implement database connection & repository layer in Go.
- [ ] Setup docker-compose.yml for PostgreSQL.

### **Milestone 2: High-Performance Go Poller & Discovery Engine**
- [ ] Build ICMP Fast Ping monitor in Go (device UP/DOWN status in milliseconds).
- [ ] Implement GoSNMP manager supporting SNMP v1, v2c, and v3.
- [ ] Port OS detection logic (sysDescr / sysObjectID from LibreNMS YAMLs).
- [ ] Build concurrent worker pool to poll device metrics (CPU, Memory, Interface Traffic, Temperature).
- [ ] Store time-series metric data into PostgreSQL partitioned tables.

### **Milestone 3: Go REST API & Real-time WebSockets**
- [ ] Build authentication & user management (JWT, RBAC).
- [ ] Create CRUD endpoints: /api/v1/devices, /api/v1/ports, /api/v1/metrics, /api/v1/alerts.
- [ ] Port LegacyApiController routes into standard Go REST endpoints.
- [ ] Implement WebSocket server to stream real-time device status changes to UI.

### **Milestone 4: Modern React Frontend (Vite + TypeScript)**
- [ ] Initialize React + Vite + TypeScript frontend in V-Nms/frontend.
- [ ] Build unified layout: Sidebar navigation, dark/light theme, breadcrumbs, search.
- [ ] Build **Live Dashboard**: Total devices, UP/DOWN counters, top traffic interfaces, alert badges.
- [ ] Build **Device Inventory Page**: Filter by OS, vendor, IP, status with detailed view.
- [ ] Build **Metrics Graphs**: Recharts / Chart.js for traffic throughput, ping latency, CPU/memory history.

### **Milestone 5: Intelligent Alerting & Event Engine**
- [ ] Rule builder engine (e.g., interface_utilization > 80%, device_down > 2 min).
- [ ] Notification dispatchers (Email, Telegram, Slack, Webhooks).
- [ ] Syslog collector & SNMP Trap receiver in Go.

### **Milestone 6: Testing, Migration Tool & Deployment**
- [ ] Create migration script to import existing devices from old LibreNMS MySQL to V-Nms PostgreSQL.
- [ ] End-to-end integration tests & SNMP simulator tests.
- [ ] Production build scripts and Docker containerization.
