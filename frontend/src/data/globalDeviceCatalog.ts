export interface VendorOption {
  id: string;
  name: string;
  country: string;
  flag: string;
  defaultOS: string;
  models: string[];
}

export interface DeviceCategoryDefinition {
  id: string;
  label: string;
  badgeLabel: string;
  iconName: string;
  description: string;
  vendors: VendorOption[];
}

export const GLOBAL_DEVICE_CATALOG: Record<string, DeviceCategoryDefinition> = {
  server: {
    id: 'server',
    label: 'Server & Compute Node',
    badgeLabel: 'SERVER',
    iconName: 'Server',
    description: 'Enterprise rackmount, blade, modular and virtualization compute servers',
    vendors: [
      {
        id: 'Dell',
        name: 'Dell Technologies',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Windows Server 2022 Datacenter',
        models: [
          'Dell PowerEdge R750 (Dual Xeon Gold 6330)',
          'Dell PowerEdge R650xs (High-Density 1U Xeon)',
          'Dell PowerEdge R740xd (Storage Optimized 24-Bay)',
          'Dell PowerEdge R940 (4-Socket Mission-Critical)',
          'Dell PowerEdge MX7000 Modular Kinetic Infrastructure',
          'Dell PowerEdge C6420 HPC Compute Sled',
          'Dell PowerEdge XR12 Rugged Military-Spec Edge'
        ]
      },
      {
        id: 'HPE',
        name: 'HPE (Hewlett Packard Enterprise)',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Red Hat Enterprise Linux 9.2',
        models: [
          'HPE ProLiant DL380 Gen10 Plus (Dual Xeon Platinum)',
          'HPE ProLiant DL360 Gen10 (Ultra-Dense 1U Rack)',
          'HPE ProLiant DL560 Gen10 (4-Socket Enterprise)',
          'HPE Synergy 480 Gen10 Composable Compute Module',
          'HPE Apollo 4200 Gen10 High-Density Storage Server',
          'HPE Edgeline EL8000 Converged Edge System'
        ]
      },
      {
        id: 'Lenovo',
        name: 'Lenovo ThinkSystem',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'SUSE Linux Enterprise Server 15 SP4',
        models: [
          'Lenovo ThinkSystem SR650 V2 (Dual Intel Xeon)',
          'Lenovo ThinkSystem SR630 V2 (1U High Performance)',
          'Lenovo ThinkSystem SR850 (4-Socket Mission Critical)',
          'Lenovo ThinkSystem SD530 Dense Modular Server',
          'Lenovo ThinkEdge SE450 Rugged Edge Server'
        ]
      },
      {
        id: 'Cisco',
        name: 'Cisco UCS Systems',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'VMware ESXi 8.0 Enterprise Plus',
        models: [
          'Cisco UCS B200 M6 Blade Server',
          'Cisco UCS C240 M6 Rack Server (Dual Xeon)',
          'Cisco UCS C220 M5 High-Density Rack',
          'Cisco UCS X210c M6 Modular Compute Node',
          'Cisco UCS S3260 Dense Storage Server'
        ]
      },
      {
        id: 'Supermicro',
        name: 'Supermicro',
        country: 'Taiwan',
        flag: '🇹🇼',
        defaultOS: 'Ubuntu Server 22.04.4 LTS',
        models: [
          'Supermicro SuperServer SYS-220U-TNR (Ultra 2U)',
          'Supermicro BigTwin SYS-210BT (4-Node 2U High-Density)',
          'Supermicro Ultra SYS-1029U-TN10RT (NVMe Optimized)',
          'Supermicro FatTwin SYS-F619P2',
          'Supermicro Edge SYS-E300-9D'
        ]
      },
      {
        id: 'Huawei',
        name: 'Huawei Enterprise',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'EulerOS 2.0 (SP9 Enterprise)',
        models: [
          'Huawei FusionServer Pro 2288H V5 (2U Xeon)',
          'Huawei FusionServer 1288H V6 (1U Rack Server)',
          'Huawei TaiShan 200 ARM Server (Kunpeng 920 64-Core)',
          'Huawei FusionServer Pro 2488H V5 (4-Socket)'
        ]
      },
      {
        id: 'Inspur',
        name: 'Inspur Information',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'Red Hat Enterprise Linux 8.8',
        models: [
          'Inspur NF5280M6 Enterprise Rack Server',
          'Inspur NF8480M6 4-Socket Mission Critical',
          'Inspur NF5468M6 High-Density AI Server (8x GPU)'
        ]
      },
      {
        id: 'Fujitsu',
        name: 'Fujitsu PRIMERGY',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Windows Server 2022 Datacenter',
        models: [
          'Fujitsu PRIMERGY RX2540 M6 (Dual Socket 2U)',
          'Fujitsu PRIMERGY RX2530 M6 (1U High Performance)',
          'Fujitsu PRIMERGY TX1330 M5 (Tower / Rack Office)',
          'Fujitsu PRIMEQUEST 3800B2 (High-Reliability Enterprise)'
        ]
      },
      {
        id: 'ASUS',
        name: 'ASUS Enterprise',
        country: 'Taiwan',
        flag: '🇹🇼',
        defaultOS: 'Ubuntu Server 22.04 LTS',
        models: [
          'ASUS RS720A-E11 (AMD EPYC 7003 Dual Socket)',
          'ASUS ESC8000 G4 (8-GPU Deep Learning Server)',
          'ASUS RS500A-E11 (1U AMD Dense Server)'
        ]
      },
      {
        id: 'Oracle',
        name: 'Oracle / Sun Microsystems',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Oracle Solaris 11.4 / Oracle Linux 9',
        models: [
          'Oracle Server X8-2 (Intel Xeon 1U)',
          'Oracle Server X9-2L (Storage Optimized 2U)',
          'Oracle SPARC T8-1 (SPARC M8 32-Core Processor)',
          'Oracle Exadata Database Machine X9M-2'
        ]
      },
      {
        id: 'IBM',
        name: 'IBM Systems',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'IBM AIX 7.3 / Red Hat Enterprise Linux',
        models: [
          'IBM Power System S924 (POWER9 Enterprise Server)',
          'IBM Power System E980 (High-End Enterprise Cloud)',
          'IBM LinuxONE Emperor 4 (Linux Mainframe)'
        ]
      },
      {
        id: 'Atos',
        name: 'Atos / Bull',
        country: 'France',
        flag: '🇫🇷',
        defaultOS: 'Red Hat Enterprise Linux 9.0',
        models: [
          'Atos BullSequana S800 (Scale-up Enterprise Server)',
          'Atos BullSequana X1000 (Supercomputer Blade)'
        ]
      },
      {
        id: 'NEC',
        name: 'NEC Corporation',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Windows Server 2022',
        models: [
          'NEC Express5800/R120h-2M (2U Dual Socket)',
          'NEC Express5800 Scalable Modular Enterprise Server'
        ]
      },
      {
        id: 'Ubuntu',
        name: 'Ubuntu / Canonical Certified',
        country: 'UK',
        flag: '🇬🇧',
        defaultOS: 'Ubuntu Server 22.04.4 LTS (Jammy Jellyfish)',
        models: [
          'Certified Ubuntu Enterprise Xeon Compute Node',
          'Ubuntu Linux KVM Virtualization Hypervisor Cluster',
          'Ubuntu MicroK8s Edge Appliance'
        ]
      }
    ]
  },

  switch: {
    id: 'switch',
    label: 'Network Core & Access Switch',
    badgeLabel: 'SWITCH',
    iconName: 'Network',
    description: 'Layer-2/3 access, distribution, spine/leaf and campus core switches',
    vendors: [
      {
        id: 'Cisco',
        name: 'Cisco Systems',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Cisco IOS-XE 17.9.4b',
        models: [
          'Cisco Catalyst 9300-48P (48-Port PoE+ L3 Managed)',
          'Cisco Catalyst 9500-24Y4C (100G Cloud Core Campus)',
          'Cisco Nexus 93180YC-FX3 (48x25G / 6x100G Data Center)',
          'Cisco Catalyst 3850-24T (Gigabit L3 Stackable)',
          'Cisco Meraki MS250-48FP (Cloud Managed 48-Port PoE+)',
          'Cisco Nexus 9336C-FX2 (36x100G Backbone Spine)'
        ]
      },
      {
        id: 'Arista',
        name: 'Arista Networks',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Arista EOS 4.30.2F',
        models: [
          'Arista 7050SX3-48YC8 (48x25G SFP28 + 8x100G QSFP28)',
          'Arista 7280R3-24P (24x100G Spine / WAN Edge)',
          'Arista 7060CX-32S (32x100G Low-Latency Data Center)',
          'Arista 7150S-24 (Ultra Low-Latency Financial Trading)'
        ]
      },
      {
        id: 'Juniper',
        name: 'Juniper Networks',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Junos OS 22.4R2',
        models: [
          'Juniper EX4300-48P (48-Port PoE+ Multigigabit)',
          'Juniper EX4400-24X (24x10G SFP+ Distribution Switch)',
          'Juniper QFX5120-48Y (48x25G + 8x100G Spine/Leaf)',
          'Juniper QFX10002-36Q (36x40G Data Center Core)'
        ]
      },
      {
        id: 'HPE_Aruba',
        name: 'HPE Aruba',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'ArubaOS-CX 10.11',
        models: [
          'Aruba CX 6300M 48G (48-Port Class 4 PoE+ Switch)',
          'Aruba CX 8325 32x100G (Data Center & Campus Core)',
          'Aruba 2930F 48G PoE+ (Layer 3 Access Switch)',
          'Aruba CX 6405 Modular Chassis Switch'
        ]
      },
      {
        id: 'Extreme',
        name: 'Extreme Networks',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'ExtremeXOS 32.2',
        models: [
          'Extreme 5520-48W (Universal Switch 48-Port 90W PoE)',
          'Extreme 5420M-24T (24-Port Gigabit Campus Edge)',
          'Extreme VSP 7400-32C (32x100G Enterprise Fabric Core)'
        ]
      },
      {
        id: 'Huawei',
        name: 'Huawei CloudEngine',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'VRP (Versatile Routing Platform) 8.20',
        models: [
          'Huawei CloudEngine 6881-48T6CQ (48x10GE + 6x100GE)',
          'Huawei CloudEngine 16800 (AI Data Center Flagship Core)',
          'Huawei S5735-L48T4X-A (48-Port Gigabit Enterprise Access)'
        ]
      },
      {
        id: 'H3C',
        name: 'H3C Technologies',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'Comware V7 Enterprise OS',
        models: [
          'H3C S6520X-54QC (48x10G + 6x40G L3 Switch)',
          'H3C S5560X-54C-EI (Gigabit Enterprise Switch)'
        ]
      },
      {
        id: 'Dell_Net',
        name: 'Dell EMC Networking',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Dell SmartFabric OS10',
        models: [
          'Dell PowerSwitch S5248F-ON (48x25GbE + 6x100GbE)',
          'Dell PowerSwitch N3248P-ON (48x 1GbE PoE+ 802.3at)',
          'Dell PowerSwitch Z9264F-ON (64x100GbE Spine Core)'
        ]
      },
      {
        id: 'Ubiquiti',
        name: 'Ubiquiti UniFi',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'UniFi OS Switch Firmware 6.5',
        models: [
          'UniFi Switch Pro 48 PoE (Layer 3 PoE++ Managed)',
          'UniFi Switch EnterpriseXG 24 (24x10GbE RJ45 10G)',
          'UniFi Switch Pro Aggregation (28x10G SFP+ / 4x25G SFP28)'
        ]
      },
      {
        id: 'MikroTik',
        name: 'MikroTik RouterBOARD',
        country: 'Latvia',
        flag: '🇱🇻',
        defaultOS: 'MikroTik RouterOS v7.12 (Level 6)',
        models: [
          'MikroTik CRS354-48G-4S+2Q+RM (48x GbE + 4x10G + 2x40G)',
          'MikroTik CRS326-24G-2S+RM (24-Port Gigabit L3 Switch)',
          'MikroTik CCR2004-1G-12S+2XS (12x10G + 2x25G Core)'
        ]
      },
      {
        id: 'Allied_Telesis',
        name: 'Allied Telesis',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'AlliedWare Plus 5.5.2',
        models: [
          'Allied Telesis CentreCOM x950-28XSQ (10G/40G Stackable)',
          'Allied Telesis SwitchBlade x908 GEN2 (Modular Core)'
        ]
      },
      {
        id: 'NVIDIA_Mellanox',
        name: 'NVIDIA / Mellanox',
        country: 'Israel',
        flag: '🇮🇱',
        defaultOS: 'NVIDIA Onyx / SONiC NOS',
        models: [
          'NVIDIA Spectrum SN2700 (32x100GbE Open Ethernet)',
          'NVIDIA Spectrum-3 SN4600 (64x100GbE High-Density Spine)'
        ]
      },
      {
        id: 'Ruijie',
        name: 'Ruijie Networks',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'RGOS 11.4',
        models: [
          'Ruijie RG-S6510-48VS8CQ (48x25G + 8x100G DC Switch)',
          'Ruijie RG-S2910-24GT4SFP-P-E (PoE+ Managed Switch)'
        ]
      },
      {
        id: 'DLink',
        name: 'D-Link Enterprise',
        country: 'Taiwan',
        flag: '🇹🇼',
        defaultOS: 'D-Link D-View 7 Managed OS',
        models: [
          'D-Link DGS-3630-52TC (Layer 3 Stackable Managed)',
          'D-Link DGS-1510-52X (48-Port GbE + 4x10G SFP+)'
        ]
      },
      {
        id: 'Zyxel',
        name: 'Zyxel Networks',
        country: 'Taiwan',
        flag: '🇹🇼',
        defaultOS: 'Zyxel NebulaFlex Pro OS',
        models: [
          'Zyxel XS3800-28 (28-Port 10G Aggregation Switch)',
          'Zyxel GS2220-50HP (50-Port GbE L2+ PoE Switch)'
        ]
      }
    ]
  },

  firewall: {
    id: 'firewall',
    label: 'Firewall & Security Gateway',
    badgeLabel: 'FIREWALL',
    iconName: 'Shield',
    description: 'Next-Generation Firewalls, unified threat management and perimeter security appliances',
    vendors: [
      {
        id: 'Palo_Alto',
        name: 'Palo Alto Networks',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'PAN-OS 11.0 Cosmos',
        models: [
          'Palo Alto PA-3260 Next-Gen Firewall (4.4 Gbps Threat)',
          'Palo Alto PA-5250 Enterprise Perimeter Gateway (20 Gbps)',
          'Palo Alto PA-850 Branch Office NGFW',
          'Palo Alto PA-440 Machine Learning NGFW',
          'Palo Alto PA-7080 Hyperscale Modular Chassis'
        ]
      },
      {
        id: 'Fortinet',
        name: 'Fortinet FortiGate',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'FortiOS 7.4.2 Enterprise',
        models: [
          'FortiGate 200F Enterprise NGFW (27 Gbps Firewall)',
          'FortiGate 100F Mid-Enterprise Security Gateway',
          'FortiGate 600E Campus Perimeter Threat Defense',
          'FortiGate 40F Secure SD-WAN SOHO Gateway',
          'FortiGate 1800F Hyperscale Data Center Firewall'
        ]
      },
      {
        id: 'Check_Point',
        name: 'Check Point Security',
        country: 'Israel',
        flag: '🇮🇱',
        defaultOS: 'Check Point GAiA R81.20',
        models: [
          'Check Point Quantum 1800 Next-Gen Gateway (GAiA R81)',
          'Check Point Quantum 6600 Security Gateway (15 Gbps)',
          'Check Point Maestro Hyperscale Orchestrator 140',
          'Check Point Quantum Spark 1570 Branch Appliance',
          'Check Point Quantum 26000 Data Center Firewall'
        ]
      },
      {
        id: 'Cisco_Sec',
        name: 'Cisco Secure Firewall',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Cisco Firepower Threat Defense (FTD 7.3)',
        models: [
          'Cisco Secure Firewall 3120 (FTD 7.2 / ASA 9.18)',
          'Cisco Firepower 2130 NGFW Enterprise Gateway',
          'Cisco ASA 5516-X with FirePOWER Services',
          'Cisco Meraki MX250 Cloud Managed Security Appliance',
          'Cisco Secure Firewall 4150 High-Throughput Carrier'
        ]
      },
      {
        id: 'Juniper_SRX',
        name: 'Juniper Networks SRX',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Junos OS 22.4R1-S2 (SRX Series)',
        models: [
          'Juniper SRX345 Branch Security Gateway (5 Gbps)',
          'Juniper SRX1500 Enterprise Data Center Firewall',
          'Juniper SRX4600 High-Performance 100G Firewall',
          'Juniper SRX300 Compact Security Gateway'
        ]
      },
      {
        id: 'Sophos',
        name: 'Sophos Firewall',
        country: 'UK',
        flag: '🇬🇧',
        defaultOS: 'Sophos SFOS 20.0 (Xstream)',
        models: [
          'Sophos XGS 2300 Next-Gen Firewall (Xstream Architecture)',
          'Sophos XGS 4500 Enterprise Core Gateway',
          'Sophos XGS 136 Desktop Security Appliance',
          'Sophos SG 310 UTM Network Security'
        ]
      },
      {
        id: 'SonicWall',
        name: 'SonicWall',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'SonicOS 7.1.1 Enterprise',
        models: [
          'SonicWall NSa 4700 High-Throughput NGFW (18 Gbps)',
          'SonicWall TZ470 Multi-Gigabit Desktop Gateway',
          'SonicWall NSa 2700 Mid-Enterprise Threat Protection',
          'SonicWall SuperMassive 9600 Carrier Security'
        ]
      },
      {
        id: 'WatchGuard',
        name: 'WatchGuard Firebox',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Fireware OS v12.10',
        models: [
          'WatchGuard Firebox M470 Enterprise UTM Appliance',
          'WatchGuard Firebox T80 Desktop Tabletop Gateway',
          'WatchGuard Firebox M590 High-Availability Gateway'
        ]
      },
      {
        id: 'Huawei_Sec',
        name: 'Huawei HiSecEngine',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'Huawei VRP SecOS 5.18',
        models: [
          'Huawei USG6680E AI Enterprise Firewall (10 Gbps)',
          'Huawei USG6530E Next-Generation Desktop Gateway',
          'Huawei HiSecEngine USG12000 Data Center Firewall'
        ]
      },
      {
        id: 'Sangfor',
        name: 'Sangfor Technologies',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'Sangfor NGAF OS 8.0.5',
        models: [
          'Sangfor NGAF M5400-F-I Next-Gen Application Firewall',
          'Sangfor NGAF AF-1000 AI Threat Gateway'
        ]
      },
      {
        id: 'Barracuda',
        name: 'Barracuda Networks',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Barracuda CloudGen OS 9.0',
        models: [
          'Barracuda CloudGen Firewall F800 Enterprise',
          'Barracuda CloudGen Firewall F380 Branch Appliance'
        ]
      },
      {
        id: 'Netgate',
        name: 'Netgate (pfSense Plus)',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'pfSense Plus 23.09.1 (FreeBSD 14)',
        models: [
          'Netgate 6100 Max Security Appliance (pfSense Plus)',
          'Netgate 1537 10G Rackmount Enterprise Firewall',
          'Netgate 8200 High-Throughput Gateway'
        ]
      },
      {
        id: 'Deciso',
        name: 'Deciso (OPNsense Business)',
        country: 'Netherlands',
        flag: '🇳🇱',
        defaultOS: 'OPNsense 24.1 Business Edition',
        models: [
          'Deciso OPNsense DEC3850 Rackmount Security Gateway',
          'Deciso OPNsense DEC740 Desktop Security Appliance'
        ]
      },
      {
        id: 'Stormshield',
        name: 'Stormshield (Airbus Cyber)',
        country: 'France',
        flag: '🇫🇷',
        defaultOS: 'Stormshield SNS v4.7 (EU Certified)',
        models: [
          'Stormshield SN910 Cyber Security UTM (EU Certified)',
          'Stormshield SN3100 Data Center Gateway'
        ]
      },
      {
        id: 'AhnLab',
        name: 'AhnLab Security',
        country: 'South Korea',
        flag: '🇰🇷',
        defaultOS: 'AhnLab TrusGuard OS 3.0',
        models: [
          'AhnLab TrusGuard 5000A Enterprise UTM Gateway',
          'AhnLab TrusGuard 1000A Mid-Market Firewall'
        ]
      },
      {
        id: 'Hillstone',
        name: 'Hillstone Networks',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'StoneOS 5.5R9',
        models: [
          'Hillstone A-Series A5800 Next-Gen Firewall',
          'Hillstone E-Series E3950 Perimeter Gateway'
        ]
      }
    ]
  },

  workstation: {
    id: 'workstation',
    label: 'Client Workstation & Endpoint',
    badgeLabel: 'WORKSTATION',
    iconName: 'Monitor',
    description: 'Corporate client desktops, tower workstations, laptops and rugged field terminals',
    vendors: [
      {
        id: 'Dell_Client',
        name: 'Dell Technologies',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Windows 11 Pro 64-bit (23H2)',
        models: [
          'Dell OptiPlex 7090 Tower (Core i7-11700, 32GB RAM)',
          'Dell Precision 5820 Tower (Intel Xeon W-2245)',
          'Dell Precision 7770 Mobile Workstation (RTX A4500)',
          'Dell OptiPlex 3080 Micro Small Form Factor',
          'Dell Latitude 5540 Enterprise Laptop'
        ]
      },
      {
        id: 'HP_Client',
        name: 'HP (Hewlett Packard)',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Windows 11 Pro 64-bit',
        models: [
          'HP EliteDesk 800 G8 Desktop (Core i7-11700)',
          'HP Z4 G4 Workstation (Intel Xeon W-2123, 64GB)',
          'HP Z8 G4 High-End Dual Xeon Workstation',
          'HP ProDesk 400 G7 Microtower PC',
          'HP ZBook Studio G8 Mobile Workstation'
        ]
      },
      {
        id: 'Lenovo_Client',
        name: 'Lenovo ThinkCentre / ThinkStation',
        country: 'China',
        flag: '🇨🇳',
        defaultOS: 'Windows 11 Pro Enterprise',
        models: [
          'Lenovo ThinkCentre M90t Gen 3 Tower',
          'Lenovo ThinkStation P620 (AMD Threadripper PRO 5955WX)',
          'Lenovo ThinkPad P16 Gen 1 Mobile Workstation',
          'Lenovo ThinkCentre M70q Tiny Enterprise PC'
        ]
      },
      {
        id: 'Apple',
        name: 'Apple Inc.',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'macOS Sonoma 14.4 Enterprise',
        models: [
          'Apple Mac Studio (M2 Ultra 24-Core CPU, 60-Core GPU)',
          'Apple Mac Pro Rackmount (M2 Ultra Apple Silicon)',
          'Apple MacBook Pro 16 (M3 Max 16-Core, 48GB Unified)',
          'Apple Mac mini (M2 Pro Enterprise Node)'
        ]
      },
      {
        id: 'Fujitsu_Client',
        name: 'Fujitsu CELSIUS',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Windows 11 Pro 64-bit',
        models: [
          'Fujitsu CELSIUS W5010 Workstation',
          'Fujitsu ESPRIMO D9011 Desktop PC',
          'Fujitsu LIFEBOOK U7411 Enterprise Laptop'
        ]
      },
      {
        id: 'ASUS_Client',
        name: 'ASUS ProArt / ExpertCenter',
        country: 'Taiwan',
        flag: '🇹🇼',
        defaultOS: 'Windows 11 Pro 64-bit',
        models: [
          'ASUS ProArt Station PD5 (Core i9-11900, RTX 3070)',
          'ASUS ExpertCenter D7 Tower (D700TD)',
          'ASUS ExpertBook B9 Ultra-Light Enterprise'
        ]
      },
      {
        id: 'Acer_Client',
        name: 'Acer Veriton',
        country: 'Taiwan',
        flag: '🇹🇼',
        defaultOS: 'Windows 11 Pro',
        models: [
          'Acer Veriton X4680G SFF Enterprise Desktop',
          'Acer ConceptD 500 Creator Workstation'
        ]
      },
      {
        id: 'Panasonic',
        name: 'Panasonic TOUGHBOOK',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Windows 11 Pro Ruggedized',
        models: [
          'Panasonic TOUGHBOOK 55 Ruggedized Enterprise Laptop',
          'Panasonic TOUGHBOOK 33 2-in-1 Field Tablet'
        ]
      },
      {
        id: 'Getac',
        name: 'Getac Rugged',
        country: 'Taiwan',
        flag: '🇹🇼',
        defaultOS: 'Windows 11 Pro Military-Spec',
        models: [
          'Getac B360 Fully Ruggedized Industrial Machine',
          'Getac S410 Semi-Rugged Enterprise Laptop'
        ]
      },
      {
        id: 'System76',
        name: 'System76 Linux Machines',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Pop!_OS 22.04 LTS / Ubuntu 22.04',
        models: [
          'System76 Thelio Major (AMD Threadripper / Ubuntu Linux)',
          'System76 Gazelle Linux Workstation'
        ]
      },
      {
        id: 'Framework',
        name: 'Framework Modular',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Windows 11 Pro / Fedora 39',
        models: [
          'Framework Laptop 16 Modular Enterprise Machine',
          'Framework Laptop 13 Intel Core Ultra'
        ]
      }
    ]
  },

  ntp: {
    id: 'ntp',
    label: 'NTP & Precision Time Reference (PTP IEEE 1588)',
    badgeLabel: 'NTP',
    iconName: 'Clock',
    description: 'Stratum-1 GNSS/GPS atomic master clocks and PTP network time synchronization appliances',
    vendors: [
      {
        id: 'Microchip',
        name: 'Microchip / Microsemi',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'SyncServer Security Linux 4.3 (Stratum-1)',
        models: [
          'Microchip SyncServer S650 GNSS/NTP/PTP Stratum-1',
          'Microchip SyncServer S600 Rubidium Atomic Clock',
          'Microchip TimeProvider 4100 IEEE 1588 Grandmaster',
          'Microsemi SyncServer S350 Legacy NTP Server'
        ]
      },
      {
        id: 'Meinberg',
        name: 'Meinberg Funkuhren',
        country: 'Germany',
        flag: '🇩🇪',
        defaultOS: 'Meinberg LANTIME V7.06 (Firmware)',
        models: [
          'Meinberg LANTIME M3000 Versatile Central Time Server',
          'Meinberg LANTIME M1000 Modular NTP Appliance',
          'Meinberg LANTIME M400 Compact Stratum-1 Server',
          'Meinberg IMS-GPS/GNSS High-Precision Receiver'
        ]
      },
      {
        id: 'Spectracom',
        name: 'Spectracom / Orolia / Safran',
        country: 'France',
        flag: '🇫🇷',
        defaultOS: 'SecureSync Enterprise Linux 5.9',
        models: [
          'Spectracom SecureSync 2400 GPS/GNSS Stratum-1',
          'Orolia VersaSync Rugged GPS PTP/NTP Clock',
          'Spectracom TSync-PCIe Timing Card'
        ]
      },
      {
        id: 'Masterclock',
        name: 'Masterclock Inc.',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Masterclock WinDiscovery Embedded',
        models: [
          'Masterclock GMR1000 Master Clock & NTP Time Server',
          'Masterclock GMR5000 Modular Time Reference Generator',
          'Masterclock NTD26 Digital IP Clock Device'
        ]
      },
      {
        id: 'Oscilloquartz',
        name: 'Oscilloquartz / ADVA Optical',
        country: 'Switzerland',
        flag: '🇨🇭',
        defaultOS: 'OSA Ensemble Sync Director',
        models: [
          'Oscilloquartz OSA 5420 IEEE 1588 PTP Grandmaster Clock',
          'Oscilloquartz OSA 5410 Precision Time Protocol Gateway',
          'Oscilloquartz OSA 3230B Cesium Atomic Frequency Standard'
        ]
      },
      {
        id: 'Seiko',
        name: 'Seiko Solutions',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Seiko TS Firmware 3.2',
        models: [
          'Seiko TS-2950 High-Precision Time Server (GNSS / PTP)',
          'Seiko TS-2560 Multi-Protocol Stratum-1 Clock'
        ]
      },
      {
        id: 'Trimble',
        name: 'Trimble Timing',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Trimble Embedded GPS Firmware',
        models: [
          'Trimble Thunderbolt E GPS Disciplined Stratum-1 Clock',
          'Trimble ICM SMT 360 Multi-GNSS Timing Module'
        ]
      },
      {
        id: 'Gorgy_Timing',
        name: 'Gorgy Timing',
        country: 'France',
        flag: '🇫🇷',
        defaultOS: 'Gorgy NTP MasterOS',
        models: [
          'Gorgy Timing LEDI Network Master Clock & NTP Server',
          'Gorgy Timing RT4200 PTP Grandmaster Clock'
        ]
      },
      {
        id: 'Brandywine',
        name: 'Brandywine Communications',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Brandywine Real-Time OS',
        models: [
          'Brandywine High-Precision GPS NTP Server 9100',
          'Brandywine Precision Frequency & Time Standard'
        ]
      }
    ]
  },
  printer: {
    id: 'printer',
    label: 'Network Printer & Imaging',
    badgeLabel: 'PRINTER',
    iconName: 'Printer',
    description: 'Enterprise office multi-function laser printers, line printers, and industrial label engines',
    vendors: [
      {
        id: 'HP',
        name: 'HP (Hewlett-Packard Printing)',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'HP FutureSmart Firmware 5.6',
        models: [
          'HP LaserJet Enterprise MFP M528dn (Monochrome 45ppm)',
          'HP Color LaserJet Enterprise M555x (High-Speed Color)',
          'HP LaserJet Managed MFP E82650dn (Departmental 50ppm)',
          'HP PageWide Enterprise Color 556xh (75ppm Flow)',
          'HP DesignJet T650 Large-Format Plotter 36-inch'
        ]
      },
      {
        id: 'Canon',
        name: 'Canon Solutions America',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Canon MEAP Platform v3.8',
        models: [
          'Canon imageRUNNER ADVANCE DX C3835i Multi-Function',
          'Canon imageRUNNER ADVANCE DX 4835i Monochrome',
          'Canon imageCLASS LBP226dw Network Laser',
          'Canon imagePRESS C165 Production Engine'
        ]
      },
      {
        id: 'Epson',
        name: 'Epson Seiko Corp',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Epson ESC/P-R Embedded 4.1',
        models: [
          'Epson WorkForce Enterprise WF-C21000 (100ppm Inkjet)',
          'Epson EcoTank Pro ET-5880 All-in-One Supertank',
          'Epson SureColor T5170 Wireless Large Format'
        ]
      },
      {
        id: 'Brother',
        name: 'Brother Industries',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Brother B-Net Embedded OS',
        models: [
          'Brother HL-L6400DW High-Volume Business Laser',
          'Brother MFC-L8900CDW Business Color All-in-One',
          'Brother MFC-L9570CDW Enterprise Color Laser'
        ]
      },
      {
        id: 'Xerox',
        name: 'Xerox Holdings Corp',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Xerox ConnectKey Technology 2024',
        models: [
          'Xerox VersaLink C405 Multifunction Color Laser',
          'Xerox AltaLink C8170 High-Volume Color MFP',
          'Xerox VersaLink B400 Monochrome Network Printer'
        ]
      },
      {
        id: 'Ricoh',
        name: 'Ricoh Global',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Ricoh SmartSDK Embedded 3.0',
        models: [
          'Ricoh IM C3500 Color Laser Multi-Function',
          'Ricoh SP 5300DN Monochrome High-Duty Laser',
          'Ricoh Pro C5300s Production Printing System'
        ]
      },
      {
        id: 'Zebra',
        name: 'Zebra Technologies',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Zebra Link-OS v6.8',
        models: [
          'Zebra ZT411 Industrial Thermal Label Printer',
          'Zebra ZD421 Advanced Desktop Barcode Printer',
          'Zebra ZT610 Heavy-Duty 600dpi Barcode Engine'
        ]
      },
      {
        id: 'Lexmark',
        name: 'Lexmark International',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Lexmark Embedded Solutions Framework (eSF)',
        models: [
          'Lexmark MS823dn Enterprise Monochrome Laser',
          'Lexmark CX735adse Color All-in-One MFP'
        ]
      },
      {
        id: 'Kyocera',
        name: 'Kyocera Document Solutions',
        country: 'Japan',
        flag: '🇯🇵',
        defaultOS: 'Kyocera HyPAS Embedded 2.4',
        models: [
          'Kyocera TASKalfa 4054ci High-Speed Color MFP',
          'Kyocera ECOSYS P3155dn Monochrome High-Yield Laser'
        ]
      }
    ]
  },
  router: {
    id: 'router',
    label: 'Core & Edge Router',
    badgeLabel: 'ROUTER',
    iconName: 'Network',
    description: 'Enterprise WAN, BGP, OSPF, and Edge Aggregation Routers',
    vendors: [
      {
        id: 'Cisco',
        name: 'Cisco Systems',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Cisco IOS-XE 17.9.4a',
        models: [
          'Cisco Catalyst 8300 Series Edge uCPE',
          'Cisco ASR 1001-X Aggregation Services Router',
          'Cisco ISR 4451-X Integrated Services Router',
          'Cisco NCS 5500 Network Convergence System'
        ]
      },
      {
        id: 'Juniper',
        name: 'Juniper Networks',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Juniper Junos OS 23.2R1',
        models: [
          'Juniper MX204 100GbE Universal Routing Platform',
          'Juniper MX480 3D Universal Edge Router',
          'Juniper ACX5448 Universal Metro Router'
        ]
      },
      {
        id: 'MikroTik',
        name: 'MikroTik RouterOS',
        country: 'Latvia',
        flag: '🇱🇻',
        defaultOS: 'MikroTik RouterOS v7.14',
        models: [
          'MikroTik CCR2216-1G-12XS-2XQ 100G Cloud Core Router',
          'MikroTik CCR2004-16G-2S+ Dual Power Enterprise',
          'MikroTik RB5009UG+S+IN Gigabit Edge Gateway'
        ]
      }
    ]
  },
  wireless: {
    id: 'wireless',
    label: 'Wireless AP & Controllers',
    badgeLabel: 'WIRELESS',
    iconName: 'Radio',
    description: 'Wi-Fi 6E/7 Enterprise Access Points and Wireless LAN Controllers',
    vendors: [
      {
        id: 'Cisco_Meraki',
        name: 'Cisco Meraki & Catalyst Wireless',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Meraki Cloud OS 29.5',
        models: [
          'Cisco Catalyst 9800-40 Wireless Controller',
          'Cisco Catalyst 9130AXE Wi-Fi 6 Access Point',
          'Cisco Meraki MR57 Wi-Fi 6E Cloud Managed AP',
          'Cisco Meraki MR46 High-Density Cloud AP'
        ]
      },
      {
        id: 'Aruba',
        name: 'Aruba (HPE Networking)',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'ArubaOS 10.4 Unified Architecture',
        models: [
          'Aruba AP-655 Wi-Fi 6E Campus Access Point',
          'Aruba 7220 Mobility Controller (10G)',
          'Aruba Instant On AP25 Wi-Fi 6 Certified'
        ]
      },
      {
        id: 'Ubiquiti',
        name: 'Ubiquiti UniFi',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'UniFi OS 3.2.12',
        models: [
          'Ubiquiti UniFi U7 Pro Wi-Fi 7 Tri-Band AP',
          'Ubiquiti UniFi U6 Enterprise Wi-Fi 6E',
          'Ubiquiti Cloud Gateway Ultra (UCG-Ultra)'
        ]
      }
    ]
  },
  storage: {
    id: 'storage',
    label: 'Enterprise Storage & SAN/NAS',
    badgeLabel: 'STORAGE',
    iconName: 'HardDrive',
    description: 'Fibre Channel SAN, NVMe-oF arrays, and unified NAS appliances',
    vendors: [
      {
        id: 'NetApp',
        name: 'NetApp FAS/AFF',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'NetApp ONTAP 9.13.1P4',
        models: [
          'NetApp AFF A400 All-Flash NVMe Array',
          'NetApp FAS8700 Hybrid Enterprise Storage',
          'NetApp AFF C250 High-Density QLC All-Flash'
        ]
      },
      {
        id: 'Synology',
        name: 'Synology Inc',
        country: 'Taiwan',
        flag: '🇹🇼',
        defaultOS: 'Synology DiskStation Manager (DSM) 7.2',
        models: [
          'Synology RackStation RS3621xs+ (12-Bay Xeon 10GbE)',
          'Synology FlashStation FS6400 Dual Xeon 24-Bay All-Flash',
          'Synology SA3400D Dual Controller High-Availability'
        ]
      },
      {
        id: 'Dell_EMC',
        name: 'Dell PowerStore / PowerMax',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'PowerStoreOS 3.6',
        models: [
          'Dell PowerStore 5000T All-Flash Appliance',
          'Dell PowerMax 8000 Mission-Critical Storage',
          'Dell Unity XT 480 Hybrid Flash Array'
        ]
      }
    ]
  },
  ups: {
    id: 'ups',
    label: 'UPS & Power Distribution',
    badgeLabel: 'UPS',
    iconName: 'Zap',
    description: 'Uninterruptible Power Supplies, ATS, and rack PDU management units',
    vendors: [
      {
        id: 'APC_Schneider',
        name: 'APC by Schneider Electric',
        country: 'France',
        flag: '🇫🇷',
        defaultOS: 'APC Network Management Card 3 (v2.5.0)',
        models: [
          'APC Smart-UPS On-Line SRT 10kVA RM 208V/230V',
          'APC Symmetra LX 16kVA Scalable Redundant Power',
          'APC NetShelter Metered Rack PDU AP8865 (3-Phase)'
        ]
      },
      {
        id: 'Eaton',
        name: 'Eaton Power Quality',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Eaton Network-M2 Gigabit Card Firmware 3.1',
        models: [
          'Eaton 9PX 11000i RT6U 11kVA Double-Conversion',
          'Eaton 93PM 50kVA Modular 3-Phase UPS System',
          'Eaton ePDU G3 Managed Rack Distribution Unit'
        ]
      },
      {
        id: 'Vertiv_Liebert',
        name: 'Vertiv (Liebert)',
        country: 'USA',
        flag: '🇺🇸',
        defaultOS: 'Vertiv Liebert RDU-A Embedded',
        models: [
          'Vertiv Liebert GXT5 10kVA Online Double Conversion',
          'Vertiv Liebert EXM2 100kVA Monolithic UPS',
          'Vertiv Geist Monitored Switched Rack PDU'
        ]
      }
    ]
  }
};

export const getAllCategories = () => Object.values(GLOBAL_DEVICE_CATALOG);

export const getCategoryDefinition = (category: string): DeviceCategoryDefinition => {
  const norm = (category || 'server').toLowerCase();
  return GLOBAL_DEVICE_CATALOG[norm] || GLOBAL_DEVICE_CATALOG.server;
};

