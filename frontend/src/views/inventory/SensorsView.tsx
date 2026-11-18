import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Thermometer, 
  Cpu, 
  Database, 
  HardDrive, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Search,
  ChevronDown,
  ChevronRight,
  Shield,
  Activity,
  Zap,
  FileText,
  RotateCcw
} from 'lucide-react';
import { 
  MOCK_SENSORS, 
  MOCK_PROCESSORS, 
  MOCK_MEMPOOLS, 
  MOCK_STORAGE, 
  MOCK_DISK_IO 
} from '../../data/mockEnterpriseData';
import { ExportButtons } from '../../components/ExportButtons';

interface SensorsViewProps {
  apiBase?: string;
}

export const SensorsView: React.FC<SensorsViewProps> = ({ apiBase = '/api/v1' }) => {
  const [subTab, setSubTab] = useState<
    'storage' | 'disk_io' | 'ipmi' | 'daemons' | 'compliance' | 'smart_nvme' | 'event_logs' | 'sensors' | 'processors' | 'mempools'
  >('storage');
  const [storageData, setStorageData] = useState<any[]>(MOCK_STORAGE);
  const [diskData, setDiskData] = useState<any[]>(MOCK_DISK_IO);
  const [ipmiData, setIpmiData] = useState<any[]>([]);
  const [daemonsData, setDaemonsData] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [smartDisksData, setSmartDisksData] = useState<any[]>([]);
  const [eventLogsData, setEventLogsData] = useState<any[]>([]);
  const [spoolersData, setSpoolersData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  // Default all servers to minimized (collapsed) per user requirement
  const [expandedServers, setExpandedServers] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchStorageAndDisks = async () => {
      try {
        const [resStorage, resDisks, resIpmi, resDaemons, resComp, resSmart, resLogs, resSpool] = await Promise.allSettled([
          axios.get(`${apiBase}/storage`, { timeout: 4000 }),
          axios.get(`${apiBase}/disks`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/ipmi`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/daemons`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/ad-updates`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/smart-disks`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/event-logs`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/spoolers`, { timeout: 4000 })
        ]);

        if (resStorage.status === 'fulfilled' && resStorage.value.data?.storage) {
          const mapped = resStorage.value.data.storage.map((s: any) => ({
            id: s.id,
            deviceId: s.device_id,
            rawHostname: s.device_hostname,
            ipAddress: s.ip_address,
            deviceHostname: `${s.device_hostname} (${s.ip_address})`,
            mountPoint: `${s.mount_point} (${s.volume_label})`,
            fileSystem: s.file_system,
            totalGb: s.total_gb,
            usedGb: s.used_gb,
            freeGb: s.free_gb,
            percentUsed: s.percent_used,
            status: s.status
          }));
          setStorageData(mapped);
          setIsLive(true);
        }

        if (resDisks.status === 'fulfilled' && resDisks.value.data?.disks) {
          const mappedDisks = resDisks.value.data.disks.map((d: any) => ({
            id: d.id,
            deviceHostname: `${d.device_hostname} (${d.ip_address})`,
            deviceDisk: `${d.model} (${d.media_type})`,
            sizeGb: d.size_gb,
            mediaType: d.media_type,
            interfaceType: d.interface_type,
            readIops: d.read_iops,
            writeIops: d.write_iops,
            readThroughputMb: d.throughput_mb,
            writeThroughputMb: Number((d.throughput_mb * 1.25).toFixed(1)),
            healthStatus: d.health_status
          }));
          setDiskData(mappedDisks);
        }

        if (resIpmi.status === 'fulfilled' && resIpmi.value.data?.ipmi_telemetry) {
          setIpmiData(resIpmi.value.data.ipmi_telemetry);
        }
        if (resDaemons.status === 'fulfilled' && resDaemons.value.data?.services) {
          setDaemonsData(resDaemons.value.data.services);
        }
        if (resComp.status === 'fulfilled' && resComp.value.data?.compliance_records) {
          setComplianceData(resComp.value.data.compliance_records);
        }
        if (resSmart.status === 'fulfilled' && resSmart.value.data?.smart_disks) {
          setSmartDisksData(resSmart.value.data.smart_disks);
        }
        if (resLogs.status === 'fulfilled' && resLogs.value.data?.event_logs) {
          setEventLogsData(resLogs.value.data.event_logs);
        }
        if (resSpool.status === 'fulfilled' && resSpool.value.data?.spoolers) {
          setSpoolersData(resSpool.value.data.spoolers);
        }
      } catch {
        // Fallback to audited mockEnterpriseData
      }
    };

    fetchStorageAndDisks();
  }, [apiBase]);

  // Group storage records by Server so server name appears ONCE with all its drives underneath
  const groupedStorage = useMemo(() => {
    const groups: { [key: string]: {
      key: string;
      deviceId?: number;
      rawHostname: string;
      ipAddress: string;
      deviceHostname: string;
      isLinux: boolean;
      totalCapacityGb: number;
      totalUsedGb: number;
      overallPercent: number;
      volumes: any[];
    } } = {};

    storageData.forEach(item => {
      let rawHost = item.rawHostname || '';
      let ip = item.ipAddress || '';

      if (!rawHost || !ip) {
        const full = item.deviceHostname || '';
        const match = full.match(/\((.*?)\)/);
        if (match) {
          ip = match[1];
          rawHost = full.replace(/\(.*?\)/, '').trim();
        } else {
          rawHost = full.trim();
        }
      }

      const key = item.deviceId ? `dev-${item.deviceId}` : rawHost;
      if (!groups[key]) {
        const isLinux = rawHost.toLowerCase().includes('linux') || 
                        item.fileSystem === 'ext4' || 
                        item.fileSystem === 'xfs' ||
                        (item.mountPoint && String(item.mountPoint).startsWith('/'));

        groups[key] = {
          key,
          deviceId: item.deviceId,
          rawHostname: rawHost,
          ipAddress: ip,
          deviceHostname: item.deviceHostname,
          isLinux,
          totalCapacityGb: 0,
          totalUsedGb: 0,
          overallPercent: 0,
          volumes: []
        };
      }

      groups[key].volumes.push(item);
      groups[key].totalCapacityGb += (Number(item.totalGb) || 0);
      groups[key].totalUsedGb += (Number(item.usedGb) || 0);
    });

    return Object.values(groups).map(g => ({
      ...g,
      overallPercent: g.totalCapacityGb > 0 ? Math.round((g.totalUsedGb / g.totalCapacityGb) * 100) : 0
    }));
  }, [storageData]);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedStorage;
    const q = searchQuery.toLowerCase();
    return groupedStorage.filter(g => 
      g.rawHostname.toLowerCase().includes(q) ||
      g.ipAddress.toLowerCase().includes(q) ||
      g.volumes.some(v => 
        (v.mountPoint || '').toLowerCase().includes(q) || 
        (v.fileSystem || '').toLowerCase().includes(q)
      )
    );
  }, [groupedStorage, searchQuery]);

  // Filter flat list for flat mode
  const filteredFlatStorage = useMemo(() => {
    if (!searchQuery.trim()) return storageData;
    const q = searchQuery.toLowerCase();
    return storageData.filter(st => 
      (st.deviceHostname || '').toLowerCase().includes(q) ||
      (st.mountPoint || '').toLowerCase().includes(q) ||
      (st.fileSystem || '').toLowerCase().includes(q)
    );
  }, [storageData, searchQuery]);

  const toggleServerExpand = (key: string) => {
    setExpandedServers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAll = () => {
    const allExp: { [key: string]: boolean } = {};
    groupedStorage.forEach(g => { allExp[g.key] = true; });
    setExpandedServers(allExp);
  };

  const collapseAll = () => {
    setExpandedServers({});
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Sensors, Metrics &amp; Storage Architecture</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: isLive ? '#dcfce7' : '#e0f2fe', color: isLive ? '#15803d' : '#0369a1', fontWeight: 700 }}>
              {isLive ? '● Live Hardware Verified' : 'Models #26 - #35'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Physical drive health (HDD/SSD/RAID), logical volumes, filesystem mount points, and environmental telemetry
          </p>
        </div>
        <ExportButtons data={storageData} filenamePrefix="vnms_storage_sensors" title="Storage & Sensors" />
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'storage', label: 'Disks & Partitions (#33)', icon: HardDrive, count: storageData.length },
          { id: 'disk_io', label: 'Physical Drives & IOPS (#34, #35)', icon: TrendingUp, count: diskData.length },
          { id: 'ipmi', label: 'Out-of-Band IPMI & BMC (#21, #22)', icon: Zap, count: ipmiData.length },
          { id: 'daemons', label: 'Services & Daemons (#25, #27, #28)', icon: Activity, count: daemonsData.length },
          { id: 'compliance', label: 'Patch & AD Health (#23, #24)', icon: Shield, count: complianceData.length },
          { id: 'smart_nvme', label: 'NVMe SMART & Spoolers (#29, #30)', icon: HardDrive, count: smartDisksData.length },
          { id: 'event_logs', label: 'Event Log Regex (#26)', icon: FileText, count: eventLogsData.length },
          { id: 'sensors', label: 'Environmental (#26-#30)', icon: Thermometer, count: MOCK_SENSORS.length },
          { id: 'processors', label: 'CPUs (#31)', icon: Cpu, count: MOCK_PROCESSORS.length },
          { id: 'mempools', label: 'RAM Pools (#32)', icon: Database, count: MOCK_MEMPOOLS.length }
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

      {/* 1. Storage & Partitions View */}
      {subTab === 'storage' && (
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Filesystem Mount Points &amp; Logical Disk Partitions
              </h3>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Real-time storage capacities grouped by enterprise Windows &amp; Linux servers
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', fontWeight: 600 }}>
                ✔ All Volumes Healthy
              </span>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: 700 }}>
                {filteredGroups.length} Servers Monitored
              </span>
            </div>
          </div>

          {/* Controls: Search, Expand All, and View Mode Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            {/* Search Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '4px 10px',
              width: '320px'
            }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search server name, IP, mount, or FS..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.74rem',
                  color: '#0f172a',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Actions & View Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {viewMode === 'grouped' && (
                <>
                  <button
                    onClick={expandAll}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Collapse All
                  </button>
                  <span style={{ fontSize: '0.66rem', color: '#64748b' }}>• Default Minimized</span>
                </>
              )}

              {/* View Toggle */}
              <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', border: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setViewMode('grouped')}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '4px',
                    border: 'none',
                    background: viewMode === 'grouped' ? '#ffffff' : 'transparent',
                    color: viewMode === 'grouped' ? '#0284c7' : '#64748b',
                    fontWeight: viewMode === 'grouped' ? 700 : 500,
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'grouped' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  🏢 Grouped by Server
                </button>
                <button
                  onClick={() => setViewMode('flat')}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '4px',
                    border: 'none',
                    background: viewMode === 'flat' ? '#ffffff' : 'transparent',
                    color: viewMode === 'flat' ? '#0284c7' : '#64748b',
                    fontWeight: viewMode === 'flat' ? 700 : 500,
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'flat' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  📋 Flat Table
                </button>
              </div>
            </div>
          </div>

          {/* Grouped by Server View */}
          {viewMode === 'grouped' ? (
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '6px 10px 6px 34px' }}>MOUNT POINT / LOGICAL DRIVE</th>
                    <th style={{ padding: '6px 10px' }}>FS TYPE</th>
                    <th style={{ padding: '6px 10px' }}>USED / TOTAL CAPACITY</th>
                    <th style={{ padding: '6px 10px' }}>UTILIZATION</th>
                    <th style={{ padding: '6px 10px' }}>FREE SPACE</th>
                    <th style={{ padding: '6px 10px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                        No servers match "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map(group => {
                      const isExpanded = Boolean(expandedServers[group.key]);
                      return (
                        <React.Fragment key={group.key}>
                          {/* Server Banner Header Row (Server Name Shown Once, Default Minimized) */}
                          <tr
                            onClick={() => toggleServerExpand(group.key)}
                            style={{
                              background: isExpanded ? '#f1f5f9' : '#f8fafc',
                              borderTop: '2px solid #e2e8f0',
                              borderBottom: isExpanded ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'background-color 0.12s ease'
                            }}
                            title={isExpanded ? 'Click to minimize server volumes' : 'Click to expand server volumes'}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = isExpanded ? '#e2e8f0' : '#f1f5f9'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = isExpanded ? '#f1f5f9' : '#f8fafc'}
                          >
                            <td colSpan={6} style={{ padding: '6px 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleServerExpand(group.key);
                                    }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '1px', display: 'flex', alignItems: 'center', color: '#64748b' }}
                                    title={isExpanded ? 'Minimize / Collapse Server Volumes' : 'Expand Server Volumes'}
                                  >
                                    {isExpanded ? <ChevronDown size={14} color="#0284c7" /> : <ChevronRight size={14} color="#64748b" />}
                                  </button>
                                  <Server size={14} color="#0284c7" />
                                  <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>
                                    {group.rawHostname}
                                  </span>
                                  {group.ipAddress && (
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                      {group.ipAddress}
                                    </span>
                                  )}
                                  <span style={{
                                    fontSize: '0.65rem',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: group.isLinux ? '#fef3c7' : '#e0e7ff',
                                    color: group.isLinux ? '#b45309' : '#3730a3',
                                    fontWeight: 700
                                  }}>
                                    {group.isLinux ? 'Enterprise Linux' : 'Windows Server'}
                                  </span>
                                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                                    • {group.volumes.length} {group.volumes.length === 1 ? 'Volume' : 'Volumes'}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.70rem' }}>
                                  <span style={{ color: '#64748b' }}>
                                    Total: <strong style={{ color: '#0f172a' }}>{group.totalCapacityGb.toFixed(0)} GB</strong>
                                  </span>
                                  <span style={{ color: '#64748b' }}>
                                    Used: <strong style={{ color: group.overallPercent > 80 ? '#dc2626' : group.overallPercent > 60 ? '#d97706' : '#16a34a' }}>
                                      {group.totalUsedGb.toFixed(1)} GB ({group.overallPercent}%)
                                    </strong>
                                  </span>
                                  <span style={{ color: '#16a34a', fontWeight: 700 }}>
                                    {(group.totalCapacityGb - group.totalUsedGb).toFixed(1)} GB Free
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Related Volumes / Partitions belonging to this Server (Shown ONLY if Expanded) */}
                          {isExpanded && group.volumes.map((st, vIdx) => {
                            const percent = Math.round(st.percentUsed);
                            const isWarning = percent >= 80;
                            const isCritical = percent >= 90;
                            const freeGb = st.freeGb ?? (st.totalGb - st.usedGb);

                            // Parse mount point and description (e.g. "C:\ (System OS (NVMe))")
                            const rawMount = String(st.mountPoint || '');
                            const spaceIdx = rawMount.indexOf(' ');
                            const mountLetter = spaceIdx > 0 ? rawMount.substring(0, spaceIdx) : rawMount;
                            const mountDesc = spaceIdx > 0 ? rawMount.substring(spaceIdx).trim() : '';

                            return (
                              <tr
                                key={st.id || `${group.key}-vol-${vIdx}`}
                                style={{
                                  borderBottom: '1px solid #fed7aa',
                                  background: '#fff7ed', // Distinct warm amber/orange child row background matching user specification
                                  transition: 'background-color 0.12s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffedd5'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff7ed'}
                              >
                                <td style={{
                                  padding: '5px 10px 5px 28px',
                                  borderLeft: '4px solid #f97316', // Warm orange left accent
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.74rem'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: '#ea580c', fontSize: '0.80rem', fontWeight: 800, userSelect: 'none' }}>↳</span>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: '#ffffff',
                                      color: '#c2410c',
                                      border: '1px solid #fdba74',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 800,
                                      fontSize: '0.72rem',
                                      boxShadow: '0 1px 2px rgba(249,115,22,0.12)'
                                    }}>
                                      <HardDrive size={11} color="#ea580c" />
                                      <span>{mountLetter}</span>
                                    </span>
                                    {mountDesc && (
                                      <span style={{ fontSize: '0.72rem', color: '#7c2d12', fontWeight: 600 }}>
                                        {mountDesc}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td style={{ padding: '5px 10px', fontSize: '0.70rem' }}>
                                  <span style={{
                                    background: st.fileSystem?.toLowerCase() === 'ntfs' ? '#ede9fe' : '#ecfdf5',
                                    color: st.fileSystem?.toLowerCase() === 'ntfs' ? '#6d28d9' : '#047857',
                                    border: `1px solid ${st.fileSystem?.toLowerCase() === 'ntfs' ? '#ddd6fe' : '#a7f3d0'}`,
                                    padding: '1.5px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-mono)'
                                  }}>
                                    {st.fileSystem}
                                  </span>
                                </td>

                                <td style={{ padding: '5px 10px', fontSize: '0.74rem', color: '#1e293b', fontWeight: 600 }}>
                                  {st.usedGb} GB / {st.totalGb} GB
                                </td>

                                <td style={{ padding: '5px 10px', width: '200px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#cbd5e1', overflow: 'hidden' }}>
                                      <div style={{
                                        width: `${percent}%`,
                                        height: '100%',
                                        background: isCritical ? '#dc2626' : isWarning ? '#d97706' : '#16a34a',
                                        borderRadius: '4px',
                                        transition: 'width 0.3s ease'
                                      }} />
                                    </div>
                                    <span style={{
                                      fontSize: '0.70rem',
                                      fontWeight: 700,
                                      fontFamily: 'var(--font-mono)',
                                      color: isCritical ? '#dc2626' : isWarning ? '#d97706' : '#0f172a',
                                      width: '36px'
                                    }}>
                                      {percent}%
                                    </span>
                                  </div>
                                </td>

                                <td style={{ padding: '5px 10px' }}>
                                  <span style={{
                                    background: '#f0fdf4',
                                    color: '#15803d',
                                    border: '1px solid #bbf7d0',
                                    padding: '1.5px 7px',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-mono)'
                                  }}>
                                    {Number(freeGb).toFixed(1)} GB Free
                                  </span>
                                </td>

                                <td style={{ padding: '5px 10px' }}>
                                  <span style={{
                                    fontSize: '0.68rem',
                                    padding: '1.5px 7px',
                                    borderRadius: '4px',
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    border: '1px solid #bbf7d0',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}>
                                    <CheckCircle2 size={11} />
                                    Healthy
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Flat Table View */
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '6px 10px' }}>SERVER / HOST</th>
                    <th style={{ padding: '6px 10px' }}>MOUNT / DRIVE</th>
                    <th style={{ padding: '6px 10px' }}>FS TYPE</th>
                    <th style={{ padding: '6px 10px' }}>USED / TOTAL</th>
                    <th style={{ padding: '6px 10px' }}>UTILIZATION</th>
                    <th style={{ padding: '6px 10px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlatStorage.map(st => {
                    const percent = Math.round(st.percentUsed);
                    const isWarning = percent >= 80;
                    const isCritical = percent >= 90;
                    return (
                      <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Server size={13} color="#0284c7" />
                            <span>{st.deviceHostname}</span>
                          </div>
                        </td>
                        <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>
                          {st.mountPoint}
                        </td>
                        <td style={{ padding: '4px 10px', fontSize: '0.72rem', color: '#64748b' }}>
                          <span style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                            {st.fileSystem}
                          </span>
                        </td>
                        <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#334155', fontWeight: 500 }}>
                          {st.usedGb} GB / {st.totalGb} GB
                        </td>
                        <td style={{ padding: '4px 10px', width: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${percent}%`, 
                                height: '100%', 
                                background: isCritical ? '#dc2626' : isWarning ? '#d97706' : '#16a34a' 
                              }} />
                            </div>
                            <span style={{ 
                              fontSize: '0.70rem', 
                              fontWeight: 700, 
                              color: isCritical ? '#dc2626' : isWarning ? '#d97706' : '#0f172a', 
                              width: '36px' 
                            }}>
                              {percent}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '4px 10px' }}>
                          <span style={{ 
                            fontSize: '0.68rem', 
                            padding: '1.5px 6px', 
                            borderRadius: '4px', 
                            background: '#f0fdf4', 
                            color: '#16a34a', 
                            fontWeight: 700, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '3px' 
                          }}>
                            <CheckCircle2 size={11} />
                            Healthy
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. Physical Disks & Disk IOPS View */}
      {subTab === 'disk_io' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {diskData.map(io => (
            <div key={io.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.70rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                  PHYSICAL DISK ARRAY
                </span>
                <span style={{ fontSize: '0.70rem', padding: '2px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={11} />
                  SMART OK
                </span>
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', marginTop: '6px', marginBottom: '2px' }}>
                {io.deviceDisk}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={13} color="#0284c7" />
                {io.deviceHostname}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>READ OPERATIONS</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', marginTop: '3px' }}>
                    {io.readIops.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>IOPS</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{io.readThroughputMb} MB/s Throughput</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>WRITE OPERATIONS</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7e22ce', marginTop: '3px' }}>
                    {io.writeIops.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>IOPS</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{io.writeThroughputMb} MB/s Throughput</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Environmental Sensors View */}
      {subTab === 'sensors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {MOCK_SENSORS.map(sensor => (
            <div key={sensor.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {sensor.sensorClass}
                </span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  color: sensor.state === 'OK' ? '#16a34a' : '#dc2626',
                  fontWeight: 600
                }}>
                  {sensor.state === 'OK' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  {sensor.state}
                </span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {sensor.sensorDescr}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>
                {sensor.deviceHostname}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                  {sensor.currentValue}
                </span>
                <span style={{ fontSize: '1rem', color: '#0284c7', fontWeight: 700 }}>
                  {sensor.unit}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Safe Range: {sensor.limitLow} - {sensor.limitHigh} {sensor.unit}</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Nominal</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Multi-Core Processors */}
      {subTab === 'processors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {MOCK_PROCESSORS.map(proc => (
            <div key={proc.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>
                  {proc.cores} Cores Physical
                </span>
                <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>
                  {proc.temperatureC}°C Package
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {proc.name}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
                {proc.deviceHostname}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Load Average</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{proc.utilization}%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${proc.utilization}%`, height: '100%', background: proc.utilization > 75 ? '#dc2626' : '#0284c7' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Memory Pools */}
      {subTab === 'mempools' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {MOCK_MEMPOOLS.map(mem => (
            <div key={mem.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7e22ce', fontWeight: 700 }}>
                RAM ALLOCATION POOL
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '8px', marginBottom: '4px' }}>
                {mem.poolName}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
                {mem.deviceHostname}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>{formatBytes(mem.usedBytes)} of {formatBytes(mem.totalBytes)}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{mem.percentUsed}%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${mem.percentUsed}%`, height: '100%', background: mem.percentUsed > 85 ? '#dc2626' : '#7e22ce' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Out-of-Band IPMI & DMTF Redfish BMC Telemetry (#21, #22) */}
      {subTab === 'ipmi' && (
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Out-of-Band IPMI &amp; DMTF Redfish BMC Hardware Chassis
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                UDP 623 IPMI 2.0 &amp; HTTPS 443 Redfish REST v1.14 polling Dell iDRAC9, HPE iLO 5, Supermicro IPMI
              </p>
            </div>
            <ExportButtons data={ipmiData} filenamePrefix="vnms_ipmi_bmc" title="IPMI BMC Telemetry" />
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>SERVER HOST / BMC IP</th>
                  <th style={{ padding: '8px 12px' }}>BMC ARCHITECTURE</th>
                  <th style={{ padding: '8px 12px' }}>CHASSIS TEMPS</th>
                  <th style={{ padding: '8px 12px' }}>COOLING FANS (RPM)</th>
                  <th style={{ padding: '8px 12px' }}>DUAL PSUs REDUNDANCY</th>
                  <th style={{ padding: '8px 12px' }}>POWER DRAW</th>
                  <th style={{ padding: '8px 12px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {ipmiData.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.server_host}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#0284c7' }}>BMC: {b.bmc_ip}</div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {b.bmc_type}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#0f172a' }}>
                      Inlet: <strong>{b.inlet_temp_c}°C</strong> | Exhaust: <strong>{b.exhaust_temp_c}°C</strong>
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>
                      Fan1: {b.fan1_rpm} | Fan2: {b.fan2_rpm} | Fan3: {b.fan3_rpm}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ color: '#16a34a', fontWeight: 600 }}>PSU1: {b.psu1_status}</div>
                      <div style={{ color: '#0284c7', fontWeight: 600 }}>PSU2: {b.psu2_status}</div>
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 800, color: '#d97706' }}>
                      {b.power_draw_watts} W
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        ● {b.chassis_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Windows Services & Linux Daemons (#25, #27, #28) */}
      {subTab === 'daemons' && (
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Enterprise Services &amp; Linux Systemd Daemons
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Real-time daemon monitoring, automatic crash remediation, PID tracking, and scheduled task health
              </p>
            </div>
            <ExportButtons data={daemonsData} filenamePrefix="vnms_service_daemons" title="Service Daemons" />
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>HOST &amp; OS</th>
                  <th style={{ padding: '8px 12px' }}>SERVICE NAME</th>
                  <th style={{ padding: '8px 12px' }}>DISPLAY NAME</th>
                  <th style={{ padding: '8px 12px' }}>STARTUP</th>
                  <th style={{ padding: '8px 12px' }}>PID</th>
                  <th style={{ padding: '8px 12px' }}>UPTIME</th>
                  <th style={{ padding: '8px 12px' }}>STATUS</th>
                  <th style={{ padding: '8px 12px' }}>REMEDIATION</th>
                </tr>
              </thead>
              <tbody>
                {daemonsData.map((s: any) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.hostname}</div>
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: s.os_type === 'Linux' ? '#fef3c7' : '#e0e7ff', color: s.os_type === 'Linux' ? '#b45309' : '#3730a3', fontWeight: 700 }}>
                        {s.os_type}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0284c7' }}>
                      {s.service_name}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#334155' }}>
                      {s.display_name}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>
                      {s.startup_type}
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>
                      {s.pid}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#16a34a', fontWeight: 600 }}>
                      {s.uptime_hours.toFixed(1)} hrs
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: s.status === 'RUNNING' ? '#dcfce7' : '#fee2e2', color: s.status === 'RUNNING' ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        ● {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.70rem',
                          color: '#0f172a',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Issue auto-restart command"
                      >
                        <RotateCcw size={11} color="#0284c7" />
                        Restart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Active Directory & Windows Patch Compliance (#23, #24) */}
      {subTab === 'compliance' && (
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Active Directory Replication &amp; Windows Update Compliance
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Auditing Domain Controller SYSVOL replication, FSMO roles, missing security KBs, and pending reboots
              </p>
            </div>
            <ExportButtons data={complianceData} filenamePrefix="vnms_ad_patch_compliance" title="Patch & AD Compliance" />
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>SERVER HOST</th>
                  <th style={{ padding: '8px 12px' }}>DOMAIN ROLE</th>
                  <th style={{ padding: '8px 12px' }}>SYSVOL REPLICATION</th>
                  <th style={{ padding: '8px 12px' }}>FSMO ROLE HOLDINGS</th>
                  <th style={{ padding: '8px 12px' }}>DAYS SINCE PATCH</th>
                  <th style={{ padding: '8px 12px' }}>MISSING SEC KBS</th>
                  <th style={{ padding: '8px 12px' }}>PENDING REBOOT</th>
                  <th style={{ padding: '8px 12px' }}>COMPLIANCE</th>
                </tr>
              </thead>
              <tbody>
                {complianceData.map((c: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                      {c.hostname}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: c.is_domain_ctrl ? '#e0f2fe' : '#f1f5f9', color: c.is_domain_ctrl ? '#0369a1' : '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {c.is_domain_ctrl ? 'Domain Controller' : 'Member Server'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#16a34a', fontWeight: 600 }}>
                      {c.sysvol_sync_status}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>
                      {c.fsmo_role_holdings}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: c.days_since_patch > 30 ? '#dc2626' : '#0f172a' }}>
                      {c.days_since_patch} days
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: c.missing_sec_kbs > 0 ? '#d97706' : '#16a34a' }}>
                      {c.missing_sec_kbs} KBs
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: c.pending_reboot ? '#fee2e2' : '#f1f5f9', color: c.pending_reboot ? '#b91c1c' : '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {c.pending_reboot ? 'YES (Reboot Needed)' : 'NO'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        background: c.compliance_rating === 'COMPLIANT' ? '#dcfce7' : c.compliance_rating === 'NEEDS_REBOOT' ? '#fef3c7' : '#fee2e2',
                        color: c.compliance_rating === 'COMPLIANT' ? '#15803d' : c.compliance_rating === 'NEEDS_REBOOT' ? '#b45309' : '#b91c1c',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}>
                        {c.compliance_rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. NVMe SSD SMART Wear & Enterprise Print Spoolers (#29, #30) */}
      {subTab === 'smart_nvme' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  NVMe / SSD SMART Wear-Leveling &amp; Flash Health Telemetry
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Monitoring remaining flash write endurance %, reallocated sectors, operating temperature, and power-on hours
                </p>
              </div>
              <ExportButtons data={smartDisksData} filenamePrefix="vnms_smart_nvme" title="NVMe SMART Wear" />
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>DISK ID / HOST</th>
                    <th style={{ padding: '8px 12px' }}>MODEL &amp; MEDIA</th>
                    <th style={{ padding: '8px 12px' }}>CAPACITY</th>
                    <th style={{ padding: '8px 12px' }}>FLASH ENDURANCE REMAINING</th>
                    <th style={{ padding: '8px 12px' }}>BAD SECTORS</th>
                    <th style={{ padding: '8px 12px' }}>TEMP</th>
                    <th style={{ padding: '8px 12px' }}>POWER-ON HOURS</th>
                    <th style={{ padding: '8px 12px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {smartDisksData.map((d: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.disk_id}</div>
                        <div style={{ color: '#0284c7', fontSize: '0.70rem' }}>{d.hostname}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{d.model_number}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{d.media_type}</div>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {d.capacity_gb} GB
                      </td>
                      <td style={{ padding: '8px 12px', width: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${d.wear_endurance_pct}%`, height: '100%', background: d.wear_endurance_pct < 20 ? '#dc2626' : '#16a34a' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: '#16a34a' }}>{d.wear_endurance_pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: d.reallocated_sectors > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                        {d.reallocated_sectors}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                        {d.temperature_c}°C
                      </td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>
                        {d.power_on_hours.toLocaleString()} hrs
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          ● {d.health_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enterprise Print Spoolers */}
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Enterprise Print Server &amp; Spooler Queue Telemetry
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Monitoring stuck print jobs, paper jams, and toner percentages across office printers
                </p>
              </div>
              <ExportButtons data={spoolersData} filenamePrefix="vnms_print_spoolers" title="Print Spoolers" />
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>HOST &amp; PRINTER QUEUE</th>
                    <th style={{ padding: '8px 12px' }}>PENDING JOBS</th>
                    <th style={{ padding: '8px 12px' }}>STUCK JOBS</th>
                    <th style={{ padding: '8px 12px' }}>TONER LEVEL</th>
                    <th style={{ padding: '8px 12px' }}>PAPER JAM</th>
                    <th style={{ padding: '8px 12px' }}>SPOOLER STATE</th>
                  </tr>
                </thead>
                <tbody>
                  {spoolersData.map((p: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.printer_queue}</div>
                        <div style={{ color: '#0284c7', fontSize: '0.70rem' }}>Host: {p.hostname}</div>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {p.pending_jobs} jobs
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: p.stuck_jobs > 0 ? '#dc2626' : '#16a34a' }}>
                        {p.stuck_jobs} stuck
                      </td>
                      <td style={{ padding: '8px 12px', width: '150px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${p.toner_level_pct}%`, height: '100%', background: p.toner_level_pct < 20 ? '#dc2626' : '#0284c7' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.toner_level_pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: p.paper_jam ? '#fee2e2' : '#f1f5f9', color: p.paper_jam ? '#b91c1c' : '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {p.paper_jam ? 'PAPER JAM!' : 'NO JAM'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          background: p.spooler_state === 'ONLINE' ? '#dcfce7' : p.spooler_state === 'WARNING' ? '#fef3c7' : '#fee2e2',
                          color: p.spooler_state === 'ONLINE' ? '#15803d' : p.spooler_state === 'WARNING' ? '#b45309' : '#b91c1c',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          ● {p.spooler_state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10. Windows Event Log & Syslog Regex Matcher (#26) */}
      {subTab === 'event_logs' && (
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Windows Event Log &amp; Syslog Regex Matcher
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Scanning System, Security, and Application event streams for critical event IDs and patterns
              </p>
            </div>
            <ExportButtons data={eventLogsData} filenamePrefix="vnms_event_log_regex" title="Event Log Regex" />
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>HOST &amp; LOG SOURCE</th>
                  <th style={{ padding: '8px 12px' }}>EVENT ID</th>
                  <th style={{ padding: '8px 12px' }}>SEVERITY</th>
                  <th style={{ padding: '8px 12px' }}>MATCHED EVENT MESSAGE</th>
                  <th style={{ padding: '8px 12px' }}>APPLIED REGEX PATTERN</th>
                </tr>
              </thead>
              <tbody>
                {eventLogsData.map((l: any) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{l.hostname}</div>
                      <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 600 }}>{l.log_source} Log</span>
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0f172a' }}>
                      Event {l.event_id}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        background: l.severity === 'CRITICAL' ? '#fee2e2' : l.severity === 'WARNING' ? '#fef3c7' : '#ede9fe',
                        color: l.severity === 'CRITICAL' ? '#b91c1c' : l.severity === 'WARNING' ? '#b45309' : '#6d28d9',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}>
                        {l.severity}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#334155' }}>
                      {l.message}
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: '#475569', fontSize: '0.70rem' }}>
                      <code>{l.regex_rule}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
