import React, { useState, useMemo } from 'react';
import {
  X,
  Activity,
  Cpu,
  Network,
  Zap,
  Server,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  HardDrive,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import type { Device } from '../types';
import { getDeviceTelemetryHistory, getDeviceInterfaces, type ChartTimeframe } from '../data/deviceTelemetryGenerator';
import { VendorLogo, DeviceTypeBadge } from './VendorLogo';

interface DeviceChartsModalProps {
  device: Device | null;
  onClose: () => void;
  onPing: (id: number) => void;
  onPoll: (id: number) => void;
  pingingId: number | null;
  pollingId: number | null;
}

export const DeviceChartsModal: React.FC<DeviceChartsModalProps> = ({
  device,
  onClose,
  onPing,
  onPoll,
  pingingId,
  pollingId
}) => {
  const [metricTab, setMetricTab] = useState<'traffic' | 'cpu' | 'latency' | 'storage' | 'outages' | 'interfaces'>('traffic');
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1h');

  const history = useMemo(() => {
    if (!device) return [];
    return getDeviceTelemetryHistory(device, timeframe);
  }, [device, timeframe]);

  const timeframeStats = useMemo(() => {
    if (!history.length) return { peakTraffic: '0.0', avgTraffic: '0.0', peakCpu: 0, avgLatency: '0.0' };
    const peakIn = Math.max(...history.map(h => h.inTraffic));
    const peakOut = Math.max(...history.map(h => h.outTraffic));
    const peakTraffic = Math.max(peakIn, peakOut).toFixed(1);
    const avgTraffic = (history.reduce((acc, h) => acc + h.inTraffic + h.outTraffic, 0) / (history.length * 2)).toFixed(1);
    const peakCpu = Math.max(...history.map(h => h.cpu));
    const avgLatency = (history.reduce((acc, h) => acc + h.latency, 0) / history.length).toFixed(2);
    return { peakTraffic, avgTraffic, peakCpu, avgLatency };
  }, [history]);

  const interfaces = useMemo(() => {
    if (!device) return [];
    return getDeviceInterfaces(device);
  }, [device]);

  // Persistent storage partition simulation based on device ID and role
  const storagePartitions = useMemo(() => {
    if (!device) return [];
    const type = (device.device_type || '').toLowerCase();
    const isWk = type === 'workstation' || device.hostname.startsWith('DESKTOP-');
    const isNet = type === 'switch' || type === 'firewall' || type === 'router';
    const devSeed = (device.id * 17) % 100;

    if (isNet) {
      return [
        { name: 'flash0:/', label: 'Primary Firmware OS & Kernel', totalGb: 8.0, usedGb: 5.4, fs: 'Cisco FlashFS', alert: false },
        { name: 'nvram:/', label: 'Startup Config & SSL Certs', totalGb: 2.0, usedGb: 0.4, fs: 'NVRAM', alert: false },
        { name: 'crashdump:/', label: 'Core Diagnostics & Traces', totalGb: 4.0, usedGb: Number((devSeed > 65 ? 3.7 : 1.1).toFixed(1)), fs: 'EXT3', alert: devSeed > 65 }
      ];
    }

    if (isWk) {
      return [
        { name: 'C:\\ (OS Disk)', label: 'Windows 11 Pro System Drive', totalGb: 512, usedGb: 245 + (devSeed % 40), fs: 'NTFS', alert: false },
        { name: 'D:\\ (UserData)', label: 'User Documents & Projects', totalGb: 1024, usedGb: 620 + (devSeed % 80), fs: 'NTFS', alert: false }
      ];
    }

    // Server
    const actualDiskUsage = (device as any).disk_percent || Math.min(88, Math.round(25 + ((device.id * 11) % 50)));
    const isLogFull = actualDiskUsage >= 90;
    return [
      { name: 'C:\\ (OS Boot)', label: 'System Boot Drive', totalGb: 500, usedGb: Math.round(500 * (actualDiskUsage / 100)), fs: 'NTFS', alert: isLogFull },
      { name: 'D:\\Data (Databases)', label: 'Enterprise Data Volume', totalGb: 2048, usedGb: Math.round(2048 * (actualDiskUsage * 0.75 / 100)), fs: 'NTFS', alert: false },
      { name: 'E:\\Logs (Audit Archive)', label: 'Application & System Audit Logs', totalGb: 500, usedGb: isLogFull ? 468 : 180, fs: 'NTFS', alert: isLogFull }
    ];
  }, [device]);

  const hasStorageAlert = storagePartitions.some(p => (p.usedGb / p.totalGb) >= 0.90);

  // Outage history
  const outages = useMemo(() => {
    if (!device) return [];
    if (!device.status) {
      return [
        { id: 1, timestamp: 'Today, 10:14 AM', duration: 'Ongoing (Active Outage)', type: 'ICMP Host Unreachable', cause: 'Network Cable Disconnected / Host Powered Off', status: 'CRITICAL' },
        { id: 2, timestamp: 'Yesterday, 14:22 PM', duration: '3m 12s', type: 'Interface Flap', cause: 'Switch Port Auto-Negotiation Flap', status: 'RESOLVED' }
      ];
    }
    const seed = device.id % 4;
    if (seed === 0) {
      return [
        { id: 1, timestamp: '3 Days Ago, 03:15 AM', duration: '1m 45s', type: 'Scheduled Reboot', cause: 'Security Kernel Live-Patch Applied', status: 'RESOLVED' }
      ];
    }
    return [
      { id: 1, timestamp: 'Past 30 Days Continuous', duration: '0s Outage', type: 'Operational SLA 100%', cause: 'Zero Outages • 100% Operational Uptime', status: 'COMPLIANT' }
    ];
  }, [device]);

  if (!device) return null;

  const latest = history[history.length - 1] || { inTraffic: 0, outTraffic: 0, cpu: 0, memory: 0, latency: 0 };
  const isServer = device.hostname.includes('srv') || device.hostname.includes('host') || device.os.toLowerCase().includes('linux') || device.os.toLowerCase().includes('windows');
  const isSwitch = device.hostname.includes('sw') || device.hardware?.toLowerCase().includes('catalyst') || device.hardware?.toLowerCase().includes('arista') || device.hardware?.toLowerCase().includes('switch');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        width: 'min(1080px, 95vw)',
        maxHeight: '92vh',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '20px 26px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: isServer ? '#e0f2fe' : isSwitch ? '#ccfbf1' : '#ede9fe',
              color: isServer ? '#0284c7' : isSwitch ? '#0d9488' : '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isServer ? <Server size={22} /> : isSwitch ? <Network size={22} /> : <Zap size={22} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {device.hostname}
                </h3>
                <VendorLogo vendor={device.vendor || 'Generic'} size="sm" />
                <span className={`status-badge ${device.status ? 'status-up' : 'status-down'}`}>
                  <span className={`pulse-dot ${device.status ? 'up' : 'down'}`} />
                  {device.status ? 'ONLINE' : 'OFFLINE'}
                </span>
                <DeviceTypeBadge type={device.device_type || 'server'} />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                IP: <strong style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{device.ip_address}</strong> • Model: <strong>{device.hardware || 'Enterprise Hardware'}</strong> • OS: {device.os || 'Enterprise OS'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onPing(device.id)}
              disabled={pingingId === device.id}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #94a3b8',
                color: '#0f172a',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Zap size={13} color="#d97706" />
              <span>Ping Now</span>
            </button>

            <button
              onClick={() => onPoll(device.id)}
              disabled={pollingId === device.id}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: '#eff6ff',
                border: '1px solid #93c5fd',
                color: '#0369a1',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Activity size={13} />
              <span>SNMP Poll</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                cursor: 'pointer',
                marginLeft: '2px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '16px 26px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 800 }}>LIVE INBOUND</span>
              <ArrowDownRight size={13} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
              {latest.inTraffic} {isServer ? 'Gbps' : 'Gbps'}
            </div>
            <span style={{ fontSize: '0.66rem', color: '#334155', fontWeight: 600 }}>Interface Rx Rate</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 800 }}>LIVE OUTBOUND</span>
              <ArrowUpRight size={13} color="#4f46e5" />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
              {latest.outTraffic} {isServer ? 'Gbps' : 'Gbps'}
            </div>
            <span style={{ fontSize: '0.66rem', color: '#334155', fontWeight: 600 }}>Interface Tx Rate</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 800 }}>CPU UTILIZATION</span>
              <Cpu size={13} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: latest.cpu > 75 ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
              {latest.cpu}%
            </div>
            <span style={{ fontSize: '0.66rem', color: '#334155', fontWeight: 600 }}>Multi-Core Load</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 800 }}>ICMP LATENCY</span>
              <Clock size={13} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: latest.latency < 5 ? '#16a34a' : '#d97706', marginTop: '2px' }}>
              {latest.latency} ms
            </div>
            <span style={{ fontSize: '0.66rem', color: '#334155', fontWeight: 600 }}>Zero Jitter Stable</span>
          </div>
        </div>

        {/* Metric Chart Selector Tabs */}
        <div style={{
          padding: '8px 24px 0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          overflowX: 'auto',
          scrollbarWidth: 'thin'
        }}>
          {[
            { id: 'traffic', label: 'Bandwidth (Gbps)', icon: Network, color: '#0284c7' },
            { id: 'cpu', label: 'CPU Load (%)', icon: Cpu, color: '#16a34a' },
            { id: 'latency', label: 'Latency & Jitter', icon: Activity, color: '#d97706' },
            { id: 'storage', label: hasStorageAlert ? 'Storage (ALERT!)' : 'Storage & Disk', icon: HardDrive, color: hasStorageAlert ? '#dc2626' : '#7c3aed' },
            { id: 'outages', label: 'Outages & SLA', icon: Clock, color: '#ef4444' },
            { id: 'interfaces', label: `Active Ports (${interfaces.length})`, icon: Server, color: '#0f172a' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = metricTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMetricTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 11px',
                  borderRadius: '4px 4px 0 0',
                  border: 'none',
                  borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                  background: isActive ? '#f8fafc' : 'transparent',
                  color: isActive ? '#0f172a' : '#334155',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? tab.color : '#475569'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Horizon & Granularity Switcher Bar (Daily, Weekly, Monthly, 1H) */}
        {(metricTab === 'traffic' || metricTab === 'cpu' || metricTab === 'latency') && (
          <div style={{
            padding: '8px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} color="#0284c7" />
                Time Frame:
              </span>
              <div style={{ display: 'flex', gap: '3px', background: '#e2e8f0', padding: '2px', borderRadius: '5px' }}>
                {[
                  { id: '1h', label: '1H' },
                  { id: '24h', label: 'Daily (24H)' },
                  { id: '7d', label: 'Weekly (7D)' },
                  { id: '30d', label: 'Monthly (30D)' }
                ].map(tf => {
                  const isSelected = timeframe === tf.id;
                  return (
                    <button
                      key={tf.id}
                      onClick={() => setTimeframe(tf.id as any)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '3px',
                        border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                        background: isSelected ? '#0284c7' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#0f172a',
                        fontSize: '0.68rem',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.68rem', color: '#0f172a' }}>
              <span>
                Window: <strong style={{ color: '#0f172a' }}>{timeframe === '1h' ? 'Live Rolling 60m' : timeframe === '24h' ? 'Today (00:00 - 23:59)' : timeframe === '7d' ? 'Last 7 Days (Mon - Sun)' : 'Month-to-Date (30 Days)'}</strong>
              </span>
              <span style={{ color: '#94a3b8' }}>|</span>
              <span>
                Peak: <strong style={{ color: '#0284c7' }}>{timeframeStats.peakTraffic} Gbps</strong> • Avg RTT: <strong style={{ color: '#15803d' }}>{timeframeStats.avgLatency} ms</strong>
              </span>
            </div>
          </div>
        )}

        {/* Content Body: Charts or Tables */}
        <div style={{ padding: '18px 24px', flex: 1, overflowY: 'auto', background: '#ffffff' }}>
          {/* TAB 1: TRAFFIC CHART */}
          {metricTab === 'traffic' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Real-Time Inbound vs Outbound Throughput
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#334155', margin: '2px 0 0 0', fontWeight: 500 }}>
                    High-resolution interface metrics polled via 64-bit HC counters
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.70rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', background: '#f0f9ff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0284c7' }} />
                    Inbound Traffic
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', background: '#eef2ff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #c7d2fe' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4f46e5' }} />
                    Outbound Traffic
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="modalIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="modalOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#0f172a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#0f172a" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '6px',
                        padding: '5px 9px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        color: '#f8fafc'
                      }}
                      itemStyle={{ color: '#f8fafc', fontSize: '0.70rem', fontWeight: 700, padding: '1px 0' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '0.66rem', fontWeight: 700, marginBottom: '2px' }}
                    />
                    <Area type="monotone" dataKey="inTraffic" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#modalIn)" name="Inbound (Gbps)" />
                    <Area type="monotone" dataKey="outTraffic" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#modalOut)" name="Outbound (Gbps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: CPU CHART */}
          {metricTab === 'cpu' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Processor Load & Core Telemetry
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#334155', margin: '2px 0 0 0', fontWeight: 500 }}>
                    HOST-RESOURCES-MIB / CISCO-PROCESS-MIB Core Load Distribution
                  </p>
                </div>
                <span style={{ fontSize: '0.70rem', color: '#14532d', fontWeight: 800, background: '#dcfce7', border: '1px solid #86efac', padding: '3px 8px', borderRadius: '4px' }}>
                  Healthy &lt; 80% Threshold
                </span>
              </div>

              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="modalCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#0f172a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#0f172a" fontSize={10} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '6px',
                        padding: '5px 9px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        color: '#f8fafc'
                      }}
                      itemStyle={{ color: '#f8fafc', fontSize: '0.70rem', fontWeight: 700, padding: '1px 0' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '0.66rem', fontWeight: 700, marginBottom: '2px' }}
                    />
                    <Area type="monotone" dataKey="cpu" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#modalCpu)" name="CPU Load (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 3: LATENCY & SPIKES */}
          {metricTab === 'latency' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    ICMP Ping RTT &amp; Latency Spike Analytics
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#334155', margin: '2px 0 0 0', fontWeight: 500 }}>
                    Go ICMP fast-probe jitter tracking with anomaly and spike detection
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.70rem', padding: '3px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#065f46', fontWeight: 800, border: '1px solid #a7f3d0' }}>
                    Jitter: &lt; 0.08 ms (Stable)
                  </span>
                  <span style={{ fontSize: '0.70rem', padding: '3px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1e40af', fontWeight: 800, border: '1px solid #bfdbfe' }}>
                    Avg: {device.last_ping_ms.toFixed(2)} ms
                  </span>
                </div>
              </div>

              {/* Spike Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 800 }}>CURRENT LATENCY</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{device.last_ping_ms.toFixed(2)} ms</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 800 }}>MAX PEAK SPIKE</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706' }}>
                    {((device.last_ping_ms || 0.5) * 2.2 + 0.8).toFixed(2)} ms
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 800 }}>SPIKE EVENTS (&gt; 10ms)</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>0 Detected (Normal)</div>
                </div>
              </div>

              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#0f172a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#0f172a" fontSize={10} tickLine={false} domain={[0, 'dataMax + 1']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '6px',
                        padding: '5px 9px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        color: '#f8fafc'
                      }}
                      itemStyle={{ color: '#f8fafc', fontSize: '0.70rem', fontWeight: 700, padding: '1px 0' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '0.66rem', fontWeight: 700, marginBottom: '2px' }}
                    />
                    <Line type="monotone" dataKey="latency" stroke="#d97706" strokeWidth={2} dot={{ r: 3, fill: '#d97706' }} name="Latency (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: STORAGE & DISK CAPACITY */}
          {metricTab === 'storage' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Storage Partitions &amp; Disk Capacity Monitoring
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#334155', margin: '2px 0 0 0', fontWeight: 500 }}>
                    HOST-RESOURCES-MIB hrStorageAllocationUnits • Real-time disk full alerts
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', padding: '3px 8px', borderRadius: '4px', background: '#ffedd5', color: '#7c2d12', fontWeight: 800, border: '1px solid #fed7aa' }}>
                    Warning: 85%
                  </span>
                  <span style={{ fontSize: '0.70rem', padding: '3px 8px', borderRadius: '4px', background: '#fee2e2', color: '#7f1d1d', fontWeight: 800, border: '1px solid #fecaca' }}>
                    Critical Full: 90%
                  </span>
                </div>
              </div>

              {/* Storage Full Warning Banner if any partition >= 90% */}
              {hasStorageAlert && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  marginBottom: '12px',
                  fontSize: '0.74rem'
                }}>
                  <AlertTriangle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>CRITICAL STORAGE FULL WARNING:</strong> One or more volumes have exceeded 90% capacity! Rotate logs or expand disk array immediately to prevent write failure.
                  </div>
                </div>
              )}

              {/* Partitions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {storagePartitions.map((part, idx) => {
                  const pct = Math.round((part.usedGb / part.totalGb) * 100);
                  const isCritical = pct >= 90;
                  const isWarn = pct >= 80 && pct < 90;
                  const barColor = isCritical ? '#dc2626' : isWarn ? '#ea580c' : '#16a34a';

                  return (
                    <div key={idx} style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: isCritical ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                      background: isCritical ? '#fff5f5' : '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', marginRight: '8px' }}>
                            {part.name}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600 }}>
                            {part.label} ({part.fs})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: 800 }}>
                            {part.usedGb} GB / {part.totalGb} GB ({pct}%)
                          </span>
                          {isCritical ? (
                            <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: '#dc2626', color: '#ffffff', fontWeight: 800 }}>
                              STORAGE FULL
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: '#ecfdf5', color: '#15803d', fontWeight: 800 }}>
                              HEALTHY
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div style={{ width: '100%', height: '7px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: barColor,
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: OUTAGE HISTORY */}
          {metricTab === 'outages' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Incident History &amp; MTTR Availability Tracking
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#334155', margin: '2px 0 0 0', fontWeight: 500 }}>
                    Historical downtime records, root-cause diagnostic log, and SLA compliance
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={14} color="#16a34a" />
                  <span style={{ fontSize: '0.70rem', color: '#14532d', background: '#dcfce7', border: '1px solid #86efac', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    Target SLA: 99.90% • MTTR: &lt; 15m
                  </span>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>
                    <th style={{ padding: '6px 10px' }}>TIMEFRAME</th>
                    <th style={{ padding: '6px 10px' }}>EVENT TYPE</th>
                    <th style={{ padding: '6px 10px' }}>DOWNTIME DURATION</th>
                    <th style={{ padding: '6px 10px' }}>ROOT CAUSE</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {outages.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 10px', color: '#0f172a', fontWeight: 700 }}>{item.timestamp}</td>
                      <td style={{ padding: '7px 10px', color: '#0f172a', fontWeight: 600 }}>{item.type}</td>
                      <td style={{ padding: '7px 10px', fontFamily: 'var(--font-mono)', color: item.status === 'CRITICAL' ? '#dc2626' : '#0284c7', fontWeight: 800 }}>
                        {item.duration}
                      </td>
                      <td style={{ padding: '7px 10px', color: '#334155' }}>{item.cause}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          background: item.status === 'CRITICAL' ? '#fee2e2' : item.status === 'COMPLIANT' ? '#ecfdf5' : '#eff6ff',
                          color: item.status === 'CRITICAL' ? '#991b1b' : item.status === 'COMPLIANT' ? '#14532d' : '#1e40af'
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: INTERFACE PORTS TABLE */}
          {metricTab === 'interfaces' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Physical &amp; Virtual Interface Ports for {device.hostname}
                </h4>
                <p style={{ fontSize: '0.72rem', color: '#334155', margin: '2px 0 0 0', fontWeight: 500 }}>
                  Interface Port Inventory • Real-time line speed and traffic counters
                </p>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>
                    <th style={{ padding: '6px 10px' }}>STATUS</th>
                    <th style={{ padding: '6px 10px' }}>PORT NAME</th>
                    <th style={{ padding: '6px 10px' }}>LINK SPEED</th>
                    <th style={{ padding: '6px 10px' }}>INBOUND (Rx)</th>
                    <th style={{ padding: '6px 10px' }}>OUTBOUND (Tx)</th>
                    <th style={{ padding: '6px 10px' }}>ERRORS</th>
                  </tr>
                </thead>
                <tbody>
                  {interfaces.map((intf, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 10px' }}>
                        <span className={`status-badge ${intf.status === 'up' ? 'status-up' : 'status-down'}`} style={{ fontSize: '0.66rem', padding: '2px 6px' }}>
                          <span className={`pulse-dot ${intf.status === 'up' ? 'up' : 'down'}`} />
                          {intf.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '7px 10px', fontWeight: 700, color: '#0f172a', fontSize: '0.76rem' }}>
                        {intf.name}
                      </td>
                      <td style={{ padding: '7px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                        {intf.speed}
                      </td>
                      <td style={{ padding: '7px 10px', fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                        {intf.inBps}
                      </td>
                      <td style={{ padding: '7px 10px', fontSize: '0.72rem', color: '#4f46e5', fontWeight: 700 }}>
                        {intf.outBps}
                      </td>
                      <td style={{ padding: '7px 10px', fontSize: '0.72rem', color: intf.errors > 0 ? '#dc2626' : '#15803d', fontWeight: 700 }}>
                        {intf.errors}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '10px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#1e293b', fontWeight: 600 }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>Real-time Telemetry Poller • Continuous sampling active</span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              border: '1px solid #94a3b8',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close Telemetry View
          </button>
        </div>
      </div>
    </div>
  );
};

