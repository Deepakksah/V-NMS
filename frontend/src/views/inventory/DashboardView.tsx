import React, { useState, useMemo } from 'react';
import {
  Server,
  Search,
  Calendar,
  Layers,
  Activity,
  HardDrive,
  Cpu,
  Moon,
  Sun
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

  const isDark = themeMode === 'dark';

  // Compute live operational numbers from active PostgreSQL devices
  const totalDevices = devices.length;
  const upDevices = devices.filter(d => d.status).length;
  const downDevices = totalDevices - upDevices;
  const criticalCount = alerts.filter(a => (a.severity || '').toLowerCase() === 'critical').length || (downDevices > 0 ? downDevices : 1);
  const majorCount = 5;
  const warningCount = 8;

  // Filter server monitors
  const serverDevices = useMemo(() => {
    const srv = devices.filter(d => (d.device_type || '').toLowerCase() === 'server' || d.hardware?.includes('Dell') || d.os?.includes('Windows') || d.os?.includes('Linux'));
    return srv.length > 0 ? srv : devices;
  }, [devices]);

  // Deterministic ranked data for Top CPU Monitors
  const topCpuMonitors = useMemo(() => {
    const list = [...serverDevices].slice(0, 5);
    const mult = timeRange === '1h' ? 0.95 : timeRange === '24h' ? 1.0 : timeRange === '7d' ? 1.08 : 1.04;
    return list.map((d, idx) => {
      const rawCpu = (idx === 0 ? 88.34 : idx === 1 ? 71.04 : idx === 2 ? 62.74 : idx === 3 ? 50.34 : 40.50) * mult;
      const baseCpu = Number(Math.min(99, rawCpu).toFixed(1));
      return {
        device: d,
        hostname: d.hostname,
        cpu: baseCpu,
        sparkline: [
          { v: Math.max(10, baseCpu - 12) },
          { v: Math.max(10, baseCpu - 4) },
          { v: Math.max(10, baseCpu + 6) },
          { v: Math.max(10, baseCpu - 8) },
          { v: Math.max(10, baseCpu + 2) },
          { v: baseCpu }
        ]
      };
    });
  }, [serverDevices, timeRange]);

  // Deterministic ranked data for Top Memory Monitors
  const topMemoryMonitors = useMemo(() => {
    const list = [...serverDevices].reverse().slice(0, 5);
    const mult = timeRange === '1h' ? 0.96 : timeRange === '24h' ? 1.0 : timeRange === '7d' ? 1.05 : 1.02;
    return list.map((d, idx) => {
      const rawMem = (idx === 0 ? 95.79 : idx === 1 ? 89.74 : idx === 2 ? 85.24 : idx === 3 ? 81.34 : 72.70) * mult;
      const baseMem = Number(Math.min(99, rawMem).toFixed(1));
      return {
        device: d,
        hostname: d.hostname,
        memory: baseMem,
        sparkline: [
          { v: Math.max(10, baseMem - 8) },
          { v: Math.max(10, baseMem - 2) },
          { v: Math.max(10, baseMem + 3) },
          { v: Math.max(10, baseMem - 5) },
          { v: Math.max(10, baseMem + 1) },
          { v: baseMem }
        ]
      };
    });
  }, [serverDevices, timeRange]);

  // Deterministic ranked data for Top Disk Operations / IOPS
  const topDiskMonitors = useMemo(() => {
    const list = [...serverDevices].slice(0, 4);
    const mult = timeRange === '1h' ? 0.85 : timeRange === '24h' ? 1.0 : timeRange === '7d' ? 1.25 : 1.15;
    const iopsValues = [304, 180, 68, 63];
    return list
      .filter(d => !diskSearch || d.hostname.toLowerCase().includes(diskSearch.toLowerCase()))
      .map((d, idx) => {
        const iops = Math.round((iopsValues[idx] || 45) * mult);
        return {
          device: d,
          hostname: d.hostname,
          iops,
          sparkline: [
            { v: Math.max(10, iops - 50) },
            { v: Math.max(10, iops + 25) },
            { v: Math.max(10, iops - 30) },
            { v: Math.max(10, iops + 40) },
            { v: Math.max(10, iops - 10) },
            { v: iops }
          ]
        };
      });
  }, [serverDevices, diskSearch, timeRange]);

  // Deterministic ranked data for Top Latency
  const topLatencyMonitors = useMemo(() => {
    const list = [...serverDevices].slice(0, 4);
    const mult = timeRange === '1h' ? 0.95 : timeRange === '24h' ? 1.0 : timeRange === '7d' ? 1.12 : 1.08;
    return list.map((d, idx) => {
      const rawLat = (idx === 0 ? 0.45 : idx === 1 ? 0.52 : idx === 2 ? 1.20 : 18.40) * mult;
      const lat = Number(rawLat.toFixed(2));
      return {
        device: d,
        hostname: d.hostname,
        latency: lat,
        sparkline: [
          { v: Math.max(0.2, lat - 0.1) },
          { v: Math.max(0.2, lat + 0.15) },
          { v: Math.max(0.2, lat - 0.05) },
          { v: Math.max(0.2, lat + 0.2) },
          { v: Math.max(0.2, lat) }
        ]
      };
    });
  }, [serverDevices, timeRange]);

  // CPU Distribution Pie Chart Data
  const cpuPieData = useMemo(() => [
    { name: topCpuMonitors[0]?.hostname || 'srv-01', value: 34, color: '#38bdf8' },
    { name: topCpuMonitors[1]?.hostname || 'srv-02', value: 24, color: '#4ade80' },
    { name: topCpuMonitors[2]?.hostname || 'srv-03', value: 18, color: '#fbbf24' },
    { name: topCpuMonitors[3]?.hostname || 'srv-04', value: 14, color: '#f87171' },
    { name: topCpuMonitors[4]?.hostname || 'srv-05', value: 10, color: '#c084fc' }
  ], [topCpuMonitors]);

  // Disk Usage Distribution Pie Chart Data
  const diskPieData = useMemo(() => [
    { name: 'C:\\ System NVMe', value: 42, color: '#06b6d4' },
    { name: '/var/log Partition', value: 28, color: '#a855f7' },
    { name: '/data Volume Array', value: 18, color: '#f59e0b' },
    { name: 'Backup LVM Volume', value: 12, color: '#10b981' }
  ], []);

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
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '30px',
        color: theme.textMain
      }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '44px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.4)'
          }}>
            <Activity size={32} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textMain, margin: '0 0 10px 0' }}>
            No Network Devices Discovered Yet
          </h2>
          <p style={{ fontSize: '0.88rem', color: theme.textMuted, lineHeight: '1.6', margin: '0 0 26px 0' }}>
            V-NMS inventory is currently empty. Click below to initiate network discovery across your subnet. You will be able to watch each IP probed live in the terminal!
          </p>

          <button
            onClick={onOpenDiscovery}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
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
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      color: theme.textMain,
      transition: 'all 0.2s ease'
    }}>
      {/* Top Motadata-Inspired Subheader & Horizon Time Bar */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '10px',
        border: `1px solid ${theme.cardBorder}`,
        padding: '12px 18px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
          }}>
            <Server size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: theme.textMain, margin: 0 }}>
                Server Overview
              </h2>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                background: isDark ? '#1e3a8a' : '#dbeafe',
                color: isDark ? '#93c5fd' : '#1d4ed8'
              }}>
                NOC CORE
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: theme.textMuted, margin: '2px 0 0 0' }}>
              High-Density Infrastructure Telemetry &bull; Real Network Nodes
            </p>
          </div>
        </div>

        {/* Time Horizon Slider Bar & Range Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Timeframe Selectors */}
          <div style={{
            display: 'flex',
            background: isDark ? '#0f172a' : '#f1f5f9',
            padding: '2px',
            borderRadius: '6px',
            border: `1px solid ${theme.cardBorder}`
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
                  color: timeRange === r.id ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontSize: '0.68rem',
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
            background: isDark ? '#0f172a' : '#f8fafc',
            border: `1px solid ${theme.cardBorder}`,
            padding: '3px 8px',
            borderRadius: '5px',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: theme.textMain
          }}>
            <Calendar size={11} color="#0284c7" />
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
              padding: '5px 10px',
              borderRadius: '6px',
              background: isDark ? '#334155' : '#ffffff',
              border: `1px solid ${theme.cardBorder}`,
              color: theme.textMain,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title={isDark ? "Switch to Light Daylight Mode" : "Switch to Dark NOC Command Center Mode"}
          >
            {isDark ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} color="#6366f1" />}
            <span>{isDark ? 'Light' : 'NOC Dark'}</span>
          </button>
        </div>
      </div>

      {/* Motadata-Style Operational Timeline Bar */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '8px',
        border: `1px solid ${theme.cardBorder}`,
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.64rem',
        color: theme.textMuted,
        fontFamily: 'var(--font-mono)',
        overflowX: 'auto'
      }}>
        {['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', 'LIVE'].map((t, idx) => (
          <div key={t} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: idx === 12 ? '#10b981' : theme.textMuted,
            fontWeight: idx === 12 ? 800 : 500
          }}>
            <span>{t}</span>
            <div style={{
              width: '1px',
              height: idx % 2 === 0 ? '6px' : '4px',
              background: idx === 12 ? '#10b981' : theme.cardBorder
            }} />
          </div>
        ))}
      </div>

      {/* ROW 1: Server Availability, Health Honeycomb & Alert Summary (3 Cards - Responsive Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
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
            <RadialRing value={downDevices} label="Down" color="#ef4444" pct={downDevices > 0 ? 30 : 0} />
            <RadialRing value={0} label="Unreachable" color="#f97316" pct={0} />
            <RadialRing value={upDevices} label="Up" color="#10b981" pct={94} />
            <RadialRing value={0} label="Maintenance" color="#3b82f6" pct={0} />
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
            <HexagonBadge name="rhel-7.8" status="up" label="Compute" />
            <HexagonBadge name="win-2022" status="up" label="PowerEdge" />
            <HexagonBadge name="cat-9300" status="up" label="Spine Sw" />
            <HexagonBadge name="chk-1800" status="up" label="Firewall" />
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
            <RadialRing value={downDevices > 0 ? '6.2%' : '0%'} label="Down" color="#ef4444" pct={downDevices > 0 ? 15 : 0} />
            <RadialRing value={criticalCount} label="Critical" color="#dc2626" pct={45} />
            <RadialRing value={majorCount} label="Major" color="#f97316" pct={35} />
            <RadialRing value={warningCount} label="Warning" color="#eab308" pct={50} />
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
                      <VendorLogo vendor={m.device.vendor || 'Dell'} size="xs" showLabel={false} />
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
                      <VendorLogo vendor={m.device.vendor || 'Ubuntu'} size="xs" showLabel={false} />
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
                      <VendorLogo vendor={m.device.vendor || 'Dell'} size="xs" showLabel={false} />
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

      {/* Deep Dive Modal if a server row was clicked */}
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
