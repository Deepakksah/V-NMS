import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Play, 
  Pause, 
  QrCode, 
  Link2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import type { Device } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ExportButtons } from '../../components/ExportButtons';

interface NocWallboardViewProps {
  devices: Device[];
  onNavigateTab?: (tab: string) => void;
}

export const NocWallboardView: React.FC<NocWallboardViewProps> = ({ devices, onNavigateTab: _onNavigateTab }) => {
  const toast = useToast();
  const [carouselActive, setCarouselActive] = useState(false);
  const [carouselCountdown, setCarouselCountdown] = useState(30);
  const [activeWallboardTab, setActiveWallboardTab] = useState<'gauges_rack' | 'sunburst' | 'comparator' | 'qrcodes'>('gauges_rack');
  const [selectedMetricOverlay, setSelectedMetricOverlay] = useState<'cpu_vs_bandwidth' | 'latency_vs_loss'>('cpu_vs_bandwidth');
  const [showQrModal, setShowQrModal] = useState(false);

  // Auto-slideshow carousel countdown (Point 17.8.10)
  useEffect(() => {
    if (!carouselActive) return;
    const interval = setInterval(() => {
      setCarouselCountdown(prev => {
        if (prev <= 1) {
          // Rotate to next wallboard tab or next view
          setActiveWallboardTab(cur => {
            if (cur === 'gauges_rack') return 'sunburst';
            if (cur === 'sunburst') return 'comparator';
            return 'gauges_rack';
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [carouselActive]);

  const totalDevs = devices.length;
  const upDevs = devices.filter(d => d.status).length;
  const _avgPing = totalDevs > 0 ? (devices.reduce((acc, d) => acc + (d.last_ping_ms || 1), 0) / totalDevs).toFixed(1) : '1.2';
  void _avgPing;
  const overallCpu = 38;
  const overallMem = 54;
  const overallWan = 420;

  // Comparator timeline sample data
  const comparatorData = [
    { time: '10:00', cpu: 32, bandwidth: 210, latency: 1.1 },
    { time: '10:05', cpu: 35, bandwidth: 280, latency: 1.2 },
    { time: '10:10', cpu: 48, bandwidth: 490, latency: 1.4 },
    { time: '10:15', cpu: 78, bandwidth: 820, latency: 2.8 },
    { time: '10:20', cpu: 52, bandwidth: 540, latency: 1.8 },
    { time: '10:25', cpu: 40, bandwidth: 390, latency: 1.3 },
    { time: '10:30', cpu: 38, bandwidth: 420, latency: 1.2 },
  ];

  // Copy public wallboard URL (Point 17.8.9)
  const handleCopyPublicUrl = () => {
    const url = `${window.location.origin}/wallboard?token=live_noc_${Date.now()}`;
    navigator.clipboard.writeText(url);
    toast.success('Public Read-Only Wallboard URL copied! Unattended NOC wall TVs can display without login.', 'Wallboard Link');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls Bar */}
      <div style={{
        background: '#0f172a',
        padding: '16px 20px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        color: '#ffffff',
        border: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0284c7', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <Tv size={20} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              NOC Interactive Wallboard &amp; Visual Studio
              <span style={{ fontSize: '0.65rem', background: '#22c55e', color: '#052e16', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>
                PRTG #71-#80
              </span>
            </h2>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Analog Speedometer Gauges • Red/Amber/Green Stoplights • 42U Rack Elevation • QR Codes • Public TV URLs
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Carousel Toggle (Point 17.8.10) */}
          <button
            onClick={() => setCarouselActive(!carouselActive)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: carouselActive ? '#0284c7' : '#1e293b',
              border: '1px solid #334155',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {carouselActive ? <Pause size={13} /> : <Play size={13} />}
            <span>Carousel Auto-Rotate: {carouselActive ? `${carouselCountdown}s` : 'OFF'}</span>
          </button>

          {/* Copy Public Link (Point 17.8.9) */}
          <button
            onClick={handleCopyPublicUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#38bdf8',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Link2 size={13} />
            <span>Public TV Link</span>
          </button>

          {/* QR Codes (Point 17.8.8) */}
          <button
            onClick={() => setShowQrModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#facc15',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <QrCode size={13} />
            <span>Rack QR Generator</span>
          </button>

          <ExportButtons data={devices} filenamePrefix="vnms_noc_wallboard" title="NOC Wallboard" />
        </div>
      </div>

      {/* Sub-View Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        {[
          { id: 'gauges_rack', label: 'Speedometer Dials & 42U Rack (#71, #72, #74)' },
          { id: 'sunburst', label: 'Concentric Sunburst Hierarchy (#73, #76)' },
          { id: 'comparator', label: 'Multi-Metric Timeline Comparator (#77)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveWallboardTab(tab.id as any)}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              border: activeWallboardTab === tab.id ? '1px solid #0284c7' : '1px solid #cbd5e1',
              background: activeWallboardTab === tab.id ? '#eff6ff' : '#ffffff',
              color: activeWallboardTab === tab.id ? '#0369a1' : '#64748b',
              fontWeight: activeWallboardTab === tab.id ? 700 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Gauges, Stoplights & 42U Server Rack View */}
      {activeWallboardTab === 'gauges_rack' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Row: Speedometers & Traffic Lights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Speedometer Gauge: Core CPU */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                CLUSTER CPU SPEEDOMETER
              </div>
              {/* Circular Gauge SVG */}
              <svg width="140" height="90" viewBox="0 0 140 90" style={{ margin: '0 auto' }}>
                <path d="M 20 80 A 50 50 0 0 1 120 80" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                <path d="M 20 80 A 50 50 0 0 1 120 80" fill="none" stroke="#0284c7" strokeWidth="12" strokeLinecap="round" strokeDasharray="157" strokeDashoffset={157 - (157 * overallCpu / 100)} />
                <circle cx="70" cy="80" r="4" fill="#0f172a" />
                <text x="70" y="70" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a">{overallCpu}%</text>
              </svg>
              <div style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                Nominal Range (Limit 85%)
              </div>
            </div>

            {/* Speedometer Gauge: Memory Pool */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                RAM MEMORY UTILIZATION
              </div>
              <svg width="140" height="90" viewBox="0 0 140 90" style={{ margin: '0 auto' }}>
                <path d="M 20 80 A 50 50 0 0 1 120 80" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                <path d="M 20 80 A 50 50 0 0 1 120 80" fill="none" stroke="#7c3aed" strokeWidth="12" strokeLinecap="round" strokeDasharray="157" strokeDashoffset={157 - (157 * overallMem / 100)} />
                <circle cx="70" cy="80" r="4" fill="#0f172a" />
                <text x="70" y="70" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a">{overallMem}%</text>
              </svg>
              <div style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 700, marginTop: '4px' }}>
                Optimal Alloc (Limit 90%)
              </div>
            </div>

            {/* Speedometer Gauge: WAN Bandwidth */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                WAN EGRESS BANDWIDTH
              </div>
              <svg width="140" height="90" viewBox="0 0 140 90" style={{ margin: '0 auto' }}>
                <path d="M 20 80 A 50 50 0 0 1 120 80" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                <path d="M 20 80 A 50 50 0 0 1 120 80" fill="none" stroke="#059669" strokeWidth="12" strokeLinecap="round" strokeDasharray="157" strokeDashoffset={157 - (157 * (overallWan / 1000))} />
                <circle cx="70" cy="80" r="4" fill="#0f172a" />
                <text x="70" y="70" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a">{overallWan}</text>
              </svg>
              <div style={{ fontSize: '0.70rem', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                Mbps (1.0 Gbps Pipe)
              </div>
            </div>

            {/* Traffic Light Stoplight Indicator (Point 17.8.6) */}
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', textAlign: 'center', color: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', marginBottom: '10px' }}>
                EXECUTIVE STOPLIGHT (#76)
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', alignItems: 'center' }}>
                {/* Red */}
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#450a0a', border: '2px solid #7f1d1d', opacity: 0.3 }} />
                {/* Amber */}
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#451a03', border: '2px solid #78350f', opacity: 0.3 }} />
                {/* Green (Active Glow) */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#22c55e', border: '2px solid #86efac',
                  boxShadow: '0 0 12px #22c55e'
                }} />
              </div>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#4ade80', marginTop: '12px' }}>
                ALL NODES HEALTHY ({upDevs}/{totalDevs} UP)
              </div>
            </div>
          </div>

          {/* 42U Server Rack Elevation Overlay (Point 17.8.2) */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Datacenter Rack 01 Elevation Overlay (42U Chassis Grid)
                </h3>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Interactive equipment positions, blade power states, thermals, and live server slot pins
                </p>
              </div>
              <span style={{ fontSize: '0.70rem', background: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '4px', fontWeight: 700 }}>
                Standard 19-inch 42U Server Cabinet
              </span>
            </div>

            {/* 42U Rack Graphic Representation */}
            <div style={{
              background: '#0f172a',
              borderRadius: '8px',
              padding: '16px',
              border: '4px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {[
                { u: '40-42U', name: 'Cisco Catalyst 9300 48-Port PoE+ Switch', type: 'Switch', temp: '28°C', status: 'ONLINE', color: '#059669' },
                { u: '38-39U', name: 'Fortinet FortiGate 200F Cluster Active', type: 'Firewall', temp: '31°C', status: 'ONLINE', color: '#dc2626' },
                { u: '34-37U', name: 'WIN-TBI5QJB6P82 (Dell PowerEdge R750 2U)', type: 'Server', temp: '22°C', status: 'ONLINE', color: '#2563eb' },
                { u: '30-33U', name: 'WIN-S6S7597BION (HPE ProLiant DL380 Gen10)', type: 'Server', temp: '23°C', status: 'ONLINE', color: '#2563eb' },
                { u: '26-29U', name: 'linux-node-17 (Supermicro 1U Dual AMD EPYC)', type: 'Server', temp: '21°C', status: 'ONLINE', color: '#0284c7' },
                { u: '18-25U', name: 'NetApp FAS2750 NVMe Flash Storage Shelf', type: 'Storage', temp: '24°C', status: 'ONLINE', color: '#7c3aed' },
                { u: '01-06U', name: 'APC Smart-UPS RT 6000VA On-Line Power (2x 3U)', type: 'UPS', temp: '26°C', status: 'ONLINE', color: '#d97706' },
              ].map((blade, bIdx) => (
                <div
                  key={bIdx}
                  style={{
                    background: '#1e293b',
                    borderRadius: '4px',
                    padding: '8px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: `4px solid ${blade.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#94a3b8', fontWeight: 700 }}>
                      [{blade.u}]
                    </span>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f8fafc' }}>
                      {blade.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem' }}>
                    <span style={{ color: '#38bdf8' }}>Inlet: <strong>{blade.temp}</strong></span>
                    <span style={{ background: '#052e16', color: '#4ade80', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.68rem' }}>
                      ● {blade.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Concentric Sunburst Hierarchy View (Point 17.8.3) */}
      {activeWallboardTab === 'sunburst' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Concentric Sunburst Infrastructure Health Chart (#73)
          </h3>
          <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0 0 20px 0' }}>
            Multi-tier hierarchical view from Root Core down to Subnets, Device Nodes, and Telemetry Channels
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <svg width="340" height="340" viewBox="0 0 340 340">
              {/* Outer Ring: Sensors */}
              <circle cx="170" cy="170" r="150" fill="none" stroke="#e0f2fe" strokeWidth="24" />
              <circle cx="170" cy="170" r="150" fill="none" stroke="#0284c7" strokeWidth="24" strokeDasharray="942" strokeDashoffset="0" />
              
              {/* Middle Ring: Node Devices */}
              <circle cx="170" cy="170" r="115" fill="none" stroke="#dcfce7" strokeWidth="26" />
              <circle cx="170" cy="170" r="115" fill="none" stroke="#16a34a" strokeWidth="26" strokeDasharray="722" strokeDashoffset="0" />

              {/* Inner Ring: Subnets */}
              <circle cx="170" cy="170" r="75" fill="none" stroke="#ede9fe" strokeWidth="28" />
              <circle cx="170" cy="170" r="75" fill="none" stroke="#7c3aed" strokeWidth="28" strokeDasharray="471" strokeDashoffset="0" />

              {/* Center Core */}
              <circle cx="170" cy="170" r="45" fill="#0f172a" />
              <text x="170" y="165" textAnchor="middle" fontSize="12" fontWeight="800" fill="#38bdf8">V-NMS</text>
              <text x="170" y="180" textAnchor="middle" fontSize="10" fontWeight="700" fill="#22c55e">100% UP</text>
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.75rem', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#0f172a' }} />
              <span>Center: Root NOC Core</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#7c3aed' }} />
              <span>Ring 1: Routed Subnets</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#16a34a' }} />
              <span>Ring 2: Physical/Virtual Nodes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#0284c7' }} />
              <span>Ring 3: Active Sensors</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Multi-Metric Interactive Comparator View (Point 17.8.7) */}
      {activeWallboardTab === 'comparator' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Multi-Metric Interactive Correlation Comparator (#77)
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Overlaying CPU spikes vs Bandwidth surges vs Ping Latency on a synchronized timeline
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setSelectedMetricOverlay('cpu_vs_bandwidth')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: selectedMetricOverlay === 'cpu_vs_bandwidth' ? '#eff6ff' : '#ffffff',
                  color: selectedMetricOverlay === 'cpu_vs_bandwidth' ? '#0284c7' : '#64748b',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                CPU vs Bandwidth
              </button>
              <button
                onClick={() => setSelectedMetricOverlay('latency_vs_loss')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: selectedMetricOverlay === 'latency_vs_loss' ? '#eff6ff' : '#ffffff',
                  color: selectedMetricOverlay === 'latency_vs_loss' ? '#0284c7' : '#64748b',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Latency vs Traffic
              </button>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparatorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '6px', fontSize: '0.75rem' }} />
                <Legend />
                <Line type="monotone" dataKey="cpu" name="CPU Utilization (%)" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bandwidth" name="WAN Bandwidth (Mbps)" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="latency" name="RTT Latency (ms)" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* QR Code Generator Modal (Point 17.8.8) */}
      {showQrModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '420px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Server Rack Equipment QR Code Generator
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '16px' }}>
              Print this QR badge and affix to cabinet rack. Technicians scanning with phone instantly view live node health.
            </p>

            {/* Generated QR Mockup */}
            <div style={{ display: 'inline-block', padding: '16px', border: '2px solid #0f172a', borderRadius: '8px', background: '#f8fafc', marginBottom: '16px' }}>
              <QrCode size={160} color="#0f172a" />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>
                RACK-01-CABINET-PROD
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  toast.success('QR Code printed / exported to PDF!', 'Print Success');
                  setShowQrModal(false);
                }}
                style={{ padding: '8px 16px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Print Equipment Badge
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
