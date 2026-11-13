# V-Nms: The Complete 145 LibreNMS Features & Models Master Checklist

This document catalogs all **145 Eloquent Models & Sub-Systems** extracted from the original LibreNMS project (pp/Models/*.php). 
In **V-Nms (Go + React + PostgreSQL)**, we will build, port, and modernize each module one by one across categorized functional domains.

---

## 1. Core Device & Hardware Infrastructure (12 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 1 | Device | Primary entity: IP, hostname, SNMP creds, OS, uptime, ping status | internal/models/device.go + devices table | **DONE** |
| 2 | DeviceAttrib | Custom key-value metadata attributes attached to devices | device_attributes table / JSONB column | Planned |
| 3 | DeviceGroup | Dynamic & static grouping of devices by vendor, OS, or tags | device_groups + relationship table | Planned |
| 4 | DeviceOutage | Downtime tracking, MTTR, duration, and outage history | device_outages table | Planned |
| 5 | DevicePerm | Multi-user access control / permissions per device | RBAC Middleware + device_permissions | Planned |
| 6 | DevicePollingMethod | Polling protocol override (SNMP v1/v2c/v3, Agent, SSH, ICMP only) | Poller dispatcher engine | Planned |
| 7 | DeviceStats | Poller cycle execution time, memory usage, and health stats | device_stats metrics | Planned |
| 8 | DeviceGraph | Custom graph views and pinned metrics for devices | Dashboard custom widget | Planned |
| 9 | DeviceRelatedModel | Base trait/abstract model for device relations | Go Interface / Struct Embedding | Planned |
| 10 | Availability | SLA availability % calculation over 24h, 7d, 30d, 1y | Aggregation worker query | Planned |
| 11 | Location | Physical geolocation, rack, site, building metadata, lat/long | locations table + map pins | Planned |
| 12 | EntPhysical | RFC 6933 Entity MIB: Chassis, Module, Power Supply, SFP serials | ent_physical hardware inventory | Planned |

---

## 2. Ports, Interfaces & Physical Layer (13 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 13 | Port | Network interfaces: ifIndex, speed, duplex, admin/oper status | ports table + IF-MIB SNMP walker | **DONE** |
| 14 | PortStack | Sub-interface and port stacking relationships (RFC 2863) | Interface hierarchy tree | Planned |
| 15 | PortStatistic | High-frequency packet error counters, drops, collisions | port_statistics table | Planned |
| 16 | PortGroup | Bundling ports across switches (LAG, LACP, EtherChannel) | Port group manager | Planned |
| 17 | PortPerm | Granular user permissions for specific switch ports | RBAC Port Filter | Planned |
| 18 | PortRelatedModel | Abstract relation model for port entities | Go Port struct embedding | Planned |
| 19 | PortSecurity | MAC-limiting, 802.1X security violation tracking | Port security engine | Planned |
| 20 | PortsFdb | Forwarding Database (Bridge MIB) - MAC to Port learning table | ARP / FDB Explorer | Planned |
| 21 | PortsNac | Network Access Control (NAC) identity & authentication logs | NAC monitor | Planned |
| 22 | PortStp | Spanning Tree Protocol port states (Blocking, Forwarding) | STP state engine | Planned |
| 23 | PortVlan | 802.1Q VLAN membership per port (Access, Trunk, Native) | VLAN port mapping | Planned |
| 24 | PortAdsl | ADSL/VDSL line attenuation, SNR margin, sync speed | Telco line poller | Planned |
| 25 | PortVdsl | VDSL2 broadband line statistics | Telco line poller | Planned |

---

## 3. Sensors, Metrics & Environmental Health (10 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 26 | Sensor | Temperature, Fan RPM, Voltage, Current, Power sensors | sensors table + MIB sensor walker | **IN PROGRESS** |
| 27 | SensorModel | Abstract polymorphic relation for sensor types | Sensor interface | Planned |
| 28 | SensorToStateIndex | Mapping numerical sensor states to text (e.g. 1=OK, 2=Fault) | State lookup table | Planned |
| 29 | StateIndex | Multi-vendor discrete state definitions | Enum state parser | Planned |
| 30 | StateTranslation | Translations for vendor-specific status codes | State dictionary | Planned |
| 31 | Processor | Multi-core CPU utilization percentage tracking | processors table + metrics | Planned |
| 32 | Mempool | Physical RAM and Swap/Virtual memory pools | mempools table + metrics | Planned |
| 33 | Storage | Disk drives, flash storage, partition sizes & % used | storages table + metrics | Planned |
| 34 | DiskIo | Disk read/write throughput (IOPS and transfer rates) | Disk I/O telemetry | Planned |
| 35 | UcdDiskio | Net-SNMP UCD-DISKIO-MIB specific disk throughput | Linux disk poller | Planned |

---

## 4. IP, Routing, Switching & Protocols (20 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 36 | Ipv4Address | IPv4 addresses assigned to interfaces with subnet mask | IPAM & Interface Address table | Planned |
| 37 | Ipv4Mac | ARP table cache: IPv4 to MAC address mapping | Network ARP table explorer | Planned |
| 38 | Ipv4Network | IPv4 Subnets and CIDR network blocks | Subnet breakdown view | Planned |
| 39 | Ipv6Address | IPv6 Global and Link-Local interface addresses | IPv6 address manager | Planned |
| 40 | Ipv6Nd | IPv6 Neighbor Discovery table (NDP) | IPv6 neighbor explorer | Planned |
| 41 | Ipv6Network | IPv6 subnets and prefixes | IPv6 prefix table | Planned |
| 42 | Vlan | 802.1Q VLAN IDs and VLAN names discovered on switches | VLAN inventory | Planned |
| 43 | Vrf | Virtual Routing and Forwarding (VRF) instances & Route Targets | MPLS / VRF viewer | Planned |
| 44 | Route | IP routing tables: Default gateway, static & dynamic routes | Routing table explorer | Planned |
| 45 | Link | Physical/logical links between devices via LLDP, CDP, FDP | Auto-Topology Map Engine | Planned |
| 46 | BgpPeer | BGP Sessions, Autonomous System Numbers (ASN), state (Established) | BGP neighbor monitor | Planned |
| 47 | BgpPeerCbgp | Cisco BGP prefix counters (received, accepted, advertised) | BGP prefix telemetry | Planned |
| 48 | OspfArea | OSPF routing areas configured on device | OSPF area table | Planned |
| 49 | OspfInstance | OSPF process instances and router IDs | OSPF instance manager | Planned |
| 50 | OspfNbr | OSPF Neighbor adjacency states (Full, 2-Way, Down) | OSPF adjacency monitor | Planned |
| 51 | OspfPort | Interfaces participating in OSPF routing | OSPF interface list | Planned |
| 52 | Ospfv3Area | OSPF for IPv6 (OSPFv3) areas | OSPFv3 area table | Planned |
| 53 | Ospfv3Instance | OSPFv3 process instances | OSPFv3 instance manager | Planned |
| 54 | Ospfv3Nbr | OSPFv3 neighbor adjacencies | OSPFv3 neighbor monitor | Planned |
| 55 | Ospfv3Port | OSPFv3 interface metrics and states | OSPFv3 interface list | Planned |

---

## 5. Alerts, Notifications & Faults (15 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 56 | Alert | Active triggered alert instances with timestamps | lerts table | **DONE** |
| 57 | AlertRule | SQL-like conditional rules (e.g. CPU > 90%, Ping = 0) | Rule Evaluator engine | **DONE** |
| 58 | AlertLog | Historical audit log of fired, acknowledged, and cleared alerts | lert_logs archive table | Planned |
| 59 | AlertFault | Exact entity ID (e.g. port 4, CPU core 1) causing alert | Fault entity linker | Planned |
| 60 | AlertSchedule | Maintenance windows (mute alerts during planned maintenance) | Maintenance scheduler | Planned |
| 61 | AlertSchedulable | Relationship linking devices/groups to maintenance windows | Schedule mapper | Planned |
| 62 | AlertTemplate | Custom alert notification templates (HTML/Markdown/JSON) | Template engine | Planned |
| 63 | AlertTemplateMap | Mapping alert rules to customized notification templates | Template mapper | Planned |
| 64 | AlertTransport | Channels: Telegram, Slack, Webhooks, Email, Discord | Webhook & Telegram dispatcher | Planned |
| 65 | AlertTransportGroup | Grouping multiple notification channels together | Transport groups | Planned |
| 66 | AlertOperation | Escalation steps (e.g. notify on-call after 10 mins) | Escalation pipeline | Planned |
| 67 | AlertOperationSegment | Time segments for phased notification escalation | Escalation segmenter | Planned |
| 68 | AlertOperationTransportMap | Transport mapping per escalation step | Escalation dispatcher | Planned |
| 69 | Notification | System notifications sent to users | User notification inbox | Planned |
| 70 | NotificationAttrib | Metadata attributes for notifications | Notification metadata | Planned |

---

## 6. Wireless, Telco & Specialized Hardware (10 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 71 | AccessPoint | Wi-Fi Access Points connected to wireless controllers | Wi-Fi AP inventory | Planned |
| 72 | WirelessSensor | Wi-Fi client count, channel interference, signal RSSI/SNR | Wireless metrics | Planned |
| 73 | PrinterSupply | Printer toner, drum, paper tray levels & life % | Printer supplies monitor | Planned |
| 74 | Transceiver | Optical SFP/QSFP transceiver optical RX/TX dBm power | DOM/DDM optical monitor | Planned |
| 75 | IpsecTunnel | IPsec VPN tunnels: Peer IP, encryption status, bytes in/out | VPN tunnel monitor | Planned |
| 76 | CefSwitching | Cisco Express Forwarding (CEF) packet switching stats | Cisco CEF monitor | Planned |
| 77 | IsisAdjacency | IS-IS routing protocol neighbor adjacencies | IS-IS neighbor explorer | Planned |
| 78 | JuniAtmVp | Juniper ATM Virtual Path statistics | ATM VP monitor | Planned |
| 79 | TnmsneInfo | Coriant/Infinera Optical Network Element info | Optical network monitor | Planned |
| 80 | SslCertificate | SSL/TLS certificate expiry tracker & CN/SAN validator | SSL expiration engine | Planned |

---

## 7. MPLS, Carrier & WAN Systems (10 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 81 | Mpls | MPLS global router settings | MPLS manager | Planned |
| 82 | MplsLsp | MPLS Label Switched Paths (LSP) and operational state | LSP monitor | Planned |
| 83 | MplsLspPath | Primary and secondary hop paths for MPLS LSPs | LSP path tracker | Planned |
| 84 | MplsSap | Service Access Points (SAP) on Nokia/Alcatel equipment | SAP bandwidth monitor | Planned |
| 85 | MplsSdp | Service Distribution Points (SDP) across MPLS core | SDP tunnel monitor | Planned |
| 86 | MplsSdpBind | Binding between services and SDP tunnels | SDP binding table | Planned |
| 87 | MplsService | VPLS, VLL, and E-Line carrier Ethernet services | Carrier service monitor | Planned |
| 88 | MplsTunnelArHop | Actual Route Hop records for MPLS tunnels | Tunnel hop tracer | Planned |
| 89 | MplsTunnelCHop | Configured Hop records for MPLS tunnels | Tunnel hop tracer | Planned |
| 90 | Pseudowire | Layer 2 pseudowires (L2VPN / EoMPLS circuits) | Pseudowire circuit monitor | Planned |

---

## 8. Billing, Transit & Bandwidth Accounting (9 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 91 | Bill | Customer bandwidth billing contracts (95th percentile, quota) | ISP Billing engine | Planned |
| 92 | BillData | Measured CDR / transfer volume per billing period | Billing measurements | Planned |
| 93 | BillHistory | Historic invoices and bandwidth consumption records | Billing history archive | Planned |
| 94 | BillPort | Network ports assigned to a customer billing circuit | Bill port mapping | Planned |
| 95 | BillPortCounter | Raw counter deltas for 95th percentile calculation | 95th percentile calculator | Planned |
| 96 | BillPerm | Customer permissions to view their own billing graphs | Multi-tenant billing portal | Planned |
| 97 | BillRelatedModel | Abstract relation for billing entities | Billing relation struct | Planned |
| 98 | MacAccounting | Cisco MAC accounting: bytes transferred per MAC on interface | MAC bandwidth usage | Planned |
| 99 | MefInfo | Metro Ethernet Forum (MEF) UNI and circuit info | Metro Ethernet monitor | Planned |

---

## 9. Load Balancers, Virtualization & Systems (9 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 100 | LoadbalancerVserver | Virtual Server IP (VIP), pool status, active connections | VIP health monitor | Planned |
| 101 | LoadbalancerRserver | Real backend server pool members and health check status | Backend pool monitor | Planned |
| 102 | NetscalerVserver | Citrix NetScaler / ADC virtual server metrics | NetScaler monitor | Planned |
| 103 | Vminfo | Virtual Machines discovered on hypervisors (VMware, Proxmox) | Hypervisor VM explorer | Planned |
| 104 | HrSystem | RFC 2790 Host Resources MIB System overview | Host overview | Planned |
| 105 | HrDevice | Host Resources Hardware Devices (Processors, disks, network) | Host hardware inventory | Planned |
| 106 | Process | Running OS processes polled via SNMP/Agent | Process list & memory | Planned |
| 107 | Service | Synthetic service checks (HTTP, HTTPS, DNS, SMTP, NTP) | Synthetic health checks | Planned |
| 108 | ServiceTemplate | Standardized templates for synthetic service checks | Service check templates | Planned |

---

## 10. Poller Architecture & Clustering (4 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 109 | Poller | Poller instance metadata and status | Go Poller worker instance | **DONE** |
| 110 | PollerCluster | Multi-node distributed poller cluster nodes | Distributed Go poller nodes | Planned |
| 111 | PollerClusterStat | Cluster load balancing, job dispatch times, latency | Cluster stats API | Planned |
| 112 | PollerGroup | Pinning specific devices to remote pollers (VPC / Branch office) | Regional poller groups | Planned |

---

## 11. Custom Maps & Network Topology (5 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 113 | CustomMap | User-defined custom network diagrams and floorplans | Interactive Canvas Map | Planned |
| 114 | CustomMapNode | Devices/icons placed on a custom map canvas | Map node coordinates | Planned |
| 115 | CustomMapEdge | Lines connecting nodes showing real-time link utilization | Map edge traffic styling | Planned |
| 116 | CustomMapBackground | Floorplan / world map background images | Map background layer | Planned |
| 117 | CustomMapNodeImage | Custom icons for routers, firewalls, and server racks | SVG / PNG icon set | Planned |

---

## 12. Logs, Events, Syslog & Applications (10 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 118 | Eventlog | Significant device events (interface flapping, config changes) | event_logs table | Planned |
| 119 | Syslog | Real-time Syslog messages received via UDP port 514 | Go UDP 514 Syslog receiver | Planned |
| 120 | AuthLog | User login attempts, success, failures, and IP tracking | Security audit log | Planned |
| 121 | Component | Modular device components (Cisco modules, chassis blades) | Component manager | Planned |
| 122 | ComponentPref | Component configuration overrides | Component settings | Planned |
| 123 | ComponentStatusLog | Historical state changes of hardware components | Component log | Planned |
| 124 | Application | Applications monitored on host (Apache, Nginx, MySQL, BIND) | Application agent monitor | Planned |
| 125 | ApplicationMetric | Application-specific counters (e.g. MySQL QPS, Nginx active conns) | App metrics telemetry | Planned |
| 126 | MuninPlugin | Integration with Munin telemetry plugins | Munin plugin parser | Planned |
| 127 | Package | Installed OS packages/RPMs/DEBs tracked on servers | Software package inventory | Planned |

---

## 13. SLA, QoS & Performance (4 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 128 | Sla | Cisco IP SLA / Juniper RPM probes (jitter, MOS score, packet loss) | IP SLA voice/video monitor | Planned |
| 129 | Qos | Quality of Service (QoS) class-map, drop rates, policing | QoS traffic shaper view | Planned |
| 130 | Stp | Spanning Tree Protocol root bridge & topology change counter | STP topology monitor | Planned |
| 131 | Customoid | User-defined custom SNMP OIDs to poll arbitrary devices | Custom OID builder | Planned |

---

## 14. Users, Authentication & Dashboards (6 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 132 | User | User accounts, credentials, email, 2FA, API tokens | users table + JWT auth | **DONE** |
| 133 | UserPref | User UI preferences (dark mode, refresh rate, default dashboard) | User preferences JSON | Planned |
| 134 | UserWidget | Dashboard widgets configured by user (charts, summaries) | React grid dashboard | Planned |
| 135 | Dashboard | Named dashboard layouts (NOC, Executive, Core Network) | Multi-dashboard manager | Planned |
| 136 | Secret | Encrypted SNMP v3 credentials, SSH keys, passwords | AES-GCM encrypted vault | Planned |
| 137 | Callback | Webhook callbacks triggered on system lifecycle events | Outbound webhook caller | Planned |

---

## 15. System Foundations & Plugins (8 Models)

| # | LibreNMS Model | Description & Purpose | V-Nms Implementation Target | Status |
|---|---|---|---|:---:|
| 138 | BaseModel | Base Eloquent model providing global traits and scopes | Go standard model interface | **DONE** |
| 139 | Config | Global system configurations stored in database | configs table + cache | Planned |
| 140 | Plugin | Community and third-party extension modules | Go Plugin system | Planned |
| 141 | GraphType | Graph rendering definitions and metric mappings | React chart definitions | Planned |
| 142 | PeeringdbIx | PeeringDB Internet Exchange (IXP) participant data | IXP peering explorer | Planned |
| 143 | PeeringdbIxPeer | PeeringDB peer IP addresses and ASN records | Peering manager | Planned |
| 144 | EntityState | Polymorphic hardware state tracker | Universal state model | Planned |
| 145 | TransportGroupTransport | Pivot mapping between transport groups and transports | Transport pivot table | Planned |

---

## Summary & Next Execution Strategy

- **Total Cataloged**: 145/145 LibreNMS Models.
- **Core Engine Live**: Devices (#1), Ports (#13), Alerts (#56, #57), Poller (#109), Users (#132), Time-Series Metrics.
- **Immediate Next Step**: We will execute module-by-module, starting from **Interfaces & Ports (#13, #14, #15)** and **Sensors (#26 - #35)**.
