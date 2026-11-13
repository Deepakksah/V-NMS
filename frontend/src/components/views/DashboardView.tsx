import React, { useState, useMemo } from 'react';
import { 
  Server, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Wifi, 
  RefreshCw, 
  ArrowUpRight,
  BarChart2,
  Cpu,
  Database,
  Clock,
  ExternalLink,
  Network,
  FolderTree
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
import type { Device, MetricDataPoint } from '../../types';
import { CATEGORIES_LIST } from '../../data/featuresRegistry';
import { getDeviceTelemetryHistory } from '../../data/deviceTelemetryGenerator';
import { DeviceChartsModal } from '../DeviceChartsModal';

interface DashboardViewProps {
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (d: Device) => void;
  onPing: (id: number) => void;
  onPoll: (id: number) => void;
  pingingId: number | null;
  pollingId: number | null;
  telemetry: MetricDataPoint[];
  alerts: any[];
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  devices,
  selectedDevice,
  setSelectedDevice,
  onPing,
  onPoll,
  pingingId,
  pollingId,
  onNavigateToTab
}) => {
  const [activeMetric, setActiveMetric] = useState<'traffic' | 'cpu' | 'memory' | 'latency'>('traffic');
  const [showDeepDiveModal, setShowDeepDiveModal] = useState<boolean>(false);

  const totalDevices = devices.length;
  const upDevices = devices.filter(d => d.status).length;
  const downDevices = totalDevices - upDevices;
  const avgLatency = devices.length > 0
    ? (devices.reduce((acc, d) => acc + (d.last_ping_ms || 0), 0) / devices.length).toFixed(1)
    : '2.4';

  // Compute live history chart points for the currently selected switch / server / router
  const activeDevice = selectedDevice || devices[0] || null;
  const deviceHistory = useMemo(() => {
    if (!activeDevice) return [];
    return getDeviceTelemetryHistory(activeDevice);
  }, [activeDevice]);

  const latestPoint = deviceHistory[deviceHistory.length - 1] || { inTraffic: 0, outTraffic: 0, cpu: 0, memory: 0, latency: 0 };
  const isServer = activeDevice?.hostname.includes('srv') || activeDevice?.hostname.includes('host') || activeDevice?.os.toLowerCase().includes('linux') || activeDevice?.os.toLowerCase().includes('windows');
  const isSwitch = activeDevice?.hostname.includes('sw') || activeDevice?.hardware?.toLowerCase().includes('catalyst') || activeDevice?.hardware?.toLowerCase().includes('arista') || activeDevice?.hardware?.toLowerCase().includes('switch');
  const typeTag = isServer ? 'Server' : isSwitch ? 'Switch' : 'Router';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Welcome / Status Hero */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            NOC Executive Overview
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Real-time telemetry, bandwidth, CPU, and latency graphs for all monitored servers, switches, and routers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigateToTab('all_features')}
            className="glow-btn"
            style={{ fontSize: '0.84rem' }}
          >
            <Zap size={15} />
            <span>Explore All 145 Models</span>
          </button>
        </div>
      </div>

      {/* Metric Overview Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL MONITORED</span>
            <Server size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#0f172a' }}>{totalDevices}</div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Model #1 Device Entities</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ONLINE (UP)</span>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#16a34a' }}>{upDevices}</div>
          <p style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px' }}>Operational & Responding</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OFFLINE / DEGRADED</span>
            <XCircle size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#dc2626' }}>{downDevices}</div>
          <p style={{ fontSize: '0.72rem', color: '#b91c1c', marginTop: '4px' }}>Model #4 Outage Incidents</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>AVG ICMP LATENCY</span>
            <Zap size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#d97706' }}>
            {avgLatency} ms
          </div>
          <p style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '4px' }}>Sub-millisecond Go Ping</p>
        </div>
      </div>

      {/* Main Grid: Live Telemetry Chart for ANY Switch/Server + Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.15fr', gap: '18px' }}>
        {/* Dynamic Telemetry Chart Card */}
        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff' }}>
          {/* Chart Header with Device Dropdown & Metric Mode Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isServer ? '#e0f2fe' : isSwitch ? '#ccfbf1' : '#ede9fe',
                color: isServer ? '#0284c7' : isSwitch ? '#0d9488' : '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart2 size={18} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Live Chart: {activeDevice?.hostname}
                  </h3>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: isServer ? '#e0f2fe' : isSwitch ? '#ccfbf1' : '#ede9fe',
                    color: isServer ? '#0284c7' : isSwitch ? '#0d9488' : '#7c3aed',
                    fontWeight: 700
                  }}>
                    {typeTag.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Select any server or switch below to dynamically render its telemetry graph
                </p>
              </div>
            </div>

            {/* Device Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={activeDevice?.id || ''}
                onChange={(e) => {
                  const dev = devices.find(d => d.id === Number(e.target.value));
                  if (dev) setSelectedDevice(dev);
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.hostname} ({d.ip_address})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowDeepDiveModal(true)}
                title="Open Complete Analytics Modal"
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#0284c7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                <ExternalLink size={14} />
                <span>Deep Dive</span>
              </button>

              <button
                onClick={() => onNavigateToTab('tree_view')}
                title="Open Infrastructure Hierarchy Tree View"
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                <FolderTree size={14} color="#0284c7" />
                <span>Tree View</span>
              </button>
            </div>
          </div>

          {/* Metric Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px' }}>
            {[
              { id: 'traffic', label: 'Network Bandwidth (Gbps)', icon: Network, color: '#0284c7' },
              { id: 'cpu', label: 'CPU Load (%)', icon: Cpu, color: '#16a34a' },
              { id: 'memory', label: 'RAM / Memory (%)', icon: Database, color: '#7c3aed' },
              { id: 'latency', label: 'Ping Latency (ms)', icon: Clock, color: '#d97706' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeMetric === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMetric(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: isActive ? `1px solid ${tab.color}` : '1px solid #e2e8f0',
                    background: isActive ? '#f8fafc' : '#ffffff',
                    color: isActive ? '#0f172a' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={14} color={isActive ? tab.color : '#64748b'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chart Rendering Canvas */}
          <div style={{ width: '100%', height: '240px' }}>
            {activeMetric === 'traffic' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={deviceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="dashOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Area type="monotone" dataKey="inTraffic" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#dashIn)" name="Inbound (Gbps)" />
                  <Area type="monotone" dataKey="outTraffic" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#dashOut)" name="Outbound (Gbps)" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeMetric === 'cpu' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={deviceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a'
                    }} 
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#dashCpu)" name="CPU Load (%)" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeMetric === 'memory' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={deviceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a'
                    }} 
                  />
                  <Area type="monotone" dataKey="memory" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#dashMem)" name="Memory (%)" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeMetric === 'latency' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deviceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a'
                    }} 
                  />
                  <Line type="monotone" dataKey="latency" stroke="#d97706" strokeWidth={2} dot={{ r: 3, fill: '#d97706' }} name="Latency (ms)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Inspector Card for Selected Device */}
        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Device Telemetry Spec</h3>
              {activeDevice && (
                <span className={`status-badge ${activeDevice.status ? 'status-up' : 'status-down'}`}>
                  <span className={`pulse-dot ${activeDevice.status ? 'up' : 'down'}`}></span>
                  {activeDevice.status ? 'Online' : 'Offline'}
                </span>
              )}
            </div>

            {activeDevice ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Hostname</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{activeDevice.hostname}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>IP Address</span>
                  <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 600 }}>{activeDevice.ip_address}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Device Type</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{typeTag} ({activeDevice.hardware || 'Enterprise Hardware'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>OS / Firmware</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{activeDevice.os || 'Cisco IOS-XE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Live Bandwidth</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>
                    {latestPoint.inTraffic}G In / {latestPoint.outTraffic}G Out
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>CPU / Memory</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>
                    {latestPoint.cpu}% CPU / {latestPoint.memory}% RAM
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Ping Latency</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: activeDevice.last_ping_ms < 10 ? '#16a34a' : '#d97706' }}>
                    {activeDevice.last_ping_ms.toFixed(2)} ms
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Select a device from inventory to view live parameters</p>
            )}
          </div>

          {activeDevice && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => onPing(activeDevice.id)}
                  disabled={pingingId === activeDevice.id}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Wifi size={14} />
                  <span>{pingingId === activeDevice.id ? 'Pinging...' : 'Instant Ping'}</span>
                </button>

                <button 
                  onClick={() => onPoll(activeDevice.id)}
                  disabled={pollingId === activeDevice.id}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} className={pollingId === activeDevice.id ? 'animate-spin' : ''} />
                  <span>{pollingId === activeDevice.id ? 'Polling...' : 'Poll SNMP'}</span>
                </button>
              </div>

              <button
                onClick={() => setShowDeepDiveModal(true)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#0284c7',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <BarChart2 size={14} />
                <span>Open Full Device Charts & Ports</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 15 Domains Quick Access Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>15 Functional Domains Coverage</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Jump directly to any of the 145 LibreNMS sub-system views</p>
          </div>
          <button
            onClick={() => onNavigateToTab('all_features')}
            style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View Full 145 Matrix</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {CATEGORIES_LIST.map(cat => (
            <div
              key={cat.num}
              onClick={() => onNavigateToTab(cat.tab)}
              className="glass-panel"
              style={{
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px',
                background: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  CAT {cat.num}
                </span>
                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                  {cat.count} Models
                </span>
              </div>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cat.name}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dive Multi-Chart Modal */}
      {showDeepDiveModal && activeDevice && (
        <DeviceChartsModal
          device={activeDevice}
          onClose={() => setShowDeepDiveModal(false)}
          onPing={onPing}
          onPoll={onPoll}
          pingingId={pingingId}
          pollingId={pollingId}
        />
      )}
    </div>
  );
};
