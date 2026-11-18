# 🚀 V-NMS Enterprise Engineering Worklist & Live Roadmap

Last Updated: 2026-11-13 | Subnet: `172.168.1.0/24` | Database: `PostgreSQL 18`

---

## 📌 Status Legend
- ⏳ **PENDING** - In queue
- 🔄 **IN_PROGRESS** - Currently being implemented
- ✅ **COMPLETED** - Built, tested & persisted to DB/code

---

## 📋 Master Worklist

### 1. Tree View Company Brand Logos & Live Side-Panel (`TreeView.tsx`)
- [x] ✅ **1.1 Left-Side Tree Node Brand Logos:**
  - Show genuine company logos next to every host node:
    - 🪟 **Microsoft Windows** for Windows servers and workstations
    - 🔵 **Dell** for Dell PowerEdge R750/R650 and OptiPlex 7090
    - 🌐 **Cisco** for Cisco Catalyst 9300-48P PoE+ switch
    - 🛡️ **Check Point / Palo Alto** for `core-gw-01` firewall
    - 💻 **HP** for HP EliteDesk 800 G8 workstations
    - 🟠 **Ubuntu** for Ubuntu Linux Xeon compute nodes
    - ⏰ **Microchip** for Microchip SyncServer S650 Stratum-1 clock
  - Display clean device type badge (`SERVER`, `SWITCH`, `FIREWALL`, `WORKSTATION`, `NTP`).
- [x] ✅ **1.2 Right-Side Inspection Panel Live Telemetry & Inline Charts:**
  - When clicking any tree node on the left, right panel immediately opens:
    - Dedicated Manufacturer Brand Logo & Model Header
    - Full Hardware Specs & Network Identity (IP, MAC, OS, SNMP, Uptime)
    - **Live Inline ICMP Ping Latency Sparkline Chart** (without requiring popup modal)
    - **Live Ingress vs Egress Bandwidth Rate Gauge** (Mbps / Gbps)
    - **Multi-Core CPU Load & Memory RAM Bars**
    - **Storage Partitions Overview** with **STORAGE FULL (>90%)** warning banner
    - Quick Action Buttons: **Live ICMP Ping**, **SNMP Poll**, and **Full Modal**
- [x] ✅ **1.3 Left Panel Hide / Unhide Controls (Default Hide):**
  - Tiers in Tree View are **default hidden (collapsed)** for a neat, compact presentation.
  - Interactive `[👁️ Unhide (count)]` / `[👁️‍🗨️ Hide]` toggle buttons directly on each parent row.
  - Quick `[👁️ Unhide All]` and `[🙈 Hide All]` action buttons in the panel header.
  - Clicking anywhere on a category/tier row expands or collapses its devices.
  - Main left sidebar (`Sidebar.tsx`) sections also equipped with `HIDE` / `UNHIDE` accordion controls with default collapsed state for secondary suites.

---

### 2. Automated DOWN / UP Host Incident Engine
- [x] ✅ **2.1 Backend ICMP State Transition Detection:**
  - Real-time probe in Go: Detect when host state transitions (`UP -> DOWN` or `DOWN -> UP`).
  - Auto-generate incident in PostgreSQL `alerts` table with `severity = 'critical'`.
  - On recovery, auto-resolve incident, log exact downtime duration, and trigger recovery events.
- [x] ✅ **2.2 Real-time Top Navbar & Sidebar Badge Updates:**
  - Dynamic alert badge increment/decrement in Navbar and Sidebar linked to active PostgreSQL incidents.
- [x] ✅ **2.3 Threshold Breach Triggers & Simulation:**
  - Latency Spike Alert (RTT > 15ms or Jitter > 5ms)
  - Storage Full Warning (Disk volume >= 90%)
  - Processor Overload Warning (CPU > 85%)
  - One-click Simulation buttons to trigger and test live incidents on demand.

---

### 3. Email (SMTP) & SMS Gateway Configuration Center
- [x] ✅ **3.1 SMTP Email Server Configuration UI & Backend:**
  - SMTP Host, Port (587 / 465 / 25), Username, Password / App Key.
  - Encryption protocol selector: TLS / SSL / None.
  - From Address & Display Name (`noc-alerts@enterprise.local`).
  - Admin Recipient Email addresses (comma-separated).
  - **"Send Test Verification Email"** button with live TLS handshake test and status banner.
- [x] ✅ **3.2 SMS Gateway Configuration UI & Backend:**
  - Provider selector: Twilio / AWS SNS / Generic HTTP SMS API.
  - API Credentials (Account SID, Auth Token / API Key).
  - Sender ID / Phone number.
  - Admin Phone Numbers list (comma-separated).
  - **"Send Test SMS"** button with live dispatch confirmation.

---

### 4. Customizable Notification Alert Templates
- [x] ✅ **4.1 Dynamic Template Engine Variables:**
  - Available tags: `{{hostname}}`, `{{ip}}`, `{{device_type}}`, `{{vendor}}`, `{{hardware}}`, `{{event_time}}`, `{{downtime_duration}}`, `{{metric_value}}`.
  - One-click tag copy pills for easy configuration.
- [x] ✅ **4.2 Pre-Configured Live Templates:**
  - **Host DOWN Alert Template:** Critical email HTML & SMS text.
  - **Host RECOVERED (UP) Alert Template:** Recovery email HTML & SMS text with calculated downtime.
  - **Storage Full (>=90%) Alert Template:** Volume threshold breach email & SMS.
  - **Latency Spike Alert Template:** RTT spike email & SMS.
- [x] ✅ **4.3 Template Live Preview & Phone Mockup:**
  - Real-time rendered HTML Email preview card.
  - Realistic Smartphone SMS preview bubble showing exact live messages.

---

### 5. High-Density NOC Executive Dashboard & Mobile/Android Architecture
- [x] ✅ **5.1 Motadata-Inspired Server Overview Layout (`DashboardView.tsx`):**
  - **Horizon Timeline Bar:** Operational time scrubber (`00:00` - `24:00`) with quick range presets (`1h`, `24h`, `7d`, `30d`).
  - **Top Availability & Health Row:** Circular radial ring gauges (`Down`, `Unreachable`, `Up`, `Maintenance`), Hexagonal honeycomb server badges, and Alert severity radial rings (`Down %`, `Critical`, `Major`, `Warning`).
  - **Ranked Telemetry with Live Sparklines:**
    - Top Servers by CPU % with live Gold `AreaChart` sparklines.
    - Top Servers by Memory % with live Orange `AreaChart` sparklines.
    - Top Servers by Disk IOPS with live Pink `AreaChart` sparklines.
    - Top Servers by Latency (RTT) with live Cyan `AreaChart` sparklines.
  - **Distribution Donut Charts:** Real-time CPU Share and Disk Storage Volume breakdown.
  - **Theme Toggle:** Switch between `🌙 Dark NOC Command Center Mode` (Motadata style) and `☀️ Daylight Mode`.
- [x] ✅ **5.2 Mobile-First & Android App Cross-Platform Readiness:**
  - **Responsive CSS Grid:** Adapts automatically from 3 columns (desktop NOC screens) to 2 columns (tablets) to 1 column (Android / iOS mobile phones).
  - **Capacitor & PWA Compatible:** Pure component architecture ready for native Android `.apk` generation (`npx cap add android`) with zero rewrites.
  - **Touch Targets:** Minimum 44px touch-friendly hit areas and responsive vector SVGs.

---

### 6. Official Brand Identity & Favicon Integration (HealthGo / Veracity)
- [x] ✅ **6.1 Extracted Official HealthGo Assets:**
  - Located official `Logo.ico` (4,286 bytes) and `Veracity_logo.png` (576x224 transparent PNG, 37,246 bytes) from HealthGo project.
  - Integrated into `frontend/public/favicon.ico`, `frontend/public/Logo.ico`, `frontend/public/Veracity_logo.png`.
- [x] ✅ **6.2 Browser Tab Favicon & Title (`index.html`):**
  - Configured `<link rel="icon" type="image/x-icon" href="/favicon.ico" />` and `<link rel="shortcut icon" href="/favicon.ico" />`.
  - Configured tab title to `V-NMS • Enterprise Network Management System`.
- [x] ✅ **6.3 Main Header Navbar Branding (`Navbar.tsx`):**
  - High-resolution `Veracity_logo.png` embedded in the sticky top Navbar alongside `V-NMS ENTERPRISE NOC`.
- [x] ✅ **6.4 Enterprise Authentication Portal (`LoginView.tsx`):**
  - Official Veracity brand identity rendered atop the login card.

---

### 7. Enterprise Alert Rules Engine UI Overhaul (`AlertsView.tsx`)
- [x] ✅ **7.1 Raw SQL Developer Queries Removed from User View:**
  - Eliminated raw `SELECT * FROM ...` code boxes from primary view.
  - Replaced with human-readable Enterprise Condition Matrix:
    - **Monitored Metric:** (e.g. `ICMP Echo Availability`, `Storage Disk Volume`, `Network Latency (RTT)`, `CPU Load`, `Physical RAM`)
    - **Trigger Threshold:** (e.g. `Packet Loss == 100%`, `Drive Usage >= 90%`, `RTT > 15.0 ms`, `CPU > 85%`, `Memory > 90%`)
    - **Duration & Sensitivity:** (e.g. `2 Consecutive Failed Probes`, `Sustained >= 60s`, `5-Sample Rolling Avg`)
    - **Evaluation Interval:** (e.g. `15s Fast-Ping Poller`, `60s Storage Sweep`, `30s Telemetry Cycle`)
- [x] ✅ **7.2 Clean Notification Channel Badges:**
  - Replaced unescaped `&bull;` strings with structured badge pills with dedicated Lucide icons (`Mail`, `Smartphone`, `Database`).
- [x] ✅ **7.3 Interactive Controls & Instant Rule Testing:**
  - **Status Toggle:** Active / Muted toggle button on every rule card with real-time feedback.
  - **1-Click Test Button (`⚡ Test Rule`):** Immediately simulates that specific rule and logs incident into PostgreSQL with instant toast notification.
  - **Interactive Threshold Editor (`⚙️ Configure`):** Modal dialog to customize rule thresholds, severity levels, evaluation intervals, and notification channels.
  - **Collapsible Technical Logic (`🔍 SQL Logic`):** Hidden by default, expands only upon explicit click for database administrators.

---

### 8. Top Header Navigation Dark NOC Mode (`Navbar.tsx`)
- [x] ✅ **8.1 Motadata-Aligned Dark Theme Header:**
  - Header background styled to deep command center dark `#0b1120` / `#0f172a` with `#1e293b` border and soft shadow.
  - High-contrast typography: `V-NMS` in crisp `#f8fafc` with glowing `ENTERPRISE NOC` cyan badge.
  - Veracity HealthGo official logo housed in a crisp white rounded badge for sharp visibility.
  - Global Search bar themed in `#1e293b` with `#334155` border and `#f8fafc` input text.
  - Action buttons (Refresh, Scan Subnet, Tree View, Reports & SLA) updated with sleek dark glass styling.
  - User session menu and dropdown upgraded to Dark NOC styling with glowing status badges.

---

### 9. Section-Scoped Device Registration & Global Multi-Vendor Hardware Catalog
- [x] ✅ **9.1 Top Navbar Cleanup:**
  - Removed the global `Add Device` button completely from top Navbar header.
- [x] ✅ **9.2 Section-Specific Registration Buttons:**
  - **Servers & Compute Nodes:** Dedicated `+ Add Server` button pre-locked to server compute nodes.
  - **Network Switches:** Dedicated `+ Add Switch` button pre-locked to network switches.
  - **Firewalls & Gateways:** Dedicated `+ Add Firewall` button pre-locked to security gateways.
  - **Client Workstations:** Dedicated `+ Add Workstation` button pre-locked to endpoint machines.
  - **NTP Time Services:** Dedicated `+ Add NTP Server` button pre-locked to Stratum-1 time references.
  - **Infrastructure Tree View:** Dedicated `+ Add Node` button in tree view header.
  - **All Inventory:** Full catalog selector.
- [x] ✅ **9.3 Global Multi-Vendor Hardware Catalog (`globalDeviceCatalog.ts`):**
  - Exhaustive directory covering world manufacturers with flags and regional origin:
    - 🇺🇸 **USA:** Dell Technologies, Cisco Systems, HPE ProLiant & Aruba, Palo Alto Networks, Fortinet, Arista, Juniper, SonicWall, Apple, Microchip, Trimble, System76, Framework.
    - 🇩🇪 **Germany:** Meinberg Funkuhren (LANTIME M3000 / M1000 / M400 Stratum-1 clocks).
    - 🇯🇵 **Japan:** Fujitsu PRIMERGY & CELSIUS, Allied Telesis, NEC Express5800, Seiko Solutions, Panasonic TOUGHBOOK.
    - 🇫🇷 **France:** Atos/Bull BullSequana, Stormshield EU-certified UTM, Spectracom / Safran SecureSync, Gorgy Timing.
    - 🇨🇭 **Switzerland:** Oscilloquartz / ADVA (IEEE 1588 PTP Grandmasters & Cesium Standards).
    - 🇨🇳 **China:** Huawei FusionServer & CloudEngine & HiSecEngine, Lenovo ThinkSystem & ThinkStation, Inspur AI servers, H3C, Sangfor, Hillstone.
    - 🇹🇼 **Taiwan:** Supermicro, ASUS RS720A & ProArt, D-Link, Zyxel, Acer Veriton, Getac rugged.
    - 🇬🇧 **UK:** Sophos XGS Next-Gen, Canonical / Ubuntu Enterprise.
    - 🇮🇱 **Israel:** Check Point Quantum Security, NVIDIA / Mellanox Spectrum 100G/400G switches.
    - 🇱🇻 **Latvia:** MikroTik RouterBOARD (CRS354, CRS326, CCR2004).
    - 🇳🇱 **Netherlands:** Deciso OPNsense Business Gateways.
    - 🇰🇷 **South Korea:** AhnLab TrusGuard UTM Firewalls.
- [x] ✅ **9.4 Dynamic Category Locking & Intelligent Dropdowns (`AddDeviceModal.tsx`):**
  - Category auto-locked to the section user clicked from.
  - Changing vendor dynamically refreshes model list and pre-fills enterprise operating system / firmware.
  - Auto-suggests hostname and available IPv4 address on the `172.168.1.0/24` subnet.
  - Commits directly to PostgreSQL 18 persistent database.

---

### 10. User Management & Mandatory 12-Character Security Sign-Up Policy
- [x] ✅ **10.1 Full Identity Registration / Sign-Up Portal (`LoginView.tsx`):**
  - Toggle between `[ Sign In ]` and `[ Register User ]` on login portal.
  - Comprehensive user identity fields captured during registration:
    - **Full Name** (e.g. Deepak Sah)
    - **Username** (e.g. deepak.sah)
    - **Corporate Email** (e.g. deepak.sah@veracity.com)
    - **Mobile Phone** for SMS notifications (e.g. +91 9876543210)
    - **Department** (NOC Operations, Network Infrastructure, System Administration, SOC, Database Engineering, Leadership)
    - **System Role** (Operator, Viewer, SuperAdmin)
- [x] ✅ **10.2 Mandatory 12-Character Password Policy:**
  - **Strict validation:** Password length must be `>= 12` characters.
  - Dynamic 12-segment progress bar and real-time character counter (`X/12 characters`).
  - Clear visual badge: `12+ Characters Required (Enterprise Policy)`.
  - Client-side validation blocks submission if `< 12` chars with explicit warning.
  - Backend validation in Go (`/api/v1/auth/register` and `/api/v1/users`) returns HTTP 400 if `< 12` chars.
  - Password hashing with bcrypt before storing in PostgreSQL `users` table.
  - Instant auto-login upon registration returning signed 256-bit JWT token.
- [x] ✅ **10.3 Admin User Management in Settings (`SettingsView.tsx`):**
  - Live PostgreSQL 18 integration under "User Accounts & RBAC" tab fetching from `GET /api/v1/users`.
  - Display table with Full Name, Username, Corporate Email, Phone, Department, Role, and Security Policy badge.
  - `+ Add System User` modal dialog with all identity fields and mandatory 12-char password enforcement.
  - User deletion capability (`DELETE /api/v1/users/:id`) with root SuperAdmin ID 1 protection.
  - Real-time refresh button and success notifications.

---

### 11. Alert Recipient Contacts & Per-Device Email/SMS Delivery Routing Matrix (`AlertsView.tsx`)
- [x] ✅ **11.1 Dedicated "Alert Recipients & Routing Matrix" Tab:**
  - Added new navigation tab in Alert Center with live counter of registered alert recipients.
  - Two coordinated operational panels:
    - **Left Panel:** Alert Recipients & On-Call Contacts Directory.
    - **Right Panel:** Granular Per-Device Notification Routing Matrix for the selected contact.
- [x] ✅ **11.2 On-Call Recipient & Person Management:**
  - Database table `alert_recipients` in PostgreSQL 18 storing Full Name, Email, Mobile Phone, Department, Role, On-Call Status (`Active 24x7`, `Business Hours`, `Standby`).
  - `+ Add Alert Contact / Person` modal to register new alert contacts.
  - Delete contact action removing person from PostgreSQL.
  - Click-to-select person card with visual highlighted active state.
- [x] ✅ **11.3 Interactive Per-Device Delivery Routing Matrix:**
  - For the selected recipient, displays all monitored servers, switches, and gateways.
  - Granular delivery channel checkboxes for each device:
    - `[ ] Send Email`
    - `[ ] Send SMS`
    - Quick Action: `[ Both (Email + SMS) ]` button
  - Active Delivery Mode badge:
    - `[ ✉️ Email + 📱 SMS ]` (Both active)
    - `[ ✉️ Email Only ]`
    - `[ 📱 SMS Only ]`
    - `[ 🔕 Muted / No Alerts ]`
  - Quick bulk toggles: `✓ All Both (Email+SMS)`, `✓ All Email Only`, `✓ All SMS Only`, `Clear All`.
  - Filter / search input to quickly find specific hostnames, IPs, or vendors.
  - `[ 💾 Save Alert Routing Matrix ]` button:
    - Dispatches to `POST /api/v1/notifications/recipients/:id/subscriptions`.
    - Persists into PostgreSQL 18 table `recipient_device_rules` (`send_email`, `send_sms`, `alert_types`).
    - Instant success notification banner with live counts.
- [x] ✅ **11.4 Two Dedicated Separate Full Pages (`AlertContactsView.tsx` & `AlertMatrixView.tsx`):**
  - **Page 1: Alert Persons Directory (`AlertContactsView.tsx`):**
    - Full-screen page to register alert persons.
    - At add time: **ONLY person identity details** (Name, Corporate Email, Mobile Phone, Department, Role, On-Call schedule). Zero device clutter.
    - Full-width enterprise table displaying all registered contacts with live stats and `[ 🔗 Link to Servers &rarr; ]` shortcut.
  - **Page 2: Device Alert Linking Matrix (`AlertMatrixView.tsx`):**
    - Dedicated separate full-screen page for mapping persons to monitored infrastructure.
    - Top Person Selector dropdown with live counters (Email servers, SMS servers, Both).
    - Full-width device table with checkboxes `[ ] Send Email` and `[ ] Send SMS` for every monitored node.
    - `[ 💾 Save Device Alert Linking Matrix ]` committing to PostgreSQL.
  - **Independent Left Sidebar Navigation Links:**
    - 👤 `Alert Persons Directory` (`+ ADD`)
    - 🔗 `Link Persons to Servers` (`MATRIX`)
- [x] ✅ **11.5 Left Sidebar Layout Optimization:**
  - Relocated all person & access related modules (`Alert Persons Directory`, `Link Persons to Servers`, `User Accounts & Sign Up`) to a dedicated section at the very bottom of the left sidebar: **`Personnel, Alert Contacts & RBAC`**.
  - Keeps core inventory and operations at the top and administration/personnel cleanly organized at the bottom.

---

### 12. Global Top-Right Toast Notification System (`ToastContext.tsx`)
- [x] ✅ **12.1 Dedicated Floating Toast Container in Top-Right Corner:**
  - Fixed coordinates: `position: fixed, top: 20px, right: 20px, z-index: 999999` ("upar right side me").
  - Smooth slide-in animation (`toast-slide-in`) with cubic-bezier easing.
  - Multi-toast support: stacks up to 5 concurrent toasts with dynamic layout.
  - Auto-dismiss with animated progress timer bar configured to exact **2 seconds (2000ms)** and manual `[X]` close button.
  - High-contrast enterprise dark styling with type-specific neon accents and Lucide icons (Success, Error, Warning, Info).
- [x] ✅ **12.2 Universal Save & Action Integration Across All Views:**
  - **Add Device Modal (`AddDeviceModal.tsx`):** Fires top-right toast on device registered in PostgreSQL (`Node "..." (IP) registered successfully in PostgreSQL!`).
  - **Alert Contacts Directory (`AlertContactsView.tsx`):** Fires top-right toast on person saved (`Person "..." added successfully to PostgreSQL! You can now link them to servers.`) and on delete.
  - **Link Persons to Servers Matrix (`AlertMatrixView.tsx`):** Fires top-right toast on matrix save (`Saved alert delivery routing rules for "..." across 33 servers in PostgreSQL!`).
  - **Automated Alert Rules & Settings (`AlertsView.tsx`):**
    - Fires on rule status toggle (`Rule "..." is now ENABLED / MUTED`).
    - Fires on rule edit save (`Rule "..." updated successfully!`).
    - Fires on incident simulation (`Incident "..." simulated & logged into PostgreSQL!`).
    - Fires on SMTP/SMS test verification (`SMTP test email sent successfully!` / `SMS test message dispatched!`).
    - Fires on notification gateway settings save (`SMTP, SMS Gateway & Alert Notification Templates saved successfully to PostgreSQL!`).
    - Fires on incident acknowledge & resolve.
  - **User Accounts & RBAC (`SettingsView.tsx`):**
    - Fires on user creation (`User "..." added successfully to PostgreSQL!`).
    - Fires on 12-char password validation warning.
    - Fires on user deletion.
  - **Subnet Discovery & Telemetry (`App.tsx`):**
    - Fires on Subnet Discovery Scan trigger and completion.
    - Fires on ICMP Ping & SNMP Poll actions with live latency metrics.

---

### 13. Automated Alert Rules UI Overhaul (Replaced Raw SQL Queries)
- [x] ✅ **13.1 Human-Readable Condition Matrix:**
  - Resolved user inquiry on raw SQL query display in alert cards (`SELECT * FROM devices WHERE status = false...`).
  - Replaced developer SQL string boxes with structured enterprise condition matrices:
    - **Monitored Metric:** `ICMP Echo Availability`, `Disk Volume Space`, `Network Latency (RTT)`, `Processor Total Thread Load`, `Physical RAM Consumption`.
    - **Trigger Threshold:** `Packet Loss == 100% (Host Offline)`, `Usage >= 90% of Volume`, `Roundtrip RTT > 15.0 ms`, `CPU Utilization > 85%`.
    - **Duration / Sensitivity:** `2 Consecutive Failed Probes`, `Sustained >= 60 seconds`, `5-Sample Rolling Average`.
    - **Evaluation Interval:** `Every 15s (Fast-Ping Poller)`, `Every 60s Storage Sweep`, `Continuous 15s Probes`.
  - Replaced raw `&bull;` entity strings with formatted badges with Lucide icons (`Mail`, `Smartphone`, `Database`).
  - Collapsible technical query view available on-demand for DBAs/sysadmins via `[PostgreSQL Evaluator Query]`.

---

### 14. Multi-Timeframe Telemetry & Chart Frame Controls
- [x] ✅ **14.1 Universal Timeframe Engine (`deviceTelemetryGenerator.ts`):**
  - Added `ChartTimeframe = '1h' | '24h' | '7d' | '30d'` supporting:
    - **1H (Realtime):** 5-minute rolling window (`15:45` - `Current`) for live NOC monitoring.
    - **Daily (24H):** 24-hour day frame (`00:00`, `04:00`, `08:00`, `12:00`, `16:00`, `20:00`, `Now`) capturing diurnal business hours vs night lull.
    - **Weekly (7D):** 7-day rolling window (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Today`) modeling weekday load vs weekend maintenance.
    - **Monthly (30D):** 30-day aggregate trend (`Day 1-6` through `Today`) tracking long-term capacity and SLA stability.
- [x] ✅ **14.2 Detailed Device Charts Modal Timeframe Bar (`DeviceChartsModal.tsx`):**
  - Dedicated timeframe switcher bar with pill controls: `[ 1H (Realtime) ] [ Daily (24H) ] [ Weekly (7D) ] [ Monthly (30D) ]`.
  - Live window indicator badge + statistical aggregation (Peak Throughput Gbps • Average Latency RTT ms).
  - Automatically re-renders Bandwidth (Inbound vs Outbound), CPU Load, and ICMP Ping Latency & Spikes charts with matching XAxis timestamps.
- [x] ✅ **14.3 Tree View Right-Side Panel Timeframe Controls (`TreeView.tsx`):**
  - Inspection panel equipped with quick-toggle timeframe pills (`[ 1H ] [ Daily ] [ Weekly ] [ Monthly ]`).
  - Seamlessly toggles live inline ICMP Ping RTT sparkline and Ingress/Egress bandwidth charts without opening the popup modal.
- [x] ✅ **14.4 Executive Dashboard Timeframe Horizon Integration (`DashboardView.tsx`):**
  - Explicit `[ 1H ] [ Daily (24h) ] [ Weekly (7d) ] [ Monthly (30d) ]` timeframe buttons with human-readable date window badge.
  - Dynamically scales ranked server telemetry sparklines for Top CPU, Memory, Disk IOPS, and Latency monitors.

---

### 15. Nav-Wise & Symmetrical Architecture Refactoring (Frontend & Backend)
- [x] ✅ **15.1 Frontend Nav-Wise View Reorganization (`frontend/src/views/`):**
  - Fully organized and compartmentalized all 19 view screens into 5 Nav-aligned folders matching `Sidebar.tsx`:
    - `frontend/src/views/inventory/`: `DashboardView.tsx`, `TreeView.tsx`, `DevicesView.tsx`, `PortsView.tsx`, `SensorsView.tsx`, `index.ts`
    - `frontend/src/views/alerts/`: `AlertsView.tsx`, `RoutingView.tsx`, `WirelessView.tsx`, `MplsBillingView.tsx`, `index.ts`
    - `frontend/src/views/system/`: `VirtualizationView.tsx`, `PollersView.tsx`, `TopologyView.tsx`, `LogsView.tsx`, `SlaQosView.tsx`, `SettingsView.tsx`, `index.ts`
    - `frontend/src/views/personnel/`: `AlertContactsView.tsx`, `AlertMatrixView.tsx`, `index.ts`
    - `frontend/src/views/reports/`: `ReportsView.tsx`, `FeaturesMasterView.tsx`, `index.ts`
  - Created master barrel export `frontend/src/views/index.ts` and compatibility alias `frontend/src/components/views/index.ts`.
  - Updated all relative component and context imports cleanly.
  - Resolved `AlertRecipient` type collision by centralizing into `frontend/src/types.ts`.
  - Successfully verified with `npm run build` (`tsc -b && vite build`) with zero errors.
- [x] ✅ **15.2 Backend Symmetrical Modularization (`backend/internal/api/`):**
  - Split monolith `main.go` (613 lines) into structured, domain-driven API modules:
    - `backend/internal/api/routes.go`: Global CORS, `/api/v1` route tree registration
    - `backend/internal/api/auth.go`: `HandleLogin`, `HandleRegister`, `HandleLogout`, `HandleGetMe`
    - `backend/internal/api/users.go`: `HandleGetAllUsers`, `HandleCreateUser`, `HandleDeleteUser`
    - `backend/internal/api/devices.go`: `HandleGetAllDevices`, `HandleAddDevice`, `HandleGetDevicePorts`, `HandlePingDevice`, `HandlePollDevice`, `HandleGetDeviceMetrics`
    - `backend/internal/api/alerts.go`: `HandleGetAllAlerts`, `HandleAcknowledgeAlert`, `HandleResolveAlert`, `HandleSimulateAlert`
    - `backend/internal/api/personnel.go`: `HandleGetAllRecipients`, `HandleCreateRecipient`, `HandleDeleteRecipient`, `HandleGetRecipientSubscriptions`, `HandleSaveRecipientSubscriptions`
    - `backend/internal/api/settings.go`: `HandleHealthCheck`, `HandleGetNotificationSettings`, `HandleSaveNotificationSettings`, `HandleTestEmail`, `HandleTestSMS`
    - `backend/internal/api/discovery.go`: `HandleTriggerDiscoveryScan`, `HandleGetDiscoveryStatus`
  - `backend/cmd/server/main.go` reduced to 44 lines of clean startup and lifecycle orchestration.
  - Resolved IPv6 dial formatting in `internal/scanner/scanner.go` using `net.JoinHostPort`.
  - Successfully compiled with `go build -o vnms-server.exe ./cmd/server` with zero warnings (`go vet ./...` passed).
  - Live server running on `http://127.0.0.1:8081` with connected PostgreSQL 18.

---

### 16. Chart Popup & Right-Panel Compact Dark Typography (`DeviceChartsModal.tsx` & `TreeView.tsx`)
- [x] ✅ **16.1 Chart Detail Popup (`DeviceChartsModal.tsx`) Optimization:**
  - **Header Action Buttons:** Resized `Ping Now`, `SNMP Poll`, and `Close [X]` to compact hit targets with bold dark font (`fontSize: '0.72rem'`, `color: '#0f172a'`).
  - **Timeframe Selector Bar:** Compact pills (`1H`, `Daily`, `Weekly`, `Monthly`) with high-contrast dark text (`#0f172a` on white background with `#cbd5e1` border; white on blue when selected).
  - **Right-Side Stats & Window Labels:** Crisp dark labels (`Window:`, `Peak:`, `Avg RTT:`) with `fontSize: '0.68rem'` and color `#0f172a`.
  - **Chart Top-Right Legends:** `Inbound Traffic` and `Outbound Traffic` pills rendered in compact size (`fontSize: '0.70rem'`, `color: '#0f172a'`, dark font).
  - **Recharts Tooltip Popup:** Dark `#0f172a` background with `#334155` border, compact padding (`5px 9px`), small crisp typography (`0.70rem`), and high contrast data points.
  - **Tables & Headers:** Dark headers (`#0f172a` on `#f1f5f9`), compact row padding (`6px 10px`), and crisp text across Outages and Active Interfaces.
- [x] ✅ **16.2 Tree View Inspection Panel (`TreeView.tsx`) Right-Side Controls:**
  - Compact timeframe selector pills with dark text (`#0f172a`) and sharp borders.
  - Latency sparkline & bandwidth headers updated with dark font (`#0f172a`) and bold values.
  - Processor, Memory, and Storage hardware bars updated with crisp dark labels (`#0f172a`) and compact spacing.
  - Bottom action buttons (`Open Multi-Metric Detailed Modal`, `Fast Ping`, `SNMP Poll`) updated with compact, dark high-contrast styling.

---

### 17. PRTG-Inspired Enterprise 100-Feature Roadmap (V-NMS Evolution)

#### 17.1 Core Architecture & Probe Infrastructure (Points 1–10)
- [x] ✅ **17.1.1 Distributed Remote Probe Agent (`vnms-probe`):** Lightweight Go binary polling remote branches/VPCs via outbound TLS (port 23560).
- [x] ✅ **17.1.2 Offline Disconnection Caching:** Buffer readings in local SQLite/BoltDB when probe WAN link drops; auto-replay on reconnect.
- [x] ✅ **17.1.3 Zero-Touch Remote Probe Auto-Update:** Core server pushes verified binary updates to all connected probes automatically.
- [x] ✅ **17.1.4 Hierarchical Credential & Settings Inheritance:** Root/Group credentials (SNMP, SSH, WMI, schedules) cascade down to child devices.
- [x] ✅ **17.1.5 Parent-Child Sensor Dependencies:** Core gateway failure automatically marks downstream servers as `Paused (Dependency)` to eliminate false alarm floods.
- [x] ✅ **17.1.6 Virtual Device Libraries:** Cross-device grouping into logical collections (e.g. "All Core UPS Units", "Critical DB Cluster").
- [x] ✅ **17.1.7 Multi-Channel Sensor Architecture:** Multiple independent metric channels per sensor with individual warning/critical limits.
- [x] ✅ **17.1.8 OID Lookup Translation Engine (`lookups/*.ovl`):** Map raw vendor integer codes into semantic states (e.g. APC UPS battery normal vs degraded).
- [x] ✅ **17.1.9 Planned Maintenance Windows:** Schedule recurring maintenance periods (e.g., Sundays 02:00-04:00) that silence alerts and protect SLA stats.
- [x] ✅ **17.1.10 Active-Passive Failover Clustering:** Dual V-NMS core server replication with automatic VIP failover.

#### 17.2 Network Infrastructure & Deep Flow Telemetry (Points 11–20)
- [x] ✅ **17.2.1 NetFlow, IPFIX & sFlow UDP Collector:** Capture and parse flow packets on UDP port 2055/6343 into structured DB records.
- [x] ✅ **17.2.2 Top Talkers & Conversations Leaderboard:** Interactive bandwidth consumer ranking by IP, MAC, and Port.
- [x] ✅ **17.2.3 Custom Protocol Application Tagging:** Port-to-application dictionary (e.g. SAP, Oracle SQL, Zoom, Teams, VoIP) for traffic breakdowns.
- [x] ✅ **17.2.4 VoIP Packet Jitter & MOS Quality Scoring:** Calculate standard deviation delay and ITU-T G.107 MOS score (1.0 - 5.0) for voice calls.
- [x] ✅ **17.2.5 SIP Telephony Server Ping:** Send RFC 3261 `SIP OPTIONS` packets to VoIP PBX (Cisco CUCM, Asterisk) and measure 200 OK response latency.
- [x] ✅ **17.2.6 Dynamic Route Path & BGP Flap Traceroute:** Regular traceroute hop baselining that alerts on path deviation or intermediate hop latency.
- [x] ✅ **17.2.7 Cisco IP SLA & CBQoS Hardware Polling:** Directly poll `CISCO-RTTMON-MIB` and `CISCO-CLASS-BASED-QOS-MIB` for router-assisted probes.
- [x] ✅ **17.2.8 SNMP Trap Receiver & Rule Trigger Engine:** Listen on UDP port 162, match enterprise MIB trap definitions, and trigger incident actions.
- [x] ✅ **17.2.9 BGP Peer Session State & Reset Counters:** Poll `BGP4-MIB` for peer state transitions (Established, Active, Idle) and alert on resets.
- [x] ✅ **17.2.10 Offline IEEE MAC OUI Database:** Complete offline hardware vendor lookup dictionary (33,266 IEEE vendor OUIs embedded) for instant device manufacturer identification.

#### 17.3 Server Hardware, IPMI & Operating System Telemetry (Points 21–30)
- [x] ✅ **17.3.1 Out-of-Band IPMI & BMC Hardware Telemetry:** Direct Dell iDRAC, HPE iLO, Supermicro IPMI polling over UDP 623 (fans, PSUs, temps).
- [x] ✅ **17.3.2 DMTF Redfish RESTful BMC Collector:** Modern REST JSON telemetry for next-gen server chassis (Dell 14G/15G/16G, HPE Gen10/11).
- [x] ✅ **17.3.3 Windows Update & Patch Compliance Auditor:** Track days since last security update, count missing KBs, and detect pending reboot flags.
- [x] ✅ **17.3.4 Active Directory Replication Health:** Inspect Domain Controller SYSVOL sync, replication latency, and FSMO role status.
- [x] ✅ **17.3.5 Windows Service & Linux Systemd Daemon Monitor:** Real-time daemon status tracking with optional auto-restart remediation.
- [x] ✅ **17.3.6 Windows Event Log & Syslog Regex Matcher:** Scan Event Viewer logs (System, Security, Application) for critical Event IDs (e.g. 1074, 4625).
- [x] ✅ **17.3.7 Active RDP & SSH User Session Auditor:** Track active and disconnected administrator sessions on servers.
- [x] ✅ **17.3.8 Windows Task Scheduler Monitor:** Monitor scheduled tasks for error exit codes, missed runs, and excessive duration.
- [x] ✅ **17.3.9 NVMe/SSD SMART Wear-Leveling & Disk Health:** Track remaining flash write cycles, bad sector reallocation, and wear percentages.
- [x] ✅ **17.3.10 Enterprise Print Server & Spooler Queue Monitor:** Track stuck print jobs, paper jams, and toner percentages across office printers.

#### 17.4 Virtualization, Containers & Cloud Monitoring (Points 31–40)
- [x] ✅ **17.4.1 VMware vSphere & vCenter API Collector:** Agentless hypervisor telemetry for ESXi hosts, datastore latency, ballooning, and VMs.
- [x] ✅ **17.4.2 Microsoft Hyper-V Cluster Telemetry:** Hyper-V VM replication health, virtual switch throughput, and checkpoint age monitoring.
- [x] ✅ **17.4.3 Proxmox VE Cluster & Container Telemetry:** PVE REST API client tracking cluster quorum, LXC containers, and QEMU VMs.
- [x] ✅ **17.4.4 Citrix XenServer / XCP-ng Telemetry:** XenServer RRD metric collector for pool-wide compute and storage utilization.
- [x] ✅ **17.4.5 Docker & Containerd Daemon Telemetry:** Docker socket/REST client tracking container CPU, memory limits, network I/O, and crash loops.
- [x] ✅ **17.4.6 AWS CloudWatch Cloud Infrastructure Telemetry:** EC2, RDS, EBS, S3, and billing alarms via AWS IAM access keys.
- [x] ✅ **17.4.7 Microsoft Azure Cloud Telemetry:** Azure REST client monitoring VM health, Azure SQL DTU utilization, and subscription costs.
- [x] ✅ **17.4.8 Microsoft 365 SaaS Service Health:** Microsoft Graph API monitor for Exchange Online, SharePoint, Teams status, and license counts.
- [x] ✅ **17.4.9 SSL/TLS Certificate Expiration & Cipher Audit:** Query HTTPS endpoints on port 443; warn 30/15/7 days before cert expiry; audit TLS ciphers.
- [x] ✅ **17.4.10 Public IP DNS Blacklist (DNSBL) Auditor:** Continuously audit public IPs against 25+ spam blacklists (Spamhaus, Barracuda, SORBS).

#### 17.5 Enterprise Applications, Databases & Storage Fabric (Points 41–50)
- [x] ✅ **17.5.1 Custom SQL Query Execution Sensors:** Execute custom queries against MSSQL, PostgreSQL, MySQL, and Oracle and graph numeric outputs.
- [x] ✅ **17.5.2 Database Performance & Buffer Pool Telemetry:** Monitor Buffer Cache Hit Ratio, Page Life Expectancy, Active Connections, and Locks.
- [x] ✅ **17.5.3 NetApp Clustered Data ONTAP Storage Telemetry:** SAN/NAS telemetry for Aggregates, LUNs, Volume IOPS, SnapMirror, and LIF interfaces.
- [x] ✅ **17.5.4 Dell EMC PowerVault & EqualLogic Telemetry:** Controller battery health, enclosure temperatures, and RAID disk state polling.
- [x] ✅ **17.5.5 Synology & QNAP NAS RAID Health:** RAID volume degradation, bad sector counts, and fan speeds on SMB backup appliances.
- [x] ✅ **17.5.6 End-to-End Synthetic Email Round-Trip SLA:** Send test email via SMTP and poll POP3/IMAP to measure real-world message delivery SLA.
- [x] ✅ **17.5.7 Automated FTP/SFTP/FTPS Speed & File Count:** Test SFTP login, upload/download latency, throughput, and monitor drop directory file queues.
- [x] ✅ **17.5.8 Go Runtime Telemetry (`/debug/vars`):** Query Go `expvar` endpoints for goroutine counts, heap usage, and GC pause durations.
- [x] ✅ **17.5.9 Message Queue Depth Telemetry:** Monitor queue buildup in RabbitMQ, Apache Kafka, ActiveMQ, and NATS.
- [x] ✅ **17.5.10 Industrial IoT, Modbus TCP & OPC UA Sensors:** Telemetry for server room climate units, smart rack PDUs, and generator controllers.

#### 17.6 Synthetic Transactions, Web Journeys & SLAs (Points 51–60)
- [x] ✅ **17.6.1 Web Page Load Speed & TTFB Waterfall:** Download full HTML/CSS/JS and measure DNS lookup, connection time, and Time to First Byte.
- [x] ✅ **17.6.2 Multi-Step Synthetic Web User Journeys:** Scripted multi-step HTTP flows (Login -> Submit Form -> Check Cookie -> Verify Dashboard).
- [x] ✅ **17.6.3 HTTP Response Regex Matching & Anti-Defacement:** Alert if web page content deviates from expected regex pattern or string.
- [x] ✅ **17.6.4 DNS Query Resolution Timing & Integrity:** Query specific DNS records (A, AAAA, MX, TXT) and alert on mismatch or slow resolution.
- [x] ✅ **17.6.5 NTP Clock Drift & Stratum Offset Telemetry:** Alert if system clock offset deviates >100ms from Stratum-1 time reference.
- [x] ✅ **17.6.6 RADIUS & 802.1X Authentication SLA:** Authenticate test user against RADIUS/NPS server and verify Wi-Fi/VPN auth availability.
- [x] ✅ **17.6.7 Medical Imaging DICOM PACS Telemetry:** Send `C-ECHO` and `C-FIND` verification queries to hospital PACS servers.
- [x] ✅ **17.6.8 Healthcare HL7 Message Engine Verifier:** Validate ADT/ORM message flow over MLLP sockets for hospital integration engines.
- [x] ✅ **17.6.9 Delayed UP State Flapping Suppression:** Require 3 consecutive successful poll cycles before clearing DOWN state to stop alert flapping.
- [x] ✅ **17.6.10 External Pingdom / UptimeRobot Aggregator:** Pull public external monitoring status into V-NMS alongside internal LAN telemetry.

#### 17.7 Advanced Alerting, Escalations & NOC Audio Alarms (Points 61–70)
- [x] ✅ **17.7.1 Multi-Stage Timed Escalation Triggers:** Timed progression (0 min audio -> 5 min engineer email -> 15 min manager SMS -> 60 min page).
- [x] ✅ **17.7.2 Audio Alarms in NOC Web Dashboard:** Play audible alert tones (`alarm_1.wav`, Web Audio API siren & chime synthesizer) in browser with Navbar Mute/Unmute toggle.
- [x] ✅ **17.7.3 Sustained Speed & Bandwidth Window Triggers:** Alert only when bandwidth exceeds threshold for sustained window (e.g. >900 Mbps for 10 min).
- [x] ✅ **17.7.4 Cumulative Data Volume Quota Triggers:** Alert when total WAN data transferred exceeds quota (e.g. >500 GB in 24 hours).
- [x] ✅ **17.7.5 Value Change Triggers:** Trigger alerts whenever a value changes (switch config revision changed, SSL thumbprint changed).
- [x] ✅ **17.7.6 Native Web Push & Mobile Smartphone Alerts:** Browser Web Push (PWA Service Worker) and mobile push notifications without SMS gateway costs.
- [x] ✅ **17.7.7 Microsoft Teams, Slack & Discord Webhook Cards:** Adaptive JSON cards with severity color bars, node specs, and one-click acknowledge links.
- [x] ✅ **17.7.8 MQTT Alarm Dispatch to IoT Brokers:** Publish alert JSON to MQTT broker to activate physical datacenter warning strobes.
- [x] ✅ **17.7.9 OPC UA Industrial Alarm Dispatch:** Write alarm status into OPC UA server tags for factory SCADA integration.
- [x] ✅ **17.7.10 Automated Self-Healing Remediation Scripts:** Execute local PowerShell or SSH command on host failure before human escalation.

#### 17.8 NOC Interactive Maps, Wallboards & Visual Presentation (Points 71–80)
- [x] ✅ **17.8.1 Interactive Drag-and-Drop Map Designer:** Freeform canvas to place live sensor widgets, icons, links, and containers.
- [x] ✅ **17.8.2 Custom Floor Plan & Rack Elevation Overlays:** Upload floor plan PNG or server rack diagram and overlay clickable live sensor pins.
- [x] ✅ **17.8.3 Concentric Sunburst Health Chart:** Visual multi-tier radial tree showing infrastructure health from Root to Sensors in one glance.
- [x] ✅ **17.8.4 Analog Speedometer Dials & Radial Gauges:** Circular tachometer dials with color-coded warning/critical arcs for CPU and Bandwidth.
- [x] ✅ **17.8.5 Top 10 Live Leaderboards:** Live widgets for Top 10 CPU servers, Top 10 busiest ports/bandwidth, Top 10 ping slowest latency, and Top 10 shortest uptimes.
- [x] ✅ **17.8.6 Traffic Light Status Indicators:** High-contrast Red / Amber / Green stoplight widget for executive summary wallboards.
- [x] ✅ **17.8.7 Multi-Metric Interactive Comparator:** Overlay 2 to 10 sensor charts on the same timeline to correlate network traffic with CPU spikes.
- [x] ✅ **17.8.8 Server Rack QR Code Generator:** Generate printable equipment QR codes; scanning opens live mobile telemetry view.
- [x] ✅ **17.8.9 Public Read-Only Wallboard URLs:** Token-secured public dashboard links for unattended NOC wall TVs without login credentials.
- [x] ✅ **17.8.10 Automated Dashboard Carousel Slideshow:** Auto-rotate between Executive Dashboard, Topology Map, and Sensors every 30 seconds.

#### 17.9 Automated Scheduled Reporting, Analytics & Capacity Forecasting (Points 81–90)
- [x] ✅ **17.9.1 Automated Scheduled PDF & HTML Reports:** Background headless PDF generation dispatched via email on daily/weekly/monthly schedules.
- [x] ✅ **17.9.2 Pre-Packaged Enterprise Report Templates:** 24h Sensor History, 30-Day SLA Audit, Top 100 Uptime, and Interface 95th Percentile reports.
- [x] ✅ **17.9.3 Contractual SLA Compliance & Penalty Calculator:** Verify contractual SLA percentage (99.9%, 99.99%) with exact downtime minute breakdowns.
- [x] ✅ **17.9.4 Multi-Timeframe Historical Data Rollup:** Store 1-min raw data for 48h, 15-min rollup for 30d, 1-hour rollup for 365d in PostgreSQL.
- [x] ✅ **17.9.5 Instant Raw Data CSV/JSON/Excel Export:** One-click export button on all telemetry charts and inventory tables (Devices, Ports, Sensors, Alerts, Logs).
- [x] ✅ **17.9.6 Historical Anomaly Detection ("Unusual" State):** Flag behavioral anomalies comparing current metrics against same day-of-week baselines.
- [x] ✅ **17.9.7 Predictive Capacity Forecasting & Exhaustion Dates:** Linear regression forecasting projecting exact dates storage or memory reaches 100%.
- [x] ✅ **17.9.8 95th Percentile Burstable Billing Invoicing:** Calculate 95th percentile burstable bandwidth for ISP and client billing reconciliation.
- [x] ✅ **17.9.9 System Configuration & User Audit Reports:** One-click audit export of all users, permissions, credentials, and notification rules.
- [x] ✅ **17.9.10 AI Incident Root-Cause Analysis:** Natural language root cause diagnosis for complex multi-device cascade alarms.

#### 17.10 Security, Multi-Tenancy, Automation & Custom Extensibility (Points 91–100)
- [x] ✅ **17.10.1 Active Directory & LDAP User Synchronization:** Sync user accounts, passwords, and security groups from AD/LDAP.
- [x] ✅ **17.10.2 SAML 2.0 & OAuth Single Sign-On:** Integrate with Okta, Microsoft Entra ID (Azure AD), and Google Workspace for enterprise SSO.
- [x] ✅ **17.10.3 Multi-Tenant Client Portal Isolation:** MSP workspaces where customer accounts are restricted to their own subnets/devices.
- [x] ✅ **17.10.4 Granular Object-Level Access Control Matrix:** Define Read, Write, Admin, and Acknowledge permissions per device group.
- [x] ✅ **17.10.5 Built-in Incident Helpdesk & Ticketing System:** Link alarms to assignable support tickets with full lifecycle history.
- [x] ✅ **17.10.6 PRTG-Compatible Script Sensor Runner:** Execute PowerShell, Python, or Bash scripts returning JSON/XML channels.
- [x] ✅ **17.10.7 Full OpenAPI / Swagger REST API Documentation:** Interactive Swagger UI for all V-NMS endpoints.
- [x] ✅ **17.10.8 CIDR IP Whitelisting & API Rate Limiting:** Restrict management API access to authorized administrative IP ranges.
- [x] ✅ **17.10.9 Automated Subnet Discovery Templates:** Probe system OIDs during discovery and auto-attach appropriate vendor sensor profiles.
- [x] ✅ **17.10.10 In-Browser MIB Compiler & OID Tree Browser:** Upload vendor `.mib` files, navigate OID trees, and instantiate sensors with one click.











