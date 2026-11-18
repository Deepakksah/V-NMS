import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  Maximize2,
  X,
  Check
} from 'lucide-react';
import type { Device } from '../types';

export interface CategorySnapshot {
  id: string;
  name: string;
  group: 'compute' | 'network' | 'security' | 'traffic' | 'wireless' | 'facilities';
  alarms: number;
  devices: number;
  problematic: number;
}

// 36 Enterprise Infrastructure Categories
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
  maxHeight?: string;
  defaultPageSize?: number;
}

export const InfrastructureSnapshot: React.FC<InfrastructureSnapshotProps> = ({
  devices = [],
  alerts = [],
  onSelectCategory,
  isDark = true,
  maxHeight = 'none',
  defaultPageSize = 100
}) => {
  const [search, setSearch] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [isMaximized, setIsMaximized] = useState(false);

  // Classify devices into the 36 categories dynamically
  const snapshotData = useMemo<CategorySnapshot[]>(() => {
    const categorizeDevice = (d: Device): string => {
      const type = (d.device_type || '').toLowerCase();
      const hardware = (d.hardware || '').toLowerCase();
      const host = (d.hostname || '').toLowerCase();
      const os = (d.os || '').toLowerCase();
      const vendor = (d.vendor || '').toLowerCase();
      const desc = (d.sys_descr || '').toLowerCase();

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
      if (type.includes('printer') || desc.includes('laserjet') || desc.includes('printer') || host.startsWith('printer-') || host.startsWith('prn-')) return 'printer';
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

    return INFRASTRUCTURE_CATEGORIES.map(cat => {
      const matchingDevices = devices.filter(d => categorizeDevice(d) === cat.id);
      const devCount = matchingDevices.length;
      const problematicCount = matchingDevices.filter(d => !d.status).length;

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

  // Total active categories count
  const activeCount = useMemo(() => {
    return snapshotData.filter(item => item.devices > 0 || item.alarms > 0).length;
  }, [snapshotData]);

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
  const effectivePageSize = isMaximized ? 36 : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, totalItems);
  const pagedItems = filteredData.slice(startIndex, endIndex);

  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0';
  const textMain = isDark ? '#f8fafc' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const tableHeaderBg = isDark ? '#1e293b' : '#f8fafc';
  const rowHover = isDark ? '#1e293b' : '#f8fafc';

  const renderTableContent = (inModal = false) => (
    <>
      {/* Table Body Container with internal scroll */}
      <div
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          borderRadius: '6px',
          border: `1px solid ${cardBorder}`,
          maxHeight: inModal ? '60vh' : maxHeight,
          background: isDark ? '#0b1120' : '#ffffff'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.70rem', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${cardBorder}`, position: 'sticky', top: 0, zIndex: 1 }}>
              <th style={{ padding: '6px 6px', width: '26px', textAlign: 'center' }}></th>
              <th style={{ padding: '6px 8px', fontWeight: 600, color: textMuted }}>Name</th>
              <th style={{ padding: '6px 6px', fontWeight: 600, color: textMuted, textAlign: 'center', width: '48px' }}>Alarms</th>
              <th style={{ padding: '6px 6px', fontWeight: 600, color: textMuted, textAlign: 'center', width: '48px' }}>Devices</th>
              <th style={{ padding: '6px 6px', fontWeight: 600, color: textMuted, textAlign: 'center', width: '120px' }}>Problematic Devices</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: textMuted, fontSize: '0.70rem' }}>
                  No matching infrastructure categories found
                </td>
              </tr>
            ) : (
              pagedItems.map((item, idx) => {
                const isProblematic = item.problematic > 0;
                const hasDevices = item.devices > 0;

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
                      height: '25px',
                      background: idx % 2 === 1 ? (isDark ? '#090d16' : '#fafafa') : 'transparent',
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = rowHover}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 1 ? (isDark ? '#090d16' : '#fafafa') : 'transparent'}
                  >
                    {/* Status Circle Icon matching screenshot */}
                    <td style={{ padding: '3px 6px', textAlign: 'center', verticalAlign: 'middle', width: '26px' }}>
                      <div style={{
                        width: '13px',
                        height: '13px',
                        borderRadius: '50%',
                        backgroundColor: isProblematic ? '#ef4444' : '#22c55e',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isProblematic ? '0 0 4px rgba(239, 68, 68, 0.4)' : '0 0 4px rgba(34, 197, 94, 0.4)'
                      }}>
                        {isProblematic ? (
                          <AlertTriangle size={8} color="#ffffff" strokeWidth={3} />
                        ) : (
                          <Check size={8} color="#ffffff" strokeWidth={3} />
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td
                      onClick={() => onSelectCategory && onSelectCategory(item.name)}
                      style={{
                        padding: '3px 8px',
                        fontWeight: hasDevices ? 600 : 400,
                        color: hasDevices ? (isDark ? '#38bdf8' : '#0284c7') : textMain,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                      title={`Click to filter ${item.name} devices`}
                    >
                      {item.name}
                    </td>

                    {/* Alarms */}
                    <td style={{ padding: '3px 6px', textAlign: 'center', width: '48px', color: item.alarms > 0 ? (isDark ? '#f87171' : '#b91c1c') : textMuted, fontWeight: item.alarms > 0 ? 700 : 400 }}>
                      {item.alarms}
                    </td>

                    {/* Devices */}
                    <td
                      onClick={() => onSelectCategory && hasDevices && onSelectCategory(item.name)}
                      style={{
                        padding: '3px 6px',
                        textAlign: 'center',
                        width: '48px',
                        color: hasDevices ? (isDark ? '#38bdf8' : '#0284c7') : textMuted,
                        fontWeight: hasDevices ? 700 : 400,
                        cursor: hasDevices ? 'pointer' : 'default'
                      }}
                    >
                      {item.devices}
                    </td>

                    {/* Problematic Devices */}
                    <td style={{ padding: '3px 6px', textAlign: 'center', width: '120px', color: isProblematic ? (isDark ? '#f87171' : '#b91c1c') : textMuted, fontWeight: isProblematic ? 700 : 400 }}>
                      {item.problematic}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching screenshot */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.68rem',
          color: textMuted,
          paddingTop: '4px',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            style={{
              padding: '2px 4px',
              borderRadius: '3px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: currentPage === 1 ? (isDark ? '#475569' : '#cbd5e1') : textMain,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="First Page"
          >
            <ChevronsLeft size={11} />
          </button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '2px 4px',
              borderRadius: '3px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: currentPage === 1 ? (isDark ? '#475569' : '#cbd5e1') : textMain,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Previous Page"
          >
            <ChevronLeft size={11} />
          </button>

          <span style={{ margin: '0 2px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem' }}>
            <span>Page</span>
            <input
              type="text"
              value={currentPage}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setPage(val);
                }
              }}
              style={{
                width: '22px',
                textAlign: 'center',
                padding: '1px 2px',
                fontSize: '0.66rem',
                borderRadius: '3px',
                border: `1px solid ${cardBorder}`,
                background: isDark ? '#1e293b' : '#ffffff',
                color: textMain,
                outline: 'none'
              }}
            />
            <span>of {totalPages}</span>
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '2px 4px',
              borderRadius: '3px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: currentPage === totalPages ? (isDark ? '#475569' : '#cbd5e1') : textMain,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Next Page"
          >
            <ChevronRight size={11} />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              padding: '2px 4px',
              borderRadius: '3px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: currentPage === totalPages ? (isDark ? '#475569' : '#cbd5e1') : textMain,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Last Page"
          >
            <ChevronsRight size={11} />
          </button>

          {!inModal && (
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(1);
              }}
              style={{
                marginLeft: '4px',
                padding: '1px 3px',
                borderRadius: '3px',
                border: `1px solid ${cardBorder}`,
                background: isDark ? '#1e293b' : '#ffffff',
                color: textMain,
                fontSize: '0.64rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={100}>All (36)</option>
              <option value={36}>36</option>
              <option value={25}>25</option>
              <option value={15}>15</option>
              <option value={10}>10</option>
            </select>
          )}
        </div>

        <div style={{ fontWeight: 500, fontSize: '0.68rem' }}>
          {totalItems > 0 ? `View ${startIndex + 1} - ${endIndex} of ${totalItems}` : 'View 0 of 0'}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Standard Dashboard Card Mode */}
      <div
        style={{
          background: cardBg,
          borderRadius: '10px',
          border: `1px solid ${cardBorder}`,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px',
          boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.15s ease'
        }}
      >
        {/* Compact Widget Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="#0284c7" />
            <h4 style={{ fontSize: '0.80rem', fontWeight: 800, color: textMain, margin: 0, whiteSpace: 'nowrap' }}>
              Infrastructure Snapshot
            </h4>
            <span
              style={{
                fontSize: '0.58rem',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '3px',
                background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                color: isDark ? '#38bdf8' : '#0369a1'
              }}
            >
              36
            </span>
          </div>

          {/* Quick Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                borderRadius: '4px',
                padding: '2px 5px'
              }}
            >
              <Search size={10} color={textMuted} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.64rem',
                  color: textMain,
                  width: '60px'
                }}
              />
            </div>

            {/* Active Only Filter Pill */}
            <button
              onClick={() => {
                setFilterActiveOnly(!filterActiveOnly);
                setPage(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 5px',
                borderRadius: '4px',
                border: `1px solid ${filterActiveOnly ? '#0284c7' : (isDark ? '#334155' : '#cbd5e1')}`,
                background: filterActiveOnly ? (isDark ? 'rgba(2, 132, 199, 0.25)' : '#eff6ff') : 'transparent',
                color: filterActiveOnly ? '#38bdf8' : textMuted,
                fontSize: '0.62rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title={filterActiveOnly ? "Showing active only. Click for all 36." : "Click to show active nodes only."}
            >
              {filterActiveOnly ? `Active (${activeCount})` : 'All'}
            </button>

            {/* Maximize Button */}
            <button
              onClick={() => setIsMaximized(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: textMuted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              title="Maximize Snapshot View"
            >
              <Maximize2 size={12} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {renderTableContent(false)}
      </div>

      {/* Maximized Full Enterprise Modal View */}
      {isMaximized && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsMaximized(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '850px',
              backgroundColor: cardBg,
              borderRadius: '12px',
              border: `1px solid ${cardBorder}`,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: textMain, margin: 0 }}>
                  Infrastructure Snapshot (All 36 Categories)
                </h3>
              </div>
              <button
                onClick={() => setIsMaximized(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: textMuted,
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Table Content */}
            {renderTableContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
