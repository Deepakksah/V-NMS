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
  RotateCcw,
  Eye,
  FileCode,
  Layers
} from 'lucide-react';
import {
  MOCK_SENSORS,
  MOCK_PROCESSORS,
  MOCK_MEMPOOLS,
  MOCK_STORAGE,
  MOCK_DISK_IO
} from '../../data/mockEnterpriseData';
import { ExportButtons } from '../../components/ExportButtons';
import { PageHeader } from '../../components/PageHeader';

interface SensorsViewProps {
  apiBase?: string;
}

export const SensorsView: React.FC<SensorsViewProps> = ({ apiBase = '/api/v1' }) => {
  const [subTab, setSubTab] = useState<
    'storage' | 'disk_io' | 'nvidia_gpu' | 'chassis_sensors' | 'ipmi' | 'daemons' | 'compliance' | 'smart_nvme' | 'event_logs' | 'sensors' | 'processors' | 'mempools' | 'mibs_catalog'
  >('storage');
  const [storageData, setStorageData] = useState<any[]>(MOCK_STORAGE);
  const [diskData, setDiskData] = useState<any[]>(MOCK_DISK_IO);
  const [ipmiData, setIpmiData] = useState<any[]>([]);
  const [daemonsData, setDaemonsData] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [smartDisksData, setSmartDisksData] = useState<any[]>([]);
  const [eventLogsData, setEventLogsData] = useState<any[]>([]);
  const [spoolersData, setSpoolersData] = useState<any[]>([]);
  const [gpuClusterData, setGpuClusterData] = useState<any[]>([]);
  const [chassisData, setChassisData] = useState<any[]>([]);
  const [mibsCatalog, setMibsCatalog] = useState<any[]>([]);
  const [mibsSearch, setMibsSearch] = useState<string>('');
  const [selectedMibRaw, setSelectedMibRaw] = useState<{ name: string; content: string } | null>(null);
  const [monitorsCatalog, setMonitorsCatalog] = useState<any[]>([]);
  const [monitorsSearch, setMonitorsSearch] = useState<string>('');
  const [mibsActiveView, setMibsActiveView] = useState<'mibs' | 'monitors'>('mibs');
  const [isLive, setIsLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  // Default all servers to minimized (collapsed) per user requirement
  const [expandedServers, setExpandedServers] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchStorageAndDisks = async () => {
      try {
        const [resStorage, resDisks, resIpmi, resDaemons, resComp, resSmart, resLogs, resSpool, resGpu, resChassis] = await Promise.allSettled([
          axios.get(`${apiBase}/storage`, { timeout: 4000 }),
          axios.get(`${apiBase}/disks`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/ipmi`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/daemons`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/ad-updates`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/smart-disks`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/event-logs`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/spoolers`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/gpu-cluster`, { timeout: 4000 }),
          axios.get(`${apiBase}/hardware/chassis-sensors`, { timeout: 4000 })
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
        if (resGpu.status === 'fulfilled' && resGpu.value.data?.gpu_cluster) {
          setGpuClusterData(resGpu.value.data.gpu_cluster);
        }
        if (resChassis.status === 'fulfilled' && resChassis.value.data?.chassis_sensors) {
          setChassisData(resChassis.value.data.chassis_sensors);
        }
      } catch {
        // Fallback to enterprise defaults
      }
    };

    fetchStorageAndDisks();
  }, [apiBase]);

  useEffect(() => {
    if (subTab === 'mibs_catalog') {
      axios.get(`${apiBase}/mibs/catalog`)
        .then(res => { if (res.data?.mibs) setMibsCatalog(res.data.mibs); })
        .catch(() => { });
      axios.get(`${apiBase}/discovery/monitors?limit=60`)
        .then(res => { if (res.data?.monitors) setMonitorsCatalog(res.data.monitors); })
        .catch(() => { });
    }
  }, [subTab, apiBase]);

  const handleSearchMonitors = (q: string) => {
    setMonitorsSearch(q);
    axios.get(`${apiBase}/discovery/monitors?q=${encodeURIComponent(q)}&limit=60`)
      .then(res => { if (res.data?.monitors) setMonitorsCatalog(res.data.monitors); })
      .catch(() => { });
  };

  const handleViewMib = (name: string) => {
    axios.get(`${apiBase}/mibs/raw/${encodeURIComponent(name)}`)
      .then(res => {
        setSelectedMibRaw({ name, content: res.data?.content || '' });
      })
      .catch(() => {
        setSelectedMibRaw({ name, content: `-- MIB file definition for ${name}\n-- Stored natively in V-NMS repository.` });
      });
  };

  // Group storage records by Server so server name appears ONCE with all its drives underneath
  const groupedStorage = useMemo(() => {
    const groups: {
      [key: string]: {
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
      }
    } = {};

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
      {/* Enterprise Dark NOC Header */}
      <PageHeader
        icon={Cpu}
        title="Sensors, Metrics & Storage Architecture"
        subtitle="Physical drive health (HDD/SSD/RAID), logical volumes, filesystem mount points, and environmental telemetry"
        badge={isLive ? '● Telemetry Poller Active' : 'Catalog Models #26 - #35'}
        badgeColor={isLive ? 'emerald' : 'blue'}
        actions={
          <ExportButtons data={storageData} filenamePrefix="vnms_storage_sensors" title="Storage & Sensors" />
        }
      />

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'storage', label: 'Disks & Partitions (#33)', icon: HardDrive, count: storageData.length },
          { id: 'disk_io', label: 'Physical Drives & IOPS (#34, #35)', icon: TrendingUp, count: diskData.length },
          { id: 'nvidia_gpu', label: 'NVIDIA GPU Cluster (#18.1)', icon: Cpu, count: gpuClusterData.length || 4 },
          { id: 'chassis_sensors', label: 'Chassis & Switches (#18.2)', icon: Server, count: chassisData.length || 3 },
          { id: 'ipmi', label: 'Out-of-Band IPMI & BMC (#21, #22)', icon: Zap, count: ipmiData.length },
          { id: 'daemons', label: 'Services & Daemons (#25, #27, #28)', icon: Activity, count: daemonsData.length },
          { id: 'compliance', label: 'Patch & AD Health (#23, #24)', icon: Shield, count: complianceData.length },
          { id: 'smart_nvme', label: 'NVMe SMART & Spoolers (#29, #30)', icon: HardDrive, count: smartDisksData.length },
          { id: 'mibs_catalog', label: '116 MIBs & 4,300+ OIDs (#18.8, #18.9)', icon: Layers, count: (mibsCatalog.length || 116) },
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

      {/* 4. NVIDIA Enterprise GPU Cluster Telemetry (Point 18.1) */}
      {subTab === 'nvidia_gpu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '16px 20px', borderRadius: '12px', color: '#ffffff' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#10b981', color: '#064e3b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.70rem', fontWeight: 800 }}>
                  NVIDIA ENTERPRISE CLUSTER
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CLI Telemetry (nvidia-smi parser) • CUDA 12.4</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                High-Performance Compute &amp; AI Accelerator Fleet
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                Real-time GPU core compute load, VRAM allocations, thermal junctions, and power envelope draw
              </p>
            </div>
            <ExportButtons data={gpuClusterData.length ? gpuClusterData : [
              { id: 'gpu-0', model: 'NVIDIA A100-SXM4-80GB', gpu_util_pct: 84.5, temp: 67, vram_used: 68400, vram_total: 81920 }
            ]} filenamePrefix="vnms_nvidia_gpu_cluster" title="NVIDIA GPU Cluster" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
            {(gpuClusterData.length ? gpuClusterData : [
              {
                id: 'gpu-0', hostname: 'ai-cluster-node-01 (172.168.1.18)', model: 'NVIDIA A100-SXM4-80GB',
                pcie_bus_id: '0000:01:00.0', gpu_util_pct: 84.5, memory_used_mb: 68400, memory_total_mb: 81920,
                temperature_c: 67, fan_speed_pct: 74, power_draw_watts: 320.4, power_limit_watts: 400.0,
                gpu_clock_mhz: 1410, mem_clock_mhz: 1215, compute_mode: 'Default (Shared)', persistence_mode: true,
                driver_version: '550.54.14 / CUDA 12.4'
              },
              {
                id: 'gpu-1', hostname: 'ai-cluster-node-01 (172.168.1.18)', model: 'NVIDIA A100-SXM4-80GB',
                pcie_bus_id: '0000:02:00.0', gpu_util_pct: 91.2, memory_used_mb: 74200, memory_total_mb: 81920,
                temperature_c: 72, fan_speed_pct: 82, power_draw_watts: 368.1, power_limit_watts: 400.0,
                gpu_clock_mhz: 1410, mem_clock_mhz: 1215, compute_mode: 'Default (Shared)', persistence_mode: true,
                driver_version: '550.54.14 / CUDA 12.4'
              },
              {
                id: 'gpu-0', hostname: 'inference-srv-02 (172.168.1.19)', model: 'NVIDIA RTX 4090 Enterprise 24GB',
                pcie_bus_id: '0000:41:00.0', gpu_util_pct: 42.0, memory_used_mb: 11200, memory_total_mb: 24576,
                temperature_c: 54, fan_speed_pct: 45, power_draw_watts: 185.0, power_limit_watts: 450.0,
                gpu_clock_mhz: 2520, mem_clock_mhz: 1313, compute_mode: 'Exclusive Process', persistence_mode: true,
                driver_version: '550.54.14 / CUDA 12.4'
              },
              {
                id: 'gpu-0', hostname: 'hpc-trainer-03 (172.168.1.20)', model: 'NVIDIA H100 80GB HBM3 PCIe',
                pcie_bus_id: '0000:81:00.0', gpu_util_pct: 96.8, memory_used_mb: 78900, memory_total_mb: 81920,
                temperature_c: 78, fan_speed_pct: 88, power_draw_watts: 620.5, power_limit_watts: 700.0,
                gpu_clock_mhz: 1980, mem_clock_mhz: 2619, compute_mode: 'Default (Shared)', persistence_mode: true,
                driver_version: '550.54.14 / CUDA 12.4'
              }
            ]).map((gpu: any, idx: number) => {
              const vramPct = Math.round((gpu.memory_used_mb / gpu.memory_total_mb) * 100);
              const powerPct = Math.round((gpu.power_draw_watts / gpu.power_limit_watts) * 100);
              const tempColor = gpu.temperature_c >= 80 ? '#ef4444' : gpu.temperature_c >= 68 ? '#f59e0b' : '#10b981';
              return (
                <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#0f172a', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                          {gpu.id.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.70rem', color: '#64748b' }}>{gpu.pcie_bus_id}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '3px 0 1px 0' }}>{gpu.model}</h4>
                      <p style={{ fontSize: '0.72rem', color: '#475569' }}>{gpu.hostname}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: `${tempColor}15`, color: tempColor, fontWeight: 800, fontSize: '0.78rem' }}>
                        <Thermometer size={14} /> {gpu.temperature_c}°C
                      </span>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>Fan: {gpu.fan_speed_pct}%</div>
                    </div>
                  </div>

                  {/* Compute Utilization Bar */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px' }}>
                      <span style={{ color: '#0f172a' }}>GPU Core Load</span>
                      <span style={{ color: gpu.gpu_util_pct >= 90 ? '#ef4444' : '#0284c7' }}>{gpu.gpu_util_pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${gpu.gpu_util_pct}%`, height: '100%', background: gpu.gpu_util_pct >= 90 ? '#ef4444' : '#0284c7', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* VRAM Memory Allocation */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px' }}>
                      <span style={{ color: '#0f172a' }}>VRAM Allocation</span>
                      <span style={{ color: '#64748b' }}>{(gpu.memory_used_mb / 1024).toFixed(1)} GB / {(gpu.memory_total_mb / 1024).toFixed(0)} GB ({vramPct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${vramPct}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Power Draw vs Limit */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px' }}>
                      <span style={{ color: '#0f172a' }}>TDP Power Envelope</span>
                      <span style={{ color: '#475569' }}>{gpu.power_draw_watts}W / {gpu.power_limit_watts}W ({powerPct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${powerPct}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Footer Clocks and Mode */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', fontSize: '0.70rem', color: '#475569' }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>CORE CLOCK</div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{gpu.gpu_clock_mhz} MHz</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>MEM CLOCK</div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{gpu.mem_clock_mhz} MHz</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>COMPUTE MODE</div>
                      <div style={{ fontWeight: 700, color: '#0284c7' }}>{gpu.compute_mode.split(' ')[0]}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Enterprise Chassis & Switch Telemetry (Point 18.2) */}
      {subTab === 'chassis_sensors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '16px 20px', borderRadius: '12px', color: '#ffffff' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#3b82f6', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.70rem', fontWeight: 800 }}>
                  CHASSIS TELEMETRY
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lenovo XCC &amp; Dell DNOS Switch MIB Mappings</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                Modular Chassis, Switch Fabric &amp; Power Subsystems
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                Redundant A/B power supplies, dual-rotor fan trays, CPU voltage regulators, and thermal deltas
              </p>
            </div>
            <ExportButtons data={chassisData.length ? chassisData : [
              { id: 'dnos-1', vendor_chassis: 'Dell Networking S5248F-ON', memory_formula_pct: 48.6 }
            ]} filenamePrefix="vnms_chassis_sensors" title="Chassis & Switch Telemetry" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
            {(chassisData.length ? chassisData : [
              {
                id: 'dnos-sw-01', hostname: 'core-sw-01 (172.168.1.10)', vendor_chassis: 'Dell Networking S5248F-ON',
                chassis_type: 'Top-of-Rack 25GbE/100GbE Switch', memory_formula_pct: 48.6,
                power_supply_1: 'HEALTHY (AC 240V / 380W Online)', power_supply_2: 'HEALTHY (AC 240V / Redundant Online)',
                fan_tray_status: 'ALL_NORMAL (6x Fan Trays @ 9,400 RPM)', chassis_temp_inlet_c: 22.4, chassis_temp_exhaust_c: 36.8,
                raid_drive_health: 'N/A (Switch Flash eMMC)', cpu_voltage_v: 1.15, flash_storage_pct: 32.5
              },
              {
                id: 'xcc-lenovo-02', hostname: 'compute-lenovo-02 (172.168.1.16)', vendor_chassis: 'Lenovo ThinkSystem SR650 V2',
                chassis_type: 'Dual-Socket Xeon Scalable 2U Node', memory_formula_pct: 64.2,
                power_supply_1: 'HEALTHY (Platinum 1100W Active)', power_supply_2: 'HEALTHY (Platinum 1100W Redundant)',
                fan_tray_status: 'NORMAL (6x Hot-swap Fans @ 6,200 RPM)', chassis_temp_inlet_c: 20.8, chassis_temp_exhaust_c: 34.1,
                raid_drive_health: 'OPTIMAL (RAID-10 8x SAS 2.4TB 10K)', cpu_voltage_v: 1.22, flash_storage_pct: 18.2
              },
              {
                id: 'ucs-blade-chassis', hostname: 'cisco-ucs-chassis (172.168.1.14)', vendor_chassis: 'Cisco UCS 5108 Blade Chassis',
                chassis_type: '8-Blade Modular Enclosure', memory_formula_pct: 58.0,
                power_supply_1: 'HEALTHY (4x 2500W Platinum Grid-A)', power_supply_2: 'HEALTHY (4x 2500W Platinum Grid-B)',
                fan_tray_status: 'OPTIMAL (8x Dual-Rotor Fans @ 8,100 RPM)', chassis_temp_inlet_c: 21.0, chassis_temp_exhaust_c: 38.5,
                raid_drive_health: 'OPTIMAL (SAN Boot LUN Mapped)', cpu_voltage_v: 1.20, flash_storage_pct: 24.0
              }
            ]).map((ch: any, idx: number) => (
              <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af' }}>
                      {ch.chassis_type}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 1px 0' }}>{ch.vendor_chassis}</h4>
                    <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{ch.hostname}</p>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.72rem' }}>
                    <CheckCircle2 size={13} /> {ch.raid_drive_health.split(' ')[0]}
                  </span>
                </div>

                {/* Power Supply A/B Feeds */}
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Dual Redundant Power Feeds</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>PSU 1 (Feed A):</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>{ch.power_supply_1}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>PSU 2 (Feed B):</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>{ch.power_supply_2}</span>
                  </div>
                </div>

                {/* Thermal and Voltage Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: '#1e40af', fontWeight: 700 }}>CHASSIS INLET</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a' }}>{ch.chassis_temp_inlet_c}°C</div>
                  </div>
                  <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: '#92400e', fontWeight: 700 }}>EXHAUST PLENUM</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#78350f' }}>{ch.chassis_temp_exhaust_c}°C</div>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 700 }}>CPU REGULATOR</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{ch.cpu_voltage_v} V</div>
                  </div>
                </div>

                {/* Fans & Flash status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.72rem', color: '#64748b' }}>
                  <span>{ch.fan_tray_status}</span>
                  <span>Flash Used: <strong>{ch.flash_storage_pct}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 13. Standard Enterprise MIBs & Telemetry OIDs Catalog (#18.8, #18.9) */}
      {subTab === 'mibs_catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Card */}
          <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '12px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.70rem', fontWeight: 800 }}>
                  V-NMS ENTERPRISE MIB &amp; OID ENGINE
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>116 Standard MIBs &bull; 4,306 Multi-Vendor Telemetry OIDs</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                Hardware Telemetry MIBs &amp; Metric Profiles
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                Native embedded enterprise MIB definitions and indexed telemetry OIDs for Cisco, Dell, HP, Fortinet, Palo Alto, Aruba, and RFC standards.
              </p>
            </div>

            {/* View Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.08)', padding: '4px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setMibsActiveView('mibs')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: mibsActiveView === 'mibs' ? '#0284c7' : 'transparent',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                116 Standard MIBs
              </button>
              <button
                type="button"
                onClick={() => setMibsActiveView('monitors')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: mibsActiveView === 'monitors' ? '#0284c7' : 'transparent',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                4,306 Telemetry OIDs
              </button>
            </div>
          </div>

          {/* View 1: 116 Standard MIB Files */}
          {mibsActiveView === 'mibs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Standard Enterprise MIB Files ({mibsCatalog.length || 116} Files Available)
                </span>
                <input
                  type="text"
                  placeholder="Filter MIBs (Cisco, Aruba, BGP, Host)..."
                  value={mibsSearch}
                  onChange={e => setMibsSearch(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    width: '260px'
                  }}
                />
              </div>

              {/* Raw MIB Inspector Drawer if selected */}
              {selectedMibRaw && (
                <div style={{ background: '#090d16', border: '1px solid #334155', borderRadius: '10px', padding: '16px', color: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCode size={16} color="#38bdf8" />
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: '#38bdf8' }}>
                        {selectedMibRaw.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMibRaw(null)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #475569',
                        background: '#1e293b',
                        color: '#f8fafc',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      Close Viewer ✕
                    </button>
                  </div>
                  <pre style={{
                    maxHeight: '260px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.72rem',
                    lineHeight: '1.4',
                    color: '#94a3b8',
                    background: '#020617',
                    padding: '12px',
                    borderRadius: '6px',
                    margin: 0
                  }}>
                    {selectedMibRaw.content}
                  </pre>
                </div>
              )}

              {/* Grid of MIB Files */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {(mibsCatalog.length > 0 ? mibsCatalog : [
                  { name: 'APPLICATION-MIB', size: 38400, category: 'Core Networking', vendor: 'Standard / IETF' },
                  { name: 'ARUBA-MIB', size: 142000, category: 'Wireless / Mobility', vendor: 'Aruba Networks' },
                  { name: 'BGP4-MIB', size: 28900, category: 'Dynamic Routing', vendor: 'IETF RFC Standard' },
                  { name: 'CISCO-CDP-MIB', size: 45200, category: 'Switching / Routing', vendor: 'Cisco Systems' },
                  { name: 'CISCO-ENVMON-MIB', size: 31000, category: 'Switching / Routing', vendor: 'Cisco Systems' },
                  { name: 'CISCO-MEMORY-POOL-MIB', size: 24500, category: 'Switching / Routing', vendor: 'Cisco Systems' },
                  { name: 'DELL-NETWORKING-MIB', size: 68000, category: 'Server Hardware', vendor: 'Dell / Advantech' },
                  { name: 'HOST-RESOURCES-MIB', size: 52100, category: 'Host / Systems', vendor: 'IETF RFC Standard' },
                  { name: 'IF-MIB', size: 84000, category: 'Core Networking', vendor: 'Standard / IETF' },
                  { name: 'RFC1213-MIB', size: 79200, category: 'Core Networking', vendor: 'Standard / IETF' }
                ])
                  .filter((m: any) => !mibsSearch || m.name.toLowerCase().includes(mibsSearch.toLowerCase()) || m.vendor.toLowerCase().includes(mibsSearch.toLowerCase()))
                  .map((mib: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.66rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8' }}>
                            {mib.vendor}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                            {(mib.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', wordBreak: 'break-all' }}>
                          {mib.name}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '3px' }}>
                          {mib.category}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewMib(mib.name)}
                        style={{
                          marginTop: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#0f172a',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={13} />
                        <span>Inspect MIB</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* View 2: 4,306 Telemetry Metrics & OIDs Table */}
          {mibsActiveView === 'monitors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Hardware Performance Telemetry Metrics (4,306 Pre-Configured OIDs)
                </span>
                <input
                  type="text"
                  placeholder="Search OID, metric or vendor (e.g. BGP, CPU, Cisco, Fortinet)..."
                  value={monitorsSearch}
                  onChange={e => handleSearchMonitors(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    width: '320px'
                  }}
                />
              </div>

              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Metric / Sensor Name</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Telemetry SNMP OID</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Vendor</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Protocol</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Engineering Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(monitorsCatalog.length > 0 ? monitorsCatalog : [
                      { name: 'BGP Peer In Updates', oid: '.1.3.6.1.2.1.15.3.1.10', vendor: 'IETF Standard', protocol: 'SNMP', unit: 'In Updates' },
                      { name: 'panSysHAState', oid: '.1.3.6.1.4.1.25461.2.1.2.1.11.0', vendor: 'Palo Alto Networks', protocol: 'SNMP', unit: 'State' },
                      { name: 'GP Gateway Utilization', oid: '.1.3.6.1.4.1.25461.2.1.2.5.1.1.0', vendor: 'Palo Alto Networks', protocol: 'SNMP', unit: '%' },
                      { name: 'ciscoMemoryPoolUtil', oid: '.1.3.6.1.4.1.9.9.48.1.1.1.5', vendor: 'Cisco Systems', protocol: 'SNMP', unit: '%' },
                      { name: 'fnSysCpuUsage', oid: '.1.3.6.1.4.1.12356.101.4.1.3.0', vendor: 'Fortinet', protocol: 'SNMP', unit: '%' }
                    ]).map((mon: any, mIdx: number) => (
                      <tr key={mIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                          {mon.name}
                          {mon.description && (
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>{mon.description}</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#0369a1', fontWeight: 600 }}>
                          <span style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 6px', borderRadius: '4px' }}>
                            {mon.oid}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#334155' }}>
                            {mon.vendor}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748b', fontWeight: 600 }}>
                          {mon.protocol || 'SNMP'}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 700 }}>
                          {mon.unit || 'Numeric'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
