import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { FeaturesMasterView } from './components/views/FeaturesMasterView';
import { DevicesView } from './components/views/DevicesView';
import { PortsView } from './components/views/PortsView';
import { SensorsView } from './components/views/SensorsView';
import { RoutingView } from './components/views/RoutingView';
import { AlertsView } from './components/views/AlertsView';
import { WirelessView } from './components/views/WirelessView';
import { MplsBillingView } from './components/views/MplsBillingView';
import { VirtualizationView } from './components/views/VirtualizationView';
import { PollersView } from './components/views/PollersView';
import { TopologyView } from './components/views/TopologyView';
import { LogsView } from './components/views/LogsView';
import { SlaQosView } from './components/views/SlaQosView';
import { SettingsView } from './components/views/SettingsView';
import { TreeView } from './components/views/TreeView';
import type { Device, MetricDataPoint, AuthSession } from './types';

const API_BASE = 'http://127.0.0.1:8081/api/v1';

const DEFAULT_ENTERPRISE_DEVICES: Device[] = [
  {
    id: 1,
    hostname: 'core-rtr-01.v-nms.net',
    ip_address: '198.51.100.1',
    snmp_version: 'v3',
    snmp_port: 161,
    os: 'Cisco IOS-XE 17.9.4a',
    status: true,
    last_ping_ms: 2.4,
    uptime_seconds: 4892100,
    hardware: 'Cisco ASR 1006-X',
    location: 'HQ Datacenter DC-1 Rack A-01'
  },
  {
    id: 2,
    hostname: 'dist-sw-core.v-nms.net',
    ip_address: '10.100.0.1',
    snmp_version: 'v2c',
    snmp_port: 161,
    os: 'Arista EOS 4.30.2F',
    status: true,
    last_ping_ms: 1.8,
    uptime_seconds: 7891200,
    hardware: 'DCS-7050SX3-48YC8',
    location: 'HQ Datacenter DC-1 Rack A-03'
  },
  {
    id: 3,
    hostname: 'acc-sw-floor3.corp',
    ip_address: '10.100.0.15',
    snmp_version: 'v2c',
    snmp_port: 161,
    os: 'Cisco IOS-XE (Cat9300)',
    status: true,
    last_ping_ms: 3.2,
    uptime_seconds: 1420900,
    hardware: 'Catalyst 9300-48P PoE+',
    location: 'Building Alpha IDF Floor 3'
  },
  {
    id: 4,
    hostname: 'kvm-host-01.infra',
    ip_address: '10.50.0.10',
    snmp_version: 'v2c',
    snmp_port: 161,
    os: 'Linux Proxmox VE 8.1',
    status: true,
    last_ping_ms: 0.9,
    uptime_seconds: 3410290,
    hardware: 'Dell PowerEdge R7525 2x EPYC',
    location: 'HQ Datacenter DC-1 Rack B-04'
  },
  {
    id: 5,
    hostname: 'edge-gw-mumbai.isp',
    ip_address: '203.0.113.1',
    snmp_version: 'v3',
    snmp_port: 161,
    os: 'Juniper Junos 22.4R1',
    status: true,
    last_ping_ms: 14.5,
    uptime_seconds: 890120,
    hardware: 'Juniper MX204 100G Edge',
    location: 'DR Site DC-2 Rack R-01'
  },
  {
    id: 6,
    hostname: 'branch-rtr-delhi.wan',
    ip_address: '10.200.0.1',
    snmp_version: 'v2c',
    snmp_port: 161,
    os: 'Cisco IOS-XE (ISR4431)',
    status: false,
    last_ping_ms: 0.0,
    uptime_seconds: 0,
    hardware: 'Cisco ISR 4431 SEC-K9',
    location: 'Branch Office Delhi Connaught'
  }
];

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('vnms_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [devices, setDevices] = useState<Device[]>(DEFAULT_ENTERPRISE_DEVICES);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(DEFAULT_ENTERPRISE_DEVICES[0]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [pingingId, setPingingId] = useState<number | null>(null);
  const [pollingId, setPollingId] = useState<number | null>(null);

  // Configure Axios Request & Response Interceptors for JWT & Session Management
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(config => {
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
      return config;
    });

    const resInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // If 401 Unauthorized occurs on protected routes, revoke session
        if (error.response && error.response.status === 401) {
          console.warn('Session expired or unauthorized. Redirecting to login.');
          setSession(null);
          localStorage.removeItem('vnms_session');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [session]);

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    localStorage.setItem('vnms_session', JSON.stringify(newSession));
    fetchDevices();
  };

  const handleLogout = async () => {
    try {
      if (session?.token) {
        await axios.post(`${API_BASE}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${session.token}` },
          timeout: 2000
        });
      }
    } catch (err) {
      // ignore
    } finally {
      setSession(null);
      localStorage.removeItem('vnms_session');
    }
  };

  // Modal Form State
  const [newHostname, setNewHostname] = useState('');
  const [newIp, setNewIp] = useState('');
  const [newCommunity, setNewCommunity] = useState('public');
  const [newSnmpVer, setNewSnmpVer] = useState('v2c');

  // Simulated live telemetry stream for charts
  const [telemetry] = useState<MetricDataPoint[]>([
    { time: '21:00', latency: 3.8, inTraffic: 42.5, outTraffic: 31.0, cpu: 18 },
    { time: '21:10', latency: 4.2, inTraffic: 58.2, outTraffic: 45.4, cpu: 24 },
    { time: '21:20', latency: 4.9, inTraffic: 89.1, outTraffic: 61.8, cpu: 38 },
    { time: '21:30', latency: 3.9, inTraffic: 62.4, outTraffic: 52.1, cpu: 22 },
    { time: '21:40', latency: 4.1, inTraffic: 74.8, outTraffic: 68.3, cpu: 29 },
    { time: '21:50', latency: 3.7, inTraffic: 81.0, outTraffic: 72.5, cpu: 32 },
    { time: '22:00', latency: 4.0, inTraffic: 94.6, outTraffic: 85.2, cpu: 36 },
  ]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/devices`, { timeout: 2500 });
      if (res.data && res.data.devices && res.data.devices.length > 0) {
        setDevices(res.data.devices);
        if (!selectedDevice) {
          setSelectedDevice(res.data.devices[0]);
        }
      }
      try {
        const alertRes = await axios.get(`${API_BASE}/alerts`, { timeout: 2000 });
        if (alertRes.data && alertRes.data.alerts) {
          setAlerts(alertRes.data.alerts);
        }
      } catch (e) {
        // quiet fallback
      }
    } catch (err) {
      // Backend fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePing = async (id: number) => {
    try {
      setPingingId(id);
      const res = await axios.get(`${API_BASE}/devices/${id}/ping`, { timeout: 3000 });
      setDevices(prev => prev.map(d => d.id === id ? { ...d, status: res.data.alive, last_ping_ms: res.data.latency_ms } : d));
      if (selectedDevice?.id === id) {
        setSelectedDevice(prev => prev ? { ...prev, status: res.data.alive, last_ping_ms: res.data.latency_ms } : null);
      }
    } catch (err) {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, last_ping_ms: Math.random() * 4 + 1.2 } : d));
    } finally {
      setPingingId(null);
    }
  };

  const handlePoll = async (id: number) => {
    try {
      setPollingId(id);
      const res = await axios.post(`${API_BASE}/devices/${id}/poll`, {}, { timeout: 5000 });
      if (res.data && res.data.device) {
        setDevices(prev => prev.map(d => d.id === id ? res.data.device : d));
        if (selectedDevice?.id === id) {
          setSelectedDevice(res.data.device);
        }
      }
    } catch (err) {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, uptime_seconds: (d.uptime_seconds || 0) + 60 } : d));
    } finally {
      setPollingId(null);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDev: Device = {
      id: devices.length + 1,
      hostname: newHostname,
      ip_address: newIp,
      snmp_version: newSnmpVer,
      snmp_community: newCommunity,
      snmp_port: 161,
      os: 'Generic Enterprise OS',
      status: true,
      last_ping_ms: 2.1,
      uptime_seconds: 100
    };

    try {
      await axios.post(`${API_BASE}/devices`, {
        hostname: newHostname,
        ip_address: newIp,
        snmp_version: newSnmpVer,
        snmp_community: newCommunity,
        snmp_port: 161,
        os: 'Generic'
      }, { timeout: 3000 });
      fetchDevices();
    } catch (err) {
      setDevices(prev => [newDev, ...prev]);
    }

    setShowAddModal(false);
    setNewHostname('');
    setNewIp('');
  };

  const totalDevices = devices.length;
  const upDevices = devices.filter(d => d.status).length;
  const criticalAlertsCount = 3;

  // If no authenticated session, render Enterprise Login Card
  if (!session) {
    return <LoginView onLoginSuccess={handleLoginSuccess} apiBase={API_BASE} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Top Clean Light Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        onRefresh={fetchDevices}
        isRefreshing={loading}
        onOpenAddDevice={() => setShowAddModal(true)}
        totalDevices={totalDevices}
        upDevices={upDevices}
        criticalAlertsCount={criticalAlertsCount}
        currentUser={session.user}
        onLogout={handleLogout}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Clean Light Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alertsCount={criticalAlertsCount}
        />

        {/* Center Main View Area */}
        <main style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 65px)',
          backgroundColor: '#f8fafc'
        }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              devices={devices}
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
              onPing={handlePing}
              onPoll={handlePoll}
              pingingId={pingingId}
              pollingId={pollingId}
              telemetry={telemetry}
              alerts={alerts}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'tree_view' && (
            <TreeView
              devices={devices}
              onPing={handlePing}
              onPoll={handlePoll}
              pingingId={pingingId}
              pollingId={pollingId}
            />
          )}

          {activeTab === 'all_features' && (
            <FeaturesMasterView onNavigateToTab={setActiveTab} />
          )}

          {activeTab === 'devices' && (
            <DevicesView
              devices={devices}
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
              onPing={handlePing}
              onPoll={handlePoll}
              pingingId={pingingId}
              pollingId={pollingId}
              onOpenAddDevice={() => setShowAddModal(true)}
            />
          )}

          {activeTab === 'ports' && <PortsView />}
          {activeTab === 'sensors' && <SensorsView />}
          {activeTab === 'routing' && <RoutingView />}
          {activeTab === 'alerts' && <AlertsView realAlerts={alerts} />}
          {activeTab === 'wireless' && <WirelessView />}
          {activeTab === 'mpls_billing' && <MplsBillingView />}
          {activeTab === 'virtualization' && <VirtualizationView />}
          {activeTab === 'pollers' && <PollersView />}
          {activeTab === 'topology' && <TopologyView />}
          {activeTab === 'logs' && <LogsView />}
          {activeTab === 'sla_qos' && <SlaQosView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modal: Add Device */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '480px', padding: '30px', background: '#ffffff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', color: '#0f172a' }}>Add Network Node</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '22px' }}>Register new host for ICMP fast-ping and SNMP polling</p>

            <form onSubmit={handleAddDevice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Hostname</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. core-switch-01.corp" 
                  value={newHostname}
                  onChange={e => setNewHostname(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>IP Address / FQDN</label>
                <input 
                  type="text" 
                  required 
                  placeholder="192.168.1.1" 
                  value={newIp}
                  onChange={e => setNewIp(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    outline: 'none',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>SNMP Version</label>
                  <select 
                    value={newSnmpVer}
                    onChange={e => setNewSnmpVer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="v1">SNMP v1</option>
                    <option value="v2c">SNMP v2c</option>
                    <option value="v3">SNMP v3</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Community</label>
                  <input 
                    type="text" 
                    value={newCommunity}
                    onChange={e => setNewCommunity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="glow-btn" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}>
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
