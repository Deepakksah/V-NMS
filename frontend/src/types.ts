export interface Device {
  id: number;
  hostname: string;
  ip_address: string;
  snmp_version: string;
  snmp_community?: string;
  snmp_port: number;
  os: string;
  version?: string;
  hardware?: string;
  sys_name?: string;
  sys_descr?: string;
  location?: string;
  status: boolean;
  last_ping_ms: number;
  last_polled_at?: string;
  uptime_seconds?: number;
  cpu_percent?: number;
  memory_percent?: number;
  device_group?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'superadmin' | 'operator' | 'read_only' | string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface MetricDataPoint {
  time: string;
  latency: number;
  inTraffic: number;
  outTraffic: number;
  cpu: number;
}

export interface FeatureDefinition {
  id: number;
  categoryNumber: number;
  categoryName: string;
  modelName: string;
  displayName: string;
  description: string;
  targetImplementation: string;
  status: 'DONE' | 'IN PROGRESS' | 'ACTIVE' | 'PLANNED';
  icon: string;
  viewTab: string;
}

// 1. Core Device & Hardware
export interface DeviceAttribute {
  id: number;
  deviceId: number;
  deviceHostname: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface DeviceGroup {
  id: number;
  name: string;
  type: 'dynamic' | 'static';
  pattern: string;
  deviceCount: number;
  health: number;
}

export interface DeviceOutage {
  id: number;
  deviceId: number;
  deviceHostname: string;
  startTime: string;
  endTime?: string;
  durationMin: number;
  reason: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface LocationRecord {
  id: number;
  siteName: string;
  building: string;
  room: string;
  rack: string;
  lat: number;
  lng: number;
  deviceCount: number;
}

export interface EntPhysicalRecord {
  id: number;
  deviceId: number;
  deviceHostname: string;
  name: string;
  descr: string;
  clazz: 'chassis' | 'module' | 'powerSupply' | 'fan' | 'port' | 'sensor';
  serialNumber: string;
  modelNumber: string;
  firmwareRev: string;
  status: 'OK' | 'WARNING' | 'FAULT';
}

// 2. Ports & Physical Layer
export interface PortRecord {
  id: number;
  deviceId: number;
  deviceHostname: string;
  ifIndex: number;
  ifName: string;
  ifAlias: string;
  ifType: string;
  ifSpeed: number; // in bps
  ifAdminStatus: 'up' | 'down';
  ifOperStatus: 'up' | 'down';
  inBps: number;
  outBps: number;
  inErrors: number;
  outErrors: number;
  vlan: number;
  duplex: 'full' | 'half' | 'auto';
  stpState?: 'forwarding' | 'blocking' | 'learning' | 'disabled';
}

export interface PortFdbRecord {
  id: number;
  macAddress: string;
  portName: string;
  deviceId: number;
  deviceHostname: string;
  vlanId: number;
  vendor: string;
  lastSeen: string;
}

export interface PortSecurityViolation {
  id: number;
  portName: string;
  deviceHostname: string;
  violatingMac: string;
  violationType: 'mac_limit_exceeded' | 'unauthorized_8021x';
  timestamp: string;
  actionTaken: 'shutdown' | 'restrict' | 'protect';
}

// 3. Sensors & Environmental Health
export interface SensorRecord {
  id: number;
  deviceId: number;
  deviceHostname: string;
  sensorClass: 'temperature' | 'voltage' | 'current' | 'power' | 'fanspeed' | 'humidity';
  sensorDescr: string;
  currentValue: number;
  unit: string;
  limitLow: number;
  limitHigh: number;
  state: 'OK' | 'WARNING' | 'CRITICAL';
}

export interface ProcessorRecord {
  id: number;
  deviceId: number;
  deviceHostname: string;
  name: string;
  cores: number;
  utilization: number;
  temperatureC: number;
}

export interface MempoolRecord {
  id: number;
  deviceId: number;
  deviceHostname: string;
  poolName: string;
  totalBytes: number;
  usedBytes: number;
  percentUsed: number;
}

export interface StorageRecord {
  id: number;
  deviceId: number;
  deviceHostname: string;
  mountPoint: string;
  fileSystem: string;
  totalGb: number;
  usedGb: number;
  percentUsed: number;
}

export interface DiskIoRecord {
  id: number;
  deviceHostname: string;
  deviceDisk: string;
  readIops: number;
  writeIops: number;
  readThroughputMb: number;
  writeThroughputMb: number;
}

// 4. IP, Routing, Switching & Protocols
export interface Ipv4Record {
  id: number;
  ipAddress: string;
  subnetMask: string;
  cidr: string;
  deviceHostname: string;
  portName: string;
}

export interface SubnetBlock {
  id: number;
  prefix: string;
  vlanId: number;
  totalIps: number;
  usedIps: number;
  description: string;
}

export interface ArpEntryRecord {
  id: number;
  ipAddress: string;
  macAddress: string;
  deviceHostname: string;
  interfaceName: string;
  manufacturer: string;
}

export interface VlanRecord {
  id: number;
  vlanId: number;
  name: string;
  deviceHostname: string;
  taggedPorts: string[];
  untaggedPorts: string[];
  status: 'active' | 'suspended';
}

export interface VrfRecord {
  id: number;
  name: string;
  routeDistinguisher: string;
  routeTargetExport: string;
  routeTargetImport: string;
  interfacesCount: number;
  deviceHostname: string;
}

export interface RouteRecord {
  id: number;
  destination: string;
  gateway: string;
  protocol: 'static' | 'ospf' | 'bgp' | 'direct' | 'connected';
  metric: number;
  interfaceName: string;
  deviceHostname: string;
}

export interface BgpPeerRecord {
  id: number;
  peerIp: string;
  remoteAsn: number;
  localAsn: number;
  state: 'Established' | 'Idle' | 'Connect' | 'Active';
  prefixesReceived: number;
  prefixesAccepted: number;
  uptime: string;
  deviceHostname: string;
}

export interface OspfNeighborRecord {
  id: number;
  routerId: string;
  neighborIp: string;
  area: string;
  state: 'Full' | '2-Way' | 'Init' | 'Down';
  interfaceName: string;
  deviceHostname: string;
}

// 5. Alerts & Notifications
export interface AlertIncident {
  id: number;
  ruleTitle: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  deviceId: number;
  deviceHostname: string;
  entityName: string;
  entityType: string;
  triggeredAt: string;
  acknowledged: boolean;
  value: string;
}

export interface AlertRuleRecord {
  id: number;
  name: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  queryRule: string;
  entityType: string;
  notifyChannels: string[];
  enabled: boolean;
}

export interface AlertScheduleRecord {
  id: number;
  title: string;
  targetScope: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
}

export interface AlertTransportRecord {
  id: number;
  name: string;
  type: 'telegram' | 'slack' | 'webhook' | 'email' | 'pagerduty';
  target: string;
  status: 'HEALTHY' | 'FAILED';
  lastDispatched: string;
}

// 6. Wireless & Specialized Hardware
export interface AccessPointRecord {
  id: number;
  macAddress: string;
  name: string;
  controllerHostname: string;
  model: string;
  clientsConnected: number;
  channel2G: number;
  channel5G: number;
  status: 'UP' | 'DOWN';
}

export interface TransceiverRecord {
  id: number;
  deviceHostname: string;
  portName: string;
  type: 'SFP-10G-SR' | 'QSFP-40G-LR4' | '100G-CWDM4';
  rxPowerDbm: number;
  txPowerDbm: number;
  wavelengthNm: number;
  temperatureC: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export interface IpsecTunnelRecord {
  id: number;
  tunnelName: string;
  localEndpoint: string;
  remoteEndpoint: string;
  encryption: string;
  ikeVersion: string;
  status: 'UP' | 'DOWN';
  bytesInMb: number;
  bytesOutMb: number;
}

export interface SslCertRecord {
  id: number;
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

// 7. MPLS & Carrier Systems
export interface MplsLspRecord {
  id: number;
  lspName: string;
  sourceRouter: string;
  destRouter: string;
  adminStatus: 'up' | 'down';
  operStatus: 'up' | 'down';
  bandwidthMbps: number;
  fastReroute: boolean;
}

export interface PseudowireRecord {
  id: number;
  pwId: number;
  vcId: number;
  peerRouter: string;
  circuitType: 'Ethernet' | 'VLAN' | 'ATM';
  localInterface: string;
  operStatus: 'UP' | 'DOWN';
}

// 8. Billing & Bandwidth Accounting
export interface BillingContractRecord {
  id: number;
  customerName: string;
  contractType: '95th_percentile' | 'quota';
  committedMbps: number;
  burstMbps: number;
  current95thMbps: number;
  billPeriod: string;
  overageStatus: 'OK' | 'OVERAGE';
  assignedPorts: string[];
}

// 9. Load Balancers & Virtualization
export interface LoadBalancerVserverRecord {
  id: number;
  vipName: string;
  vipAddress: string;
  port: number;
  protocol: 'TCP' | 'HTTP' | 'HTTPS';
  activeConnections: number;
  healthyBackends: number;
  totalBackends: number;
  status: 'UP' | 'DEGRADED' | 'DOWN';
}

export interface VmRecord {
  id: number;
  vmName: string;
  hypervisor: string;
  os: string;
  vCpu: number;
  ramGb: number;
  storageGb: number;
  status: 'RUNNING' | 'STOPPED' | 'PAUSED';
  cpuPercent: number;
}

export interface OsProcessRecord {
  id: number;
  deviceHostname: string;
  pid: number;
  processName: string;
  cpuPercent: number;
  memoryMb: number;
  user: string;
}

export interface SyntheticServiceRecord {
  id: number;
  serviceName: string;
  target: string;
  checkType: 'HTTP' | 'HTTPS' | 'DNS' | 'SMTP' | 'NTP';
  responseTimeMs: number;
  expectedStatus: string;
  status: 'PASS' | 'FAIL';
  lastChecked: string;
}

// 10. Poller Architecture
export interface PollerNodeRecord {
  id: number;
  name: string;
  ipAddress: string;
  region: string;
  activeWorkers: number;
  devicesAssigned: number;
  avgCycleSeconds: number;
  memoryUsageMb: number;
  status: 'ONLINE' | 'STANDBY' | 'OFFLINE';
}

// 11. Custom Maps & Topology
export interface TopologyNode {
  id: string;
  label: string;
  type: 'core_router' | 'switch' | 'firewall' | 'server' | 'ap';
  ip: string;
  status: 'UP' | 'DOWN';
  x: number;
  y: number;
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  label: string;
  utilizationPercent: number;
  speedGbps: number;
}

// 12. Logs & Syslog
export interface SyslogRecord {
  id: number;
  timestamp: string;
  facility: string;
  severity: 'emerg' | 'alert' | 'crit' | 'err' | 'warning' | 'notice' | 'info' | 'debug';
  host: string;
  program: string;
  message: string;
}

export interface EventLogRecord {
  id: number;
  timestamp: string;
  deviceHostname: string;
  eventType: 'interface_down' | 'config_change' | 'bgp_flap' | 'power_fail';
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

export interface MonitoredAppRecord {
  id: number;
  deviceHostname: string;
  appName: string;
  version: string;
  status: 'UP' | 'DOWN';
  metrics: { [key: string]: string | number };
}

// 13. SLA & QoS
export interface SlaProbeRecord {
  id: number;
  probeName: string;
  sourceDevice: string;
  targetIp: string;
  rttMs: number;
  jitterMs: number;
  packetLossPercent: number;
  mosScore: number;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export interface QosClassRecord {
  id: number;
  deviceHostname: string;
  policyName: string;
  classMap: string;
  allocatedBps: number;
  currentBps: number;
  droppedPackets: number;
}

export interface CustomOidRecord {
  id: number;
  deviceHostname: string;
  oidName: string;
  oidString: string;
  lastValue: string;
  valueType: string;
  lastPolled: string;
}

// 14. Users & Vault
export interface UserAccountRecord {
  id: number;
  username: string;
  email: string;
  role: 'superadmin' | 'network_admin' | 'noc_operator' | 'read_only';
  twoFactorEnabled: boolean;
  lastLogin: string;
}

export interface VaultSecretRecord {
  id: number;
  title: string;
  targetType: 'snmp_v3' | 'ssh_key' | 'api_token' | 'radius';
  targetDevice: string;
  cipher: 'AES-256-GCM';
  updatedAt: string;
}

// 15. System Foundations
export interface SystemConfigRecord {
  id: number;
  group: string;
  key: string;
  value: string;
  description: string;
}

export interface PeeringDbIxRecord {
  id: number;
  ixName: string;
  city: string;
  country: string;
  ipv4Prefix: string;
  ipv6Prefix: string;
  participantsCount: number;
  speedGbps: number;
}
