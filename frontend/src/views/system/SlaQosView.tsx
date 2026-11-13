import React, { useState } from 'react';
import { 
  Activity, 
  TrendingDown, 
  Sliders
} from 'lucide-react';
import { 
  MOCK_SLA_PROBES, 
  MOCK_QOS_CLASSES, 
  MOCK_CUSTOM_OIDS 
} from '../../data/mockEnterpriseData';

export const SlaQosView: React.FC = () => {
  const [subTab, setSubTab] = useState<'sla' | 'qos' | 'custom_oid'>('sla');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>SLA Probes, QoS Shaping & Custom SNMP OIDs</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #128 - #131
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Cisco IP SLA Voice MOS score, packet jitter, QoS class-map bandwidth policing & custom SNMP OID builder
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'sla', label: 'Cisco IP SLA Probes & MOS (#128)', icon: Activity, count: MOCK_SLA_PROBES.length },
          { id: 'qos', label: 'QoS Bandwidth Shaping (#129)', icon: TrendingDown, count: MOCK_QOS_CLASSES.length },
          { id: 'custom_oid', label: 'Custom SNMP OID Poller (#131)', icon: Sliders, count: MOCK_CUSTOM_OIDS.length }
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

      {/* SLA Probes */}
      {subTab === 'sla' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_SLA_PROBES.map(sla => (
            <div key={sla.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="status-badge status-up">
                  <span className="pulse-dot up" /> {sla.status}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a' }}>
                  MOS {sla.mosScore.toFixed(2)} / 5.0
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{sla.probeName}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>
                Target IP: <span style={{ fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 600 }}>{sla.targetIp}</span>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>RTT Latency</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{sla.rttMs} ms</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Jitter</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{sla.jitterMs} ms</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Loss %</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: sla.packetLossPercent > 0 ? '#dc2626' : '#16a34a', marginTop: '2px' }}>{sla.packetLossPercent}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QoS Shaping */}
      {subTab === 'qos' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Quality of Service (QoS) Class-Map Policing &amp; Drop Counters
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>ROUTER DEVICE</th>
                <th style={{ padding: '10px 14px' }}>POLICY NAME</th>
                <th style={{ padding: '10px 14px' }}>CLASS MAP</th>
                <th style={{ padding: '10px 14px' }}>ALLOCATED BANDWIDTH</th>
                <th style={{ padding: '10px 14px' }}>CURRENT THROUGHPUT</th>
                <th style={{ padding: '10px 14px' }}>DROPPED PACKETS</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_QOS_CLASSES.map(qos => (
                <tr key={qos.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{qos.deviceHostname}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{qos.policyName}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0284c7', fontWeight: 700 }}>{qos.classMap}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{(qos.allocatedBps / 1000000000).toFixed(1)} Gbps</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#7e22ce', fontWeight: 700 }}>{(qos.currentBps / 1000000).toFixed(0)} Mbps</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: qos.droppedPackets > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                    {qos.droppedPackets} drops
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom OID */}
      {subTab === 'custom_oid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_CUSTOM_OIDS.map(oid => (
            <div key={oid.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                CUSTOM SNMP OID MONITOR
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '8px', marginBottom: '4px' }}>
                {oid.oidName}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>
                Device: {oid.deviceHostname}
              </p>

              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>OID Path</span>
                <code style={{ fontSize: '0.78rem', color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  {oid.oidString}
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748b' }}>Polled Value:</span>
                <span style={{ color: '#16a34a', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{oid.lastValue}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
