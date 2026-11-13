import React, { useState, useMemo } from 'react';
import { 
  X, 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  Zap, 
  Server, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight,
  ShieldCheck
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
import { getDeviceTelemetryHistory, getDeviceInterfaces } from '../data/deviceTelemetryGenerator';

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
  const [metricTab, setMetricTab] = useState<'traffic' | 'cpu' | 'memory' | 'latency' | 'interfaces'>('traffic');

  const history = useMemo(() => {
    if (!device) return [];
    return getDeviceTelemetryHistory(device);
  }, [device]);

  const interfaces = useMemo(() => {
    if (!device) return [];
    return getDeviceInterfaces(device);
  }, [device]);

  if (!device) return null;

  const latest = history[history.length - 1] || { inTraffic: 0, outTraffic: 0, cpu: 0, memory: 0, latency: 0 };
  const isServer = device.hostname.includes('srv') || device.hostname.includes('host') || device.os.toLowerCase().includes('linux') || device.os.toLowerCase().includes('windows');
  const isSwitch = device.hostname.includes('sw') || device.hardware?.toLowerCase().includes('catalyst') || device.hardware?.toLowerCase().includes('arista') || device.hardware?.toLowerCase().includes('switch');
  const deviceTypeLabel = isServer ? 'Server / Host' : isSwitch ? 'Network Switch' : 'Core Router / Gateway';

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
        width: '920px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {device.hostname}
                </h3>
                <span className={`status-badge ${device.status ? 'status-up' : 'status-down'}`}>
                  <span className={`pulse-dot ${device.status ? 'up' : 'down'}`} />
                  {device.status ? 'ONLINE' : 'OFFLINE'}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700
                }}>
                  {deviceTypeLabel}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                IP: <strong style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{device.ip_address}</strong> • OS: {device.os} • SNMP: {device.snmp_version.toUpperCase()}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onPing(device.id)}
              disabled={pingingId === device.id}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={14} color="#d97706" />
              <span>Ping Now</span>
            </button>

            <button
              onClick={() => onPoll(device.id)}
              disabled={pollingId === device.id}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#0284c7',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Activity size={14} />
              <span>SNMP Poll</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              <X size={18} />
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
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>LIVE INBOUND</span>
              <ArrowDownRight size={14} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
              {latest.inTraffic} {isServer ? 'Gbps' : 'Gbps'}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Interface Rx Rate</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>LIVE OUTBOUND</span>
              <ArrowUpRight size={14} color="#4f46e5" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
              {latest.outTraffic} {isServer ? 'Gbps' : 'Gbps'}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Interface Tx Rate</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>CPU UTILIZATION</span>
              <Cpu size={14} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: latest.cpu > 75 ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
              {latest.cpu}%
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Multi-Core Load</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>ICMP LATENCY</span>
              <Clock size={14} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: latest.latency < 5 ? '#16a34a' : '#d97706', marginTop: '2px' }}>
              {latest.latency} ms
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Zero Jitter Stable</span>
          </div>
        </div>

        {/* Metric Chart Selector Tabs */}
        <div style={{
          padding: '12px 26px 0 26px',
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          {[
            { id: 'traffic', label: 'Network Bandwidth (Gbps)', icon: Network, color: '#0284c7' },
            { id: 'cpu', label: 'CPU Core Utilization (%)', icon: Cpu, color: '#16a34a' },
            { id: 'memory', label: 'Memory / RAM Pools (%)', icon: Database, color: '#7c3aed' },
            { id: 'latency', label: 'Ping Latency RTT (ms)', icon: Activity, color: '#d97706' },
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
                  gap: '6px',
                  padding: '9px 14px',
                  border: 'none',
                  borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                  background: 'transparent',
                  color: isActive ? '#0f172a' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Icon size={15} color={isActive ? tab.color : '#64748b'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Charts or Interface Table */}
        <div style={{ padding: '22px 26px', flex: 1, overflowY: 'auto', background: '#ffffff' }}>
          {/* TAB 1: TRAFFIC CHART */}
          {metricTab === 'traffic' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Real-Time Inbound vs Outbound Throughput
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    High-resolution interface metrics polled via 64-bit HC counters (Model #13, #15)
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0284c7' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
                    Inbound Traffic
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4f46e5' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }} />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Processor Load & Core Telemetry
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Model #31 HOST-RESOURCES-MIB / CISCO-PROCESS-MIB Core Utilization
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
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
                    <Area type="monotone" dataKey="cpu" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#modalCpu)" name="CPU Load (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 3: MEMORY CHART */}
          {metricTab === 'memory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Physical RAM & Memory Pool Allocation
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Model #32 Mempools (Buffer, Cache, Active & Slab Memory)
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700 }}>
                  Buffered & Cached
                </span>
              </div>

              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="modalMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
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
                    <Area type="monotone" dataKey="memory" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#modalMem)" name="Memory (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: LATENCY CHART */}
          {metricTab === 'latency' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    ICMP Ping RTT & Jitter Telemetry
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Continuous Go ICMP fast-ping sub-second probe diagnostics
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>
                  Avg: {device.last_ping_ms.toFixed(2)} ms
                </span>
              </div>

              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              </div>
            </div>
          )}

          {/* TAB 5: INTERFACE PORTS TABLE */}
          {metricTab === 'interfaces' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Physical & Virtual Interface Ports for {device.hostname}
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Model #13 Interfaces • Real-time status, line speed, and traffic counters
                </p>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.76rem' }}>
                    <th style={{ padding: '8px 12px' }}>STATUS</th>
                    <th style={{ padding: '8px 12px' }}>PORT NAME</th>
                    <th style={{ padding: '8px 12px' }}>LINK SPEED</th>
                    <th style={{ padding: '8px 12px' }}>INBOUND (Rx)</th>
                    <th style={{ padding: '8px 12px' }}>OUTBOUND (Tx)</th>
                    <th style={{ padding: '8px 12px' }}>ERRORS</th>
                  </tr>
                </thead>
                <tbody>
                  {interfaces.map((intf, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`status-badge ${intf.status === 'up' ? 'status-up' : 'status-down'}`}>
                          <span className={`pulse-dot ${intf.status === 'up' ? 'up' : 'down'}`} />
                          {intf.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>
                        {intf.name}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#0284c7' }}>
                        {intf.speed}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>
                        {intf.inBps}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600 }}>
                        {intf.outBps}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: intf.errors > 0 ? '#dc2626' : '#16a34a' }}>
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
          padding: '14px 26px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>Telemetry verified via PostgreSQL partitioned storage • Model #1 to #35</span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 600,
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

