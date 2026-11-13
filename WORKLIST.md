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










