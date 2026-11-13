# V-NMS — Enterprise Network Management System

[![Go](https://img.shields.io/badge/Go-1.27-00ADD8?style=flat&logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**V-NMS** is an enterprise-grade Network Management & Autonomous Telemetry System designed for Network Operations Centers (NOC), Datacenters, ISPs, and modern enterprise infrastructures. It features an ultra-fast **Go** core engine, native **PostgreSQL 18** time-series partitioning, and a reactive **React/TypeScript** executive dashboard with 145 LibreNMS domain models.

---

## 🌟 Key Architecture & Capabilities

- **High-Performance Go Poller**: Autonomous, concurrent ICMP fast-ping engine and SNMP v2c/v3 collector.
- **PostgreSQL 18 Storage**: Relational topology mapping with partitioned `device_metrics` table for fast time-series queries.
- **145 LibreNMS Domain Models**: Grouped into 15 enterprise domain suites (Hardware, Ports, Sensors, BGP/OSPF Routing, Alerts, Wireless, MPLS, Virtualization, Billing, and Syslog).
- **JWT Authentication & RBAC**: HMAC-SHA256 tokens (24h session) and bcrypt password hashing with SuperAdmin and Operator permission tiers.
- **Infrastructure Hierarchy Tree View**: Interactive tree with expand/collapse (hide/unhide) from Datacenters down to Firewalls, Routers, Switches, Servers, and physical port interfaces.
- **Dynamic Multi-Metric Telemetry Charts**: Real-time Bandwidth (Gbps), CPU Core %, Memory RAM %, ICMP Latency, and Port counters for every switch, server, and router.
- **Normal Enterprise Theme**: Crisp light mode design (`#ffffff`, `#f8fafc`, slate typography, colorful badge accents).

---

## 🗂️ Project Structure

```
V-NMS/
├── backend/                       # Go Core Backend Server
│   ├── cmd/server/main.go         # API endpoints & poller initialization
│   ├── internal/
│   │   ├── alerts/                # Alert rule engine & threshold evaluation
│   │   ├── auth/                  # JWT token engine, claims, & bcrypt security
│   │   ├── database/              # PostgreSQL pgxpool connection & repository
│   │   ├── models/                # Core Go structs & models
│   │   ├── ping/                  # ICMP fast-ping engine
│   │   └── poller/                # Autonomous background worker pool
│   ├── migrations/                # PostgreSQL schema & partitioning scripts
│   └── go.mod                     # Go modules definition
│
├── frontend/                      # React + TypeScript Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── views/             # 15 Domain Views (Dashboard, TreeView, Devices, etc.)
│   │   │   ├── Navbar.tsx         # Sticky header with user profile & logout dropdown
│   │   │   ├── Sidebar.tsx        # Colored icon badge navigation sidebar
│   │   │   ├── LoginView.tsx      # Enterprise login card with 1-click test accounts
│   │   │   └── DeviceChartsModal.tsx # Multi-metric deep-dive modal
│   │   ├── data/                  # Telemetry generators & 145 model registry
│   │   └── types.ts               # Complete TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── ALL_145_FEATURES_CHECKLIST.md  # 145 LibreNMS models verification matrix
├── ARCHITECTURE_PLAN.md           # System design & architecture blueprint
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Go**: 1.24+ (or Go 1.27)
- **Node.js**: 18+ (Node.js 20+ recommended)
- **PostgreSQL**: 16+ or 18 running on port `5432`

### 2. Database Setup
Create database `vnms` in PostgreSQL:
```sql
CREATE DATABASE vnms;
```
Apply the schema from `backend/migrations/001_initial_schema.sql`.

### 3. Backend Setup
```bash
cd backend
go mod tidy
go run ./cmd/server
```
The backend server runs on `http://127.0.0.1:8081`.

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔐 Default Credentials

| Username | Password | Role |
| :--- | :--- | :--- |
| `deepak.sah` | `admin123` | **SuperAdmin** |
| `operator` | `operator123` | **Operator** |

---

## 📄 License
This project is licensed under the MIT License.
