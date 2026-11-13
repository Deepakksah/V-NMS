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

// Category 1: Device Groups, Outages, Locations, EntPhysical
export const MOCK_DEVICE_GROUPS: DeviceGroup[] = [
  { id: 1, name: 'Core Backbone Routers', type: 'dynamic', pattern: 'hostname ~ core-.*', deviceCount: 8, health: 100 },
  { id: 2, name: 'Datacenter Distribution Switches', type: 'dynamic', pattern: 'os == "Cisco IOS-XE"', deviceCount: 24, health: 95 },
  { id: 3, name: 'Edge Firewalls & VPN Gateways', type: 'static', pattern: 'manual', deviceCount: 6, health: 100 },
  { id: 4, name: 'Access Layer Switches', type: 'dynamic', pattern: 'hostname ~ acc-.*', deviceCount: 42, health: 92 },
  { id: 5, name: 'Compute Hypervisors', type: 'dynamic', pattern: 'os ~ (Proxmox|VMware)', deviceCount: 16, health: 98 },
];

export const MOCK_DEVICE_OUTAGES: DeviceOutage[] = [
  { id: 101, deviceId: 3, deviceHostname: 'acc-sw-floor3.corp', startTime: '2026-11-12 18:22:10', endTime: '2026-11-12 18:38:45', durationMin: 16.5, reason: 'PDU Power Supply tripped on Rack B12', status: 'RESOLVED' },
  { id: 102, deviceId: 7, deviceHostname: 'edge-gw-mumbai.isp', startTime: '2026-11-12 14:10:02', endTime: '2026-11-12 14:18:20', durationMin: 8.3, reason: 'Fiber cut on local loop line 04', status: 'RESOLVED' },
  { id: 103, deviceId: 12, deviceHostname: 'branch-rtr-delhi.wan', startTime: '2026-11-12 21:05:00', durationMin: 45.0, reason: 'ICMP timeout, uplink packet loss 100%', status: 'ACTIVE' },
];

export const MOCK_LOCATIONS: LocationRecord[] = [
  { id: 1, siteName: 'HQ Datacenter DC-1', building: 'Building Alpha', room: 'Server Room 402', rack: 'Rack A-01 to A-08', lat: 28.6139, lng: 77.2090, deviceCount: 48 },
  { id: 2, siteName: 'Disaster Recovery Site DC-2', building: 'Tech Park B', room: 'Suite 101', rack: 'Rack R-01 to R-04', lat: 19.0760, lng: 72.8777, deviceCount: 32 },
  { id: 3, siteName: 'Edge Branch Bangalore', building: 'Cyber Tower 2', room: 'IDF-02', rack: 'Wallmount 12U', lat: 12.9716, lng: 77.5946, deviceCount: 12 },
];

export const MOCK_ENT_PHYSICAL: EntPhysicalRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', name: 'Chassis Cisco ASR 1006-X', descr: 'Modular Routing System 100 Gbps backplane', clazz: 'chassis', serialNumber: 'SN-FXS2039182', modelNumber: 'ASR1006-X', firmwareRev: 'IOS-XE 17.9.4a', status: 'OK' },
  { id: 2, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', name: 'Route Processor Slot 0', descr: 'ASR1000-RP3 16GB RAM Quad Core', clazz: 'module', serialNumber: 'SN-RP3-998124', modelNumber: 'ASR1000-RP3', firmwareRev: '17.9.4', status: 'OK' },
  { id: 3, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', name: 'Embedded Service Processor', descr: 'ESP100 100Gbps Crypto Engine', clazz: 'module', serialNumber: 'SN-ESP-554129', modelNumber: 'ASR1000-ESP100', firmwareRev: '17.9.4', status: 'OK' },
  { id: 4, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', name: 'Power Supply Module 0', descr: 'AC Redundant 1600W Titanium', clazz: 'powerSupply', serialNumber: 'PWR-AC-1600W-01', modelNumber: 'ASR1000-PWR-AC', firmwareRev: '1.4', status: 'OK' },
  { id: 5, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', name: 'Power Supply Module 1', descr: 'AC Redundant 1600W Titanium', clazz: 'powerSupply', serialNumber: 'PWR-AC-1600W-02', modelNumber: 'ASR1000-PWR-AC', firmwareRev: '1.4', status: 'OK' },
  { id: 6, deviceId: 2, deviceHostname: 'dist-sw-core.v-nms.net', name: 'Arista 7050SX3-48YC8 Chassis', descr: '48x 25G SFP28 + 8x 100G QSFP28', clazz: 'chassis', serialNumber: 'JPE1829012', modelNumber: 'DCS-7050SX3-48YC8', firmwareRev: 'EOS 4.30.2F', status: 'OK' },
];

// Category 2: Ports, FDB & Port Security
export const MOCK_PORTS: PortRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', ifIndex: 1, ifName: 'HundredGigE0/0/0', ifAlias: 'Uplink: Transit-Tier1-Tata (100G)', ifType: 'ethernetCsmacd', ifSpeed: 100000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 42150000000, outBps: 28400000000, inErrors: 0, outErrors: 0, vlan: 100, duplex: 'full', stpState: 'forwarding' },
  { id: 2, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', ifIndex: 2, ifName: 'HundredGigE0/0/1', ifAlias: 'Uplink: Transit-Tier1-Airtel (100G)', ifType: 'ethernetCsmacd', ifSpeed: 100000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 36800000000, outBps: 31200000000, inErrors: 0, outErrors: 0, vlan: 200, duplex: 'full', stpState: 'forwarding' },
  { id: 3, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', ifIndex: 3, ifName: 'TenGigE0/1/0', ifAlias: 'Trunk: DC1-Spine-Switch-01', ifType: 'ethernetCsmacd', ifSpeed: 10000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 4500000000, outBps: 5800000000, inErrors: 12, outErrors: 0, vlan: 1, duplex: 'full', stpState: 'forwarding' },
  { id: 4, deviceId: 2, deviceHostname: 'dist-sw-core.v-nms.net', ifIndex: 10, ifName: 'TwentyFiveGigE1/1', ifAlias: 'Server: Compute-Node-KVM-01 bond0', ifType: 'ethernetCsmacd', ifSpeed: 25000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 8400000000, outBps: 6200000000, inErrors: 0, outErrors: 0, vlan: 50, duplex: 'full', stpState: 'forwarding' },
  { id: 5, deviceId: 2, deviceHostname: 'dist-sw-core.v-nms.net', ifIndex: 11, ifName: 'TwentyFiveGigE1/2', ifAlias: 'Server: Storage-SAN-Cluster port2', ifType: 'ethernetCsmacd', ifSpeed: 25000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 11200000000, outBps: 9800000000, inErrors: 0, outErrors: 0, vlan: 60, duplex: 'full', stpState: 'forwarding' },
  { id: 6, deviceId: 3, deviceHostname: 'acc-sw-floor3.corp', ifIndex: 24, ifName: 'GigabitEthernet1/0/24', ifAlias: 'AP: Floor3-Central-Aruba-AP515', ifType: 'ethernetCsmacd', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'up', inBps: 420000000, outBps: 310000000, inErrors: 0, outErrors: 0, vlan: 20, duplex: 'full', stpState: 'forwarding' },
  { id: 7, deviceId: 3, deviceHostname: 'acc-sw-floor3.corp', ifIndex: 48, ifName: 'GigabitEthernet1/0/48', ifAlias: 'CCTV-Security-NVR-Uplink', ifType: 'ethernetCsmacd', ifSpeed: 1000000000, ifAdminStatus: 'up', ifOperStatus: 'down', inBps: 0, outBps: 0, inErrors: 84, outErrors: 12, vlan: 99, duplex: 'auto', stpState: 'blocking' },
];

export const MOCK_PORTS_FDB: PortFdbRecord[] = [
  { id: 1, macAddress: '00:1A:2B:3C:4D:5E', portName: 'TwentyFiveGigE1/1', deviceId: 2, deviceHostname: 'dist-sw-core.v-nms.net', vlanId: 50, vendor: 'Dell Enterprise', lastSeen: '10s ago' },
  { id: 2, macAddress: 'AC:1F:6B:88:99:AA', portName: 'TwentyFiveGigE1/2', deviceId: 2, deviceHostname: 'dist-sw-core.v-nms.net', vlanId: 60, vendor: 'Pure Storage', lastSeen: '2s ago' },
  { id: 3, macAddress: '70:B3:D5:12:34:56', portName: 'GigabitEthernet1/0/24', deviceId: 3, deviceHostname: 'acc-sw-floor3.corp', vlanId: 20, vendor: 'Hewlett Packard Aruba', lastSeen: '1m ago' },
  { id: 4, macAddress: '54:E1:AD:66:77:88', portName: 'GigabitEthernet1/0/12', deviceId: 3, deviceHostname: 'acc-sw-floor3.corp', vlanId: 10, vendor: 'Apple Inc.', lastSeen: '30s ago' },
];

export const MOCK_PORT_SECURITY: PortSecurityViolation[] = [
  { id: 1, portName: 'GigabitEthernet1/0/8', deviceHostname: 'acc-sw-floor3.corp', violatingMac: 'F4:8E:38:11:22:33', violationType: 'mac_limit_exceeded', timestamp: '2026-11-12 19:42:10', actionTaken: 'shutdown' },
  { id: 2, portName: 'GigabitEthernet1/0/15', deviceHostname: 'acc-sw-floor3.corp', violatingMac: '00:0C:29:44:55:66', violationType: 'unauthorized_8021x', timestamp: '2026-11-12 17:15:30', actionTaken: 'restrict' },
];

// Category 3: Sensors, Processors, Mempools, Storage, DiskIO
export const MOCK_SENSORS: SensorRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', sensorClass: 'temperature', sensorDescr: 'Route Processor Intake Temp', currentValue: 34.5, unit: '°C', limitLow: 10, limitHigh: 65, state: 'OK' },
  { id: 2, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', sensorClass: 'temperature', sensorDescr: 'Crypto ASIC Exhaust Temp', currentValue: 52.0, unit: '°C', limitLow: 10, limitHigh: 75, state: 'OK' },
  { id: 3, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', sensorClass: 'fanspeed', sensorDescr: 'Chassis Fan Tray 1 RPM', currentValue: 4200, unit: 'RPM', limitLow: 2000, limitHigh: 9000, state: 'OK' },
  { id: 4, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', sensorClass: 'voltage', sensorDescr: 'Backplane +12V Rail', currentValue: 12.04, unit: 'V', limitLow: 11.4, limitHigh: 12.6, state: 'OK' },
  { id: 5, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', sensorClass: 'power', sensorDescr: 'PSU 0 Power Draw', currentValue: 680, unit: 'W', limitLow: 50, limitHigh: 1600, state: 'OK' },
  { id: 6, deviceId: 2, deviceHostname: 'dist-sw-core.v-nms.net', sensorClass: 'temperature', sensorDescr: 'Switching Fabric ASIC', currentValue: 46.2, unit: '°C', limitLow: 15, limitHigh: 85, state: 'OK' },
  { id: 7, deviceId: 3, deviceHostname: 'acc-sw-floor3.corp', sensorClass: 'temperature', sensorDescr: 'Internal Thermostat', currentValue: 58.9, unit: '°C', limitLow: 10, limitHigh: 60, state: 'WARNING' },
];

export const MOCK_PROCESSORS: ProcessorRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', name: 'RP3 Control Plane CPU', cores: 8, utilization: 24.5, temperatureC: 44.0 },
  { id: 2, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', name: 'ESP100 Packet Forwarding Engine', cores: 16, utilization: 41.2, temperatureC: 51.5 },
  { id: 3, deviceId: 2, deviceHostname: 'dist-sw-core.v-nms.net', name: 'Broadcom Tomahawk ASIC CPU', cores: 4, utilization: 18.0, temperatureC: 42.0 },
  { id: 4, deviceId: 4, deviceHostname: 'kvm-host-01.infra', name: 'AMD EPYC 7763 64-Core Processor', cores: 64, utilization: 68.4, temperatureC: 48.0 },
];

export const MOCK_MEMPOOLS: MempoolRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', poolName: 'System RAM (RP3)', totalBytes: 17179869184, usedBytes: 6871947673, percentUsed: 40.0 },
  { id: 2, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', poolName: 'Packet Buffer Memory', totalBytes: 4294967296, usedBytes: 1288490188, percentUsed: 30.0 },
  { id: 3, deviceId: 4, deviceHostname: 'kvm-host-01.infra', poolName: 'DDR4 ECC Physical Memory', totalBytes: 274877906944, usedBytes: 192414534860, percentUsed: 70.0 },
  { id: 4, deviceId: 4, deviceHostname: 'kvm-host-01.infra', poolName: 'Linux Swap Partition', totalBytes: 34359738368, usedBytes: 1073741824, percentUsed: 3.1 },
];

export const MOCK_STORAGE: StorageRecord[] = [
  { id: 1, deviceId: 1, deviceHostname: 'core-rtr-01.v-nms.net', mountPoint: 'bootflash:', fileSystem: 'vfat', totalGb: 32, usedGb: 8.5, percentUsed: 26.5 },
  { id: 2, deviceId: 4, deviceHostname: 'kvm-host-01.infra', mountPoint: '/', fileSystem: 'ext4', totalGb: 500, usedGb: 120, percentUsed: 24.0 },
  { id: 3, deviceId: 4, deviceHostname: 'kvm-host-01.infra', mountPoint: '/var/lib/vz', fileSystem: 'zfs', totalGb: 12000, usedGb: 8900, percentUsed: 74.1 },
];

export const MOCK_DISK_IO: DiskIoRecord[] = [
  { id: 1, deviceHostname: 'kvm-host-01.infra', deviceDisk: 'nvme0n1 (OS NVMe)', readIops: 4200, writeIops: 8900, readThroughputMb: 145.2, writeThroughputMb: 310.8 },
  { id: 2, deviceHostname: 'kvm-host-01.infra', deviceDisk: 'zfs-pool-data', readIops: 12400, writeIops: 24000, readThroughputMb: 680.0, writeThroughputMb: 920.5 },
];

// Category 4: IP, Subnets, ARP, VLANs, VRFs, BGP, OSPF
export const MOCK_IPV4: Ipv4Record[] = [
  { id: 1, ipAddress: '198.51.100.1', subnetMask: '255.255.255.252', cidr: '/30', deviceHostname: 'core-rtr-01.v-nms.net', portName: 'HundredGigE0/0/0' },
  { id: 2, ipAddress: '203.0.113.1', subnetMask: '255.255.255.252', cidr: '/30', deviceHostname: 'core-rtr-01.v-nms.net', portName: 'HundredGigE0/0/1' },
  { id: 3, ipAddress: '10.100.0.1', subnetMask: '255.255.255.0', cidr: '/24', deviceHostname: 'dist-sw-core.v-nms.net', portName: 'Vlan100-Management' },
  { id: 4, ipAddress: '10.20.0.1', subnetMask: '255.255.254.0', cidr: '/23', deviceHostname: 'dist-sw-core.v-nms.net', portName: 'Vlan20-User-WiFi' },
];

export const MOCK_SUBNETS: SubnetBlock[] = [
  { id: 1, prefix: '10.100.0.0/24', vlanId: 100, totalIps: 254, usedIps: 42, description: 'Datacenter Out-of-Band Management' },
  { id: 2, prefix: '10.20.0.0/23', vlanId: 20, totalIps: 510, usedIps: 384, description: 'Corporate Wi-Fi DHCP Pool' },
  { id: 3, prefix: '10.50.0.0/22', vlanId: 50, totalIps: 1022, usedIps: 710, description: 'Virtual Machine Server VLAN' },
  { id: 4, prefix: '198.51.100.0/30', vlanId: 100, totalIps: 2, usedIps: 2, description: 'Uplink Peer Tata Communications' },
];

export const MOCK_ARP: ArpEntryRecord[] = [
  { id: 1, ipAddress: '10.100.0.15', macAddress: '00:1E:67:89:AB:CD', deviceHostname: 'dist-sw-core.v-nms.net', interfaceName: 'Vlan100', manufacturer: 'Intel Corporate' },
  { id: 2, ipAddress: '10.20.0.45', macAddress: '3C:22:FB:11:22:33', deviceHostname: 'dist-sw-core.v-nms.net', interfaceName: 'Vlan20', manufacturer: 'Apple, Inc.' },
  { id: 3, ipAddress: '10.50.0.12', macAddress: '00:50:56:AA:BB:CC', deviceHostname: 'dist-sw-core.v-nms.net', interfaceName: 'Vlan50', manufacturer: 'VMware, Inc.' },
];

export const MOCK_VLANS: VlanRecord[] = [
  { id: 1, vlanId: 10, name: 'CORP_DATA', deviceHostname: 'dist-sw-core.v-nms.net', taggedPorts: ['TenGigE0/1/0'], untaggedPorts: ['GigabitEthernet1/0/1-20'], status: 'active' },
  { id: 2, vlanId: 20, name: 'CORP_WIFI', deviceHostname: 'dist-sw-core.v-nms.net', taggedPorts: ['TenGigE0/1/0', 'TwentyFiveGigE1/1'], untaggedPorts: ['GigabitEthernet1/0/24'], status: 'active' },
  { id: 3, vlanId: 50, name: 'SERVER_PROD', deviceHostname: 'dist-sw-core.v-nms.net', taggedPorts: ['TwentyFiveGigE1/1-4'], untaggedPorts: [], status: 'active' },
  { id: 4, vlanId: 99, name: 'SECURITY_CCTV', deviceHostname: 'acc-sw-floor3.corp', taggedPorts: [], untaggedPorts: ['GigabitEthernet1/0/48'], status: 'active' },
];

export const MOCK_VRFS: VrfRecord[] = [
  { id: 1, name: 'VRF_MANAGEMENT', routeDistinguisher: '65001:100', routeTargetExport: '65001:100', routeTargetImport: '65001:100', interfacesCount: 14, deviceHostname: 'core-rtr-01.v-nms.net' },
  { id: 2, name: 'VRF_CUSTOMER_A', routeDistinguisher: '65001:201', routeTargetExport: '65001:201', routeTargetImport: '65001:201', interfacesCount: 6, deviceHostname: 'core-rtr-01.v-nms.net' },
  { id: 3, name: 'VRF_INTERNET_TRANSIT', routeDistinguisher: '65001:999', routeTargetExport: '65001:999', routeTargetImport: '65001:999', interfacesCount: 4, deviceHostname: 'core-rtr-01.v-nms.net' },
];

export const MOCK_ROUTES: RouteRecord[] = [
  { id: 1, destination: '0.0.0.0/0', gateway: '198.51.100.2', protocol: 'bgp', metric: 10, interfaceName: 'HundredGigE0/0/0', deviceHostname: 'core-rtr-01.v-nms.net' },
  { id: 2, destination: '10.0.0.0/8', gateway: '10.100.0.2', protocol: 'ospf', metric: 110, interfaceName: 'TenGigE0/1/0', deviceHostname: 'core-rtr-01.v-nms.net' },
  { id: 3, destination: '172.16.0.0/16', gateway: 'direct', protocol: 'connected', metric: 0, interfaceName: 'Loopback0', deviceHostname: 'core-rtr-01.v-nms.net' },
];

export const MOCK_BGP_PEERS: BgpPeerRecord[] = [
  { id: 1, peerIp: '198.51.100.2', remoteAsn: 6453, localAsn: 65001, state: 'Established', prefixesReceived: 945200, prefixesAccepted: 944980, uptime: '45d 12h 18m', deviceHostname: 'core-rtr-01.v-nms.net' },
  { id: 2, peerIp: '203.0.113.2', remoteAsn: 9498, localAsn: 65001, state: 'Established', prefixesReceived: 948120, prefixesAccepted: 947890, uptime: '12d 06h 40m', deviceHostname: 'core-rtr-01.v-nms.net' },
  { id: 3, peerIp: '195.66.225.1', remoteAsn: 13335, localAsn: 65001, state: 'Established', prefixesReceived: 420, prefixesAccepted: 420, uptime: '89d 22h 10m', deviceHostname: 'core-rtr-01.v-nms.net' },
];

export const MOCK_OSPF_NEIGHBORS: OspfNeighborRecord[] = [
  { id: 1, routerId: '10.255.255.2', neighborIp: '10.100.0.2', area: '0.0.0.0', state: 'Full', interfaceName: 'TenGigE0/1/0', deviceHostname: 'core-rtr-01.v-nms.net' },
  { id: 2, routerId: '10.255.255.3', neighborIp: '10.100.0.3', area: '0.0.0.0', state: 'Full', interfaceName: 'TenGigE0/1/1', deviceHostname: 'core-rtr-01.v-nms.net' },
  { id: 3, routerId: '10.255.255.10', neighborIp: '10.200.0.2', area: '0.0.0.1', state: '2-Way', interfaceName: 'GigabitEthernet0/0/2', deviceHostname: 'core-rtr-01.v-nms.net' },
];

// Category 5: Alerts, Rules, Schedules, Transports
export const MOCK_ALERTS_ACTIVE: AlertIncident[] = [
  { id: 1, ruleTitle: 'High CPU Utilization (>85%)', severity: 'CRITICAL', deviceId: 4, deviceHostname: 'kvm-host-01.infra', entityName: 'CPU-Core-64', entityType: 'processor', triggeredAt: '2026-11-12 21:30:15', acknowledged: false, value: '92.4%' },
  { id: 2, ruleTitle: 'Switchport Transmit Errors Detected', severity: 'WARNING', deviceId: 3, deviceHostname: 'acc-sw-floor3.corp', entityName: 'GigabitEthernet1/0/48', entityType: 'port', triggeredAt: '2026-11-12 21:14:02', acknowledged: true, value: '84 err/sec' },
  { id: 3, ruleTitle: 'Chassis Temperature Threshold Warning', severity: 'WARNING', deviceId: 3, deviceHostname: 'acc-sw-floor3.corp', entityName: 'Internal Thermostat', entityType: 'sensor', triggeredAt: '2026-11-12 20:45:00', acknowledged: false, value: '58.9°C' },
];

export const MOCK_ALERT_RULES: AlertRuleRecord[] = [
  { id: 1, name: 'Device Down (ICMP Ping Loss = 100%)', severity: 'CRITICAL', queryRule: 'device.status == false AND device.last_ping_ms == 0', entityType: 'device', notifyChannels: ['Telegram NOC', 'Slack #alerts', 'PagerDuty Primary'], enabled: true },
  { id: 2, name: 'Interface Link Down (Admin UP, Oper DOWN)', severity: 'CRITICAL', queryRule: 'ports.ifAdminStatus == "up" AND ports.ifOperStatus == "down"', entityType: 'port', notifyChannels: ['Slack #network-ops'], enabled: true },
  { id: 3, name: 'High Processor Load (> 90% for 5 min)', severity: 'CRITICAL', queryRule: 'processors.utilization > 90', entityType: 'processor', notifyChannels: ['Telegram NOC', 'Email SysAdmin'], enabled: true },
  { id: 4, name: 'Disk Space Exhaustion (< 10% free)', severity: 'WARNING', queryRule: 'storages.percentUsed > 90', entityType: 'storage', notifyChannels: ['Slack #infra'], enabled: true },
  { id: 5, name: 'BGP Peer Session Drop', severity: 'CRITICAL', queryRule: 'bgp.state != "Established"', entityType: 'bgp_peer', notifyChannels: ['Telegram NOC', 'PagerDuty Primary'], enabled: true },
];

export const MOCK_ALERT_SCHEDULES: AlertScheduleRecord[] = [
  { id: 1, title: 'Datacenter Switch OS Upgrade Window', targetScope: 'Datacenter Distribution Switches', startTime: '2026-11-15 02:00:00', endTime: '2026-11-15 05:00:00', recurring: false, status: 'PENDING' },
  { id: 2, title: 'Weekly Database Cold Backup & Truncation', targetScope: 'PostgreSQL Core Nodes', startTime: 'Every Sunday 03:00', endTime: 'Sunday 04:00', recurring: true, status: 'ACTIVE' },
];

export const MOCK_ALERT_TRANSPORTS: AlertTransportRecord[] = [
  { id: 1, name: 'Telegram NOC Channel', type: 'telegram', target: '@vnms_noc_alerts_bot', status: 'HEALTHY', lastDispatched: '10m ago' },
  { id: 2, name: 'Slack #network-ops', type: 'slack', target: 'https://hooks.slack.com/services/T00/B00/X12', status: 'HEALTHY', lastDispatched: '22m ago' },
  { id: 3, name: 'PagerDuty Critical On-Call', type: 'pagerduty', target: 'pd-service-key-vnms-prod', status: 'HEALTHY', lastDispatched: '1d ago' },
  { id: 4, name: 'Corporate Email Dispatch', type: 'email', target: 'noc-team@v-nms.net', status: 'HEALTHY', lastDispatched: '35m ago' },
];

// Category 6: Wireless & Specialized Hardware
export const MOCK_ACCESS_POINTS: AccessPointRecord[] = [
  { id: 1, macAddress: '70:B3:D5:12:34:56', name: 'AP-Floor3-Central', controllerHostname: 'wlc-5520.corp', model: 'Aruba AP-515 Wi-Fi 6', clientsConnected: 54, channel2G: 6, channel5G: 36, status: 'UP' },
  { id: 2, macAddress: '70:B3:D5:12:34:57', name: 'AP-Floor3-WestWing', controllerHostname: 'wlc-5520.corp', model: 'Aruba AP-515 Wi-Fi 6', clientsConnected: 38, channel2G: 1, channel5G: 48, status: 'UP' },
  { id: 3, macAddress: '70:B3:D5:12:34:58', name: 'AP-Cafeteria-HighDensity', controllerHostname: 'wlc-5520.corp', model: 'Cisco Catalyst 9130AX', clientsConnected: 124, channel2G: 11, channel5G: 149, status: 'UP' },
];

export const MOCK_TRANSCEIVERS: TransceiverRecord[] = [
  { id: 1, deviceHostname: 'core-rtr-01.v-nms.net', portName: 'HundredGigE0/0/0', type: '100G-CWDM4', rxPowerDbm: -3.8, txPowerDbm: 0.5, wavelengthNm: 1310, temperatureC: 38.2, status: 'OPTIMAL' },
  { id: 2, deviceHostname: 'core-rtr-01.v-nms.net', portName: 'HundredGigE0/0/1', type: '100G-CWDM4', rxPowerDbm: -4.1, txPowerDbm: 0.2, wavelengthNm: 1310, temperatureC: 40.1, status: 'OPTIMAL' },
  { id: 3, deviceHostname: 'dist-sw-core.v-nms.net', portName: 'TwentyFiveGigE1/1', type: 'SFP-10G-SR', rxPowerDbm: -2.2, txPowerDbm: -1.8, wavelengthNm: 850, temperatureC: 32.5, status: 'OPTIMAL' },
  { id: 4, deviceHostname: 'edge-gw-mumbai.isp', portName: 'TenGigE0/0/4', type: 'SFP-10G-SR', rxPowerDbm: -18.4, txPowerDbm: -2.1, wavelengthNm: 1310, temperatureC: 55.4, status: 'WARNING' },
];

export const MOCK_IPSEC_TUNNELS: IpsecTunnelRecord[] = [
  { id: 1, tunnelName: 'VPN-HQ-to-AWS-VPC', localEndpoint: '198.51.100.1', remoteEndpoint: '52.14.88.12', encryption: 'AES-256-GCM / SHA-384', ikeVersion: 'IKEv2', status: 'UP', bytesInMb: 145000, bytesOutMb: 198000 },
  { id: 2, tunnelName: 'VPN-HQ-to-Branch-Bangalore', localEndpoint: '198.51.100.1', remoteEndpoint: '103.22.44.18', encryption: 'AES-256-CBC / SHA-256', ikeVersion: 'IKEv2', status: 'UP', bytesInMb: 42000, bytesOutMb: 38000 },
];

export const MOCK_SSL_CERTS: SslCertRecord[] = [
  { id: 1, domain: 'api.v-nms.net', issuer: 'Let\'s Encrypt Authority X3', validFrom: '2026-09-01', validTo: '2026-12-01', daysRemaining: 19, status: 'EXPIRING_SOON' },
  { id: 2, domain: 'noc.corp.v-nms.internal', issuer: 'DigiCert Global Root G2', validFrom: '2026-01-15', validTo: '2027-01-15', daysRemaining: 64, status: 'VALID' },
];

// Category 7 & 8: MPLS, Carrier & Bandwidth Billing
export const MOCK_MPLS_LSPS: MplsLspRecord[] = [
  { id: 1, lspName: 'LSP-DELHI-TO-MUMBAI-PRIMARY', sourceRouter: 'core-rtr-01.v-nms.net', destRouter: 'edge-gw-mumbai.isp', adminStatus: 'up', operStatus: 'up', bandwidthMbps: 40000, fastReroute: true },
  { id: 2, lspName: 'LSP-DELHI-TO-BLR-TRANSIT', sourceRouter: 'core-rtr-01.v-nms.net', destRouter: 'branch-rtr-delhi.wan', adminStatus: 'up', operStatus: 'up', bandwidthMbps: 10000, fastReroute: true },
];

export const MOCK_PSEUDOWIRES: PseudowireRecord[] = [
  { id: 1, pwId: 5001, vcId: 101, peerRouter: '10.255.255.2', circuitType: 'Ethernet', localInterface: 'GigabitEthernet0/1/4', operStatus: 'UP' },
  { id: 2, pwId: 5002, vcId: 102, peerRouter: '10.255.255.5', circuitType: 'VLAN', localInterface: 'GigabitEthernet0/1/5.200', operStatus: 'UP' },
];

export const MOCK_BILLS: BillingContractRecord[] = [
  { id: 1, customerName: 'Apex Cloud Services Pvt Ltd', contractType: '95th_percentile', committedMbps: 10000, burstMbps: 25000, current95thMbps: 14200, billPeriod: '2026-11-01 to 2026-11-30', overageStatus: 'OVERAGE', assignedPorts: ['HundredGigE0/0/0.100'] },
  { id: 2, customerName: 'Fintech Payments Ltd', contractType: '95th_percentile', committedMbps: 5000, burstMbps: 10000, current95thMbps: 3840, billPeriod: '2026-11-01 to 2026-11-30', overageStatus: 'OK', assignedPorts: ['TenGigE0/1/0.50'] },
];

// Category 9: Load Balancers, Virtualization & Processes
export const MOCK_LOAD_BALANCERS: LoadBalancerVserverRecord[] = [
  { id: 1, vipName: 'VIP_K8S_INGRESS_PROD', vipAddress: '10.100.1.50', port: 443, protocol: 'HTTPS', activeConnections: 18450, healthyBackends: 8, totalBackends: 8, status: 'UP' },
  { id: 2, vipName: 'VIP_POSTGRES_PGPOOL_READ', vipAddress: '10.100.1.51', port: 5432, protocol: 'TCP', activeConnections: 340, healthyBackends: 3, totalBackends: 3, status: 'UP' },
];

export const MOCK_VMS: VmRecord[] = [
  { id: 1, vmName: 'v-nms-postgres-primary', hypervisor: 'kvm-host-01.infra', os: 'Ubuntu 24.04 LTS', vCpu: 16, ramGb: 64, storageGb: 1000, status: 'RUNNING', cpuPercent: 32.4 },
  { id: 2, vmName: 'k8s-worker-node-01', hypervisor: 'kvm-host-01.infra', os: 'Debian 12 Bookworm', vCpu: 32, ramGb: 128, storageGb: 500, status: 'RUNNING', cpuPercent: 64.1 },
  { id: 3, vmName: 'redis-cluster-node-01', hypervisor: 'kvm-host-01.infra', os: 'Alpine Linux 3.19', vCpu: 4, ramGb: 16, storageGb: 100, status: 'RUNNING', cpuPercent: 12.0 },
];

export const MOCK_PROCESSES: OsProcessRecord[] = [
  { id: 1, deviceHostname: 'kvm-host-01.infra', pid: 1421, processName: 'v-nms-server', cpuPercent: 8.5, memoryMb: 142, user: 'vnms' },
  { id: 2, deviceHostname: 'kvm-host-01.infra', pid: 982, processName: 'postgres', cpuPercent: 24.1, memoryMb: 4096, user: 'postgres' },
  { id: 3, deviceHostname: 'kvm-host-01.infra', pid: 2204, processName: 'snmpd', cpuPercent: 0.8, memoryMb: 34, user: 'root' },
];

export const MOCK_SYNTHETIC_SERVICES: SyntheticServiceRecord[] = [
  { id: 1, serviceName: 'Public API Gateway Health', target: 'https://api.v-nms.net/health', checkType: 'HTTPS', responseTimeMs: 14.2, expectedStatus: 'HTTP 200 OK', status: 'PASS', lastChecked: '15s ago' },
  { id: 2, serviceName: 'Core DNS Resolver (8.8.8.8)', target: '8.8.8.8', checkType: 'DNS', responseTimeMs: 8.1, expectedStatus: 'NOERROR', status: 'PASS', lastChecked: '30s ago' },
  { id: 3, serviceName: 'NTP Stratum 1 Clock Sync', target: 'time.cloudflare.com', checkType: 'NTP', responseTimeMs: 12.0, expectedStatus: 'Offset < 5ms', status: 'PASS', lastChecked: '1m ago' },
];

// Category 10: Poller Architecture & Clustering
export const MOCK_POLLER_NODES: PollerNodeRecord[] = [
  { id: 1, name: 'Poller-Master-Delhi-DC1', ipAddress: '10.100.0.10', region: 'Asia-South (Delhi)', activeWorkers: 64, devicesAssigned: 120, avgCycleSeconds: 14.2, memoryUsageMb: 82, status: 'ONLINE' },
  { id: 2, name: 'Poller-Worker-Mumbai-DC2', ipAddress: '10.200.0.10', region: 'Asia-South (Mumbai)', activeWorkers: 32, devicesAssigned: 84, avgCycleSeconds: 16.5, memoryUsageMb: 64, status: 'ONLINE' },
  { id: 3, name: 'Poller-Edge-Bangalore', ipAddress: '10.300.0.10', region: 'Asia-South (Bangalore)', activeWorkers: 16, devicesAssigned: 24, avgCycleSeconds: 8.1, memoryUsageMb: 38, status: 'ONLINE' },
];

// Category 11: Topology Nodes & Links
export const MOCK_TOPOLOGY_NODES: TopologyNode[] = [
  { id: 'core1', label: 'Core-ASR-01', type: 'core_router', ip: '198.51.100.1', status: 'UP', x: 280, y: 80 },
  { id: 'core2', label: 'Core-ASR-02', type: 'core_router', ip: '203.0.113.1', status: 'UP', x: 520, y: 80 },
  { id: 'dist1', label: 'Dist-Arista-01', type: 'switch', ip: '10.100.0.1', status: 'UP', x: 200, y: 220 },
  { id: 'dist2', label: 'Dist-Arista-02', type: 'switch', ip: '10.100.0.2', status: 'UP', x: 600, y: 220 },
  { id: 'fw1', label: 'PaloAlto-FW-01', type: 'firewall', ip: '198.51.100.254', status: 'UP', x: 400, y: 20 },
  { id: 'srv1', label: 'Compute-KVM-01', type: 'server', ip: '10.50.0.10', status: 'UP', x: 140, y: 360 },
  { id: 'srv2', label: 'Storage-SAN-01', type: 'server', ip: '10.50.0.20', status: 'UP', x: 280, y: 360 },
  { id: 'ap1', label: 'Aruba-AP-Floor3', type: 'ap', ip: '10.20.0.24', status: 'UP', x: 640, y: 360 },
];

export const MOCK_TOPOLOGY_LINKS: TopologyLink[] = [
  { id: 'l1', source: 'fw1', target: 'core1', label: '100G Transit', utilizationPercent: 42, speedGbps: 100 },
  { id: 'l2', source: 'fw1', target: 'core2', label: '100G Transit', utilizationPercent: 36, speedGbps: 100 },
  { id: 'l3', source: 'core1', target: 'core2', label: '200G Inter-Core Link', utilizationPercent: 18, speedGbps: 200 },
  { id: 'l4', source: 'core1', target: 'dist1', label: '40G Spine Link', utilizationPercent: 55, speedGbps: 40 },
  { id: 'l5', source: 'core2', target: 'dist2', label: '40G Spine Link', utilizationPercent: 51, speedGbps: 40 },
  { id: 'l6', source: 'dist1', target: 'srv1', label: '25G Server Uplink', utilizationPercent: 68, speedGbps: 25 },
  { id: 'l7', source: 'dist1', target: 'srv2', label: '25G SAN Uplink', utilizationPercent: 74, speedGbps: 25 },
  { id: 'l8', source: 'dist2', target: 'ap1', label: '1G PoE Access', utilizationPercent: 45, speedGbps: 1 },
];

// Category 12: Logs, Syslog, Events
export const MOCK_SYSLOG: SyslogRecord[] = [
  { id: 1, timestamp: '2026-11-12 21:44:12', facility: 'local7', severity: 'info', host: 'core-rtr-01.v-nms.net', program: 'BGP', message: '%BGP-5-ADJCHANGE: neighbor 198.51.100.2 Up (established)' },
  { id: 2, timestamp: '2026-11-12 21:40:02', facility: 'auth', severity: 'notice', host: 'dist-sw-core.v-nms.net', program: 'SSHD', message: 'Accepted publickey for admin from 10.100.0.42 port 52318 ssh2' },
  { id: 3, timestamp: '2026-11-12 21:35:18', facility: 'daemon', severity: 'warning', host: 'acc-sw-floor3.corp', program: 'STP', message: '%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi1/0/48 with BPDU Guard enabled. Disabling port.' },
  { id: 4, timestamp: '2026-11-12 21:31:00', facility: 'system', severity: 'crit', host: 'kvm-host-01.infra', program: 'KERNEL', message: '[48921.192] Out of memory: Kill process 19284 (python3) score 421 or sacrifice child' },
  { id: 5, timestamp: '2026-11-12 21:28:44', facility: 'local0', severity: 'info', host: 'edge-gw-mumbai.isp', program: 'SNMP', message: 'SNMP request received for ifTable from 10.100.0.10' },
];

export const MOCK_EVENT_LOGS: EventLogRecord[] = [
  { id: 1, timestamp: '2026-11-12 21:35:19', deviceHostname: 'acc-sw-floor3.corp', eventType: 'interface_down', severity: 'warning', message: 'Interface GigabitEthernet1/0/48 changed state to down (BPDU Guard)' },
  { id: 2, timestamp: '2026-11-12 21:10:05', deviceHostname: 'core-rtr-01.v-nms.net', eventType: 'config_change', severity: 'info', message: 'Configuration modified via SSH by admin (vty0)' },
  { id: 3, timestamp: '2026-11-12 20:00:12', deviceHostname: 'core-rtr-01.v-nms.net', eventType: 'bgp_flap', severity: 'info', message: 'BGP session 198.51.100.2 graceful restart completed' },
];

export const MOCK_MONITORED_APPS: MonitoredAppRecord[] = [
  { id: 1, deviceHostname: 'kvm-host-01.infra', appName: 'PostgreSQL 16 Enterprise', version: '16.4-1.pgdg22.04+1', status: 'UP', metrics: { 'Active Connections': 42, 'Transactions/sec': 1240, 'Cache Hit Ratio': '99.4%' } },
  { id: 2, deviceHostname: 'kvm-host-01.infra', appName: 'Nginx High-Speed Reverse Proxy', version: '1.26.1', status: 'UP', metrics: { 'Active Conns': 8920, 'Requests/sec': 4100, 'Handshakes/sec': 380 } },
  { id: 3, deviceHostname: 'kvm-host-01.infra', appName: 'Redis In-Memory Cache', version: '7.2.4', status: 'UP', metrics: { 'Connected Clients': 180, 'Used Memory': '1.8 GB', 'Hits Ratio': '98.8%' } },
];

// Category 13: SLA & QoS Performance
export const MOCK_SLA_PROBES: SlaProbeRecord[] = [
  { id: 1, probeName: 'VoIP IP-SLA Delhi to Mumbai', sourceDevice: 'core-rtr-01.v-nms.net', targetIp: '203.0.113.2', rttMs: 14.8, jitterMs: 1.2, packetLossPercent: 0.0, mosScore: 4.41, status: 'HEALTHY' },
  { id: 2, probeName: 'SIP Voice Gateway Bangalore', sourceDevice: 'core-rtr-01.v-nms.net', targetIp: '103.22.44.18', rttMs: 28.4, jitterMs: 2.1, packetLossPercent: 0.1, mosScore: 4.28, status: 'HEALTHY' },
  { id: 3, probeName: 'High-Frequency Trader Colocation SLA', sourceDevice: 'core-rtr-01.v-nms.net', targetIp: '198.51.100.2', rttMs: 4.2, jitterMs: 0.3, packetLossPercent: 0.0, mosScore: 4.48, status: 'HEALTHY' },
];

export const MOCK_QOS_CLASSES: QosClassRecord[] = [
  { id: 1, deviceHostname: 'core-rtr-01.v-nms.net', policyName: 'WAN_EDGE_EGRESS_POLICY', classMap: 'VOICE_CRITICAL (EF)', allocatedBps: 1000000000, currentBps: 240000000, droppedPackets: 0 },
  { id: 2, deviceHostname: 'core-rtr-01.v-nms.net', policyName: 'WAN_EDGE_EGRESS_POLICY', classMap: 'VIDEO_STREAMING (AF41)', allocatedBps: 2000000000, currentBps: 1100000000, droppedPackets: 4 },
  { id: 3, deviceHostname: 'core-rtr-01.v-nms.net', policyName: 'WAN_EDGE_EGRESS_POLICY', classMap: 'BEST_EFFORT_DEFAULT', allocatedBps: 10000000000, currentBps: 8400000000, droppedPackets: 812 },
];

export const MOCK_CUSTOM_OIDS: CustomOidRecord[] = [
  { id: 1, deviceHostname: 'core-rtr-01.v-nms.net', oidName: 'ciscoMemoryPoolFree', oidString: '.1.3.6.1.4.1.9.9.48.1.1.1.6.1', lastValue: '10307921510', valueType: 'Gauge32', lastPolled: '10s ago' },
  { id: 2, deviceHostname: 'acc-sw-floor3.corp', oidName: 'pethPsePortDetectionStatus', oidString: '.1.3.6.1.2.1.105.1.1.1.6.1.24', lastValue: '3 (deliveringPower)', valueType: 'INTEGER', lastPolled: '15s ago' },
];

// Category 14 & 15: Users, Vault, Config, PeeringDB
export const MOCK_USERS: UserAccountRecord[] = [
  { id: 1, username: 'admin', email: 'admin@v-nms.net', role: 'superadmin', twoFactorEnabled: true, lastLogin: '2026-11-12 21:40:00' },
  { id: 2, username: 'deepak.sah', email: 'deepak@v-nms.net', role: 'network_admin', twoFactorEnabled: true, lastLogin: '2026-11-12 21:45:10' },
  { id: 3, username: 'noc_operator_1', email: 'operator1@v-nms.net', role: 'noc_operator', twoFactorEnabled: false, lastLogin: '2026-11-12 20:15:33' },
];

export const MOCK_VAULT_SECRETS: VaultSecretRecord[] = [
  { id: 1, title: 'Core Router SNMPv3 Auth (SHA-256 + AES-128)', targetType: 'snmp_v3', targetDevice: 'core-rtr-01.v-nms.net', cipher: 'AES-256-GCM', updatedAt: '2026-10-15' },
  { id: 2, title: 'Arista Switches SSH Production RSA Key', targetType: 'ssh_key', targetDevice: 'All Arista Spine Nodes', cipher: 'AES-256-GCM', updatedAt: '2026-10-20' },
  { id: 3, title: 'Telegram Dispatcher Bot API Token', targetType: 'api_token', targetDevice: 'Global Notification Engine', cipher: 'AES-256-GCM', updatedAt: '2026-11-01' },
];

export const MOCK_SYSTEM_CONFIGS: SystemConfigRecord[] = [
  { id: 1, group: 'Poller Core', key: 'poller.default_interval_seconds', value: '60', description: 'Default SNMP metrics polling cycle interval' },
  { id: 2, group: 'Poller Core', key: 'poller.max_concurrent_workers', value: '128', description: 'Go goroutine concurrency limit for SNMP pollers' },
  { id: 3, group: 'Fast Ping', key: 'ping.timeout_milliseconds', value: '1000', description: 'ICMP ping timeout before marking node down' },
  { id: 4, group: 'Storage & Retention', key: 'timeseries.retention_days', value: '365', description: 'PostgreSQL partition retention window for metrics' },
  { id: 5, group: 'WebSockets', key: 'ws.heartbeat_seconds', value: '15', description: 'WebSocket ping-pong keepalive interval for UI' },
];

export const MOCK_PEERING_IXPS: PeeringDbIxRecord[] = [
  { id: 1, ixName: 'NIXI Delhi (National Internet Exchange of India)', city: 'New Delhi', country: 'IN', ipv4Prefix: '180.149.48.0/22', ipv6Prefix: '2001:e10:200::/48', participantsCount: 142, speedGbps: 100 },
  { id: 2, ixName: 'Extreme IX Mumbai', city: 'Mumbai', country: 'IN', ipv4Prefix: '103.111.12.0/22', ipv6Prefix: '2404:3c00::/48', participantsCount: 280, speedGbps: 400 },
  { id: 3, ixName: 'DE-CIX Frankfurt', city: 'Frankfurt', country: 'DE', ipv4Prefix: '80.81.192.0/21', ipv6Prefix: '2001:7f8::/32', participantsCount: 1100, speedGbps: 1200 },
];
