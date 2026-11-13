import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  Binary, 
  ShieldAlert, 
  Radio, 
  ArrowDownRight, 
  ArrowUpRight
} from 'lucide-react';
import { MOCK_PORTS, MOCK_PORTS_FDB, MOCK_PORT_SECURITY } from '../../data/mockEnterpriseData';

export const PortsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'interfaces' | 'fdb' | 'security' | 'broadband'>('interfaces');
  const [search, setSearch] = useState('');

  const filteredPorts = MOCK_PORTS.filter(p => 
    p.ifName.toLowerCase().includes(search.toLowerCase()) ||
    p.ifAlias.toLowerCase().includes(search.toLowerCase()) ||
    p.deviceHostname.toLowerCase().includes(search.toLowerCase())
  );

  const formatSpeed = (speed: number) => {
    if (speed >= 100000000000) return `${speed / 100000000000 * 100}G`;
    if (speed >= 1000000000) return `${speed / 1000000000}G`;
    if (speed >= 1000000) return `${speed / 1000000}M`;
    return `${speed} bps`;
  };

  const formatTraffic = (bps: number) => {
    if (bps >= 1000000000) return `${(bps / 1000000000).toFixed(2)} Gbps`;
    if (bps >= 1000000) return `${(bps / 1000000).toFixed(1)} Mbps`;
    if (bps >= 1000) return `${(bps / 1000).toFixed(1)} Kbps`;
    return `${bps} bps`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Ports, Interfaces & Physical Layer</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #13 - #25
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            High-frequency traffic counters, bridge forwarding database (FDB), 802.1X security & STP topology states
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'interfaces', label: 'All Interfaces (#13, #15)', icon: Network, count: MOCK_PORTS.length },
          { id: 'fdb', label: 'Bridge FDB / MAC Table (#20)', icon: Binary, count: MOCK_PORTS_FDB.length },
          { id: 'security', label: '802.1X Port Security (#19)', icon: ShieldAlert, count: MOCK_PORT_SECURITY.length },
          { id: 'broadband', label: 'Telco ADSL / VDSL (#24, #25)', icon: Radio, count: 2 }
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

      {/* Interfaces Table */}
      {subTab === 'interfaces' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              width: '320px'
            }}>
              <Search size={16} color="#64748b" />
              <input 
                type="text" 
                placeholder="Search interface name, alias or device..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: '0.85rem', width: '100%' }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing {filteredPorts.length} interfaces
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '12px 14px' }}>STATUS</th>
                <th style={{ padding: '12px 14px' }}>DEVICE</th>
                <th style={{ padding: '12px 14px' }}>PORT / NAME</th>
                <th style={{ padding: '12px 14px' }}>SPEED</th>
                <th style={{ padding: '12px 14px' }}>VLAN</th>
                <th style={{ padding: '12px 14px' }}>INBOUND TRAFFIC</th>
                <th style={{ padding: '12px 14px' }}>OUTBOUND TRAFFIC</th>
                <th style={{ padding: '12px 14px' }}>STP STATE</th>
                <th style={{ padding: '12px 14px' }}>ERRORS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPorts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`status-badge ${p.ifOperStatus === 'up' ? 'status-up' : 'status-down'}`}>
                      <span className={`pulse-dot ${p.ifOperStatus === 'up' ? 'up' : 'down'}`}></span>
                      {p.ifOperStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{p.deviceHostname}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{p.ifName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.ifAlias}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
                    {formatSpeed(p.ifSpeed)}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>
                    VLAN {p.vlan}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0369a1', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowDownRight size={14} />
                      {formatTraffic(p.inBps)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#7e22ce', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight size={14} />
                      {formatTraffic(p.outBps)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', textTransform: 'capitalize', color: p.stpState === 'forwarding' ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                    {p.stpState || 'forwarding'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: p.inErrors > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                    {p.inErrors + p.outErrors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FDB Table */}
      {subTab === 'fdb' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Bridge Forwarding Database (FDB / MAC Learning Table - Model #20)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>MAC ADDRESS</th>
                <th style={{ padding: '10px 14px' }}>MANUFACTURER OUI</th>
                <th style={{ padding: '10px 14px' }}>SWITCH / HOST</th>
                <th style={{ padding: '10px 14px' }}>PORT</th>
                <th style={{ padding: '10px 14px' }}>VLAN ID</th>
                <th style={{ padding: '10px 14px' }}>LAST SEEN</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PORTS_FDB.map(fdb => (
                <tr key={fdb.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0284c7', fontWeight: 700 }}>
                    {fdb.macAddress}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{fdb.vendor}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{fdb.deviceHostname}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{fdb.portName}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>VLAN {fdb.vlanId}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>{fdb.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Port Security */}
      {subTab === 'security' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            802.1X & Port Security Violations Tracker (Model #19, #21)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>TIMESTAMP</th>
                <th style={{ padding: '10px 14px' }}>SWITCH</th>
                <th style={{ padding: '10px 14px' }}>PORT</th>
                <th style={{ padding: '10px 14px' }}>VIOLATING MAC</th>
                <th style={{ padding: '10px 14px' }}>VIOLATION TYPE</th>
                <th style={{ padding: '10px 14px' }}>ACTION ENFORCED</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PORT_SECURITY.map(sec => (
                <tr key={sec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#334155' }}>{sec.timestamp}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{sec.deviceHostname}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{sec.portName}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>{sec.violatingMac}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>{sec.violationType}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: '0.72rem' }}>
                      {sec.actionTaken.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Broadband */}
      {subTab === 'broadband' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              MODEL #24 ADSL
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '8px', marginBottom: '14px' }}>
              ADSL Telco Loop Line Diagnostics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Downstream Rate:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>24.0 Mbps</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Upstream Rate:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>2.5 Mbps</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>SNR Margin:</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>14.2 dB (Healthy)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Attenuation:</span>
                <span style={{ color: '#334155' }}>18.5 dB</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7e22ce', fontWeight: 700 }}>
              MODEL #25 VDSL2
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '8px', marginBottom: '14px' }}>
              VDSL2 Vectoring Line Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Vectoring Profile:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>17a Vectoring</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Sync Down / Up:</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>100 Mbps / 40 Mbps</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>CRC Error Counter:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>0 errors in 24h</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
