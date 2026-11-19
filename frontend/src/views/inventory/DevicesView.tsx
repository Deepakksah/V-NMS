import React, { useState, useMemo } from 'react';
import {
  Server,
  Search,
  Plus,
  MapPin,
  Cpu,
  AlertOctagon,
  Layers,
  BarChart2,
  Network,
  Shield,
  Clock,
  Printer,
  Zap,
  Trash2
} from 'lucide-react';
import type { Device } from '../../types';
import {
  MOCK_DEVICE_GROUPS,
  MOCK_DEVICE_OUTAGES,
  MOCK_LOCATIONS,
  MOCK_ENT_PHYSICAL
} from '../../data/mockEnterpriseData';
import { DeviceChartsModal } from '../../components/DeviceChartsModal';
import { VendorLogo, DeviceTypeBadge } from '../../components/VendorLogo';
import { OsBadge, OsIcon, detectOsInfo } from '../../components/OsBadge';
import { ExportButtons } from '../../components/ExportButtons';
import { PageHeader } from '../../components/PageHeader';

export type CategoryFilterType = 'all' | 'server' | 'switch' | 'firewall' | 'workstation' | 'printer' | 'ntp';

interface DevicesViewProps {
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (d: Device) => void;
  onPing: (id: number) => void;
  onPoll: (id: number) => void;
  pingingId: number | null;
  pollingId: number | null;
  onOpenAddDevice: (defaultCategory?: string) => void;
  onOpenDiscovery?: () => void;
  onClearAllDevices?: () => void;
  categoryFilter?: CategoryFilterType;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  devices,
  selectedDevice,
  setSelectedDevice,
  onPing,
  onPoll,
  pingingId,
  pollingId,
  onOpenAddDevice,
  onOpenDiscovery,
  onClearAllDevices,
  categoryFilter = 'all'
}) => {
  const [subTab, setSubTab] = useState<'inventory' | 'groups' | 'outages' | 'locations' | 'ent_physical'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SERVER' | 'WORKSTATION' | 'SWITCH' | 'FIREWALL' | 'PRINTER' | 'NTP'>(() => {
    if (categoryFilter === 'server') return 'SERVER';
    if (categoryFilter === 'switch') return 'SWITCH';
    if (categoryFilter === 'firewall') return 'FIREWALL';
    if (categoryFilter === 'workstation') return 'WORKSTATION';
    if (categoryFilter === 'printer') return 'PRINTER';
    if (categoryFilter === 'ntp') return 'NTP';
    return 'ALL';
  });
  const [chartDevice, setChartDevice] = useState<Device | null>(null);
  const [osFilter, setOsFilter] = useState<'ALL' | 'WINDOWS' | 'LINUX' | 'MACOS' | 'DOCKER'>('ALL');

  // Sync type filter when categoryFilter prop changes
  React.useEffect(() => {
    if (categoryFilter === 'server') setTypeFilter('SERVER');
    else if (categoryFilter === 'switch') setTypeFilter('SWITCH');
    else if (categoryFilter === 'firewall') setTypeFilter('FIREWALL');
    else if (categoryFilter === 'workstation') setTypeFilter('WORKSTATION');
    else if (categoryFilter === 'printer') setTypeFilter('PRINTER');
    else if (categoryFilter === 'ntp') setTypeFilter('NTP');
    else if (categoryFilter === 'all') setTypeFilter('ALL');
  }, [categoryFilter]);

  const getDeviceType = (d: Device): 'SERVER' | 'WORKSTATION' | 'SWITCH' | 'FIREWALL' | 'PRINTER' | 'NTP' => {
    const rawType = (d.device_type || '').toLowerCase();
    const h = (d.hostname || '').toLowerCase();
    const hard = (d.hardware || '').toLowerCase();
    const desc = (d.sys_descr || '').toLowerCase();

    if (rawType === 'printer' || h.startsWith('printer-') || h.startsWith('prn-') || hard.includes('printer') || desc.includes('printer') || desc.includes('laserjet')) return 'PRINTER';
    if (rawType === 'switch') return 'SWITCH';
    if (rawType === 'firewall' || rawType === 'router') return 'FIREWALL';
    if (rawType === 'ntp') return 'NTP';
    if (rawType === 'server') return 'SERVER';
    if (rawType === 'workstation') {
      // Ensure Windows Servers (WIN-* and win-node-*) are classified as SERVER
      if ((h.startsWith('win-') || h.startsWith('win-node-')) && !h.startsWith('win-client-')) {
        return 'SERVER';
      }
      return 'WORKSTATION';
    }

    if (h.startsWith('desktop-') || h.startsWith('laptop-') || h.startsWith('pc-') || h.startsWith('belpc') || h.startsWith('win-client-') || h.startsWith('cam-') || h.startsWith('host-') || h === 'admin') return 'WORKSTATION';
    if (h.includes('sw') || h.includes('catalyst') || h.includes('unifi')) return 'SWITCH';
    if (h.includes('gw') || h.includes('core-gw') || h.includes('firewall') || (d.ip_address && d.ip_address.endsWith('.1'))) return 'FIREWALL';
    if (h.includes('ntp') || h.includes('time') || (d.ip_address && d.ip_address.endsWith('.10'))) return 'NTP';
    if (h.startsWith('win-') || h.startsWith('win-node-') || h.startsWith('srv') || h.includes('server') || h.includes('sql') || h.includes('vps') || h.includes('solus') || h.includes('dc-')) return 'SERVER';
    return 'WORKSTATION';
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch = d.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.ip_address.includes(searchTerm) ||
        (d.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.hardware || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.os || '').toLowerCase().includes(searchTerm.toLowerCase());

      const devType = getDeviceType(d);

      // Apply category filter if active
      if (categoryFilter === 'server' && devType !== 'SERVER') return false;
      if (categoryFilter === 'switch' && devType !== 'SWITCH') return false;
      if (categoryFilter === 'firewall' && devType !== 'FIREWALL') return false;
      if (categoryFilter === 'workstation' && devType !== 'WORKSTATION') return false;
      if (categoryFilter === 'printer' && devType !== 'PRINTER') return false;
      if (categoryFilter === 'ntp' && devType !== 'NTP') return false;

      const matchType = typeFilter === 'ALL' || devType === typeFilter;
      if (!matchType) return false;

      // Apply OS platform filter if active
      if (osFilter !== 'ALL') {
        const osInfo = detectOsInfo(d.os, d.hostname, d.device_type);
        if (osFilter === 'WINDOWS' && osInfo.type !== 'windows') return false;
        if (osFilter === 'LINUX' && (osInfo.type !== 'linux' && osInfo.type !== 'ubuntu' && osInfo.type !== 'redhat')) return false;
        if (osFilter === 'MACOS' && osInfo.type !== 'macos') return false;
        if (osFilter === 'DOCKER' && osInfo.type !== 'docker') return false;
      }

      return matchSearch;
    }).sort((a, b) => {
      // Natural IPv4 numerical octet sorting
      const octA = (a.ip_address || '').split('.').map(Number);
      const octB = (b.ip_address || '').split('.').map(Number);
      for (let i = 0; i < 4; i++) {
        if ((octA[i] || 0) !== (octB[i] || 0)) {
          return (octA[i] || 0) - (octB[i] || 0);
        }
      }
      return (a.id || 0) - (b.id || 0);
    });
  }, [devices, searchTerm, typeFilter, categoryFilter]);

  const headerInfo = useMemo(() => {
    switch (categoryFilter) {
      case 'server':
        return {
          title: 'Enterprise Servers & Compute Infrastructure',
          subtitle: 'Enterprise Dell PowerEdge R750/R650, Windows Server 2022 Datacenter, Supermicro & Ubuntu Linux enterprise nodes',
          addLabel: 'Add Server',
          typeDefault: 'server'
        };
      case 'switch':
        return {
          title: 'Network Core & Access Switches',
          subtitle: 'Cisco Catalyst 9300-48P PoE+, Ubiquiti UniFi Switch Pro 24 PoE, and Gigabit Layer-2/3 distribution switches',
          addLabel: 'Add Switch',
          typeDefault: 'switch'
        };
      case 'firewall':
        return {
          title: 'Firewalls & Security Gateways',
          subtitle: 'Check Point Quantum 1800 Next-Gen Firewall (GAiA R81.20) & Perimeter WAN Security Gateways',
          addLabel: 'Add Firewall',
          typeDefault: 'firewall'
        };
      case 'workstation':
        return {
          title: 'Client Workstations & Office Machines',
          subtitle: 'Client endpoints, desktop computers, and workstations active in your monitored enterprise network',
          addLabel: 'Add Workstation',
          typeDefault: 'workstation'
        };
      case 'printer':
        return {
          title: 'Network Printers & Imaging Infrastructure',
          subtitle: 'Enterprise HP LaserJet, Canon imageRUNNER, Brother, Epson, Xerox, and Ricoh high-volume network printers',
          addLabel: 'Add Printer',
          typeDefault: 'printer'
        };
      case 'ntp':
        return {
          title: 'Stratum-1 & Precision NTP Time Services',
          subtitle: 'Microchip SyncServer S650 GPS/NTP Reference Clock providing sub-millisecond network synchronization',
          addLabel: 'Add NTP Server',
          typeDefault: 'ntp'
        };
      default:
        return {
          title: 'Complete Enterprise Network Inventory',
          subtitle: 'Real-time telemetry, ICMP ping latency, multi-vendor hardware, and SNMP metrics across all network nodes',
          addLabel: 'Add Device',
          typeDefault: 'server'
        };
    }
  }, [categoryFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Enterprise Dark NOC Header */}
      <PageHeader
        icon={Server}
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        badge={`${filteredDevices.length} Monitored`}
        badgeColor="blue"
        actions={
          <>
            <ExportButtons data={filteredDevices} filenamePrefix="vnms_devices" title="Device Inventory" />

            {devices.length > 0 && onClearAllDevices && (
              <button
                onClick={onClearAllDevices}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  cursor: 'pointer'
                }}
                title="Clear all old devices and reset inventory to 0"
              >
                <Trash2 size={14} />
                <span>Reset Inventory</span>
              </button>
            )}

            {onOpenDiscovery && (
              <button
                onClick={onOpenDiscovery}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer'
                }}
                title="Automatically scan network subnet for active devices"
              >
                <Zap size={14} />
                <span>Auto Scan Subnet</span>
              </button>
            )}

            <button onClick={() => onOpenAddDevice(headerInfo.typeDefault)} className="glow-btn">
              <Plus size={15} />
              <span>{headerInfo.addLabel} (Manual)</span>
            </button>
          </>
        }
      />

      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'inventory', label: 'Primary Inventory', icon: Server, count: filteredDevices.length },
          { id: 'groups', label: 'Device Groups', icon: Layers, count: MOCK_DEVICE_GROUPS.length },
          { id: 'outages', label: 'Outage History & MTTR', icon: AlertOctagon, count: MOCK_DEVICE_OUTAGES.length },
          { id: 'locations', label: 'Locations & Racks', icon: MapPin, count: MOCK_LOCATIONS.length },
          { id: 'ent_physical', label: 'RFC 6933 Hardware MIB', icon: Cpu, count: MOCK_ENT_PHYSICAL.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#0369a1' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '9999px',
                background: isActive ? '#bfdbfe' : '#f1f5f9',
                color: isActive ? '#1e40af' : '#64748b'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* View Content based on active subTab */}
      {subTab === 'inventory' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          {/* Search & Device Type Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                width: '300px'
              }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search hostname, IP, or OS..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: '0.85rem', width: '100%' }}
                />
              </div>

              {/* Type Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'All Hosts', icon: Server },
                  { id: 'SERVER', label: 'Servers', icon: Cpu },
                  { id: 'SWITCH', label: 'Switches', icon: Network },
                  { id: 'FIREWALL', label: 'Firewalls', icon: Shield },
                  { id: 'WORKSTATION', label: 'Workstations', icon: Layers },
                  { id: 'PRINTER', label: 'Printers', icon: Printer },
                  { id: 'NTP', label: 'NTP Time', icon: Clock }
                ].map(chip => {
                  const ChipIcon = chip.icon;
                  const isChipActive = typeFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setTypeFilter(chip.id as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 11px',
                        borderRadius: '6px',
                        border: isChipActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                        background: isChipActive ? '#eff6ff' : '#ffffff',
                        color: isChipActive ? '#0369a1' : '#64748b',
                        fontSize: '0.76rem',
                        fontWeight: isChipActive ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      <ChipIcon size={13} color={isChipActive ? '#0284c7' : '#64748b'} />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* OS / Platform Filter Pills */}
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', marginLeft: '6px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', marginRight: '2px' }}>OS:</span>
                {[
                  { id: 'ALL', label: 'All OS' },
                  { id: 'WINDOWS', label: 'Windows', iconType: 'windows' as const },
                  { id: 'LINUX', label: 'Linux', iconType: 'linux' as const },
                  { id: 'MACOS', label: 'macOS', iconType: 'macos' as const },
                  { id: 'DOCKER', label: 'Docker', iconType: 'docker' as const }
                ].map(osChip => {
                  const isOsActive = osFilter === osChip.id;
                  return (
                    <button
                      key={osChip.id}
                      onClick={() => setOsFilter(osChip.id as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: isOsActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                        background: isOsActive ? '#f0f9ff' : '#ffffff',
                        color: isOsActive ? '#0284c7' : '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: isOsActive ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {osChip.iconType && <OsIcon type={osChip.iconType} size={12} />}
                      <span>{osChip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Showing {filteredDevices.length} nodes • Click any row or <strong>Charts</strong> for live telemetry
              </span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>STATUS</th>
                <th style={{ padding: '6px 8px' }}>TYPE</th>
                <th style={{ padding: '6px 8px' }}>BRAND / VENDOR</th>
                <th style={{ padding: '6px 10px' }}>HOSTNAME</th>
                <th style={{ padding: '6px 10px' }}>IP / MAC ADDRESS</th>
                <th style={{ padding: '6px 10px' }}>HARDWARE &amp; OS</th>
                <th style={{ padding: '6px 8px' }}>SNMP</th>
                <th style={{ padding: '6px 8px' }}>LATENCY</th>
                <th style={{ padding: '6px 10px', textAlign: 'right' }}>CHARTS &amp; ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map(dev => {
                const devType = getDeviceType(dev);
                return (
                  <tr
                    key={dev.id}
                    onClick={() => { setSelectedDevice(dev); setChartDevice(dev); }}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      backgroundColor: selectedDevice?.id === dev.id ? '#eff6ff' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      if (selectedDevice?.id !== dev.id) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={e => {
                      if (selectedDevice?.id !== dev.id) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '4px 10px' }}>
                      <span className={`status-badge ${dev.status ? 'status-up' : 'status-down'}`} style={{ padding: '1.5px 6px', fontSize: '0.67rem' }}>
                        <span className={`pulse-dot ${dev.status ? 'up' : 'down'}`} style={{ width: '5px', height: '5px' }}></span>
                        {dev.status ? 'UP' : 'DOWN'}
                      </span>
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <DeviceTypeBadge type={dev.device_type || devType} size="xs" />
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <VendorLogo vendor={dev.vendor || 'Generic'} size="xs" />
                    </td>
                    <td style={{ padding: '4px 10px', fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <OsBadge os={dev.os} hostname={dev.hostname} deviceType={dev.device_type || devType} size="xs" variant="icon-only" />
                        <span>{dev.hostname}</span>
                      </div>
                    </td>
                    <td style={{ padding: '4px 10px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>
                        {dev.ip_address}
                      </div>
                      {dev.mac_address && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#94a3b8' }}>
                          {dev.mac_address}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '4px 10px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: 600 }}>{dev.hardware || 'Enterprise Hardware'}</div>
                      <div style={{ marginTop: '2px' }}>
                        <OsBadge os={dev.os} hostname={dev.hostname} deviceType={dev.device_type || devType} size="xs" />
                      </div>
                    </td>
                    <td style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#64748b' }}>{dev.snmp_version.toUpperCase()}</td>
                    <td style={{ padding: '4px 8px', fontWeight: 600, color: dev.last_ping_ms < 10 ? '#16a34a' : '#d97706', fontSize: '0.74rem' }}>
                      {dev.last_ping_ms.toFixed(1)} ms
                    </td>
                    <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {/* Dedicated Interactive Chart Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDevice(dev);
                            setChartDevice(dev);
                          }}
                          style={{
                            padding: '2px 7px',
                            height: '24px',
                            borderRadius: '4px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#15803d',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="Open Real-time Telemetry & Bandwidth Charts"
                        >
                          <BarChart2 size={12} color="#16a34a" />
                          <span>Charts</span>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onPing(dev.id); }}
                          disabled={pingingId === dev.id}
                          style={{
                            padding: '2px 7px',
                            height: '24px',
                            borderRadius: '4px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#0f172a',
                            fontSize: '0.68rem',
                            cursor: 'pointer'
                          }}
                        >
                          Ping
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onPoll(dev.id); }}
                          disabled={pollingId === dev.id}
                          style={{
                            padding: '2px 7px',
                            height: '24px',
                            borderRadius: '4px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Poll
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '2rem' }}>🔍</span>
                      <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>No devices found in inventory</strong>
                      <span style={{ fontSize: '0.80rem', color: '#64748b', maxWidth: '420px', lineHeight: 1.5 }}>
                        The inventory has been reset or no devices match your filter. You can initiate an automated subnet discovery to scan and map all live devices.
                      </span>
                      {onOpenDiscovery && (
                        <button
                          onClick={onOpenDiscovery}
                          style={{
                            marginTop: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.80rem',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                          }}
                        >
                          <Zap size={15} />
                          <span>Auto Scan Subnet Now</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SubTab: Device Groups */}
      {subTab === 'groups' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {MOCK_DEVICE_GROUPS.map(grp => (
            <div key={grp.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: grp.type === 'dynamic' ? '#e0f2fe' : '#f3e8ff', color: grp.type === 'dynamic' ? '#0369a1' : '#7e22ce' }}>
                  {grp.type.toUpperCase()} GROUP
                </span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                  {grp.health}% Health
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{grp.name}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                Rule: {grp.pattern}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748b' }}>Assigned Devices:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{grp.deviceCount} Hosts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SubTab: Outages */}
      {subTab === 'outages' && (
        <div className="glass-panel" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
            Device Outage History &amp; Downtime MTTR
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>STATUS</th>
                <th style={{ padding: '6px 10px' }}>DEVICE</th>
                <th style={{ padding: '6px 10px' }}>OUTAGE START</th>
                <th style={{ padding: '6px 10px' }}>DURATION</th>
                <th style={{ padding: '6px 10px' }}>ROOT CAUSE / INCIDENT</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DEVICE_OUTAGES.map(outage => (
                <tr key={outage.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: outage.status === 'RESOLVED' ? '#dcfce7' : '#fee2e2',
                      color: outage.status === 'RESOLVED' ? '#15803d' : '#b91c1c'
                    }}>
                      {outage.status}
                    </span>
                  </td>
                  <td style={{ padding: '4px 10px', fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>{outage.deviceHostname}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#334155' }}>{outage.startTime}</td>
                  <td style={{ padding: '4px 10px', fontWeight: 700, color: '#b45309', fontSize: '0.74rem' }}>
                    {outage.durationMin.toFixed(1)} min
                  </td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#64748b' }}>{outage.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SubTab: Locations */}
      {subTab === 'locations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {MOCK_LOCATIONS.map(loc => (
            <div key={loc.id} className="glass-panel" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MapPin size={16} color="#0284c7" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{loc.siteName}</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '4px' }}>{loc.building} • {loc.room}</p>
              <p style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '10px' }}>Rack: {loc.rack}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.74rem' }}>
                <span style={{ color: '#64748b' }}>GPS: {loc.lat}, {loc.lng}</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>{loc.deviceCount} Devices Mounted</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SubTab: EntPhysical */}
      {subTab === 'ent_physical' && (
        <div className="glass-panel" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
            RFC 6933 Entity MIB Hardware Inventory
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>CLASS</th>
                <th style={{ padding: '6px 10px' }}>HOST DEVICE</th>
                <th style={{ padding: '6px 10px' }}>ENTITY NAME</th>
                <th style={{ padding: '6px 10px' }}>MODEL / DESCR</th>
                <th style={{ padding: '6px 10px' }}>SERIAL NUMBER</th>
                <th style={{ padding: '6px 10px' }}>FIRMWARE</th>
                <th style={{ padding: '6px 10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ENT_PHYSICAL.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '4px 10px' }}>
                    <span style={{ padding: '1.5px 6px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.68rem', fontWeight: 700 }}>
                      {item.clazz.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '4px 10px', fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>{item.deviceHostname}</td>
                  <td style={{ padding: '4px 10px', color: '#334155', fontSize: '0.74rem' }}>{item.name}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#64748b' }}>{item.modelNumber}</td>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>{item.serialNumber}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#334155' }}>{item.firmwareRev}</td>
                  <td style={{ padding: '4px 10px' }}>
                    <span style={{ color: item.status === 'OK' ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: '0.72rem' }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deep-Dive Multi-Chart Telemetry Modal for Any Selected Device */}
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
