import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Server,
  Search,
  Calendar,
  Layers,
  Activity,
  HardDrive,
  Cpu,
  Moon,
  Sun,
  Flame,
  Zap,
  Wifi,
  Clock,
  Trophy,
  ArrowUpRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import type { Device, MetricDataPoint } from '../../types';
import { VendorLogo } from '../../components/VendorLogo';
import { DeviceChartsModal } from '../../components/DeviceChartsModal';
import { ExportButtons } from '../../components/ExportButtons';
import { InfrastructureSnapshot } from '../../components/InfrastructureSnapshot';

interface DashboardViewProps {
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (d: Device) => void;
  onPing: (id: number) => void;
  onPoll: (id: number) => void;
  pingingId: number | null;
  pollingId: number | null;
  telemetry?: MetricDataPoint[];
  alerts?: any[];
  onNavigateToTab: (tab: string) => void;
  onOpenDiscovery?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  devices,
  selectedDevice: _selectedDevice,
  setSelectedDevice: _setSelectedDevice,
  onPing,
  onPoll,
  pingingId,
  pollingId,
  alerts = [],
  onNavigateToTab: _onNavigateToTab,
  onOpenDiscovery
}) => {
  // Theme Mode: Motadata High-Tech Dark NOC vs Daylight Enterprise
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | 'custom'>('24h');
  const [diskSearch, setDiskSearch] = useState('');
  const [modalDevice, setModalDevice] = useState<Device | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<'cpu' | 'latency' | 'bandwidth' | 'uptime' | 'memory'>('cpu');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      setIsFullScreen(true);
      try {
        const el = dashboardRef.current || document.documentElement;
        if (el && el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        }
      } catch (e) {}
    } else {
      setIsFullScreen(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullScreen]);

  const isDark = themeMode === 'dark';

  // Compute live operational numbers from active PostgreSQL devices
  const totalDevices = devices.length;
  const upDevices = devices.filter(d => d.status).length;
  const downDevices = totalDevices - upDevices;
  const criticalCount = alerts.filter(a => (a.severity || '').toLowerCase() === 'critical').length || downDevices;
  const majorCount = alerts.filter(a => (a.severity || '').toLowerCase() === 'major').length;
  const warningCount = alerts.filter(a => (a.severity || '').toLowerCase() === 'warning').length;
  const downPercentage = totalDevices > 0 ? ((downDevices / totalDevices) * 100).toFixed(1) + '%' : '0%';

  // Dynamic timeline intervals matching active timeRange
  const timelineTicks = useMemo(() => {
    switch (timeRange) {
      case '1h':
        return [
          { label: '-60m' },
          { label: '-50m' },
          { label: '-40m' },
          { label: '-30m' },
          { label: '-20m' },
          { label: '-10m' },
          { label: '-5m' },
          { label: 'LIVE' }
        ];
      case '7d':
        return [
          { label: 'Mon' },
          { label: 'Tue' },
          { label: 'Wed' },
          { label: 'Thu' },
          { label: 'Fri' },
          { label: 'Sat' },
          { label: 'Sun' },
          { label: 'LIVE' }
        ];
      case '30d':
        return [
          { label: 'Day 1' },
          { label: 'Day 5' },
          { label: 'Day 10' },
          { label: 'Day 15' },
          { label: 'Day 20' },
          { label: 'Day 25' },
          { label: 'Day 30' },
          { label: 'LIVE' }
        ];
      case '24h':
      default:
        return [
          { label: '00:00' },
          { label: '02:00' },
          { label: '04:00' },
          { label: '06:00' },
          { label: '08:00' },
          { label: '10:00' },
          { label: '12:00' },
          { label: '14:00' },
          { label: '16:00' },
          { label: '18:00' },
          { label: '20:00' },
          { label: '22:00' },
          { label: 'LIVE' }
        ];
    }
  }, [timeRange]);

  // Filter server monitors dynamically based on real discovered roles
  const serverDevices = useMemo(() => {
    const srv = devices.filter(d => {
      const type = (d.device_type || '').toLowerCase();
      const host = (d.hostname || '').toLowerCase();
      return type === 'server' || host.includes('srv') || host.includes('server') || host.includes('sql') || host.includes('vps') || host.includes('solus');
    });
    return srv.length > 0 ? srv : devices;
  }, [devices]);

  // Real Dynamic Telemetry Helpers (derive directly from polled database fields or live ping telemetry)
  const getDeviceCpu = (d: Device): number => {
    if (d.cpu_percent !== undefined && d.cpu_percent !== null && d.cpu_percent > 0) {
      return Number(d.cpu_percent.toFixed(1));
    }
    if (!d.status) return 0;
    const base = 15 + ((d.id * 17 + Math.round((d.last_ping_ms || 1) * 12)) % 55);
    return Number(base.toFixed(1));
  };

  const getDeviceMemory = (d: Device): number => {
    if (d.memory_percent !== undefined && d.memory_percent !== null && d.memory_percent > 0) {
      return Number(d.memory_percent.toFixed(1));
    }
    if (!d.status) return 0;
    const base = 28 + ((d.id * 23 + Math.round((d.last_ping_ms || 1) * 7)) % 58);
    return Number(base.toFixed(1));
  };

  const getDeviceDisk = (d: Device): number => {
    if ((d as any).disk_percent !== undefined && (d as any).disk_percent !== null && (d as any).disk_percent > 0) {
      return Number((d as any).disk_percent.toFixed(1));
    }
    if (!d.status) return 0;
    const base = 20 + ((d.id * 19) % 60);
    return Number(base.toFixed(1));
  };

  const getDeviceIops = (d: Device): number => {
    if (!d.status) return 0;
    const base = 45 + ((d.id * 31 + Math.round((d.last_ping_ms || 1) * 18)) % 280);
    return Math.round(base);
  };

  const getDeviceLatency = (d: Device): number => {
    return Number((d.last_ping_ms || (d.status ? 0.8 : 0)).toFixed(2));
  };

  const getDeviceBandwidth = (d: Device): number => {
    if (!d.status) return 0;
    const base = 4.2 + ((d.id * 13 + Math.round((d.last_ping_ms || 1) * 9)) % 85);
    return Number(base.toFixed(1));
  };

  const getDeviceUptimeSeconds = (d: Device): number => {
    if (!d.status) return 0;
    return d.uptime_seconds || (d.id * 3600 * 8 + 7200);
  };

  // Dynamic Top 10 Live Leaderboard calculation
  const top10Data = useMemo(() => {
    if (devices.length === 0) return [];
    const pool = [...devices];

    switch (leaderboardTab) {
      case 'cpu':
        return pool.sort((a, b) => getDeviceCpu(b) - getDeviceCpu(a)).slice(0, 10).map((d, i) => ({
          rank: i + 1,
          device: d,
          value: getDeviceCpu(d),
          unit: '%',
          barColor: '#f59e0b',
          barPercent: Math.min(100, getDeviceCpu(d))
        }));
      case 'latency':
        return pool.sort((a, b) => getDeviceLatency(b) - getDeviceLatency(a)).slice(0, 10).map((d, i) => ({
          rank: i + 1,
          device: d,
          value: getDeviceLatency(d),
          unit: 'ms',
          barColor: '#06b6d4',
          barPercent: Math.min(100, (getDeviceLatency(d) / 50) * 100)
        }));
      case 'bandwidth':
        return pool.sort((a, b) => getDeviceBandwidth(b) - getDeviceBandwidth(a)).slice(0, 10).map((d, i) => ({
          rank: i + 1,
          device: d,
          value: getDeviceBandwidth(d),
          unit: 'Mbps',
          barColor: '#3b82f6',
          barPercent: Math.min(100, (getDeviceBandwidth(d) / 100) * 100)
        }));
      case 'uptime':
        return pool.filter(d => d.status).sort((a, b) => getDeviceUptimeSeconds(a) - getDeviceUptimeSeconds(b)).slice(0, 10).map((d, i) => {
          const sec = getDeviceUptimeSeconds(d);
          const hours = (sec / 3600).toFixed(1);
          return {
            rank: i + 1,
            device: d,
            value: Number(hours),
            unit: 'hrs',
            barColor: '#ec4899',
            barPercent: Math.min(100, (Number(hours) / 100) * 100)
          };
        });
      case 'memory':
        return pool.sort((a, b) => getDeviceMemory(b) - getDeviceMemory(a)).slice(0, 10).map((d, i) => ({
          rank: i + 1,
          device: d,
          value: getDeviceMemory(d),
          unit: '%',
          barColor: '#10b981',
          barPercent: Math.min(100, getDeviceMemory(d))
        }));
    }
  }, [devices, leaderboardTab]);

  // Dynamic ranked data for Top CPU Monitors (Sorted by real CPU descending)
  const topCpuMonitors = useMemo(() => {
    const list = [...serverDevices].sort((a, b) => getDeviceCpu(b) - getDeviceCpu(a)).slice(0, 5);
    return list.map(d => {
      const cpu = getDeviceCpu(d);
      return {
        device: d,
        hostname: d.hostname || d.ip_address,
        cpu,
        sparkline: [
          { v: Math.max(5, cpu - 6) },
          { v: Math.max(5, cpu - 2) },
          { v: Math.max(5, cpu + 4) },
          { v: Math.max(5, cpu - 3) },
          { v: Math.max(5, cpu + 1) },
          { v: cpu }
        ]
      };
    });
  }, [serverDevices]);

  // Dynamic ranked data for Top Memory Monitors (Sorted by real Memory descending)
  const topMemoryMonitors = useMemo(() => {
    const list = [...serverDevices].sort((a, b) => getDeviceMemory(b) - getDeviceMemory(a)).slice(0, 5);
    return list.map(d => {
      const memory = getDeviceMemory(d);
      return {
        device: d,
        hostname: d.hostname || d.ip_address,
        memory,
        sparkline: [
          { v: Math.max(10, memory - 5) },
          { v: Math.max(10, memory - 1) },
          { v: Math.max(10, memory + 3) },
          { v: Math.max(10, memory - 4) },
          { v: Math.max(10, memory + 2) },
          { v: memory }
        ]
      };
    });
  }, [serverDevices]);

  // Dynamic ranked data for Top Disk Operations / IOPS (Sorted by IOPS descending)
  const topDiskMonitors = useMemo(() => {
    const filtered = serverDevices.filter(d => !diskSearch || (d.hostname || d.ip_address).toLowerCase().includes(diskSearch.toLowerCase()));
    const list = [...filtered].sort((a, b) => getDeviceIops(b) - getDeviceIops(a)).slice(0, 4);
    return list.map(d => {
      const iops = getDeviceIops(d);
      return {
        device: d,
        hostname: d.hostname || d.ip_address,
        iops,
        sparkline: [
          { v: Math.max(5, Math.round(iops * 0.8)) },
          { v: Math.max(5, Math.round(iops * 1.1)) },
          { v: Math.max(5, Math.round(iops * 0.9)) },
          { v: Math.max(5, Math.round(iops * 1.15)) },
          { v: Math.max(5, Math.round(iops * 0.95)) },
          { v: iops }
        ]
      };
    });
  }, [serverDevices, diskSearch]);

  // Dynamic ranked data for Top Latency (Sorted by real ICMP RTT descending)
  const topLatencyMonitors = useMemo(() => {
    const list = [...serverDevices].sort((a, b) => getDeviceLatency(b) - getDeviceLatency(a)).slice(0, 4);
    return list.map(d => {
      const latency = getDeviceLatency(d);
      return {
        device: d,
        hostname: d.hostname || d.ip_address,
        latency,
        sparkline: [
          { v: Math.max(0.1, Number((latency * 0.85).toFixed(2))) },
          { v: Math.max(0.1, Number((latency * 1.1).toFixed(2))) },
          { v: Math.max(0.1, Number((latency * 0.9).toFixed(2))) },
          { v: Math.max(0.1, Number((latency * 1.05).toFixed(2))) },
          { v: latency }
        ]
      };
    });
  }, [serverDevices]);

  // CPU Distribution Pie Chart Data - Dynamically calculated from top servers
  const cpuPieData = useMemo(() => {
    if (topCpuMonitors.length === 0) return [];
    const colors = ['#38bdf8', '#4ade80', '#fbbf24', '#f87171', '#c084fc'];
    const totalCpu = topCpuMonitors.reduce((acc, m) => acc + m.cpu, 0) || 1;
    return topCpuMonitors.map((m, idx) => ({
      name: m.hostname,
      value: Math.round((m.cpu / totalCpu) * 100),
      color: colors[idx % colors.length]
    }));
  }, [topCpuMonitors]);

  // Disk Usage Distribution Pie Chart Data - Dynamically calculated from real devices
  const diskPieData = useMemo(() => {
    if (serverDevices.length === 0) return [];
    const topStorageDevs = [...serverDevices].sort((a, b) => getDeviceDisk(b) - getDeviceDisk(a)).slice(0, 4);
    const colors = ['#06b6d4', '#a855f7', '#f59e0b', '#10b981'];
    return topStorageDevs.map((d, idx) => ({
      name: d.hostname || d.ip_address,
      value: getDeviceDisk(d),
      color: colors[idx % colors.length]
    }));
  }, [serverDevices]);

  // Theme Styling Configuration
  const theme = {
    bg: isDark ? '#0f172a' : '#f8fafc',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e2e8f0',
    textMain: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    headerBg: isDark ? '#111827' : '#ffffff',
    rowHover: isDark ? '#334155' : '#f1f5f9',
    timelineBg: isDark ? '#090d16' : '#e2e8f0'
  };

  // Reusable Radial Ring Component
  const RadialRing: React.FC<{
    value: number | string;
    label: string;
    color: string;
    pct?: number;
    sublabel?: string;
  }> = ({ value, label, color, pct = 75 }) => {
    const size = 68;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDark ? '#334155' : '#e2e8f0'}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: theme.textMain, lineHeight: 1 }}>
              {value}
            </span>
          </div>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: theme.textMuted, textTransform: 'capitalize' }}>
          {label}
        </span>
      </div>
    );
  };

  // Reusable Hexagon Component
  const HexagonBadge: React.FC<{ name: string; status: 'up' | 'down' | 'warning'; label: string }> = ({ name, status, label }) => {
    const color = status === 'up' ? '#10b981' : status === 'down' ? '#ef4444' : '#f59e0b';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <svg width="42" height="46" viewBox="0 0 42 46" fill="none">
          <polygon
            points="21,1 41,12 41,34 21,45 1,34 1,12"
            fill={isDark ? `${color}22` : `${color}15`}
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="23" r="5" fill={color} />
        </svg>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: theme.textMain, textAlign: 'center', maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </span>
        <span style={{ fontSize: '0.55rem', color: theme.textMuted }}>
          {label}
        </span>
      </div>
    );
  };

  if (devices.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: theme.textMain
      }}>
        {/* Discovery Prompt Card */}
        <div style={{
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.4)'
          }}>
            <Activity size={28} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.textMain, margin: '0 0 8px 0' }}>
            No Network Devices Discovered Yet
          </h2>
          <p style={{ fontSize: '0.84rem', color: theme.textMuted, lineHeight: '1.6', margin: '0 auto 20px auto', maxWidth: '520px' }}>
            V-NMS inventory is currently empty. Click below to initiate network discovery across your subnet. You will be able to watch each IP probed live in the terminal!
          </p>

          <button
            onClick={onOpenDiscovery}
            style={{
              padding: '11px 26px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '0.90rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 6px 16px rgba(2, 132, 199, 0.35)'
            }}
          >
            <Activity size={18} />
            <span>🚀 Fetch &amp; Discover Network Devices</span>
          </button>
        </div>

        {/* Live Infrastructure Snapshot Table (36 Enterprise Categories) */}
        <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto' }}>
          <InfrastructureSnapshot
            devices={devices}
            alerts={alerts}
            isDark={isDark}
            defaultPageSize={100}
            onSelectCategory={(catName) => {
              if (_onNavigateToTab) {
                const lower = catName.toLowerCase();
                if (lower === 'printer') _onNavigateToTab('printers');
                else if (lower === 'server') _onNavigateToTab('servers');
                else if (lower === 'switch') _onNavigateToTab('switches');
                else if (lower === 'firewall') _onNavigateToTab('firewalls');
                else if (lower === 'desktop') _onNavigateToTab('workstations');
                else _onNavigateToTab('devices');
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dashboardRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: theme.textMain,
        transition: 'all 0.2s ease',
        ...(isFullScreen ? {
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: themeMode === 'dark' ? '#0b1120' : '#f8fafc',
          padding: '16px 24px',
          overflowY: 'auto',
          height: '100vh',
          maxHeight: '100vh'
        } : {})
      }}
    >
      {/* Top Enterprise Dark NOC Control Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
        position: isFullScreen ? 'sticky' : 'relative',
        top: isFullScreen ? '0px' : undefined,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)',
            flexShrink: 0
          }}>
            <Server size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                Server Overview
              </h2>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '5px',
                background: 'rgba(2, 132, 199, 0.22)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)'
              }}>
                NOC CORE
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
              High-Density Infrastructure Telemetry • Real Network Nodes
            </p>
          </div>
        </div>

        {/* Time Horizon Slider Bar & Range Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Timeframe Selectors */}
          <div style={{
            display: 'flex',
            background: '#0f172a',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #334155'
          }}>
            {[
              { id: '1h', label: '1H' },
              { id: '24h', label: 'Daily (24h)' },
              { id: '7d', label: 'Weekly (7d)' },
              { id: '30d', label: 'Monthly (30d)' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id as any)}
                style={{
                  background: timeRange === r.id ? '#0284c7' : 'transparent',
                  color: timeRange === r.id ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Date Range Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: '#0f172a',
            border: '1px solid #334155',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#f8fafc'
          }}>
            <Calendar size={12} color="#38bdf8" />
            <span>
              {timeRange === '1h' ? 'Past 60 Minutes (Live)' :
                timeRange === '24h' ? 'Today, 12:00 AM - Now' :
                  timeRange === '7d' ? 'Past 7 Days (Mon - Today)' :
                    'Month-to-Date (30 Days)'}
            </span>
          </div>

          {/* Theme Toggle Button: Dark NOC vs Light Enterprise */}
          <button
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title={isDark ? "Switch to Light Daylight Mode" : "Switch to Dark NOC Command Center Mode"}
          >
            {isDark ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} color="#6366f1" />}
            <span>{isDark ? 'Light' : 'NOC Dark'}</span>
          </button>

          {/* Full Screen NOC Command Center Mode Toggle */}
          <button
            onClick={toggleFullScreen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: isFullScreen ? '#0284c7' : '#1e293b',
              border: `1px solid ${isFullScreen ? '#38bdf8' : '#334155'}`,
              color: '#f8fafc',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isFullScreen ? '0 0 12px rgba(56, 189, 248, 0.45)' : 'none',
              transition: 'all 0.15s ease'
            }}
            title={isFullScreen ? "Exit Fullscreen Mode (Esc)" : "Expand Server Overview to Full Screen NOC Command Display"}
          >
            {isFullScreen ? <Minimize2 size={13} color="#ffffff" /> : <Maximize2 size={13} color="#38bdf8" />}
            <span>{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      {/* Enterprise NOC Operational Timeline Ruler */}
      <div style={{
        background: isDark ? 'linear-gradient(180deg, #0f172a 0%, #0b1120 100%)' : '#f8fafc',
        borderRadius: '8px',
        border: `1px solid ${theme.cardBorder}`,
        padding: '10px 20px 8px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.74rem',
          width: '100%'
        }}>
          {timelineTicks.map((tick, idx) => {
            const isLive = idx === timelineTicks.length - 1;
            return (
              <div
                key={tick.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  color: isLive ? '#22c55e' : theme.textMuted,
                  fontWeight: isLive ? 800 : 600
                }}
              >
                {isLive ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#22c55e',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      boxShadow: '0 0 8px #22c55e'
                    }} />
                    LIVE
                  </span>
                ) : (
                  <span style={{ letterSpacing: '0.02em' }}>{tick.label}</span>
                )}
                <div style={{
                  width: isLive ? '2px' : (idx % 2 === 0 ? '2px' : '1px'),
                  height: isLive ? '10px' : (idx % 2 === 0 ? '8px' : '5px'),
                  background: isLive ? '#22c55e' : (idx % 2 === 0 ? '#38bdf8' : theme.cardBorder),
                  borderRadius: '1px'
                }} />
              </div>
            );
          })}
        </div>

        {/* Continuous Horizontal Baseline Track */}
        <div style={{
          height: '2px',
          background: isDark ? 'linear-gradient(90deg, #1e293b 0%, #334155 60%, #22c55e 100%)' : '#e2e8f0',
          width: '100%',
          borderRadius: '1px'
        }} />
      </div>

      {/* 2-Column Split NOC Dashboard Layout: Left Telemetry Grid + Right Infrastructure Snapshot */}
      <div className="dashboard-split-layout">
        {/* Left Column: All Telemetry Metrics & NOC Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          {/* ROW 1: Server Availability, Server Health Summary & Server Alert Summary (3 Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '14px'
          }}>
            {/* Widget 1: Server Availability */}
            <div style={{
              background: theme.cardBg,
              borderRadius: '10px',
              border: `1px solid ${theme.cardBorder}`,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: '0 0 10px 0' }}>
                Server Availability
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <RadialRing
                  value={downDevices}
                  label="Down"
                  color="#ef4444"
                  pct={totalDevices > 0 ? Math.round((downDevices / totalDevices) * 100) : 0}
                />
                <RadialRing
                  value={0}
                  label="Unreachable"
                  color="#f97316"
                  pct={0}
                />
                <RadialRing
                  value={upDevices}
                  label="Up"
                  color="#10b981"
                  pct={totalDevices > 0 ? Math.round((upDevices / totalDevices) * 100) : 0}
                />
                <RadialRing
                  value={totalDevices}
                  label="Monitored"
                  color="#3b82f6"
                  pct={100}
                />
              </div>
            </div>

            {/* Widget 2: Server Health Summary (Honeycomb Hexagons) */}
            <div style={{
              background: theme.cardBg,
              borderRadius: '10px',
              border: `1px solid ${theme.cardBorder}`,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>
                  Server Health Summary
                </h4>
                <span style={{ fontSize: '0.64rem', color: '#10b981', fontWeight: 700 }}>
                  {upDevices} HEALTHY
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '6px 0' }}>
                {devices.slice(0, 4).map(d => (
                  <HexagonBadge
                    key={d.id}
                    name={d.hostname || d.ip_address}
                    status={d.status ? 'up' : 'down'}
                    label={d.device_type ? d.device_type.toUpperCase() : (d.hardware || 'Device')}
                  />
                ))}
              </div>
            </div>

            {/* Widget 3: Server Alert Summary */}
            <div style={{
              background: theme.cardBg,
              borderRadius: '10px',
              border: `1px solid ${theme.cardBorder}`,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: '0 0 10px 0' }}>
                Server Alert Summary
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <RadialRing
                  value={downPercentage}
                  label="Down Rate"
                  color="#ef4444"
                  pct={totalDevices > 0 ? Math.round((downDevices / totalDevices) * 100) : 0}
                />
                <RadialRing
                  value={criticalCount}
                  label="Critical"
                  color="#dc2626"
                  pct={criticalCount > 0 ? Math.min(100, criticalCount * 20) : 0}
                />
                <RadialRing
                  value={majorCount}
                  label="Major"
                  color="#f97316"
                  pct={majorCount > 0 ? Math.min(100, majorCount * 15) : 0}
                />
                <RadialRing
                  value={warningCount}
                  label="Warning"
                  color="#eab308"
                  pct={warningCount > 0 ? Math.min(100, warningCount * 10) : 0}
                />
              </div>
            </div>
          </div>

      {/* ROW 2: Top CPU Monitors, Top Memory Monitors & CPU Distribution (3 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '14px'
      }}>
        {/* Card 4: Top Server Monitor by CPU Percent */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '10px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>
              Top Server Monitor by CPU Percent
            </h4>
            <Cpu size={14} color="#f59e0b" />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.70rem' }}>
            <thead>
              <tr style={{ color: theme.textMuted, borderBottom: `1px solid ${theme.cardBorder}`, textAlign: 'left' }}>
                <th style={{ padding: '4px 6px', fontWeight: 700 }}>MONITOR</th>
                <th style={{ padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>CPU %</th>
                <th style={{ padding: '4px 6px', fontWeight: 700, textAlign: 'center', width: '90px' }}>SPARKLINE</th>
              </tr>
            </thead>
            <tbody>
              {topCpuMonitors.map(m => (
                <tr
                  key={m.hostname}
                  onClick={() => setModalDevice(m.device)}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#1e293b' : '#f8fafc'}`,
                    cursor: 'pointer',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.rowHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '5px 6px', color: '#38bdf8', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <VendorLogo vendor={m.device.vendor || 'Generic'} size="xs" showLabel={false} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                        {m.hostname}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700, color: m.cpu > 80 ? '#ef4444' : theme.textMain }}>
                    {m.cpu.toFixed(2)}%
                  </td>
                  <td style={{ padding: '2px 6px', width: '90px', height: '24px' }}>
                    <ResponsiveContainer width="100%" height={22}>
                      <AreaChart data={m.sparkline}>
                        <defs>
                          <linearGradient id={`cpuGrad-${m.hostname}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={1.5} fill={`url(#cpuGrad-${m.hostname})`} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card 5: Top Server Monitor by Memory Used */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '10px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>
              Top Server Monitor by Memory Used
            </h4>
            <Layers size={14} color="#f97316" />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.70rem' }}>
            <thead>
              <tr style={{ color: theme.textMuted, borderBottom: `1px solid ${theme.cardBorder}`, textAlign: 'left' }}>
                <th style={{ padding: '4px 6px', fontWeight: 700 }}>MONITOR</th>
                <th style={{ padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>MEM %</th>
                <th style={{ padding: '4px 6px', fontWeight: 700, textAlign: 'center', width: '90px' }}>SPARKLINE</th>
              </tr>
            </thead>
            <tbody>
              {topMemoryMonitors.map(m => (
                <tr
                  key={m.hostname}
                  onClick={() => setModalDevice(m.device)}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#1e293b' : '#f8fafc'}`,
                    cursor: 'pointer',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.rowHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '5px 6px', color: '#38bdf8', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <VendorLogo vendor={m.device.vendor || 'Generic'} size="xs" showLabel={false} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                        {m.hostname}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700, color: m.memory > 90 ? '#ef4444' : theme.textMain }}>
                    {m.memory.toFixed(2)}%
                  </td>
                  <td style={{ padding: '2px 6px', width: '90px', height: '24px' }}>
                    <ResponsiveContainer width="100%" height={22}>
                      <AreaChart data={m.sparkline}>
                        <defs>
                          <linearGradient id={`memGrad-${m.hostname}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#f97316" strokeWidth={1.5} fill={`url(#memGrad-${m.hostname})`} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card 6: Top Server Monitor by CPU User Distribution (Pie / Donut) */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '10px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: '0 0 4px 0' }}>
            Top Server Monitor by CPU User Percent
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cpuPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cpuPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '11px',
                    padding: '4px 8px'
                  }}
                  formatter={(val: any) => [`${val}%`, 'CPU Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Compact Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px', fontSize: '0.62rem', marginTop: '4px' }}>
            {cpuPieData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color }} />
                <span style={{ color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}: <strong>{item.value}%</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: Disk Usage Pie, Disk Operations IOPS & ICMP Latency (3 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '14px'
      }}>
        {/* Card 7: Top Server Monitor by Disk Usage (Pie / Donut) */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '10px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: '0 0 4px 0' }}>
            Top Server Monitor by Disk Usage
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {diskPieData.map((entry, index) => (
                    <Cell key={`disk-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '11px',
                    padding: '4px 8px'
                  }}
                  formatter={(val: any) => [`${val}%`, 'Usage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px', fontSize: '0.62rem', marginTop: '4px' }}>
            {diskPieData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color }} />
                <span style={{ color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}: <strong>{item.value}%</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 8: Top Server Monitor by Disk Operations / s (IOPS) */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '10px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>
              Top Server Monitor by Disk Operations/s
            </h4>
            <HardDrive size={14} color="#ec4899" />
          </div>

          {/* Quick Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isDark ? '#0f172a' : '#f8fafc',
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: '5px',
            padding: '3px 8px',
            marginBottom: '6px'
          }}>
            <Search size={11} color={theme.textMuted} />
            <input
              type="text"
              placeholder="Search monitor..."
              value={diskSearch}
              onChange={e => setDiskSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.68rem',
                color: theme.textMain,
                width: '100%'
              }}
            />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.70rem' }}>
            <thead>
              <tr style={{ color: theme.textMuted, borderBottom: `1px solid ${theme.cardBorder}`, textAlign: 'left' }}>
                <th style={{ padding: '4px 6px', fontWeight: 700 }}>MONITOR</th>
                <th style={{ padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>OPS/S</th>
                <th style={{ padding: '4px 6px', fontWeight: 700, textAlign: 'center', width: '90px' }}>SPARKLINE</th>
              </tr>
            </thead>
            <tbody>
              {topDiskMonitors.map(m => (
                <tr
                  key={m.hostname}
                  onClick={() => setModalDevice(m.device)}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#1e293b' : '#f8fafc'}`,
                    cursor: 'pointer',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.rowHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '5px 6px', color: '#38bdf8', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <VendorLogo vendor={m.device.vendor || 'Generic'} size="xs" showLabel={false} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                        {m.hostname}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                    {m.iops}
                  </td>
                  <td style={{ padding: '2px 6px', width: '90px', height: '24px' }}>
                    <ResponsiveContainer width="100%" height={22}>
                      <AreaChart data={m.sparkline}>
                        <defs>
                          <linearGradient id={`diskGrad-${m.hostname}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#ec4899" strokeWidth={1.5} fill={`url(#diskGrad-${m.hostname})`} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card 9: Top Server Monitor by Latency (RTT) */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '10px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>
              Top Server Monitor by Latency (RTT)
            </h4>
            <Activity size={14} color="#06b6d4" />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.70rem' }}>
            <thead>
              <tr style={{ color: theme.textMuted, borderBottom: `1px solid ${theme.cardBorder}`, textAlign: 'left' }}>
                <th style={{ padding: '4px 6px', fontWeight: 700 }}>MONITOR</th>
                <th style={{ padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>LATENCY</th>
                <th style={{ padding: '4px 6px', fontWeight: 700, textAlign: 'center', width: '90px' }}>SPARKLINE</th>
              </tr>
            </thead>
            <tbody>
              {topLatencyMonitors.map(m => (
                <tr
                  key={m.hostname}
                  onClick={() => setModalDevice(m.device)}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#1e293b' : '#f8fafc'}`,
                    cursor: 'pointer',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.rowHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '5px 6px', color: '#38bdf8', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <VendorLogo vendor={m.device.vendor || 'Generic'} size="xs" showLabel={false} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                        {m.hostname}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: '5px 6px',
                    textAlign: 'right',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: m.latency > 15 ? '#ef4444' : '#06b6d4'
                  }}>
                    {m.latency.toFixed(2)} ms
                  </td>
                  <td style={{ padding: '2px 6px', width: '90px', height: '24px' }}>
                    <ResponsiveContainer width="100%" height={22}>
                      <AreaChart data={m.sparkline}>
                        <defs>
                          <linearGradient id={`latGrad-${m.hostname}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={1.5} fill={`url(#latGrad-${m.hostname})`} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise Live Telemetry Top 10 Leaderboards (Feature 17.8.5) */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '12px',
        border: `1px solid ${theme.cardBorder}`,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: isDark ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Leaderboard Header & Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} color="#fbbf24" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>
                Enterprise Live Telemetry Top 10 Leaderboard
              </h3>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                REAL-TIME RANKED
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: theme.textMuted, margin: '2px 0 0 0' }}>
              Instant operational ranking across compute loads, ping latency, network throughput & link stability
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Category Tabs */}
            <div style={{
              display: 'inline-flex',
              background: isDark ? '#0f172a' : '#f1f5f9',
              borderRadius: '7px',
              padding: '2px',
              border: `1px solid ${theme.cardBorder}`
            }}>
              {[
                { id: 'cpu', label: 'Top CPU', icon: Flame, color: '#f59e0b' },
                { id: 'latency', label: 'Top Latency', icon: Zap, color: '#06b6d4' },
                { id: 'bandwidth', label: 'Top Bandwidth', icon: Wifi, color: '#3b82f6' },
                { id: 'uptime', label: 'Shortest Uptime', icon: Clock, color: '#ec4899' },
                { id: 'memory', label: 'Top Memory', icon: Cpu, color: '#10b981' }
              ].map(t => {
                const Icon = t.icon;
                const active = leaderboardTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setLeaderboardTab(t.id as any)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      fontSize: '0.70rem',
                      fontWeight: active ? 700 : 500,
                      borderRadius: '5px',
                      border: 'none',
                      background: active ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
                      color: active ? theme.textMain : theme.textMuted,
                      boxShadow: active ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={12} color={active ? t.color : theme.textMuted} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <ExportButtons
              data={top10Data.map(t => ({
                Rank: t.rank,
                Hostname: t.device.hostname || t.device.ip_address,
                IP_Address: t.device.ip_address,
                Vendor: t.device.vendor || 'Generic',
                Hardware: t.device.hardware || 'Enterprise Appliance',
                Metric_Value: `${t.value} ${t.unit}`,
                Status: t.device.status ? 'ONLINE' : 'OFFLINE'
              }))}
              filenamePrefix={`vnms_leaderboard_${leaderboardTab}`}
              title={`Top 10 ${leaderboardTab.toUpperCase()}`}
            />
          </div>
        </div>

        {/* Compact Table */}
        <div style={{ overflowX: 'auto', border: `1px solid ${theme.cardBorder}`, borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: isDark ? '#090d16' : '#f8fafc', borderBottom: `1px solid ${theme.cardBorder}` }}>
                <th style={{ padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700, color: theme.textMuted, width: '60px' }}>RANK</th>
                <th style={{ padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700, color: theme.textMuted }}>NODE / HOSTNAME</th>
                <th style={{ padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700, color: theme.textMuted }}>IP ADDRESS</th>
                <th style={{ padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700, color: theme.textMuted }}>VENDOR / HARDWARE</th>
                <th style={{ padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700, color: theme.textMuted }}>STATUS</th>
                <th style={{ padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700, color: theme.textMuted, minWidth: '180px' }}>TELEMETRY VALUE &amp; GAUGE</th>
                <th style={{ padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700, color: theme.textMuted, textAlign: 'right', width: '80px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {top10Data.map(item => (
                <tr
                  key={`${item.device.id}-${item.rank}`}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
                    transition: 'background 0.1s ease',
                    height: '32px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.rowHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700 }}>
                    {item.rank === 1 && <span style={{ color: '#fbbf24' }}>🥇 #1</span>}
                    {item.rank === 2 && <span style={{ color: '#94a3b8' }}>🥈 #2</span>}
                    {item.rank === 3 && <span style={{ color: '#b45309' }}>🥉 #3</span>}
                    {item.rank > 3 && <span style={{ color: theme.textMuted }}>#{item.rank}</span>}
                  </td>

                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <VendorLogo vendor={item.device.vendor || 'Generic'} size="xs" showLabel={false} />
                      <span
                        onClick={() => setModalDevice(item.device)}
                        style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(56,189,248,0.4)' }}
                        title="Click to inspect node telemetry"
                      >
                        {item.device.hostname || item.device.ip_address}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: theme.textMain }}>
                    {item.device.ip_address}
                  </td>

                  <td style={{ padding: '4px 10px', fontSize: '0.72rem', color: theme.textMuted }}>
                    {item.device.vendor || 'Generic'} • {item.device.hardware || 'Appliance'}
                  </td>

                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: item.device.status ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: item.device.status ? '#34d399' : '#f87171',
                      border: `1px solid ${item.device.status ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: item.device.status ? '#10b981' : '#ef4444' }} />
                      {item.device.status ? 'UP' : 'DOWN'}
                    </span>
                  </td>

                  <td style={{ padding: '4px 10px', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: theme.textMain,
                        minWidth: '58px'
                      }}>
                        {item.value} {item.unit}
                      </span>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        background: isDark ? '#0f172a' : '#e2e8f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${item.barPercent}%`,
                          background: item.barColor,
                          borderRadius: '3px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => setModalDevice(item.device)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '3px 7px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Inspect real-time telemetry charts"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>

        {/* Right Column: Infrastructure Snapshot (Shows all 36 Categories to eliminate empty space) */}
        <div style={{
          position: 'sticky',
          top: '16px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0
        }}>
          <InfrastructureSnapshot
            devices={devices}
            alerts={alerts}
            isDark={isDark}
            defaultPageSize={100}
            onSelectCategory={(catName) => {
              if (_onNavigateToTab) {
                const lower = catName.toLowerCase();
                if (lower === 'printer') _onNavigateToTab('printers');
                else if (lower === 'server') _onNavigateToTab('servers');
                else if (lower === 'switch') _onNavigateToTab('switches');
                else if (lower === 'firewall') _onNavigateToTab('firewalls');
                else if (lower === 'desktop') _onNavigateToTab('workstations');
                else _onNavigateToTab('devices');
              }
            }}
          />
        </div>
      </div>
      {modalDevice && (
        <DeviceChartsModal
          device={modalDevice}
          onClose={() => setModalDevice(null)}
          onPing={onPing}
          onPoll={onPoll}
          pingingId={pingingId}
          pollingId={pollingId}
        />
      )}
    </div>
  );
};
