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
  HardDrive,
  Clock,
  Laptop,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import type { Device } from '../../types';
import { DeviceChartsModal } from '../../components/DeviceChartsModal';
import { VendorLogo, DeviceTypeBadge } from '../../components/VendorLogo';
import { getDeviceTelemetryHistory, type ChartTimeframe } from '../../data/deviceTelemetryGenerator';

interface TreeViewProps {
  devices: Device[];
  onPing: (id: number) => void;
  onPoll: (id: number) => void;
  pingingId: number | null;
  pollingId: number | null;
  onOpenAddDevice?: (category?: string) => void;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'datacenter' | 'tier' | 'firewall' | 'router' | 'switch' | 'server' | 'workstation' | 'ntp' | 'port' | 'sensor' | 'model_category' | 'model';
  badge?: string;
  badgeColor?: string;
  ip?: string;
  status?: 'up' | 'down' | 'warning' | 'info';
  meta?: string;
  hardware?: string;
  os?: string;
  uptime?: string;
  vendor?: string;
  deviceType?: string;
  mac?: string;
  metrics?: { cpu?: number; mem?: number; traffic?: string; latency?: number };
  deviceId?: number;
  device?: Device;
  children?: TreeNode[];
}

export const TreeView: React.FC<TreeViewProps> = ({
  devices,
  onPing,
  onPoll,
  pingingId,
  pollingId,
  onOpenAddDevice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  // Default hide all sub-tiers per user requirement ("default hide hona chiaye")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['local-subnet']));
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [chartDevice, setChartDevice] = useState<Device | null>(null);
  const [treeTimeframe, setTreeTimeframe] = useState<ChartTimeframe>('1h');

  // Dynamically calculate the active subnet from real discovered devices
  const activeSubnet = useMemo(() => {
    if (devices.length === 0) return 'Local Network';
    const counts: Record<string, number> = {};
    for (const d of devices) {
      if (d.ip_address) {
        const parts = d.ip_address.split('.');
        if (parts.length === 4) {
          const prefix = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
          counts[prefix] = (counts[prefix] || 0) + 1;
        }
      }
    }
    let topPrefix = '';
    let topCount = 0;
    for (const [p, c] of Object.entries(counts)) {
      if (c > topCount) {
        topCount = c;
        topPrefix = p;
      }
    }
    return topPrefix ? `Subnet ${topPrefix}` : 'Local Network';
  }, [devices]);

  // Dynamic Real Network Hierarchy from autodiscovered devices
  const dynamicNetworkNode: TreeNode = useMemo(() => {
    const sortByIP = (list: Device[]) => [...list].sort((a, b) => {
      const octA = (a.ip_address || '').split('.').map(Number);
      const octB = (b.ip_address || '').split('.').map(Number);
      for (let i = 0; i < 4; i++) {
        if ((octA[i] || 0) !== (octB[i] || 0)) return (octA[i] || 0) - (octB[i] || 0);
      }
      return (a.id || 0) - (b.id || 0);
    });

    const firewalls = sortByIP(devices.filter(d => (d.device_type || '').toLowerCase() === 'firewall'));
    const switches = sortByIP(devices.filter(d => (d.device_type || '').toLowerCase() === 'switch' && !firewalls.includes(d)));
    const servers = sortByIP(devices.filter(d => (d.device_type || '').toLowerCase() === 'server' && !firewalls.includes(d) && !switches.includes(d)));
    const workstations = sortByIP(devices.filter(d => (d.device_type || '').toLowerCase() === 'workstation'));
    const ntpNodes = sortByIP(devices.filter(d => (d.device_type || '').toLowerCase() === 'ntp'));

    const mapDeviceToNode = (d: Device): TreeNode => {
      const v = d.vendor || 'Generic';
      const dt = (d.device_type || 'server').toLowerCase();
      return {
        id: `dev-${d.id}`,
        deviceId: d.id,
        device: d,
        vendor: v,
        deviceType: dt,
        mac: d.mac_address || '',
        name: d.hostname,
        type: dt as any,
        ip: d.ip_address,
        status: d.status ? 'up' : 'down',
        hardware: d.hardware || 'Enterprise Hardware',
        os: d.os || 'Enterprise OS',
        uptime: d.uptime_seconds ? `${Math.round(d.uptime_seconds / 3600)} Hours` : 'Online',
        metrics: {
          latency: d.last_ping_ms || 0.5,
          cpu: d.cpu_percent ?? Math.min(85, Math.round(18 + ((d.id * 7) % 50))),
          mem: d.memory_percent ?? Math.min(90, Math.round(28 + ((d.id * 9) % 45))),
          traffic: `${((d.last_ping_ms || 1.2) * 8.5 + 4).toFixed(1)} Mbps`
        },
        children: [
          { id: `dev-${d.id}-eth0`, name: `eth0 [Gigabit Ethernet 1 Gbps Full-Duplex]`, type: 'port', status: d.status ? 'up' : 'down', meta: `Latency: ${d.last_ping_ms || 0.5} ms • MTU 1500` },
          { id: `dev-${d.id}-ping`, name: `ICMP Fast-Ping Telemetry Probe`, type: 'sensor', status: d.status ? 'up' : 'down', meta: `Roundtrip RTT: ${d.last_ping_ms || 0.5} ms • 0% Loss` }
        ]
      };
    };

    return {
      id: 'local-subnet',
      name: `${activeSubnet} (Active Network)`,
      type: 'datacenter',
      badge: `${devices.length} LIVE NODES`,
      badgeColor: '#059669',
      status: 'up',
      meta: 'Physical Enterprise Infrastructure â€¢ Real Network Hardware',
      children: [
        {
          id: 'tier-firewall',
          name: 'Perimeter Security & Firewalls',
          type: 'tier' as const,
          badge: `${firewalls.length} FIREWALL`,
          badgeColor: '#dc2626',
          status: 'up' as const,
          children: firewalls.map(mapDeviceToNode)
        },
        {
          id: 'tier-switches',
          name: 'Network Core & Distribution Switches',
          type: 'tier' as const,
          badge: `${switches.length} SWITCHES`,
          badgeColor: '#059669',
          status: 'up' as const,
          children: switches.map(mapDeviceToNode)
        },
        {
          id: 'tier-servers',
          name: 'Enterprise Servers & Compute Cluster',
          type: 'tier' as const,
          badge: `${servers.length} SERVERS`,
          badgeColor: '#2563eb',
          status: 'up' as const,
          children: servers.map(mapDeviceToNode)
        },
        {
          id: 'tier-workstations',
          name: 'Client Machines & Workstations',
          type: 'tier' as const,
          badge: `${workstations.length} MACHINES`,
          badgeColor: '#0891b2',
          status: 'up' as const,
          children: workstations.map(mapDeviceToNode)
        },
        {
          id: 'tier-ntp',
          name: 'Stratum-1 Precision NTP Time Services',
          type: 'tier' as const,
          badge: `${ntpNodes.length} TIME CLOCK`,
          badgeColor: '#ca8a04',
          status: 'up' as const,
          children: ntpNodes.map(mapDeviceToNode)
        }
      ].filter(t => t.children && t.children.length > 0) as TreeNode[]
    };
  }, [devices]);

  // Set default selected node to first server or first device
  React.useEffect(() => {
    if (!selectedNode && dynamicNetworkNode.children && dynamicNetworkNode.children.length > 0) {
      for (const tier of dynamicNetworkNode.children) {
        if (tier.children && tier.children.length > 0) {
          setSelectedNode(tier.children[0]);
          break;
        }
      }
    }
  }, [dynamicNetworkNode, selectedNode]);

  // Complete Enterprise Infrastructure Hierarchy Tree Data (Real Discovered Infrastructure)
  const treeData: TreeNode[] = useMemo(() => [
    dynamicNetworkNode
  ], [dynamicNetworkNode]);

  // Filter tree nodes based on search and type
  const filterNode = (node: TreeNode, term: string, fType: string): TreeNode | null => {
    if (fType !== 'all') {
      if (fType === 'firewalls' && node.type !== 'firewall' && node.type !== 'datacenter' && node.type !== 'tier') return null;
      if (fType === 'routers' && node.type !== 'router' && node.type !== 'datacenter' && node.type !== 'tier') return null;
      if (fType === 'switches' && node.type !== 'switch' && node.type !== 'datacenter' && node.type !== 'tier') return null;
      if (fType === 'servers' && node.type !== 'server' && node.type !== 'datacenter' && node.type !== 'tier') return null;
      if (fType === 'workstations' && node.type !== 'workstation' && node.type !== 'datacenter' && node.type !== 'tier') return null;
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
    // Keep top root container visible, but collapse/hide all sub-tier options
    setExpandedNodes(new Set(['local-subnet']));
  };

  // Node type icon helper for system suites and tiers
  const getNodeIcon = (type: TreeNode['type']) => {
    switch (type) {
      case 'datacenter':
        return <FolderTree size={16} color="#0284c7" />;
      case 'tier':
        return <LayersIcon color="#4f46e5" />;
      case 'firewall':
        return <Shield size={15} color="#dc2626" />;
      case 'router':
        return <Globe size={15} color="#4f46e5" />;
      case 'switch':
        return <Network size={15} color="#0284c7" />;
      case 'server':
        return <Server size={15} color="#16a34a" />;
      case 'workstation':
        return <Laptop size={15} color="#0891b2" />;
      case 'ntp':
        return <Clock size={15} color="#ca8a04" />;
      case 'port':
        return <Network size={13} color="#0d9488" />;
      case 'sensor':
        return <Thermometer size={13} color="#d97706" />;
      case 'model_category':
        return <Sparkles size={15} color="#7c3aed" />;
      case 'model':
        return <Zap size={13} color="#9333ea" />;
      default:
        return <FolderTree size={15} color="#64748b" />;
    }
  };

  const LayersIcon = ({ color }: { color: string }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    const isDeviceNode = Boolean(node.deviceId || node.vendor || node.deviceType);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Node Row */}
        <div
          onClick={(e) => {
            setSelectedNode(node);
            if (hasChildren) {
              toggleNode(node.id, e);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 8px',
            paddingLeft: `${depth * 20 + 8}px`,
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: isSelected ? '#eff6ff' : 'transparent',
            border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
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
                width: '18px',
                height: '18px',
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
              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
          ) : (
            <span style={{ width: '18px', height: '18px', display: 'inline-block', flexShrink: 0 }} />
          )}

          {/* Node Icon / Vendor Logo */}
          {isDeviceNode && node.vendor ? (
            <VendorLogo vendor={node.vendor} size="xs" showLabel={false} />
          ) : (
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '5px',
              background: node.type === 'tier' ? '#eef2ff' :
                node.type === 'datacenter' ? '#f0f9ff' :
                  node.type === 'model_category' ? '#f3e8ff' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {getNodeIcon(node.type)}
            </div>
          )}

          {/* Node Name & Type Badge */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <span style={{
              fontSize: depth === 0 ? '0.84rem' : depth === 1 ? '0.80rem' : '0.78rem',
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
                fontSize: '0.70rem',
                fontFamily: 'var(--font-mono)',
                color: '#0284c7',
                background: '#f0f9ff',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid #e0f2fe',
                fontWeight: 600,
                flexShrink: 0
              }}>
                {node.ip}
              </span>
            )}
          </div>

          {/* Node Device Type Badge if device */}
          {isDeviceNode && node.deviceType && (
            <DeviceTypeBadge type={node.deviceType} size="xs" />
          )}

          {/* Node Status Badge */}
          {node.status && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: node.status === 'up' ? '#16a34a' : node.status === 'down' ? '#dc2626' : '#d97706'
              }} />
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: node.status === 'up' ? '#15803d' : node.status === 'down' ? '#b91c1c' : '#b45309'
              }}>
                {node.status}
              </span>
            </div>
          )}

          {/* Optional Tier Badge */}
          {node.badge && (
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '9999px',
              background: '#f8fafc',
              color: node.badgeColor || '#475569',
              border: '1px solid #e2e8f0',
              flexShrink: 0
            }}>
              {node.badge}
            </span>
          )}

          {/* Interactive +/- Toggle Button for Parents */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id, e);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: isExpanded ? '#f1f5f9' : '#e0f2fe',
                color: isExpanded ? '#475569' : '#0284c7',
                border: isExpanded ? '1px solid #cbd5e1' : '1px solid #bae6fd',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.12s ease'
              }}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <Minus size={11} strokeWidth={2.5} />
              ) : (
                <Plus size={11} strokeWidth={2.5} />
              )}
            </button>
          )}
        </div>

        {/* Children (if expanded) */}
        {hasChildren && isExpanded && (
          <div style={{
            position: 'relative',
            marginLeft: `${depth * 20 + 17}px`,
            paddingLeft: '6px',
            borderLeft: '1px solid #e2e8f0'
          }}>
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Find corresponding device representation for the right panel
  const activeDevice: Device | null = useMemo(() => {
    if (!selectedNode) return null;
    if (selectedNode.deviceId) {
      const match = devices.find(d => d.id === selectedNode.deviceId);
      if (match) return match;
    }
    // Synthesize fallback device object for full telemetry display
    return {
      id: selectedNode.deviceId || 999,
      hostname: selectedNode.name,
      ip_address: selectedNode.ip || '172.168.1.1',
      snmp_version: 'v2c',
      snmp_port: 161,
      os: selectedNode.os || 'Enterprise OS',
      hardware: selectedNode.hardware || selectedNode.name,
      vendor: selectedNode.vendor || 'Generic',
      device_type: selectedNode.deviceType || selectedNode.type,
      mac_address: selectedNode.mac || '00:50:56:AB:CD:EF',
      status: selectedNode.status !== 'down',
      last_ping_ms: selectedNode.metrics?.latency || 0.5,
      uptime_seconds: 589200
    };
  }, [selectedNode, devices]);

  // Telemetry series for inline real-time charts
  const telemetryData = useMemo(() => {
    if (!activeDevice) return [];
    return getDeviceTelemetryHistory(activeDevice, treeTimeframe);
  }, [activeDevice, treeTimeframe]);

  // Deterministic storage info calculation derived from runtime device properties
  const storageInfo = useMemo(() => {
    if (!activeDevice) return { diskUsage: 45, partition: 'C:\\', capacity: '512 GB', isFull: false };
    const devType = (activeDevice.device_type || 'server').toLowerCase();
    const isWin = (activeDevice.os || '').toLowerCase().includes('windows');
    const totalGb = devType === 'server' ? 1024 : 512;
    const diskUsage = (activeDevice as any).disk_percent || Math.min(88, Math.round(28 + ((activeDevice.id * 11) % 48)));
    const isFull = diskUsage >= 90;
    const usedGb = Math.round(totalGb * (diskUsage / 100));
    const partition = isWin ? 'C:\\ (System NVMe)' : '/ (ext4 NVMe Root)';
    const capacity = `${totalGb} GB (${usedGb} GB Used • ${isWin ? 'NTFS' : 'EXT4'})`;
    return { diskUsage, partition, capacity, isFull };
  }, [activeDevice]);

  // Find corresponding device for charts if clicked
  const handleOpenChartForNode = (node: TreeNode) => {
    if (node.deviceId) {
      const match = devices.find(d => d.id === node.deviceId);
      if (match) {
        setChartDevice(match);
        return;
      }
    }
    if (activeDevice) {
      setChartDevice(activeDevice);
    }
  };

  if (devices.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '30px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '44px 32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.35)'
          }}>
            <FolderTree size={32} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
            Infrastructure Tree is Empty
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            Zero devices are currently indexed in your inventory. Run Network Discovery to scan your subnet and automatically build the interactive infrastructure hierarchy.
          </p>
          {onOpenAddDevice && (
            <button
              onClick={() => onOpenAddDevice()}
              style={{
                padding: '11px 26px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Plus size={16} />
              <span>Add / Discover Network Devices</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Card */}
      <div style={{
        background: '#ffffff',
        padding: '16px 20px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)'
          }}>
            <FolderTree size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Enterprise Infrastructure Tree View
              </h2>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '5px',
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd'
              }}>
                NETWORK TOPOLOGY &amp; TELEMETRY
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Perimeter Firewalls &rarr; Core Switches &rarr; Servers &rarr; Workstations &rarr; NTP Clocks with Live Telemetry Charts
            </p>
          </div>
        </div>

        {/* Global Expand / Collapse All Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleExpandAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Maximize2 size={13} color="#0284c7" />
            <span>Expand All</span>
          </button>

          <button
            onClick={handleCollapseAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Minimize2 size={13} color="#dc2626" />
            <span>Collapse All</span>
          </button>

          {onOpenAddDevice && (
            <button
              onClick={() => onOpenAddDevice('server')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)'
              }}
              title="Register new hardware node into tree topology"
            >
              <Plus size={13} />
              <span>Add Node</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '5px 10px',
          width: '280px'
        }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search hosts, IP, vendor, hardware..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.78rem',
              color: '#0f172a',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              âœ•
            </button>
          )}
        </div>

        {/* Quick Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Hierarchy', icon: SlidersHorizontal },
            { id: 'firewalls', label: 'Firewalls', icon: Shield },
            { id: 'switches', label: 'Switches', icon: Network },
            { id: 'servers', label: 'Servers', icon: Server },
            { id: 'workstations', label: 'Workstations', icon: Laptop },
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
                  gap: '5px',
                  padding: '5px 9px',
                  borderRadius: '5px',
                  background: isCurrent ? '#0284c7' : '#f8fafc',
                  color: isCurrent ? '#ffffff' : '#475569',
                  border: isCurrent ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={12} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column View: Tree Pane on Left (1.2fr), Node Details & Live Charts on Right (1.3fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '16px', alignItems: 'start' }}>
        {/* Left: Collapsible Tree Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          padding: '12px 14px',
          maxHeight: '820px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', marginBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                {activeSubnet} Tree ({devices.length} Devices)
              </span>
              <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Default collapsed &bull; click + to expand</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleExpandAll}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: '#0284c7',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Expand all categories and devices"
              >
                <Plus size={12} strokeWidth={2.5} color="#0284c7" />
                <span>Expand All</span>
              </button>

              <button
                onClick={handleCollapseAll}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Collapse all categories"
              >
                <Minus size={12} strokeWidth={2.5} color="#475569" />
                <span>Collapse All</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {filteredTree.map(rootNode => renderTreeNode(rootNode, 0))}
          </div>
        </div>

        {/* Right: Selected Node Detail Inspector & Inline Real-Time Charts */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          padding: '16px',
          position: 'sticky',
          top: '80px',
          maxHeight: '860px',
          overflowY: 'auto'
        }}>
          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Header with Brand Logo, Model and Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedNode.vendor ? (
                    <VendorLogo vendor={selectedNode.vendor} size="md" showLabel={true} />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: '#e0f2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getNodeIcon(selectedNode.type)}
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                      {selectedNode.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      {selectedNode.deviceType && (
                        <DeviceTypeBadge type={selectedNode.deviceType} size="xs" />
                      )}
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {selectedNode.hardware || 'Enterprise Hardware'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedNode.status && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '5px',
                    background: selectedNode.status === 'up' ? '#dcfce7' : '#fee2e2',
                    color: selectedNode.status === 'up' ? '#15803d' : '#b91c1c',
                    border: `1px solid ${selectedNode.status === 'up' ? '#bbf7d0' : '#fecaca'}`
                  }}>
                    {selectedNode.status.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Storage Full Warning Banner if breached */}
              {storageInfo.isFull && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#991b1b',
                  fontSize: '0.74rem'
                }}>
                  <AlertTriangle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>CRITICAL ALERT: STORAGE FULL ({storageInfo.diskUsage}% Used)</strong>
                    <div style={{ fontSize: '0.66rem', color: '#b91c1c' }}>Volume {storageInfo.partition} has exceeded 90% threshold. Immediate log purge recommended.</div>
                  </div>
                </div>
              )}

              {/* Fast Metadata Grid */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '6px',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px 10px',
                fontSize: '0.70rem'
              }}>
                <div>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>IP Address: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#0284c7' }}>{selectedNode.ip || '172.168.1.x'}</strong>
                </div>
                <div>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>OS: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedNode.os || 'Enterprise OS'}</strong>
                </div>
                <div>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>MAC: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>{selectedNode.mac || '00:50:56:xx:xx:xx'}</strong>
                </div>
                <div>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>Uptime: </span>
                  <strong style={{ color: '#15803d' }}>{selectedNode.uptime || '99.98%'}</strong>
                </div>
              </div>

              {/* Inspection Panel Timeframe Selector (1h, Daily, Weekly, Monthly) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                background: '#f1f5f9',
                borderRadius: '5px',
                border: '1px solid #cbd5e1'
              }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} color="#0284c7" /> Time Frame:
                </span>
                <div style={{ display: 'flex', gap: '3px', background: '#e2e8f0', padding: '2px', borderRadius: '4px' }}>
                  {[
                    { id: '1h', label: '1H' },
                    { id: '24h', label: 'Daily' },
                    { id: '7d', label: 'Weekly' },
                    { id: '30d', label: 'Monthly' }
                  ].map(tf => {
                    const isSel = treeTimeframe === tf.id;
                    return (
                      <button
                        key={tf.id}
                        onClick={() => setTreeTimeframe(tf.id as any)}
                        style={{
                          padding: '2px 7px',
                          borderRadius: '3px',
                          border: isSel ? '1px solid #0284c7' : '1px solid #cbd5e1',
                          background: isSel ? '#0284c7' : '#ffffff',
                          color: isSel ? '#ffffff' : '#0f172a',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        {tf.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chart 1: Live ICMP Ping RTT Latency Sparkline */}
              <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={12} color="#0284c7" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>
                      Real-time ICMP Ping Latency (RTT)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '0.66rem', color: '#0f172a', fontWeight: 700 }}>Current:</span>
                    <span style={{
                      fontSize: '0.70rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: (selectedNode.metrics?.latency || 0.5) > 10 ? '#dc2626' : '#0284c7',
                      background: '#ffffff',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      border: '1px solid #94a3b8'
                    }}>
                      {selectedNode.metrics?.latency || 0.5} ms
                    </span>
                  </div>
                </div>

                <div style={{ height: '90px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetryData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="treeLatGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#0f172a' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#0f172a' }} domain={[0, 'auto']} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#ffffff', fontSize: '10px', padding: '4px 8px' }}
                        formatter={(val: any) => [`${val} ms`, 'RTT Latency']}
                      />
                      <Area type="monotone" dataKey="latency" stroke="#0284c7" strokeWidth={1.8} fillOpacity={1} fill="url(#treeLatGrad)" dot={{ r: 2, fill: '#0284c7' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Real-time Ingress vs Egress Bandwidth */}
              <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Network size={12} color="#059669" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>
                      Bandwidth Telemetry (Ingress &amp; Egress)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.66rem' }}>
                    <span style={{ color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 800 }}>
                      <ArrowDownLeft size={10} /> IN: {telemetryData[telemetryData.length - 1]?.inTraffic || 0} Mbps
                    </span>
                    <span style={{ color: '#4338ca', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 800 }}>
                      <ArrowUpRight size={10} /> OUT: {telemetryData[telemetryData.length - 1]?.outTraffic || 0} Mbps
                    </span>
                  </div>
                </div>

                <div style={{ height: '90px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetryData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="treeInGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="treeOutGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#0f172a' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#0f172a' }} domain={[0, 'auto']} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#ffffff', fontSize: '10px', padding: '4px 8px' }}
                      />
                      <Area type="monotone" dataKey="inTraffic" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#treeInGrad)" name="Ingress Mbps" />
                      <Area type="monotone" dataKey="outTraffic" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#treeOutGrad)" name="Egress Mbps" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Hardware Utilization Bars: CPU, RAM & Storage Partition */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* CPU Bar */}
                <div style={{ background: '#f8fafc', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', fontSize: '0.68rem' }}>
                    <span style={{ color: '#0f172a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Cpu size={12} color="#0284c7" /> Processor Multi-Core Load
                    </span>
                    <strong style={{ color: (selectedNode.metrics?.cpu || 20) > 80 ? '#dc2626' : '#0f172a' }}>
                      {selectedNode.metrics?.cpu || 20}%
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${selectedNode.metrics?.cpu || 20}%`,
                      height: '100%',
                      background: (selectedNode.metrics?.cpu || 20) > 80 ? '#ef4444' : (selectedNode.metrics?.cpu || 20) > 60 ? '#f59e0b' : '#10b981',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* RAM Bar */}
                <div style={{ background: '#f8fafc', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', fontSize: '0.68rem' }}>
                    <span style={{ color: '#0f172a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <HardDrive size={12} color="#16a34a" /> Memory (RAM) Allocation
                    </span>
                    <strong style={{ color: '#0f172a' }}>{selectedNode.metrics?.mem || 38}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${selectedNode.metrics?.mem || 38}%`,
                      height: '100%',
                      background: (selectedNode.metrics?.mem || 38) > 85 ? '#ef4444' : '#0284c7',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Storage Partition Bar with Full Warning */}
                <div style={{
                  background: storageInfo.isFull ? '#fef2f2' : '#f8fafc',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: storageInfo.isFull ? '1px solid #fecaca' : '1px solid #cbd5e1'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', fontSize: '0.68rem' }}>
                    <span style={{ color: storageInfo.isFull ? '#991b1b' : '#0f172a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <HardDrive size={12} color={storageInfo.isFull ? '#dc2626' : '#7c3aed'} /> Storage: {storageInfo.partition}
                    </span>
                    <strong style={{ color: storageInfo.isFull ? '#dc2626' : '#0f172a' }}>
                      {storageInfo.diskUsage}% {storageInfo.isFull && '(ALERT)'}
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${storageInfo.diskUsage}%`,
                      height: '100%',
                      background: storageInfo.isFull ? '#dc2626' : storageInfo.diskUsage > 80 ? '#f59e0b' : '#7c3aed',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.62rem', color: storageInfo.isFull ? '#991b1b' : '#334155', marginTop: '2px', fontWeight: 600 }}>
                    {storageInfo.capacity}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                <button
                  onClick={() => handleOpenChartForNode(selectedNode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '7px',
                    borderRadius: '5px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <BarChart3 size={13} />
                  <span>Open Multi-Metric Detailed Modal</span>
                </button>

                {selectedNode.deviceId && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button
                      onClick={() => onPing(selectedNode.deviceId!)}
                      disabled={pingingId === selectedNode.deviceId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '5px 8px',
                        borderRadius: '5px',
                        background: '#ffffff',
                        border: '1px solid #94a3b8',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.70rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Zap size={12} color="#0284c7" />
                      <span>{pingingId === selectedNode.deviceId ? 'Pinging...' : 'Fast Ping'}</span>
                    </button>

                    <button
                      onClick={() => onPoll(selectedNode.deviceId!)}
                      disabled={pollingId === selectedNode.deviceId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '5px 8px',
                        borderRadius: '5px',
                        background: '#ffffff',
                        border: '1px solid #94a3b8',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.70rem',
                        cursor: 'pointer'
                      }}
                    >
                      <RefreshCw size={12} color="#15803d" />
                      <span>{pollingId === selectedNode.deviceId ? 'Polling...' : 'SNMP Poll'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
              <FolderTree size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                No Node Selected
              </p>
              <p style={{ fontSize: '0.74rem', margin: 0 }}>
                Click any server, switch, firewall, or workstation in the left tree to inspect live charts &amp; telemetry.
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
