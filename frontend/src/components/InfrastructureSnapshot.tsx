import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Layers,
  Server,
  Network,
  Shield,
  Radio,
  HardDrive,
  Activity,
  Zap
} from 'lucide-react';
import type { Device } from '../types';

const getCategoryIcon = (id: string) => {
  if (id.includes('firewall') || id.includes('security') || id.includes('ngfw')) return <Shield size={13} color="#f43f5e" />;
  if (id.includes('router') || id.includes('switch') || id.includes('sdn') || id.includes('sdwan')) return <Network size={13} color="#0284c7" />;
  if (id.includes('wireless') || id.includes('wlc') || id.includes('wap') || id.includes('radio') || id.includes('vision') || id.includes('sensor')) return <Radio size={13} color="#8b5cf6" />;
  if (id.includes('storage') || id.includes('raid') || id.includes('tape')) return <HardDrive size={13} color="#059669" />;
  if (id.includes('ups') || id.includes('pdu') || id.includes('cooling') || id.includes('printer') || id.includes('iot')) return <Zap size={13} color="#d97706" />;
  if (id.includes('wan') || id.includes('voip') || id.includes('balancer')) return <Activity size={13} color="#06b6d4" />;
  return <Server size={13} color="#3b82f6" />;
};

export interface CategorySnapshot {
  id: string;
  name: string;
  group: 'compute' | 'network' | 'security' | 'traffic' | 'wireless' | 'facilities';
  alarms: number;
  devices: number;
  problematic: number;
}

// 36 Enterprise Infrastructure Categories exactly matching the reference specification
export const INFRASTRUCTURE_CATEGORIES: { id: string; name: string; group: CategorySnapshot['group'] }[] = [
  { id: 'server', name: 'Server', group: 'compute' },
  { id: 'router', name: 'Router', group: 'network' },
  { id: 'switch', name: 'Switch', group: 'network' },
  { id: 'desktop', name: 'Desktop', group: 'compute' },
  { id: 'firewall', name: 'Firewall', group: 'security' },
  { id: 'domain_controller', name: 'DomainController', group: 'compute' },
  { id: 'load_balancer', name: 'Load Balancer', group: 'traffic' },
  { id: 'wan_accelerator', name: 'WAN Accelerator', group: 'traffic' },
  { id: 'wireless', name: 'Wireless', group: 'wireless' },
  { id: 'ups', name: 'UPS', group: 'facilities' },
  { id: 'cooling_unit', name: 'Cooling Unit', group: 'facilities' },
  { id: 'printer', name: 'Printer', group: 'facilities' },
  { id: 'unknown', name: 'Unknown', group: 'compute' },
  { id: 'storage', name: 'Storage', group: 'facilities' },
  { id: 'pdu', name: 'PDU', group: 'facilities' },
  { id: 'ucs', name: 'UCS', group: 'compute' },
  { id: 'raid', name: 'RAID', group: 'compute' },
  { id: 'fc_switch', name: 'FCSwitch', group: 'network' },
  { id: 'tape_library', name: 'TapeLibrary', group: 'facilities' },
  { id: 'wlc', name: 'Wireless LAN Controller', group: 'wireless' },
  { id: 'wap', name: 'Wireless Access Point', group: 'wireless' },
  { id: 'ipmi', name: 'IPMI', group: 'compute' },
  { id: 'meraki_controller', name: 'Meraki Controller', group: 'wireless' },
  { id: 'meraki_security', name: 'Meraki Security', group: 'security' },
  { id: 'meraki_switch', name: 'Meraki Switch', group: 'network' },
  { id: 'meraki_radio', name: 'Meraki Radio', group: 'wireless' },
  { id: 'meraki_vision', name: 'Meraki Vision', group: 'wireless' },
  { id: 'meraki_cellular', name: 'Meraki Cellular Gateway', group: 'security' },
  { id: 'sdn', name: 'SDN', group: 'network' },
  { id: 'iot', name: 'IoT', group: 'facilities' },
  { id: 'sdwan', name: 'SDWAN', group: 'network' },
  { id: 'meraki_sensor', name: 'Meraki Sensor', group: 'wireless' },
  { id: 'container', name: 'Container', group: 'compute' },
  { id: 'ngfw', name: 'NGFW', group: 'security' },
  { id: 'wan_rtt', name: 'WAN RTT Monitors', group: 'traffic' },
  { id: 'voip', name: 'VoIP Monitors', group: 'traffic' }
];

interface InfrastructureSnapshotProps {
  devices: Device[];
  alerts?: any[];
  onSelectCategory?: (categoryName: string) => void;
  isDark?: boolean;
}

export const InfrastructureSnapshot: React.FC<InfrastructureSnapshotProps> = ({
  devices = [],
  alerts = [],
  onSelectCategory,
  isDark = true
}) => {
  const [search, setSearch] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Classify devices into the 36 categories dynamically
  const snapshotData = useMemo<CategorySnapshot[]>(() => {
    // Helper to test if a device belongs to a category
    const categorizeDevice = (d: Device): string => {
      const type = (d.device_type || '').toLowerCase();
      const hardware = (d.hardware || '').toLowerCase();
      const host = (d.hostname || '').toLowerCase();
      const os = (d.os || '').toLowerCase();
      const vendor = (d.vendor || '').toLowerCase();
      const desc = (d.sys_descr || '').toLowerCase();

      // Granular checks
      if (type.includes('domain_controller') || host.includes('dc-') || desc.includes('active directory') || desc.includes('domain controller')) return 'domain_controller';
      if (type.includes('ngfw') || hardware.includes('fortigate') || hardware.includes('palo alto') || hardware.includes('firepower')) return 'ngfw';
      if (type.includes('firewall') || hardware.includes('firewall') || host.includes('fw-')) return 'firewall';
      if (type.includes('meraki_vision') || hardware.includes('mv') || desc.includes('meraki mv')) return 'meraki_vision';
      if (type.includes('meraki_cellular') || hardware.includes('mg') || desc.includes('meraki mg')) return 'meraki_cellular';
      if (type.includes('meraki_sensor') || hardware.includes('mt') || desc.includes('meraki mt')) return 'meraki_sensor';
      if (type.includes('meraki_radio') || hardware.includes('mr') || desc.includes('meraki mr')) return 'meraki_radio';
      if (type.includes('meraki_switch') || hardware.includes('ms') || desc.includes('meraki ms')) return 'meraki_switch';
      if (type.includes('meraki_security') || hardware.includes('mx') || desc.includes('meraki mx')) return 'meraki_security';
      if (type.includes('meraki') || vendor.includes('meraki')) return 'meraki_controller';
      if (type.includes('load_balancer') || hardware.includes('f5') || hardware.includes('netscaler') || desc.includes('big-ip')) return 'load_balancer';
      if (type.includes('wan_accelerator') || hardware.includes('riverbed') || desc.includes('steelhead')) return 'wan_accelerator';
      if (type.includes('wlc') || desc.includes('wireless controller')) return 'wlc';
      if (type.includes('wap') || desc.includes('access point') || type.includes('ap')) return 'wap';
      if (type.includes('wireless')) return 'wireless';
      if (type.includes('ups') || vendor.includes('apc') || vendor.includes('cyberpower') || hardware.includes('smart-ups')) return 'ups';
      if (type.includes('pdu') || hardware.includes('pdu')) return 'pdu';
      if (type.includes('cooling') || desc.includes('liebert') || desc.includes('stulz')) return 'cooling_unit';
      if (type.includes('printer') || desc.includes('laserjet') || desc.includes('printer')) return 'printer';
      if (type.includes('ucs') || desc.includes('ucs') || hardware.includes('ucs')) return 'ucs';
      if (type.includes('raid') || desc.includes('megaraid') || desc.includes('perc')) return 'raid';
      if (type.includes('fc_switch') || desc.includes('fibre channel') || desc.includes('brocade')) return 'fc_switch';
      if (type.includes('tape_library') || desc.includes('tape') || desc.includes('autoloader')) return 'tape_library';
      if (type.includes('ipmi') || desc.includes('idrac') || desc.includes('ilo')) return 'ipmi';
      if (type.includes('sdwan') || desc.includes('sd-wan')) return 'sdwan';
      if (type.includes('sdn') || desc.includes('sdn')) return 'sdn';
      if (type.includes('container') || type.includes('docker') || type.includes('k8s')) return 'container';
      if (type.includes('storage') || vendor.includes('synology') || vendor.includes('netapp') || vendor.includes('qnap') || desc.includes('san') || desc.includes('nas')) return 'storage';
      if (type.includes('router') || desc.includes('router') || host.includes('rtr-')) return 'router';
      if (type.includes('switch') || desc.includes('switch') || host.includes('sw-')) return 'switch';
      if (type.includes('desktop') || type.includes('workstation') || os.includes('windows 10') || os.includes('windows 11')) return 'desktop';
      if (type.includes('wan_rtt') || desc.includes('ip sla')) return 'wan_rtt';
      if (type.includes('voip') || desc.includes('sip') || desc.includes('voip')) return 'voip';
      if (type.includes('iot') || desc.includes('modbus')) return 'iot';
      if (type.includes('server') || os.includes('server') || os.includes('linux') || os.includes('ubuntu') || os.includes('red hat')) return 'server';

      return 'unknown';
    };

    // Calculate counts for all 36 categories
    return INFRASTRUCTURE_CATEGORIES.map(cat => {
      const matchingDevices = devices.filter(d => categorizeDevice(d) === cat.id);
      const devCount = matchingDevices.length;
      const problematicCount = matchingDevices.filter(d => !d.status).length;

      // Calculate alarms associated with these devices
      const matchingDeviceIds = new Set(matchingDevices.map(d => d.id));
      const matchingDeviceIps = new Set(matchingDevices.map(d => d.ip_address));
      const categoryAlarms = alerts.filter(a =>
        (a.device_id && matchingDeviceIds.has(a.device_id)) ||
        (a.ip_address && matchingDeviceIps.has(a.ip_address))
      ).length;

      return {
        id: cat.id,
        name: cat.name,
        group: cat.group,
        alarms: categoryAlarms,
        devices: devCount,
        problematic: problematicCount
      };
    });
  }, [devices, alerts]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return snapshotData.filter(item => {
      const matchSearch = search === '' || item.name.toLowerCase().includes(search.toLowerCase());
      const matchActive = !filterActiveOnly || item.devices > 0 || item.alarms > 0;
      return matchSearch && matchActive;
    });
  }, [snapshotData, search, filterActiveOnly]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedItems = filteredData.slice(startIndex, endIndex);

  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0';
  const textMain = isDark ? '#f8fafc' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const tableHeaderBg = isDark ? '#1e293b' : '#f8fafc';
  const rowHover = isDark ? '#1e293b' : '#f8fafc';

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)'
            }}
          >
            <Layers size={17} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: textMain, margin: 0 }}>
                Infrastructure Snapshot
              </h3>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                  color: isDark ? '#38bdf8' : '#0369a1',
                  border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.3)' : '#bae6fd'}`
                }}
              >
                36 CATEGORIES MONITORED
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: textMuted, margin: '2px 0 0 0' }}>
              Real-time enterprise device distribution, alarm propagation, and problematic node health status
            </p>
          </div>
        </div>

        {/* Toolbar: Search, Active Toggle & Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isDark ? '#1e293b' : '#f8fafc',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              borderRadius: '6px',
              padding: '4px 8px'
            }}
          >
            <Search size={13} color={textMuted} />
            <input
              type="text"
              placeholder="Filter categories (e.g. Meraki, Switch)..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.74rem',
                color: textMain,
                width: '180px'
              }}
            />
          </div>

          {/* Active Only Filter */}
          <button
            onClick={() => {
              setFilterActiveOnly(!filterActiveOnly);
              setPage(1);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: `1px solid ${filterActiveOnly ? '#0284c7' : (isDark ? '#334155' : '#cbd5e1')}`,
              background: filterActiveOnly ? (isDark ? 'rgba(2, 132, 199, 0.25)' : '#eff6ff') : (isDark ? '#1e293b' : '#ffffff'),
              color: filterActiveOnly ? '#38bdf8' : textMuted,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Filter size={12} />
            <span>{filterActiveOnly ? 'Active Only (>0)' : 'All 36'}</span>
          </button>
        </div>
      </div>

      {/* Snapshot Table */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: `1px solid ${cardBorder}`
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.76rem' }}>
          <thead>
            <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${cardBorder}` }}>
              <th style={{ padding: '8px 12px', width: '40px', textAlign: 'center' }}></th>
              <th style={{ padding: '8px 14px', fontWeight: 700, color: textMuted }}>Name</th>
              <th style={{ padding: '8px 14px', fontWeight: 700, color: textMuted, textAlign: 'center', width: '110px' }}>Alarms</th>
              <th style={{ padding: '8px 14px', fontWeight: 700, color: textMuted, textAlign: 'center', width: '110px' }}>Devices</th>
              <th style={{ padding: '8px 14px', fontWeight: 700, color: textMuted, textAlign: 'center', width: '160px' }}>Problematic Devices</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map((item, idx) => {
              const isProblematic = item.problematic > 0;
              const hasDevices = item.devices > 0;

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectCategory && hasDevices && onSelectCategory(item.name)}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
                    cursor: hasDevices && onSelectCategory ? 'pointer' : 'default',
                    transition: 'background 0.12s ease',
                    height: '38px',
                    background: idx % 2 === 1 ? (isDark ? '#090d16' : '#fafafa') : 'transparent'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = rowHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 1 ? (isDark ? '#090d16' : '#fafafa') : 'transparent'}
                >
                  {/* Status Indicator Icon (Matching Reference Screenshot) */}
                  <td style={{ padding: '6px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {isProblematic ? (
                      <AlertTriangle size={15} color="#ef4444" />
                    ) : (
                      <CheckCircle2 size={15} color="#22c55e" />
                    )}
                  </td>

                  {/* Category Name */}
                  <td style={{ padding: '6px 14px', fontWeight: hasDevices ? 800 : 500, color: hasDevices ? (isDark ? '#38bdf8' : '#0284c7') : textMain }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getCategoryIcon(item.id)}
                      <span>{item.name}</span>
                      {hasDevices && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                            color: isDark ? '#4ade80' : '#15803d'
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Alarms Count */}
                  <td style={{ padding: '6px 14px', textAlign: 'center', fontWeight: item.alarms > 0 ? 800 : 500 }}>
                    {item.alarms > 0 ? (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                          color: isDark ? '#f87171' : '#b91c1c',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        {item.alarms}
                      </span>
                    ) : (
                      <span style={{ color: textMuted }}>0</span>
                    )}
                  </td>

                  {/* Devices Count */}
                  <td style={{ padding: '6px 14px', textAlign: 'center', fontWeight: hasDevices ? 800 : 500 }}>
                    {hasDevices ? (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                          color: isDark ? '#38bdf8' : '#0369a1',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        {item.devices}
                      </span>
                    ) : (
                      <span style={{ color: textMuted }}>0</span>
                    )}
                  </td>

                  {/* Problematic Devices */}
                  <td style={{ padding: '6px 14px', textAlign: 'center', fontWeight: isProblematic ? 800 : 500 }}>
                    {isProblematic ? (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                          color: isDark ? '#f87171' : '#b91c1c',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        {item.problematic}
                      </span>
                    ) : (
                      <span style={{ color: textMuted }}>0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Matching Reference Screenshot) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.74rem',
          color: textMuted,
          paddingTop: '4px'
        }}
      >
        {/* Left Pagination Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* First Page */}
          <button
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: currentPage === 1 ? (isDark ? '#334155' : '#cbd5e1') : textMain,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Prev Page */}
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: currentPage === 1 ? (isDark ? '#334155' : '#cbd5e1') : textMain,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page Number Box */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px', marginRight: '4px' }}>
            <span>Page</span>
            <input
              type="number"
              value={currentPage}
              min={1}
              max={totalPages}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setPage(val);
                }
              }}
              style={{
                width: '38px',
                padding: '2px 4px',
                borderRadius: '4px',
                border: `1px solid ${cardBorder}`,
                background: isDark ? '#1e293b' : '#ffffff',
                color: textMain,
                textAlign: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                outline: 'none'
              }}
            />
            <span>of {totalPages}</span>
          </span>

          {/* Next Page */}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: currentPage === totalPages ? (isDark ? '#334155' : '#cbd5e1') : textMain,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>

          {/* Last Page */}
          <button
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: currentPage === totalPages ? (isDark ? '#334155' : '#cbd5e1') : textMain,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>

          {/* Page Size Select */}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(1);
            }}
            style={{
              marginLeft: '8px',
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${cardBorder}`,
              background: isDark ? '#1e293b' : '#ffffff',
              color: textMain,
              fontSize: '0.72rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={36}>36 (All)</option>
          </select>
        </div>

        {/* Right: View X - Y of Total Count */}
        <div style={{ fontWeight: 600 }}>
          View {startIndex + 1} - {endIndex} of {totalItems}
        </div>
      </div>
    </div>
  );
};
