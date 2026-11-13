import React, { useState, useMemo } from 'react';
import { 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  Shield, 
  Server, 
  Network, 
  Globe, 
  Search, 
  Maximize2, 
  Minimize2, 
  Activity, 
  Cpu, 
  Thermometer, 
  Zap, 
  BarChart3, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  HardDrive
} from 'lucide-react';
import type { Device } from '../../types';
import { DeviceChartsModal } from '../DeviceChartsModal';

interface TreeViewProps {
  devices: Device[];
  onPing: (id: number) => void;
  onPoll: (id: number) => void;
  pingingId: number | null;
  pollingId: number | null;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'datacenter' | 'tier' | 'firewall' | 'router' | 'switch' | 'server' | 'port' | 'sensor' | 'model_category' | 'model';
  badge?: string;
  badgeColor?: string;
  ip?: string;
  status?: 'up' | 'down' | 'warning' | 'info';
  meta?: string;
  hardware?: string;
  os?: string;
  uptime?: string;
  metrics?: { cpu?: number; mem?: number; traffic?: string; latency?: number };
  deviceId?: number;
  children?: TreeNode[];
}

export const TreeView: React.FC<TreeViewProps> = ({
  devices,
  onPing,
  onPoll,
  pingingId,
  pollingId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([
    'dc-hq',
    'dc-hq-firewalls',
    'dc-hq-routers',
    'dc-hq-switches',
    'dc-hq-servers',
    'models-root',
    'cat-core-devices'
  ]));
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [chartDevice, setChartDevice] = useState<Device | null>(null);

  // Complete Enterprise Infrastructure Hierarchy Tree Data
  const treeData: TreeNode[] = useMemo(() => [
    {
      id: 'dc-hq',
      name: 'HQ Datacenter (DC-1 Primary • Mumbai Hub)',
      type: 'datacenter',
      badge: '4 TIERS • 18 NODES',
      badgeColor: '#0284c7',
      status: 'up',
      meta: 'Primary Tier-4 Datacenter • Dual 100G Carrier Uplinks',
      children: [
        {
          id: 'dc-hq-firewalls',
          name: 'Edge & Perimeter Security (Firewalls)',
          type: 'tier',
          badge: '2 FIREWALLS',
          badgeColor: '#dc2626',
          status: 'up',
          children: [
            {
              id: 'fw-palo-alto-01',
              name: 'palo-alto-pa5250-01.fw',
              type: 'firewall',
              ip: '198.51.100.254',
              status: 'up',
              hardware: 'Palo Alto Networks PA-5250',
              os: 'PAN-OS 11.0.2',
              uptime: '142 Days, 8 Hours',
              metrics: { cpu: 28, mem: 42, traffic: '3.8 Gbps', latency: 1.2 },
              children: [
                { id: 'fw-palo-p1', name: 'ethernet1/1 [WAN Uplink ISP-A]', type: 'port', status: 'up', meta: '10 Gbps • Full Duplex • Flow: 1.9 Gbps' },
                { id: 'fw-palo-p2', name: 'ethernet1/2 [WAN Uplink ISP-B]', type: 'port', status: 'up', meta: '10 Gbps • Full Duplex • Flow: 1.9 Gbps' },
                { id: 'fw-palo-p3', name: 'ethernet1/24 [Internal DMZ Trunk]', type: 'port', status: 'up', meta: '40 Gbps • Active LACP LAG' },
                { id: 'fw-palo-s1', name: 'GlobalProtect VPN Tunnel Count', type: 'sensor', status: 'up', meta: '148 Active Remote Workers' },
                { id: 'fw-palo-s2', name: 'Threat Prevention Engine', type: 'sensor', status: 'up', meta: 'Signatures Up-to-Date • 0 Breaches' }
              ]
            },
            {
              id: 'fw-fortigate-02',
              name: 'fortigate-1000f-edge.fw',
              type: 'firewall',
              ip: '198.51.100.250',
              status: 'up',
              hardware: 'Fortinet FortiGate 1000F Next-Gen',
              os: 'FortiOS 7.4.1',
              uptime: '89 Days, 12 Hours',
              metrics: { cpu: 22, mem: 36, traffic: '2.4 Gbps', latency: 1.4 },
              children: [
                { id: 'fw-fg-p1', name: 'port1 [Direct Cloud Interconnect]', type: 'port', status: 'up', meta: '10 Gbps • AWS DirectConnect' },
                { id: 'fw-fg-p2', name: 'port2 [Internal Trust Network]', type: 'port', status: 'up', meta: '10 Gbps • MTU 9000 Jumbo' },
                { id: 'fw-fg-s1', name: 'Hardware ASIC NP7 Utilization', type: 'sensor', status: 'up', meta: '18% Load • 80 Gbps Capacity' }
              ]
            }
          ]
        },
        {
          id: 'dc-hq-routers',
          name: 'Core Routing Fabric (BGP & MPLS Routers)',
          type: 'tier',
          badge: '2 ROUTERS',
          badgeColor: '#4f46e5',
          status: 'up',
          children: [
            {
              id: 'rtr-cisco-asr',
              deviceId: 1,
              name: 'core-rtr-01.v-nms.net',
              type: 'router',
              ip: '198.51.100.1',
              status: 'up',
              hardware: 'Cisco ASR 1006-X',
              os: 'Cisco IOS-XE 17.9.4a',
              uptime: '56 Days, 14 Hours',
              metrics: { cpu: 32, mem: 48, traffic: '18.4 Gbps', latency: 2.4 },
              children: [
                { id: 'rtr-cisco-p1', name: 'TenGigE0/0/0 [Transit Telia AS1299]', type: 'port', status: 'up', meta: '10 Gbps • BGP Full Table (942,000 Routes)' },
                { id: 'rtr-cisco-p2', name: 'TenGigE0/0/1 [Transit NTT AS2914]', type: 'port', status: 'up', meta: '10 Gbps • BGP Full Table' },
                { id: 'rtr-cisco-p3', name: 'HundredGigE0/1/0 [Fabric to Spine 01]', type: 'port', status: 'up', meta: '100 Gbps • OSPF Area 0 Backbone' },
                { id: 'rtr-cisco-s1', name: 'ASR Route Processor 3 (RP3) CPU', type: 'sensor', status: 'up', meta: '32% Utilization • Temp: 41°C' },
                { id: 'rtr-cisco-s2', name: 'Power Supply Unit 1 (Dual AC Redundant)', type: 'sensor', status: 'up', meta: '54V DC • Healthy • 480W Draw' }
              ]
            },
            {
              id: 'rtr-juniper-edge',
              deviceId: 5,
              name: 'edge-gw-mumbai.isp',
              type: 'router',
              ip: '203.0.113.1',
              status: 'up',
              hardware: 'Juniper MX204 100G Edge',
              os: 'Juniper Junos 22.4R1',
              uptime: '103 Days, 2 Hours',
              metrics: { cpu: 26, mem: 44, traffic: '12.8 Gbps', latency: 14.5 },
              children: [
                { id: 'rtr-jun-p1', name: 'et-0/0/0 [100G NIXI Peering Exchange]', type: 'port', status: 'up', meta: '100 Gbps • BGP Peering Established' },
                { id: 'rtr-jun-p2', name: 'et-0/0/1 [100G Backbone to Delhi]', type: 'port', status: 'up', meta: '100 Gbps • MPLS TE Fast-Reroute' },
                { id: 'rtr-jun-s1', name: 'Routing Engine Temperature Sensor', type: 'sensor', status: 'up', meta: '36.0°C • Fan Speed: 4200 RPM' }
              ]
            }
          ]
        },
        {
          id: 'dc-hq-switches',
          name: 'Distribution & Access Switching (Spine / Leaf / Top-of-Rack)',
          type: 'tier',
          badge: '3 SWITCHES',
          badgeColor: '#0284c7',
          status: 'up',
          children: [
            {
              id: 'sw-arista-spine',
              deviceId: 2,
              name: 'dist-sw-core.v-nms.net',
              type: 'switch',
              ip: '10.100.0.1',
              status: 'up',
              hardware: 'Arista DCS-7050SX3-48YC8',
              os: 'Arista EOS 4.30.2F',
              uptime: '91 Days, 7 Hours',
              metrics: { cpu: 18, mem: 34, traffic: '32.6 Gbps', latency: 1.8 },
              children: [
                { id: 'sw-ar-p1', name: 'Ethernet1/1 [Uplink to Spine-01]', type: 'port', status: 'up', meta: '100 Gbps • Multi-Chassis LACP MLAG' },
                { id: 'sw-ar-p2', name: 'Ethernet1/2 [Uplink to Spine-02]', type: 'port', status: 'up', meta: '100 Gbps • Multi-Chassis LACP MLAG' },
                { id: 'sw-ar-p3', name: 'Ethernet48/1 [VLAN 100 Server Farm Trunk]', type: 'port', status: 'up', meta: '25 Gbps SFP28 • Flow: 8.2 Gbps' },
                { id: 'sw-ar-s1', name: 'Switch Chassis Thermal Sensor 1', type: 'sensor', status: 'up', meta: '34.5°C Normal Range' },
                { id: 'sw-ar-s2', name: 'Internal Switching ASIC Fan Tray', type: 'sensor', status: 'up', meta: 'Fan 1-4 RPM: 5200 • Status OK' }
              ]
            },
            {
              id: 'sw-cisco-cat9300',
              deviceId: 3,
              name: 'acc-sw-floor3.corp',
              type: 'switch',
              ip: '10.100.0.15',
              status: 'up',
              hardware: 'Cisco Catalyst 9300-48P PoE+',
              os: 'Cisco IOS-XE (Cat9300)',
              uptime: '16 Days, 11 Hours',
              metrics: { cpu: 14, mem: 28, traffic: '1.2 Gbps', latency: 3.2 },
              children: [
                { id: 'sw-cat-p1', name: 'GigabitEthernet1/0/1 [AP-Ceiling-01]', type: 'port', status: 'up', meta: '1 Gbps • PoE+ Draw: 24.5W' },
                { id: 'sw-cat-p2', name: 'GigabitEthernet1/0/2 [AP-Ceiling-02]', type: 'port', status: 'up', meta: '1 Gbps • PoE+ Draw: 24.5W' },
                { id: 'sw-cat-p3', name: 'GigabitEthernet1/0/48 [Workstation VoIP]', type: 'port', status: 'up', meta: '1 Gbps • 802.1Q Voice VLAN 20' },
                { id: 'sw-cat-s1', name: 'PoE Available Power Budget', type: 'sensor', status: 'up', meta: '580W Available / 740W Total' }
              ]
            },
            {
              id: 'sw-san-brocade',
              name: 'san-sw-mumbai.iscsi',
              type: 'switch',
              ip: '10.100.0.50',
              status: 'up',
              hardware: 'Brocade 6510 16Gb Fibre Channel',
              os: 'Fabric OS 8.2.3b',
              uptime: '210 Days, 4 Hours',
              metrics: { cpu: 12, mem: 24, traffic: '14.2 Gbps', latency: 0.8 },
              children: [
                { id: 'san-p1', name: 'fc0/1 [Storage Array SAN NetApp AFF]', type: 'port', status: 'up', meta: '16 Gbps Fibre Channel' },
                { id: 'san-p2', name: 'fc0/2 [Compute Host HBA 1]', type: 'port', status: 'up', meta: '16 Gbps Fibre Channel' },
                { id: 'san-s1', name: 'Optical Transceiver SFP+ Tx/Rx Power', type: 'sensor', status: 'up', meta: '-2.4 dBm • Optimal Optical Link' }
              ]
            }
          ]
        },
        {
          id: 'dc-hq-servers',
          name: 'Compute Hypervisors & Baremetal Database Servers',
          type: 'tier',
          badge: '4 SERVERS',
          badgeColor: '#16a34a',
          status: 'up',
          children: [
            {
              id: 'srv-kvm-proxmox',
              deviceId: 4,
              name: 'kvm-host-01.infra',
              type: 'server',
              ip: '10.50.0.10',
              status: 'up',
              hardware: 'Dell PowerEdge R7525 2x AMD EPYC 7763',
              os: 'Linux Proxmox VE 8.1 (Debian 12)',
              uptime: '39 Days, 11 Hours',
              metrics: { cpu: 46, mem: 68, traffic: '4.8 Gbps', latency: 0.9 },
              children: [
                { id: 'srv-kvm-p1', name: 'ens1f0 [Bond0 LACP 2x25GbE]', type: 'port', status: 'up', meta: '25 Gbps • VM Bridge vmbr0' },
                { id: 'srv-kvm-p2', name: 'ens1f1 [Bond0 LACP 2x25GbE]', type: 'port', status: 'up', meta: '25 Gbps • VM Bridge vmbr0' },
                { id: 'srv-kvm-s1', name: 'AMD EPYC 7763 64-Core Package 0', type: 'sensor', status: 'up', meta: '44.0°C • 3.2 GHz Boost' },
                { id: 'srv-kvm-s2', name: 'Samsung PM1733 Enterprise NVMe RAID', type: 'sensor', status: 'up', meta: '15.3 TB Total • 0 SMART Errors' }
              ]
            },
            {
              id: 'srv-esxi-node2',
              name: 'esxi-cluster-node-02.corp',
              type: 'server',
              ip: '10.50.0.12',
              status: 'up',
              hardware: 'HPE ProLiant DL380 Gen10 2x Intel Xeon Gold',
              os: 'VMware ESXi 8.0 Update 2b',
              uptime: '75 Days, 6 Hours',
              metrics: { cpu: 38, mem: 72, traffic: '3.6 Gbps', latency: 1.1 },
              children: [
                { id: 'srv-esx-p1', name: 'vmnic0 [vSphere Distributed Switch 10G]', type: 'port', status: 'up', meta: '10 Gbps • Uplink 1' },
                { id: 'srv-esx-p2', name: 'vmnic1 [vSphere vMotion Network]', type: 'port', status: 'up', meta: '10 Gbps • Jumbo Frame MTU 9000' },
                { id: 'srv-esx-s1', name: 'HPE iLO 5 Integrated Lights-Out', type: 'sensor', status: 'up', meta: 'Dedicated Management IP: 10.50.0.112' }
              ]
            },
            {
              id: 'srv-db-pg18',
              name: 'db-cluster-pg18.prod',
              type: 'server',
              ip: '10.50.0.30',
              status: 'up',
              hardware: 'Baremetal Supermicro 2U Ultra 1TB RAM',
              os: 'Ubuntu 24.04 LTS (PostgreSQL 18 HA)',
              uptime: '118 Days, 19 Hours',
              metrics: { cpu: 34, mem: 62, traffic: '2.1 Gbps', latency: 0.4 },
              children: [
                { id: 'srv-db-p1', name: 'eno1 [Primary Database Replication]', type: 'port', status: 'up', meta: '10 Gbps • Synchronous Streaming Standby' },
                { id: 'srv-db-s1', name: 'PostgreSQL 18 Buffer Pool Cache Hit Ratio', type: 'sensor', status: 'up', meta: '99.4% Memory Hit • 2200 TPS' },
                { id: 'srv-db-s2', name: 'WAL Write Latency & Storage IOPS', type: 'sensor', status: 'up', meta: '0.12 ms Latency • 42,000 IOPS' }
              ]
            },
            {
              id: 'srv-k8s-master',
              name: 'k8s-control-plane-01.infra',
              type: 'server',
              ip: '10.50.0.40',
              status: 'up',
              hardware: 'Dell PowerEdge R6515 1U',
              os: 'Linux Kubernetes v1.30.1',
              uptime: '42 Days, 3 Hours',
              metrics: { cpu: 26, mem: 48, traffic: '1.8 Gbps', latency: 0.6 },
              children: [
                { id: 'srv-k8s-p1', name: 'eth0 [Calico Overlay CNI Network]', type: 'port', status: 'up', meta: '10 Gbps • Pod CIDR 10.244.0.0/16' },
                { id: 'srv-k8s-s1', name: 'etcd 3-Node Raft Consensus Health', type: 'sensor', status: 'up', meta: 'Leader Active • Sync Latency 1.1ms' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'dc-dr',
      name: 'DR Site Datacenter (DC-2 Secondary Disaster Recovery)',
      type: 'datacenter',
      badge: 'STANDBY WARM',
      badgeColor: '#d97706',
      status: 'up',
      meta: 'Disaster Recovery Location • Auto-Failover Hot Standby',
      children: [
        {
          id: 'dr-fw',
          name: 'pfsense-ha-gw.corp (DR Security Gateway)',
          type: 'firewall',
          ip: '203.0.113.250',
          status: 'up',
          hardware: 'Netgate 1541 1U Rackmount',
          os: 'pfSense Plus 23.09.1',
          uptime: '180 Days',
          metrics: { cpu: 14, mem: 24, traffic: '450 Mbps', latency: 15.2 },
          children: [
            { id: 'dr-p1', name: 'igb0 [WAN Static IP]', type: 'port', status: 'up', meta: '1 Gbps Uplink' },
            { id: 'dr-p2', name: 'igb1 [WireGuard Site-to-Site VPN Tunnel]', type: 'port', status: 'up', meta: 'Encrypted Sync to DC-1' }
          ]
        },
        {
          id: 'dr-srv',
          name: 'dr-replica-node-01.infra (Warm Standby Server)',
          type: 'server',
          ip: '10.60.0.10',
          status: 'up',
          hardware: 'Dell PowerEdge R740xd',
          os: 'Linux Ubuntu 24.04 LTS',
          uptime: '180 Days',
          metrics: { cpu: 18, mem: 38, traffic: '320 Mbps', latency: 15.6 },
          children: [
            { id: 'dr-srv-p1', name: 'eth0 [Async DB Replica Standby]', type: 'port', status: 'up', meta: 'Lag: 0 Bytes • Continuous Sync' }
          ]
        }
      ]
    },
    {
      id: 'branch-delhi',
      name: 'Branch Office Delhi (North WAN Hub)',
      type: 'datacenter',
      badge: 'BRANCH OFFICE',
      badgeColor: '#7c3aed',
      status: 'warning',
      meta: 'Regional Enterprise Branch • 250 Onsite Endpoints',
      children: [
        {
          id: 'branch-rtr-delhi',
          deviceId: 6,
          name: 'branch-rtr-delhi.wan (Cisco ISR 4431)',
          type: 'router',
          ip: '10.200.0.1',
          status: 'down',
          hardware: 'Cisco ISR 4431 SEC-K9',
          os: 'Cisco IOS-XE (ISR4431)',
          uptime: '0 Days (Device Down)',
          metrics: { cpu: 0, mem: 0, traffic: '0 bps', latency: 0 },
          children: [
            { id: 'delhi-p1', name: 'GigabitEthernet0/0/0 [Primary MPLS Circuit]', type: 'port', status: 'down', meta: 'Carrier Line Down • ISP Ticket #48921 Open' },
            { id: 'delhi-p2', name: 'GigabitEthernet0/0/1 [Backup LTE 5G Modem]', type: 'port', status: 'up', meta: '4G/5G Failover Active (Limited Bandwidth)' }
          ]
        }
      ]
    },
    {
      id: 'models-root',
      name: '145 LibreNMS Domain Models Hierarchy Tree',
      type: 'model_category',
      badge: '145 MODELS • 15 SUITES',
      badgeColor: '#7c3aed',
      status: 'info',
      meta: 'Full Autonomous Telemetry Model Registry Mapped in PostgreSQL',
      children: [
        {
          id: 'cat-core-devices',
          name: 'Suite 1: Core Device & Hardware Hierarchy (12 Models)',
          type: 'model_category',
          badge: '12 MODELS',
          badgeColor: '#0284c7',
          status: 'up',
          children: [
            { id: 'm-dev-1', name: 'devices (Device inventory & core metadata)', type: 'model', status: 'up', meta: 'Target: PostgreSQL devices table' },
            { id: 'm-dev-2', name: 'device_groups (Static and dynamic device clusters)', type: 'model', status: 'up', meta: 'Health calculation engine' },
            { id: 'm-dev-3', name: 'device_outages (Tracking downtime and SLA durations)', type: 'model', status: 'up', meta: 'Historical log repository' },
            { id: 'm-dev-4', name: 'entPhysical (Physical chassis hierarchy and serial numbers)', type: 'model', status: 'up', meta: 'RFC 6933 entity MIB' },
            { id: 'm-dev-5', name: 'locations (Geographic coordinates, building, rack and elevation)', type: 'model', status: 'up', meta: 'GIS spatial mapping' }
          ]
        },
        {
          id: 'cat-ports',
          name: 'Suite 2: Ports & Physical Layer Hierarchy (13 Models)',
          type: 'model_category',
          badge: '13 MODELS',
          badgeColor: '#0d9488',
          status: 'up',
          children: [
            { id: 'm-port-1', name: 'ports (Interface table, traffic rates, 64-bit HC counters)', type: 'model', status: 'up', meta: 'IF-MIB RFC 2863' },
            { id: 'm-port-2', name: 'ports_fdb (MAC address forwarding database / CAM table)', type: 'model', status: 'up', meta: 'BRIDGE-MIB tracking' },
            { id: 'm-port-3', name: 'ports_vlans (802.1Q tagged and untagged port bindings)', type: 'model', status: 'up', meta: 'VLAN membership table' }
          ]
        },
        {
          id: 'cat-sensors',
          name: 'Suite 3: Sensors & Environmental Telemetry (10 Models)',
          type: 'model_category',
          badge: '10 MODELS',
          badgeColor: '#d97706',
          status: 'up',
          children: [
            { id: 'm-sens-1', name: 'sensors (Temperature, voltage, fan speed, power wattage, humidity)', type: 'model', status: 'up', meta: 'ENTITY-SENSOR-MIB' },
            { id: 'm-sens-2', name: 'processors (Multi-core CPU utilization percentage)', type: 'model', status: 'up', meta: 'HOST-RESOURCES-MIB' },
            { id: 'm-sens-3', name: 'mempools (RAM memory pool breakdown, buffers and cache)', type: 'model', status: 'up', meta: 'Real-time telemetry' }
          ]
        },
        {
          id: 'cat-routing',
          name: 'Suite 4: IP, Routing & Carrier Protocols (20 Models)',
          type: 'model_category',
          badge: '20 MODELS',
          badgeColor: '#4f46e5',
          status: 'up',
          children: [
            { id: 'm-rt-1', name: 'bgp_peers (BGP autonomous system peering, prefixes received)', type: 'model', status: 'up', meta: 'BGP4-MIB RFC 4273' },
            { id: 'm-rt-2', name: 'ospf_nbrs (OSPF adjacency states: Full, 2-Way, Init, Down)', type: 'model', status: 'up', meta: 'OSPF-MIB RFC 4752' },
            { id: 'm-rt-3', name: 'vrf (Virtual Routing and Forwarding table partitions)', type: 'model', status: 'up', meta: 'MPLS-VPN-MIB' },
            { id: 'm-rt-4', name: 'ipv4_addresses & ipv6_addresses (IP subnet allocations)', type: 'model', status: 'up', meta: 'IP-MIB prefix repository' }
          ]
        },
        {
          id: 'cat-alerts',
          name: 'Suite 5: Alerts, Thresholds & Transports (15 Models)',
          type: 'model_category',
          badge: '15 MODELS',
          badgeColor: '#dc2626',
          status: 'up',
          children: [
            { id: 'm-alt-1', name: 'alert_rules (Dynamic boolean threshold conditions and SQL queries)', type: 'model', status: 'up', meta: 'Autonomous rule evaluator' },
            { id: 'm-alt-2', name: 'alert_log (Historical audit log of incidents triggered and cleared)', type: 'model', status: 'up', meta: 'PostgreSQL alerts log' },
            { id: 'm-alt-3', name: 'alert_transports (Telegram, Slack, Email, Webhook, PagerDuty)', type: 'model', status: 'up', meta: 'Multi-channel dispatcher' }
          ]
        }
      ]
    }
  ], []);

  // Filter tree nodes based on search and type
  const filterNode = (node: TreeNode, term: string, fType: string): TreeNode | null => {
    // Check type filter
    if (fType !== 'all') {
      if (fType === 'firewalls' && node.type !== 'firewall' && node.type !== 'datacenter' && node.type !== 'tier') return null;
      if (fType === 'routers' && node.type !== 'router' && node.type !== 'datacenter' && node.type !== 'tier') return null;
      if (fType === 'switches' && node.type !== 'switch' && node.type !== 'datacenter' && node.type !== 'tier') return null;
      if (fType === 'servers' && node.type !== 'server' && node.type !== 'datacenter' && node.type !== 'tier') return null;
      if (fType === 'models' && node.type !== 'model_category' && node.type !== 'model') return null;
    }

    const matchesSelf = !term || 
      node.name.toLowerCase().includes(term.toLowerCase()) || 
      (node.ip && node.ip.includes(term)) ||
      (node.hardware && node.hardware.toLowerCase().includes(term.toLowerCase())) ||
      (node.meta && node.meta.toLowerCase().includes(term.toLowerCase()));

    if (!node.children || node.children.length === 0) {
      return matchesSelf ? node : null;
    }

    const filteredChildren = node.children
      .map(child => filterNode(child, term, fType))
      .filter((child): child is TreeNode => child !== null);

    if (matchesSelf || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren
      };
    }

    return null;
  };

  const filteredTree = useMemo(() => {
    return treeData
      .map(node => filterNode(node, searchQuery, filterType))
      .filter((n): n is TreeNode => n !== null);
  }, [treeData, searchQuery, filterType]);

  // Expand / Collapse Handlers
  const toggleNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allIds = new Set<string>();
    const collect = (nodes: TreeNode[]) => {
      nodes.forEach(n => {
        allIds.add(n.id);
        if (n.children) collect(n.children);
      });
    };
    collect(treeData);
    setExpandedNodes(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Node type icon helper
  const getNodeIcon = (type: TreeNode['type'], _status?: string) => {
    switch (type) {
      case 'datacenter':
        return <FolderTree size={16} color="#0284c7" />;
      case 'tier':
        return <LayersIcon color="#4f46e5" />;
      case 'firewall':
        return <Shield size={16} color="#dc2626" />;
      case 'router':
        return <Globe size={16} color="#4f46e5" />;
      case 'switch':
        return <Network size={16} color="#0284c7" />;
      case 'server':
        return <Server size={16} color="#16a34a" />;
      case 'port':
        return <Network size={14} color="#0d9488" />;
      case 'sensor':
        return <Thermometer size={14} color="#d97706" />;
      case 'model_category':
        return <Sparkles size={16} color="#7c3aed" />;
      case 'model':
        return <Zap size={14} color="#9333ea" />;
      default:
        return <FolderTree size={16} color="#64748b" />;
    }
  };

  const LayersIcon = ({ color }: { color: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );

  // Render a recursive tree node
  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Node Row */}
        <div 
          onClick={() => setSelectedNode(node)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            paddingLeft: `${depth * 22 + 12}px`,
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: isSelected ? '#e0f2fe' : 'transparent',
            border: isSelected ? '1px solid #bae6fd' : '1px solid transparent',
            transition: 'background-color 0.12s ease',
            userSelect: 'none'
          }}
          onMouseEnter={e => {
            if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
          onMouseLeave={e => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Chevron expand/collapse toggle */}
          {hasChildren ? (
            <button
              onClick={(e) => toggleNode(node.id, e)}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isExpanded ? '#e2e8f0' : '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                flexShrink: 0,
                padding: 0
              }}
              title={isExpanded ? "Collapse (Hide Children)" : "Expand (Unhide Children)"}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span style={{ width: '20px', height: '20px', display: 'inline-block', flexShrink: 0 }} />
          )}

          {/* Node Icon */}
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: node.type === 'firewall' ? '#fee2e2' :
                        node.type === 'router' ? '#e0e7ff' :
                        node.type === 'switch' ? '#e0f2fe' :
                        node.type === 'server' ? '#dcfce7' :
                        node.type === 'datacenter' ? '#f0f9ff' :
                        node.type === 'model_category' ? '#f3e8ff' : '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getNodeIcon(node.type, node.status)}
          </div>

          {/* Node Name & Meta */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{
              fontSize: depth === 0 ? '0.88rem' : depth === 1 ? '0.84rem' : '0.82rem',
              fontWeight: depth <= 1 ? 700 : isSelected ? 700 : 500,
              color: node.status === 'down' ? '#dc2626' : '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {node.name}
            </span>

            {node.ip && (
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                color: '#64748b',
                background: '#f1f5f9',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {node.ip}
              </span>
            )}
          </div>

          {/* Node Status Badge */}
          {node.status && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: node.status === 'up' ? '#16a34a' : node.status === 'down' ? '#dc2626' : '#d97706'
              }} />
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: node.status === 'up' ? '#15803d' : node.status === 'down' ? '#b91c1c' : '#b45309'
              }}>
                {node.status}
              </span>
            </div>
          )}

          {/* Optional Type Badge */}
          {node.badge && (
            <span style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '9999px',
              background: '#f1f5f9',
              color: node.badgeColor || '#475569',
              border: '1px solid #e2e8f0',
              flexShrink: 0
            }}>
              {node.badge}
            </span>
          )}
        </div>

        {/* Children (if expanded) */}
        {hasChildren && isExpanded && (
          <div style={{
            position: 'relative',
            marginLeft: `${depth * 22 + 21}px`,
            paddingLeft: '6px',
            borderLeft: '1px solid #e2e8f0'
          }}>
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Find corresponding device for charts if clicked
  const handleOpenChartForNode = (node: TreeNode) => {
    if (node.deviceId) {
      const match = devices.find(d => d.id === node.deviceId);
      if (match) {
        setChartDevice(match);
        return;
      }
    }
    // Fallback: construct device representation
    const tempDev: Device = {
      id: 999,
      hostname: node.name,
      ip_address: node.ip || '192.168.1.1',
      snmp_version: 'v2c',
      snmp_port: 161,
      os: node.os || 'Enterprise OS',
      hardware: node.hardware || node.name,
      status: node.status !== 'down',
      last_ping_ms: node.metrics?.latency || 1.4,
      uptime_seconds: 589200
    };
    setChartDevice(tempDev);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div style={{
        background: '#ffffff',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
          }}>
            <FolderTree size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Enterprise Infrastructure Tree View
              </h2>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd'
              }}>
                HIDE / UNHIDE HIERARCHY
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
              Structural topology from Datacenters &rarr; Firewalls &rarr; Core Routers &rarr; Switches &rarr; Servers &rarr; Ports &rarr; 145 LibreNMS Models
            </p>
          </div>
        </div>

        {/* Global Expand / Collapse All Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExpandAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Maximize2 size={14} color="#0284c7" />
            <span>Expand All (Unhide)</span>
          </button>

          <button
            onClick={handleCollapseAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Minimize2 size={14} color="#dc2626" />
            <span>Collapse All (Hide)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        padding: '14px 20px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '6px 12px',
          width: '320px'
        }}>
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Search servers, switches, firewalls, ports..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.82rem',
              color: '#0f172a',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Hierarchy', icon: SlidersHorizontal },
            { id: 'firewalls', label: 'Firewalls (Perimeter)', icon: Shield },
            { id: 'routers', label: 'Routers (WAN/BGP)', icon: Globe },
            { id: 'switches', label: 'Switches (Spine/Leaf)', icon: Network },
            { id: 'servers', label: 'Servers (Compute/DB)', icon: Server },
            { id: 'models', label: '145 Domain Models', icon: Sparkles },
          ].map(btn => {
            const isCurrent = filterType === btn.id;
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 11px',
                  borderRadius: '6px',
                  background: isCurrent ? '#0284c7' : '#f8fafc',
                  color: isCurrent ? '#ffffff' : '#475569',
                  border: isCurrent ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={13} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column View: Tree Pane on Left, Node Details on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Collapsible Tree Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          padding: '16px',
          maxHeight: '750px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
              Network & Models Tree ({filteredTree.length} Root Datacenters/Domains)
            </span>
            <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>
              Click node to inspect &bull; [ &gt; ] to expand/hide
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredTree.map(rootNode => renderTreeNode(rootNode, 0))}
          </div>
        </div>

        {/* Right: Selected Node Detail Inspector */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          padding: '20px',
          position: 'sticky',
          top: '85px'
        }}>
          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getNodeIcon(selectedNode.type, selectedNode.status)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {selectedNode.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0', textTransform: 'uppercase', fontWeight: 600 }}>
                      Type: {selectedNode.type}
                    </p>
                  </div>
                </div>

                {selectedNode.status && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    background: selectedNode.status === 'up' ? '#dcfce7' : selectedNode.status === 'down' ? '#fee2e2' : '#fef3c7',
                    color: selectedNode.status === 'up' ? '#15803d' : selectedNode.status === 'down' ? '#b91c1c' : '#b45309',
                    border: `1px solid ${selectedNode.status === 'up' ? '#bbf7d0' : selectedNode.status === 'down' ? '#fecaca' : '#fde68a'}`
                  }}>
                    {selectedNode.status.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Attributes Grid */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.8rem'
              }}>
                {selectedNode.ip && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>IP Address / FQDN:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#0284c7' }}>{selectedNode.ip}</strong>
                  </div>
                )}
                {selectedNode.hardware && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Hardware Model:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedNode.hardware}</strong>
                  </div>
                )}
                {selectedNode.os && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Operating System:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedNode.os}</strong>
                  </div>
                )}
                {selectedNode.uptime && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>System Uptime:</span>
                    <strong style={{ color: '#16a34a' }}>{selectedNode.uptime}</strong>
                  </div>
                )}
                {selectedNode.meta && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.74rem' }}>Description / Spec:</span>
                    <span style={{ color: '#334155', fontWeight: 600 }}>{selectedNode.meta}</span>
                  </div>
                )}
              </div>

              {/* Live Telemetry Summary if available */}
              {selectedNode.metrics && (
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', marginBottom: '8px' }}>
                    Live Hardware Telemetry
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem' }}>
                        <Cpu size={13} color="#0284c7" />
                        <span>CPU Load</span>
                      </div>
                      <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {selectedNode.metrics.cpu}%
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem' }}>
                        <HardDrive size={13} color="#16a34a" />
                        <span>Memory RAM</span>
                      </div>
                      <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {selectedNode.metrics.mem}%
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem' }}>
                        <Activity size={13} color="#7c3aed" />
                        <span>Current Bandwidth</span>
                      </div>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {selectedNode.metrics.traffic}
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem' }}>
                        <RefreshCw size={13} color="#d97706" />
                        <span>ICMP Latency</span>
                      </div>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {selectedNode.metrics.latency} ms
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleOpenChartForNode(selectedNode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <BarChart3 size={15} />
                  <span>Open Multi-Metric Charts Modal</span>
                </button>

                {selectedNode.deviceId && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => onPing(selectedNode.deviceId!)}
                      disabled={pingingId === selectedNode.deviceId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Zap size={13} color="#0284c7" />
                      <span>{pingingId === selectedNode.deviceId ? 'Pinging...' : 'Fast Ping'}</span>
                    </button>

                    <button
                      onClick={() => onPoll(selectedNode.deviceId!)}
                      disabled={pollingId === selectedNode.deviceId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      <RefreshCw size={13} color="#16a34a" />
                      <span>{pollingId === selectedNode.deviceId ? 'Polling...' : 'SNMP Poll'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
              <FolderTree size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                No Node Selected
              </p>
              <p style={{ fontSize: '0.78rem', margin: 0 }}>
                Click any server, switch, firewall, or port in the left tree to inspect full telemetry, IP metadata, and launch charts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Metric Charts Deep Dive Modal */}
      {chartDevice && (
        <DeviceChartsModal
          device={chartDevice}
          onClose={() => setChartDevice(null)}
          onPing={onPing}
          onPoll={onPoll}
          pingingId={pingingId}
          pollingId={pollingId}
        />
      )}
    </div>
  );
};
