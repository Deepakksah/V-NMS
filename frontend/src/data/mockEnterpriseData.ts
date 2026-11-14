import type {
  DeviceGroup,
  DeviceOutage,
  LocationRecord,
  EntPhysicalRecord,
  PortRecord,
  PortFdbRecord,
  PortSecurityViolation,
  SensorRecord,
  ProcessorRecord,
  MempoolRecord,
  StorageRecord,
  DiskIoRecord,
  Ipv4Record,
  SubnetBlock,
  ArpEntryRecord,
  VlanRecord,
  VrfRecord,
  RouteRecord,
  BgpPeerRecord,
  OspfNeighborRecord,
  AlertIncident,
  AlertRuleRecord,
  AlertScheduleRecord,
  AlertTransportRecord,
  AccessPointRecord,
  TransceiverRecord,
  IpsecTunnelRecord,
  SslCertRecord,
  MplsLspRecord,
  PseudowireRecord,
  BillingContractRecord,
  LoadBalancerVserverRecord,
  VmRecord,
  OsProcessRecord,
  SyntheticServiceRecord,
  PollerNodeRecord,
  TopologyNode,
  TopologyLink,
  SyslogRecord,
  EventLogRecord,
  MonitoredAppRecord,
  SlaProbeRecord,
  QosClassRecord,
  CustomOidRecord,
  UserAccountRecord,
  VaultSecretRecord,
  SystemConfigRecord,
  PeeringDbIxRecord
} from '../types';

// Category 1: Device Groups, Outages, Locations, EntPhysical (Real Network Infrastructure)
export const MOCK_DEVICE_GROUPS: DeviceGroup[] = [
  { id: 1, name: 'Core Security Gateways & Routers', type: 'dynamic', pattern: 'ip == 172.168.1.1', deviceCount: 1, health: 100 },
  { id: 2, name: 'Dell PowerEdge Compute Cluster', type: 'dynamic', pattern: 'hardware ~ Dell.*', deviceCount: 18, health: 100 },
  { id: 3, name: 'Linux Enterprise Cluster', type: 'dynamic', pattern: 'os ~ Linux.*', deviceCount: 5, health: 100 },
  { id: 4, name: 'Windows Production Servers', type: 'dynamic', pattern: 'os ~ Windows.*', deviceCount: 8, health: 100 },
  { id: 5, name: 'Managed Switches & Network Appliances', type: 'dynamic', pattern: 'role ~ (Switch|Appliance)', deviceCount: 3, health: 100 },
];

export const MOCK_DEVICE_OUTAGES: DeviceOutage[] = [
  { id: 101, deviceId: 1, deviceHostname: 'core-gw-01', startTime: '2026-11-13 14:10:00', endTime: '2026-11-13 14:12:15', durationMin: 2.2, reason: 'High-availability state synchronization failover test', status: 'RESOLVED' },
];

export const MOCK_LOCATIONS: LocationRecord[] = [
  { id: 1, siteName: 'Enterprise NOC & Datacenter Hub', building: 'Main Infrastructure Building', room: 'Server Room DC-1', rack: 'Rack A1 - Rack A8', lat: 28.6139, lng: 77.2090, deviceCount: 32 },
  { id: 2, siteName: 'Local Management Gateway Facility', building: 'Network Ops Center', room: 'NOC Room 101', rack: 'Wallmount 16U', lat: 28.6200, lng: 77.2100, deviceCount: 4 },
];

export const MOCK_ENT_PHYSICAL: EntPhysicalRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-gw-01', name: 'Check Point Security Gateway Chassis', descr: 'Enterprise Perimeter Firewall & Gateway System', clazz: 'chassis', serialNumber: 'SN-CP8878-01', modelNumber: 'CP-GW-172', firmwareRev: 'GAiA R81.20', status: 'OK' },
  { id: 2, deviceId: 2, deviceHostname: 'WIN-TBI5QJB6P82', name: 'NOC Host Management Server Chassis', descr: 'Windows Server 2022 Management Controller', clazz: 'chassis', serialNumber: 'SN-WIN-MGMTHOST', modelNumber: 'PowerEdge R750', firmwareRev: '2026.11', status: 'OK' },
  { id: 3, deviceId: 3, deviceHostname: 'WIN-0KBJVAPST46', name: 'Dell PowerEdge R750 Node 14 Chassis', descr: 'Dell Dual Xeon Scalable Server', clazz: 'chassis', serialNumber: 'SN-DELL-91F4', modelNumber: 'PowerEdge R750', firmwareRev: 'iDRAC9 6.10', status: 'OK' },
  { id: 4, deviceId: 4, deviceHostname: 'WIN-B1QJ2680QQF', name: 'Dell PowerEdge R750 Node 15 Chassis', descr: 'Dell Dual Xeon Scalable Server', clazz: 'chassis', serialNumber: 'SN-DELL-7410', modelNumber: 'PowerEdge R750', firmwareRev: 'iDRAC9 6.10', status: 'OK' },
];

// Category 2: Ports, FDB & Port Security (Real Detected Ports)
export const MOCK_PORTS: PortRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-gw-01', ifIndex: 1, ifName: 'eth0', ifAlias: 'Primary LAN Interface (172.168.1.1)', ifType: 'ethernetCsmacd', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 45000000, outBps: 32000000, inErrors: 0, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
  { id: 2, deviceId: 1, deviceHostname: 'core-gw-01', ifIndex: 2, ifName: 'SSH-22', ifAlias: 'Secure Management Terminal (Port 22)', ifType: 'servicePort', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 120000, outBps: 340000, inErrors: 0, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
  { id: 3, deviceId: 1, deviceHostname: 'core-gw-01', ifIndex: 3, ifName: 'HTTP-80', ifAlias: 'Web Management Console (Port 80)', ifType: 'servicePort', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 2400000, outBps: 8900000, inErrors: 0, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
  { id: 4, deviceId: 1, deviceHostname: 'core-gw-01', ifIndex: 4, ifName: 'HTTPS-443', ifAlias: 'SSL Portal & VPN (Port 443)', ifType: 'servicePort', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 12500000, outBps: 18200000, inErrors: 0, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
  { id: 5, deviceId: 2, deviceHostname: 'WIN-TBI5QJB6P82', ifIndex: 1, ifName: 'NIC1', ifAlias: 'Primary LAN Interface (172.168.1.11)', ifType: 'ethernetCsmacd', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 28000000, outBps: 41000000, inErrors: 0, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
  { id: 6, deviceId: 2, deviceHostname: 'WIN-TBI5QJB6P82', ifIndex: 2, ifName: 'SMB-445', ifAlias: 'Windows File Sharing & RPC (Port 445)', ifType: 'servicePort', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 8400000, outBps: 12100000, inErrors: 0, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
  { id: 7, deviceId: 2, deviceHostname: 'WIN-TBI5QJB6P82', ifIndex: 3, ifName: 'RDP-3389', ifAlias: 'Remote Desktop Protocol (Port 3389)', ifType: 'servicePort', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 450000, outBps: 2400000, inErrors: 0, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
  { id: 8, deviceId: 3, deviceHostname: 'WIN-0KBJVAPST46', ifIndex: 1, ifName: 'eth0', ifAlias: 'Primary LAN Interface (172.168.1.14)', ifType: 'ethernetCsmacd', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 15400000, outBps: 12100000, inErrors: 0, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
];

export const MOCK_PORTS_FDB: PortFdbRecord[] = [
  { id: 1, macAddress: '00:1C:7F:DC:88:78', portName: 'eth0', deviceId: 1, deviceHostname: 'core-gw-01', vlanId: 1, vendor: 'Check Point / Cisco', lastSeen: 'Just now' },
  { id: 2, macAddress: 'F0:D4:E2:E9:91:F4', portName: 'eth0', deviceId: 3, deviceHostname: 'WIN-0KBJVAPST46', vlanId: 1, vendor: 'Dell Inc.', lastSeen: 'Just now' },
  { id: 3, macAddress: 'F0:D4:E2:E9:74:10', portName: 'eth0', deviceId: 4, deviceHostname: 'WIN-B1QJ2680QQF', vlanId: 1, vendor: 'Dell Inc.', lastSeen: 'Just now' },
  { id: 4, macAddress: '20:88:10:BD:DE:73', portName: 'eth0', deviceId: 5, deviceHostname: 'WIN-DK4863L7MVJ', vlanId: 1, vendor: 'Supermicro', lastSeen: 'Just now' },
];

export const MOCK_PORT_SECURITY: PortSecurityViolation[] = [];

// Category 3: Sensors, Processors, Mempools, Storage, DiskIO
export const MOCK_SENSORS: SensorRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-gw-01', sensorClass: 'temperature', sensorDescr: 'Perimeter Gateway System Temp', currentValue: 38.2, unit: '°C', limitLow: 10, limitHigh: 65, state: 'OK' },
  { id: 2, deviceId: 1, deviceHostname: 'core-gw-01', sensorClass: 'fanspeed', sensorDescr: 'Chassis Cooling Fan Tray', currentValue: 3800, unit: 'RPM', limitLow: 1500, limitHigh: 8000, state: 'OK' },
  { id: 3, deviceId: 2, deviceHostname: 'WIN-TBI5QJB6P82', sensorClass: 'temperature', sensorDescr: 'Host CPU Package Temperature', currentValue: 42.0, unit: '°C', limitLow: 15, limitHigh: 75, state: 'OK' },
  { id: 4, deviceId: 3, deviceHostname: 'WIN-0KBJVAPST46', sensorClass: 'temperature', sensorDescr: 'Xeon Processor Intake Temp', currentValue: 36.5, unit: '°C', limitLow: 10, limitHigh: 70, state: 'OK' },
];

export const MOCK_PROCESSORS: ProcessorRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-gw-01', name: 'Check Point NP ASIC Processor', cores: 8, utilization: 22.4, temperatureC: 38.0 },
  { id: 2, deviceId: 2, deviceHostname: 'WIN-TBI5QJB6P82', name: 'Intel Xeon Processor E5/Gold', cores: 16, utilization: 18.5, temperatureC: 42.0 },
  { id: 3, deviceId: 3, deviceHostname: 'WIN-0KBJVAPST46', name: 'Intel Xeon Scalable 6330', cores: 28, utilization: 34.2, temperatureC: 36.5 },
];

export const MOCK_MEMPOOLS: MempoolRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-gw-01', poolName: 'System RAM (GAiA OS)', totalBytes: 17179869184, usedBytes: 5153960755, percentUsed: 30.0 },
  { id: 2, deviceId: 2, deviceHostname: 'WIN-TBI5QJB6P82', poolName: 'Physical RAM (NOC Host)', totalBytes: 68719476736, usedBytes: 24738988624, percentUsed: 36.0 },
  { id: 3, deviceId: 3, deviceHostname: 'WIN-0KBJVAPST46', poolName: 'DDR4 ECC Memory (Node 14)', totalBytes: 137438953472, usedBytes: 68719476736, percentUsed: 50.0 },
];

export const MOCK_STORAGE: StorageRecord[] = [
  // Server 14 (Dell PowerEdge Node 14)
  { id: 1, deviceId: 10, deviceHostname: 'WIN-0KBJVAPST46 (172.168.1.14)', mountPoint: 'C:\\ (System OS)', fileSystem: 'NTFS', totalGb: 210.1, usedGb: 136.1, percentUsed: 64.8 },
  { id: 2, deviceId: 10, deviceHostname: 'WIN-0KBJVAPST46 (172.168.1.14)', mountPoint: 'D:\\ (Local Disk RAID-10)', fileSystem: 'NTFS', totalGb: 1464.8, usedGb: 199.5, percentUsed: 13.6 },

  // Server 15 (Dell PowerEdge Node 15)
  { id: 3, deviceId: 2, deviceHostname: 'WIN-B1QJ2680QQF (172.168.1.15)', mountPoint: 'C:\\ (System OS)', fileSystem: 'NTFS', totalGb: 210.1, usedGb: 165.3, percentUsed: 78.7 },
  { id: 4, deviceId: 2, deviceHostname: 'WIN-B1QJ2680QQF (172.168.1.15)', mountPoint: 'E:\\ (Storage Array)', fileSystem: 'NTFS', totalGb: 1464.8, usedGb: 967.8, percentUsed: 66.1 },

  // Server 16 (Dell PowerEdge Node 16)
  { id: 5, deviceId: 3, deviceHostname: 'WIN-09QJ62CLSDG (172.168.1.16)', mountPoint: 'C:\\ (System OS)', fileSystem: 'NTFS', totalGb: 210.2, usedGb: 61.1, percentUsed: 29.1 },
  { id: 6, deviceId: 3, deviceHostname: 'WIN-09QJ62CLSDG (172.168.1.16)', mountPoint: 'F:\\ (Archive Store)', fileSystem: 'NTFS', totalGb: 1464.8, usedGb: 9.1, percentUsed: 0.6 },

  // Server 12 (Dell PowerEdge Node 12)
  { id: 7, deviceId: 25, deviceHostname: 'WIN-S6S7597BION (172.168.1.12)', mountPoint: 'C:\\ (System OS)', fileSystem: 'NTFS', totalGb: 976.1, usedGb: 209.2, percentUsed: 21.4 },
  { id: 8, deviceId: 25, deviceHostname: 'WIN-S6S7597BION (172.168.1.12)', mountPoint: 'D:\\ (Data Volume)', fileSystem: 'NTFS', totalGb: 140.2, usedGb: 30.9, percentUsed: 22.0 },

  // Server 13 (Dell PowerEdge Node 13)
  { id: 9, deviceId: 28, deviceHostname: 'WIN-49GSPF4PDUB (172.168.1.13)', mountPoint: 'C:\\ (System OS)', fileSystem: 'NTFS', totalGb: 600.0, usedGb: 64.2, percentUsed: 10.7 },
  { id: 10, deviceId: 28, deviceHostname: 'WIN-49GSPF4PDUB (172.168.1.13)', mountPoint: 'D:\\ (Data Array)', fileSystem: 'NTFS', totalGb: 1075.0, usedGb: 164.7, percentUsed: 15.3 },

  // Local NOC Server 11
  { id: 11, deviceId: 16, deviceHostname: 'WIN-TBI5QJB6P82 (172.168.1.11)', mountPoint: 'C:\\ (System OS)', fileSystem: 'NTFS', totalGb: 976.0, usedGb: 74.3, percentUsed: 7.6 },
  { id: 12, deviceId: 16, deviceHostname: 'WIN-TBI5QJB6P82 (172.168.1.11)', mountPoint: 'E:\\ (Backup Repository)', fileSystem: 'NTFS', totalGb: 698.5, usedGb: 59.4, percentUsed: 8.5 },

  // Server 19 (Dell PowerEdge R650xs Linux Node)
  { id: 13, deviceId: 29, deviceHostname: 'linux-node-19 (172.168.1.19)', mountPoint: '/ (Root System)', fileSystem: 'ext4', totalGb: 240.0, usedGb: 42.5, percentUsed: 17.7 },
  { id: 14, deviceId: 29, deviceHostname: 'linux-node-19 (172.168.1.19)', mountPoint: '/data/db (MongoDB Data Store)', fileSystem: 'xfs', totalGb: 720.0, usedGb: 138.2, percentUsed: 19.2 },

  // Server 17 (Dell PowerEdge R650xs PostgreSQL Node)
  { id: 15, deviceId: 27, deviceHostname: 'linux-node-17 (172.168.1.17)', mountPoint: '/ (Root System)', fileSystem: 'ext4', totalGb: 240.0, usedGb: 38.4, percentUsed: 16.0 },
  { id: 16, deviceId: 27, deviceHostname: 'linux-node-17 (172.168.1.17)', mountPoint: '/var/lib/postgresql/data (PostgreSQL DB)', fileSystem: 'xfs', totalGb: 720.0, usedGb: 184.6, percentUsed: 25.6 },

  // Server 18 (Dell PowerEdge R650xs Web & Cockpit Node)
  { id: 17, deviceId: 24, deviceHostname: 'linux-node-18 (172.168.1.18)', mountPoint: '/ (Root System)', fileSystem: 'ext4', totalGb: 480.0, usedGb: 52.1, percentUsed: 10.9 },
  { id: 18, deviceId: 24, deviceHostname: 'linux-node-18 (172.168.1.18)', mountPoint: '/var/log (Audit & Telemetry Logs)', fileSystem: 'ext4', totalGb: 480.0, usedGb: 44.3, percentUsed: 9.2 },

  // Server 20 (Dell PowerEdge R650xs Compute Worker Node)
  { id: 19, deviceId: 14, deviceHostname: 'linux-node-20 (172.168.1.20)', mountPoint: '/ (Root System)', fileSystem: 'ext4', totalGb: 480.0, usedGb: 68.2, percentUsed: 14.2 },
  { id: 20, deviceId: 14, deviceHostname: 'linux-node-20 (172.168.1.20)', mountPoint: '/opt (Container & App Runtime)', fileSystem: 'ext4', totalGb: 480.0, usedGb: 112.5, percentUsed: 23.4 },

  // Server 21 (Dell PowerEdge R650xs Cache & Shard Node)
  { id: 21, deviceId: 26, deviceHostname: 'linux-node-21 (172.168.1.21)', mountPoint: '/ (Root System)', fileSystem: 'ext4', totalGb: 240.0, usedGb: 35.8, percentUsed: 14.9 },
  { id: 22, deviceId: 26, deviceHostname: 'linux-node-21 (172.168.1.21)', mountPoint: '/var/lib/redis (Redis Cache)', fileSystem: 'ext4', totalGb: 240.0, usedGb: 42.1, percentUsed: 17.5 },
  { id: 23, deviceId: 26, deviceHostname: 'linux-node-21 (172.168.1.21)', mountPoint: '/data/shard (MongoDB Shard)', fileSystem: 'xfs', totalGb: 480.0, usedGb: 86.4, percentUsed: 18.0 },

  // Core Security Gateway
  { id: 24, deviceId: 12, deviceHostname: 'core-gw-01 (172.168.1.1)', mountPoint: '/ (GAiA OS)', fileSystem: 'ext4', totalGb: 60.0, usedGb: 18.2, percentUsed: 30.3 },
  { id: 25, deviceId: 12, deviceHostname: 'core-gw-01 (172.168.1.1)', mountPoint: '/var/log (Firewall Logs)', fileSystem: 'ext4', totalGb: 240.0, usedGb: 48.0, percentUsed: 20.0 },
];

export const MOCK_DISK_IO: DiskIoRecord[] = [
  // Server 14 Physical Disks
  { id: 1, deviceHostname: 'WIN-0KBJVAPST46 (172.168.1.14)', deviceDisk: 'SEAGATE ST600MM0069 (600 GB SAS 10K RPM Enterprise HDD)', readIops: 3200, writeIops: 4800, readThroughputMb: 185.0, writeThroughputMb: 240.0 },
  { id: 2, deviceHostname: 'WIN-0KBJVAPST46 (172.168.1.14)', deviceDisk: 'DELL PERC H330 Adp (1.8 TB Hardware RAID Array)', readIops: 8900, writeIops: 12400, readThroughputMb: 320.0, writeThroughputMb: 450.0 },

  // Server 15 Physical Disks
  { id: 3, deviceHostname: 'WIN-B1QJ2680QQF (172.168.1.15)', deviceDisk: 'SEAGATE ST600MM0069 (600 GB SAS 10K RPM Enterprise HDD)', readIops: 3100, writeIops: 4600, readThroughputMb: 180.0, writeThroughputMb: 235.0 },
  { id: 4, deviceHostname: 'WIN-B1QJ2680QQF (172.168.1.15)', deviceDisk: 'DELL PERC H330 Adp (1.8 TB Hardware RAID Array)', readIops: 9200, writeIops: 11800, readThroughputMb: 340.0, writeThroughputMb: 420.0 },

  // Server 16 Physical Disks
  { id: 5, deviceHostname: 'WIN-09QJ62CLSDG (172.168.1.16)', deviceDisk: 'DELL PERC H330 Adp (1.8 TB Hardware RAID Array)', readIops: 7800, writeIops: 10500, readThroughputMb: 290.0, writeThroughputMb: 390.0 },

  // Server 12 Physical Disks
  { id: 6, deviceHostname: 'WIN-S6S7597BION (172.168.1.12)', deviceDisk: 'SEAGATE ST600MM0069 (600 GB SAS 10K RPM Enterprise HDD)', readIops: 2900, writeIops: 4400, readThroughputMb: 175.0, writeThroughputMb: 220.0 },
  { id: 7, deviceHostname: 'WIN-S6S7597BION (172.168.1.12)', deviceDisk: 'DELL PERC H330 Adp (1.1 TB Hardware RAID Array)', readIops: 8400, writeIops: 11200, readThroughputMb: 310.0, writeThroughputMb: 410.0 },

  // Server 13 Physical Disks
  { id: 8, deviceHostname: 'WIN-49GSPF4PDUB (172.168.1.13)', deviceDisk: 'SEAGATE ST600MM0069 (600 GB SAS 10K RPM Enterprise HDD)', readIops: 3300, writeIops: 4900, readThroughputMb: 190.0, writeThroughputMb: 250.0 },
  { id: 9, deviceHostname: 'WIN-49GSPF4PDUB (172.168.1.13)', deviceDisk: 'DELL PERC H330 Adp (2.2 TB Hardware RAID Array)', readIops: 9600, writeIops: 13500, readThroughputMb: 360.0, writeThroughputMb: 490.0 },

  // Server 11 Physical RAID
  { id: 10, deviceHostname: 'WIN-TBI5QJB6P82 (172.168.1.11)', deviceDisk: 'DELL PERC H330 Adp (1.8 TB Hardware RAID Array)', readIops: 8400, writeIops: 11200, readThroughputMb: 310.0, writeThroughputMb: 410.0 },

  // Server 19 Physical NVMe SSD (MongoDB Cluster Node)
  { id: 11, deviceHostname: 'linux-node-19 (172.168.1.19)', deviceDisk: 'Dell Enterprise PCIe Gen4 NVMe SSD PM9A3 (960 GB)', readIops: 45000, writeIops: 38000, readThroughputMb: 1450.0, writeThroughputMb: 1850.0 },

  // Server 17 Physical NVMe SSD (PostgreSQL Cluster Node)
  { id: 12, deviceHostname: 'linux-node-17 (172.168.1.17)', deviceDisk: 'Dell Enterprise PCIe Gen4 NVMe SSD PM9A3 (960 GB)', readIops: 46000, writeIops: 42000, readThroughputMb: 1520.0, writeThroughputMb: 1950.0 },

  // Server 18 Physical SATA SSD (Web & Cockpit Node)
  { id: 13, deviceHostname: 'linux-node-18 (172.168.1.18)', deviceDisk: 'Dell Enterprise SATA Mixed-Use SSD (960 GB)', readIops: 24000, writeIops: 18500, readThroughputMb: 480.0, writeThroughputMb: 540.0 },

  // Server 20 Physical NVMe SSD (Compute Node)
  { id: 14, deviceHostname: 'linux-node-20 (172.168.1.20)', deviceDisk: 'Dell Enterprise PCIe Gen4 NVMe SSD PM9A3 (960 GB)', readIops: 44000, writeIops: 39000, readThroughputMb: 1400.0, writeThroughputMb: 1800.0 },

  // Server 21 Physical NVMe SSD (Redis Cache & Mongo Shard)
  { id: 15, deviceHostname: 'linux-node-21 (172.168.1.21)', deviceDisk: 'Dell Enterprise PCIe Gen4 NVMe SSD PM9A3 (960 GB)', readIops: 47000, writeIops: 41000, readThroughputMb: 1550.0, writeThroughputMb: 1920.0 },
];

// Category 4: Real Network Subnets, ARP Table, IPv4, VLANs
export const MOCK_IPV4: Ipv4Record[] = [
  { id: 1, ipAddress: '172.168.1.1', subnetMask: '255.255.255.0', cidr: '/24', deviceHostname: 'core-gw-01', portName: 'eth0 (Default Gateway)' },
  { id: 2, ipAddress: '172.168.1.11', subnetMask: '255.255.255.0', cidr: '/24', deviceHostname: 'WIN-TBI5QJB6P82', portName: 'NIC1 (Local NOC Host)' },
  { id: 3, ipAddress: '172.168.1.14', subnetMask: '255.255.255.0', cidr: '/24', deviceHostname: 'WIN-0KBJVAPST46', portName: 'eth0 (Dell Node 14)' },
  { id: 4, ipAddress: '172.168.1.15', subnetMask: '255.255.255.0', cidr: '/24', deviceHostname: 'WIN-B1QJ2680QQF', portName: 'eth0 (Dell Node 15)' },
  { id: 5, ipAddress: '172.168.1.16', subnetMask: '255.255.255.0', cidr: '/24', deviceHostname: 'WIN-09QJ62CLSDG', portName: 'eth0 (Dell Node 16)' },
  { id: 6, ipAddress: '172.168.1.22', subnetMask: '255.255.255.0', cidr: '/24', deviceHostname: 'WIN-DK4863L7MVJ', portName: 'eth0 (Supermicro)' },
  { id: 7, ipAddress: '172.168.1.56', subnetMask: '255.255.255.0', cidr: '/24', deviceHostname: 'DESKTOP-TF2PGC9', portName: 'eth0 (Dell Server)' },
];

export const MOCK_SUBNETS: SubnetBlock[] = [
  { id: 1, prefix: '172.168.1.0/24', vlanId: 1, totalIps: 254, usedIps: 34, description: 'Primary Enterprise LAN (NIC1 - Production Subnet)' },
  { id: 2, prefix: '169.254.0.0/16', vlanId: 0, totalIps: 65534, usedIps: 6, description: 'Internal Link-Local Cluster Interconnect (NIC2 - NIC4)' },
];

// Actual Machine ARP Cache from live network discovery
export const MOCK_ARP: ArpEntryRecord[] = [
  { id: 1, ipAddress: '172.168.1.1', macAddress: '00:1C:7F:DC:88:78', deviceHostname: 'core-gw-01', interfaceName: 'NIC1', manufacturer: 'Check Point / Cisco' },
  { id: 2, ipAddress: '172.168.1.14', macAddress: 'F0:D4:E2:E9:91:F4', deviceHostname: 'WIN-0KBJVAPST46', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 3, ipAddress: '172.168.1.15', macAddress: 'F0:D4:E2:E9:74:10', deviceHostname: 'WIN-B1QJ2680QQF', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 4, ipAddress: '172.168.1.16', macAddress: 'F0:D4:E2:E9:91:B0', deviceHostname: 'WIN-09QJ62CLSDG', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 5, ipAddress: '172.168.1.22', macAddress: '20:88:10:BD:DE:73', deviceHostname: 'WIN-DK4863L7MVJ', interfaceName: 'NIC1', manufacturer: 'Supermicro' },
  { id: 6, ipAddress: '172.168.1.51', macAddress: 'A4:BB:6D:A5:B8:F7', deviceHostname: 'DESKTOP-LMS5A05', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 7, ipAddress: '172.168.1.52', macAddress: 'A4:BB:6D:A5:B7:C2', deviceHostname: 'DESKTOP-LK7HKPB', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 8, ipAddress: '172.168.1.53', macAddress: '4C:D7:17:98:28:B1', deviceHostname: 'admin', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 9, ipAddress: '172.168.1.54', macAddress: '4C:D7:17:98:28:AB', deviceHostname: 'DESKTOP-C6VUH84', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 10, ipAddress: '172.168.1.55', macAddress: '4C:D7:17:98:28:9E', deviceHostname: 'DESKTOP-6U5UPDB', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 11, ipAddress: '172.168.1.56', macAddress: '4C:D7:17:98:23:F3', deviceHostname: 'DESKTOP-TF2PGC9', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 12, ipAddress: '172.168.1.60', macAddress: 'A4:BB:6D:A5:B1:1D', deviceHostname: 'BELPC', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 13, ipAddress: '172.168.1.63', macAddress: '4C:D7:17:98:29:47', deviceHostname: 'DESKTOP-V1JU1MF', interfaceName: 'NIC1', manufacturer: 'Dell Inc.' },
  { id: 14, ipAddress: '172.168.1.71', macAddress: 'F8:75:A4:D5:26:AC', deviceHostname: 'net-device-71', interfaceName: 'NIC1', manufacturer: 'Ubiquiti Networks' },
  { id: 15, ipAddress: '172.168.1.100', macAddress: '00:BE:43:6F:46:12', deviceHostname: 'dist-sw-100', interfaceName: 'NIC1', manufacturer: 'Dell / Switch' },
  { id: 16, ipAddress: '172.168.1.101', macAddress: '24:FB:E3:FF:96:51', deviceHostname: 'sw-cisco-101', interfaceName: 'NIC1', manufacturer: 'Cisco Systems' },
  { id: 17, ipAddress: '172.168.1.102', macAddress: '24:FB:E3:FF:96:51', deviceHostname: 'sw-cisco-102', interfaceName: 'NIC1', manufacturer: 'Cisco Systems' },
];

export const MOCK_VLANS: VlanRecord[] = [
  { id: 1, vlanId: 1, name: 'DEFAULT_MANAGEMENT', deviceHostname: 'core-gw-01', taggedPorts: ['eth0'], untaggedPorts: ['eth1-eth8'], status: 'active' },
  { id: 2, vlanId: 10, name: 'ENTERPRISE_SERVERS', deviceHostname: 'core-gw-01', taggedPorts: ['eth0'], untaggedPorts: [], status: 'active' },
];

export const MOCK_VRFS: VrfRecord[] = [
  { id: 1, name: 'VRF_DEFAULT', routeDistinguisher: '172:1', routeTargetExport: '172:1', routeTargetImport: '172:1', interfacesCount: 8, deviceHostname: 'core-gw-01' },
];

export const MOCK_ROUTES: RouteRecord[] = [
  { id: 1, destination: '0.0.0.0/0', gateway: '172.168.1.1', protocol: 'connected', metric: 0, interfaceName: 'NIC1', deviceHostname: 'WIN-TBI5QJB6P82' },
  { id: 2, destination: '172.168.1.0/24', gateway: 'direct', protocol: 'connected', metric: 0, interfaceName: 'NIC1', deviceHostname: 'WIN-TBI5QJB6P82' },
];

export const MOCK_BGP_PEERS: BgpPeerRecord[] = [];
export const MOCK_OSPF_NEIGHBORS: OspfNeighborRecord[] = [];

// Category 5: Real Alerts & Active Incidents
export const MOCK_ALERTS_ACTIVE: AlertIncident[] = [];

export const MOCK_ALERT_RULES: AlertRuleRecord[] = [
  { id: 1, name: 'Host Unreachable (ICMP Loss = 100%)', severity: 'CRITICAL', queryRule: 'device.status == false', entityType: 'device', notifyChannels: ['NOC Console', 'Event Log'], enabled: true },
  { id: 2, name: 'Latency Degraded (> 50ms)', severity: 'WARNING', queryRule: 'device.last_ping_ms > 50', entityType: 'device', notifyChannels: ['NOC Console'], enabled: true },
  { id: 3, name: 'Service Port Down', severity: 'WARNING', queryRule: 'ports.ifOperStatus == "down"', entityType: 'port', notifyChannels: ['NOC Console'], enabled: true },
];

export const MOCK_ALERT_SCHEDULES: AlertScheduleRecord[] = [
  { id: 1, title: 'Weekly Maintenance & Discovery Sweep', targetScope: 'Subnet 172.168.1.0/24', startTime: 'Every Sunday 02:00', endTime: 'Sunday 03:00', recurring: true, status: 'ACTIVE' },
];

export const MOCK_ALERT_TRANSPORTS: AlertTransportRecord[] = [
  { id: 1, name: 'NOC Live Console Stream', type: 'webhook', target: 'http://127.0.0.1:8081/alerts/webhook', status: 'HEALTHY', lastDispatched: 'Active' },
  { id: 2, name: 'Audit Event Log Dispatcher', type: 'email', target: 'noc-alerts@vnms.local', status: 'HEALTHY', lastDispatched: 'Active' },
];

// Category 6: Wireless & Specialized Hardware
export const MOCK_ACCESS_POINTS: AccessPointRecord[] = [
  { id: 1, macAddress: 'F8:75:A4:D5:26:AC', name: 'AP-UniFi-Building1', controllerHostname: 'core-gw-01', model: 'Ubiquiti UniFi 6 Pro', clientsConnected: 28, channel2G: 6, channel5G: 44, status: 'UP' },
];

export const MOCK_TRANSCEIVERS: TransceiverRecord[] = [
  { id: 1, deviceHostname: 'core-gw-01', portName: 'eth0', type: 'SFP-10G-SR', rxPowerDbm: 0.0, txPowerDbm: 0.0, wavelengthNm: 850, temperatureC: 38.2, status: 'OPTIMAL' },
];

export const MOCK_IPSEC_TUNNELS: IpsecTunnelRecord[] = [
  { id: 1, tunnelName: 'VPN-Local-SecGateway', localEndpoint: '172.168.1.1', remoteEndpoint: 'Internal', encryption: 'AES-256-GCM / SHA-384', ikeVersion: 'IKEv2', status: 'UP', bytesInMb: 4200, bytesOutMb: 5800 },
];

export const MOCK_SSL_CERTS: SslCertRecord[] = [
  { id: 1, domain: 'localhost (V-NMS Engine)', issuer: 'Local Trusted Authority', validFrom: '2026-01-01', validTo: '2027-01-01', daysRemaining: 48, status: 'VALID' },
];

// Category 7 & 8: Carrier & Billing
export const MOCK_MPLS_LSPS: MplsLspRecord[] = [];
export const MOCK_PSEUDOWIRES: PseudowireRecord[] = [];
export const MOCK_BILLS: BillingContractRecord[] = [];

// Category 9: Virtualization & Processes
export const MOCK_LOAD_BALANCERS: LoadBalancerVserverRecord[] = [];
export const MOCK_VMS: VmRecord[] = [
  { id: 1, vmName: 'WIN-0KBJVAPST46-VM1', hypervisor: 'WIN-0KBJVAPST46 (172.168.1.14)', os: 'Windows Server 2022', vCpu: 8, ramGb: 32, storageGb: 500, status: 'RUNNING', cpuPercent: 22.4 },
  { id: 2, vmName: 'linux-node-17-VM', hypervisor: 'linux-node-17 (172.168.1.17)', os: 'RHEL Enterprise Linux', vCpu: 16, ramGb: 64, storageGb: 1000, status: 'RUNNING', cpuPercent: 38.1 },
];

export const MOCK_PROCESSES: OsProcessRecord[] = [
  { id: 1, deviceHostname: 'WIN-TBI5QJB6P82', pid: 1824, processName: 'vnms-server.exe', cpuPercent: 1.2, memoryMb: 42, user: 'Administrator' },
  { id: 2, deviceHostname: 'WIN-TBI5QJB6P82', pid: 3248, processName: 'postgres.exe', cpuPercent: 2.4, memoryMb: 128, user: 'postgres' },
  { id: 3, deviceHostname: 'WIN-TBI5QJB6P82', pid: 4892, processName: 'node.exe (Vite)', cpuPercent: 0.8, memoryMb: 85, user: 'Administrator' },
];

export const MOCK_SYNTHETIC_SERVICES: SyntheticServiceRecord[] = [
  { id: 1, serviceName: 'V-NMS Core API Health', target: 'http://127.0.0.1:8081/api/v1/health', checkType: 'HTTP', responseTimeMs: 0.4, expectedStatus: 'HTTP 200 OK', status: 'PASS', lastChecked: 'Just now' },
  { id: 2, serviceName: 'Local Gateway ICMP Probe', target: 'http://172.168.1.1', checkType: 'HTTP', responseTimeMs: 0.5, expectedStatus: 'HTTP 200 OK', status: 'PASS', lastChecked: 'Just now' },
  { id: 3, serviceName: 'Database Listener Port', target: '127.0.0.1', checkType: 'DNS', responseTimeMs: 0.2, expectedStatus: 'Resolved', status: 'PASS', lastChecked: 'Just now' },
];

// Category 10: Real Poller Nodes
export const MOCK_POLLER_NODES: PollerNodeRecord[] = [
  { id: 1, name: 'Local-Master-Poller (WIN-TBI5QJB6P82)', ipAddress: '172.168.1.11', region: 'Local Subnet 172.168.1.0/24', activeWorkers: 40, devicesAssigned: 32, avgCycleSeconds: 1.8, memoryUsageMb: 42, status: 'ONLINE' },
];

// Category 11: Real Topology Nodes & Links
export const MOCK_TOPOLOGY_NODES: TopologyNode[] = [
  { id: 'gw1', label: 'core-gw-01', type: 'core_router', ip: '172.168.1.1', status: 'UP', x: 400, y: 50 },
  { id: 'noc1', label: 'WIN-TBI5QJB6P82 (NOC)', type: 'server', ip: '172.168.1.11', status: 'UP', x: 220, y: 200 },
  { id: 'sw1', label: 'dist-sw-100', type: 'switch', ip: '172.168.1.100', status: 'UP', x: 580, y: 200 },
  { id: 'srv1', label: 'Dell-Cluster (18 Nodes)', type: 'server', ip: '172.168.1.14 - 68', status: 'UP', x: 180, y: 350 },
  { id: 'srv2', label: 'Linux-Nodes (5 Hosts)', type: 'server', ip: '172.168.1.17 - 21', status: 'UP', x: 400, y: 350 },
  { id: 'ap1', label: 'net-device-71', type: 'ap', ip: '172.168.1.71', status: 'UP', x: 620, y: 350 },
];

export const MOCK_TOPOLOGY_LINKS: TopologyLink[] = [
  { id: 'l1', source: 'gw1', target: 'noc1', label: '1G Mgmt Link', utilizationPercent: 12, speedGbps: 1 },
  { id: 'l2', source: 'gw1', target: 'sw1', label: '10G Trunk', utilizationPercent: 24, speedGbps: 10 },
  { id: 'l3', source: 'sw1', target: 'srv1', label: '10G Dell Cluster Link', utilizationPercent: 38, speedGbps: 10 },
  { id: 'l4', source: 'sw1', target: 'srv2', label: '1G Linux Cluster', utilizationPercent: 18, speedGbps: 1 },
  { id: 'l5', source: 'sw1', target: 'ap1', label: '1G Access Uplink', utilizationPercent: 8, speedGbps: 1 },
];

// Category 12: Logs & System Activity
export const MOCK_SYSLOG: SyslogRecord[] = [
  { id: 1, timestamp: '2026-11-13 16:25:30', facility: 'local0', severity: 'info', host: 'WIN-TBI5QJB6P82', program: 'VNMS-SCAN', message: '[Scanner] Auto-discovery completed: 32 active network devices indexed in inventory' },
  { id: 2, timestamp: '2026-11-13 16:25:28', facility: 'daemon', severity: 'notice', host: 'core-gw-01', program: 'ICMP', message: 'ICMP fast-ping response: 0.5ms roundtrip latency' },
  { id: 3, timestamp: '2026-11-13 16:20:10', facility: 'auth', severity: 'info', host: 'WIN-TBI5QJB6P82', program: 'AUTH', message: 'User deepak.sah authenticated successfully via SuperAdmin token' },
];

export const MOCK_EVENT_LOGS: EventLogRecord[] = [
  { id: 1, timestamp: '2026-11-13 16:25:30', deviceHostname: 'WIN-TBI5QJB6P82', eventType: 'config_change', severity: 'info', message: 'Network Discovery Scan completed on subnet 172.168.1.0/24' },
  { id: 2, timestamp: '2026-11-13 16:20:46', deviceHostname: 'WIN-TBI5QJB6P82', eventType: 'config_change', severity: 'info', message: 'V-NMS Core Telemetry Engine initialized and active' },
];

export const MOCK_MONITORED_APPS: MonitoredAppRecord[] = [
  { id: 1, deviceHostname: 'WIN-TBI5QJB6P82', appName: 'PostgreSQL 18 Enterprise', version: '18.7-1', status: 'UP', metrics: { 'Active Conns': 5, 'Port': 5432, 'Database': 'vnms', 'Status': 'Healthy' } },
  { id: 2, deviceHostname: 'WIN-TBI5QJB6P82', appName: 'V-NMS Go Core Poller', version: '1.0.0-Go1.27', status: 'UP', metrics: { 'Goroutines': 42, 'Poller Interval': '30s', 'Monitored Hosts': 32 } },
  { id: 3, deviceHostname: 'WIN-TBI5QJB6P82', appName: 'Vite React Dashboard', version: '8.3.5', status: 'UP', metrics: { 'Port': 5173, 'Client Engine': 'React 19 / TypeScript' } },
];

// Category 13: SLA & QoS Performance
export const MOCK_SLA_PROBES: SlaProbeRecord[] = [
  { id: 1, probeName: 'NOC Host to Core Gateway Probe', sourceDevice: 'WIN-TBI5QJB6P82', targetIp: '172.168.1.1', rttMs: 0.5, jitterMs: 0.1, packetLossPercent: 0.0, mosScore: 4.49, status: 'HEALTHY' },
  { id: 2, probeName: 'Dell PowerEdge Compute Node 14 Probe', sourceDevice: 'WIN-TBI5QJB6P82', targetIp: '172.168.1.14', rttMs: 0.5, jitterMs: 0.1, packetLossPercent: 0.0, mosScore: 4.49, status: 'HEALTHY' },
];

export const MOCK_QOS_CLASSES: QosClassRecord[] = [
  { id: 1, deviceHostname: 'core-gw-01', policyName: 'LAN_DEFAULT_POLICY', classMap: 'MANAGEMENT_TRAFFIC', allocatedBps: 100000000, currentBps: 14500000, droppedPackets: 0 },
];

export const MOCK_CUSTOM_OIDS: CustomOidRecord[] = [
  { id: 1, deviceHostname: 'core-gw-01', oidName: 'sysDescr', oidString: '.1.3.6.1.2.1.1.1.0', lastValue: 'Check Point Security Gateway GAiA', valueType: 'DisplayString', lastPolled: 'Just now' },
];

// Category 14 & 15: Users, Vault, Config
export const MOCK_USERS: UserAccountRecord[] = [
  { id: 1, username: 'deepak.sah', email: 'deepak.sah@vnms.local', role: 'superadmin', twoFactorEnabled: true, lastLogin: '2026-11-13 16:20:00' },
  { id: 2, username: 'operator', email: 'operator@vnms.local', role: 'noc_operator', twoFactorEnabled: false, lastLogin: '2026-11-13 16:00:00' },
];

export const MOCK_VAULT_SECRETS: VaultSecretRecord[] = [
  { id: 1, title: 'SNMPv3 Public Community String', targetType: 'snmp_v3', targetDevice: 'All Subnet 172.168.1.0/24 Devices', cipher: 'AES-256-GCM', updatedAt: '2026-11-13' },
  { id: 2, title: 'Local Gateway Administrative Key', targetType: 'ssh_key', targetDevice: 'core-gw-01 (172.168.1.1)', cipher: 'AES-256-GCM', updatedAt: '2026-11-13' },
];

export const MOCK_SYSTEM_CONFIGS: SystemConfigRecord[] = [
  { id: 1, group: 'Network Scanner', key: 'discovery.default_subnet', value: '172.168.1.0/24', description: 'Active auto-discovery subnet CIDR' },
  { id: 2, group: 'Poller Core', key: 'poller.default_interval_seconds', value: '30', description: 'Real-time metrics polling cycle' },
  { id: 3, group: 'Fast Ping', key: 'ping.timeout_milliseconds', value: '600', description: 'ICMP ping timeout before marking node down' },
  { id: 4, group: 'Storage', key: 'timeseries.retention_days', value: '365', description: 'Telemetry data partition retention window' },
];

export const MOCK_PEERING_IXPS: PeeringDbIxRecord[] = [];
