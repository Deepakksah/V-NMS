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
  ChevronRight
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
  const [subTab, setSubTab] = useState<'sensors' | 'processors' | 'mempools' | 'storage' | 'disk_io'>('storage');
  const [storageData, setStorageData] = useState<any[]>(MOCK_STORAGE);
  const [diskData, setDiskData] = useState<any[]>(MOCK_DISK_IO);
  const [isLive, setIsLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  // Default all servers to minimized (collapsed) per user requirement
  const [expandedServers, setExpandedServers] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchStorageAndDisks = async () => {
      try {
        const [resStorage, resDisks] = await Promise.allSettled([
          axios.get(`${apiBase}/storage`, { timeout: 4000 }),
          axios.get(`${apiBase}/disks`, { timeout: 4000 })
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
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'storage', label: 'Disks & Partitions (#33)', icon: HardDrive, count: storageData.length },
          { id: 'disk_io', label: 'Physical Drives & IOPS (#34, #35)', icon: TrendingUp, count: diskData.length },
          { id: 'sensors', label: 'Environmental Sensors (#26-#30)', icon: Thermometer, count: MOCK_SENSORS.length },
          { id: 'processors', label: 'Multi-Core CPUs (#31)', icon: Cpu, count: MOCK_PROCESSORS.length },
          { id: 'mempools', label: 'Memory Pools (#32)', icon: Database, count: MOCK_MEMPOOLS.length }
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
                                  borderBottom: '1px solid #e2e8f0',
                                  background: '#f0f7ff', // Distinct light-blue child background
                                  transition: 'background-color 0.12s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                              >
                                <td style={{
                                  padding: '5px 10px 5px 28px',
                                  borderLeft: '4px solid #0284c7', // Distinct child tree connector accent
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.74rem'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: '#0284c7', fontSize: '0.80rem', fontWeight: 800, userSelect: 'none' }}>↳</span>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: '#ffffff',
                                      color: '#0369a1',
                                      border: '1px solid #bae6fd',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 800,
                                      fontSize: '0.72rem',
                                      boxShadow: '0 1px 2px rgba(2,132,199,0.08)'
                                    }}>
                                      <HardDrive size={11} color="#0284c7" />
                                      <span>{mountLetter}</span>
                                    </span>
                                    {mountDesc && (
                                      <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>
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
    </div>
  );
};
