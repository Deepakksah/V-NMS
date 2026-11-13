import React, { useState } from 'react';
import { 
  Wifi, 
  Sun, 
  Lock, 
  ShieldCheck
} from 'lucide-react';
import { 
  MOCK_ACCESS_POINTS, 
  MOCK_TRANSCEIVERS, 
  MOCK_IPSEC_TUNNELS, 
  MOCK_SSL_CERTS 
} from '../../data/mockEnterpriseData';

export const WirelessView: React.FC = () => {
  const [subTab, setSubTab] = useState<'wifi' | 'transceivers' | 'vpn' | 'ssl'>('wifi');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Wireless, Telco & Specialized Hardware</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #71 - #80
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Wi-Fi Access Points, Optical Transceivers (DOM/DDM dBm), IPsec VPN tunnels & SSL Certificate expiry
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'wifi', label: 'Wi-Fi Access Points (#71, #72)', icon: Wifi, count: MOCK_ACCESS_POINTS.length },
          { id: 'transceivers', label: 'Optical Transceivers DOM (#74)', icon: Sun, count: MOCK_TRANSCEIVERS.length },
          { id: 'vpn', label: 'IPsec VPN Tunnels (#75)', icon: Lock, count: MOCK_IPSEC_TUNNELS.length },
          { id: 'ssl', label: 'SSL/TLS Expiration (#80)', icon: ShieldCheck, count: MOCK_SSL_CERTS.length }
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

      {/* Wi-Fi APs */}
      {subTab === 'wifi' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {MOCK_ACCESS_POINTS.map(ap => (
            <div key={ap.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="status-badge status-up">
                  <span className="pulse-dot up" /> {ap.status}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                  {ap.clientsConnected} Clients Active
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{ap.name}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Controller: {ap.controllerHostname}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Model:</span><span style={{ color: '#0f172a', fontWeight: 600 }}>{ap.model}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Radio Channels:</span><span style={{ color: '#334155' }}>2.4GHz: Ch {ap.channel2G} • 5GHz: Ch {ap.channel5G}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>BSSID MAC:</span><span style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{ap.macAddress}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transceivers */}
      {subTab === 'transceivers' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Optical Transceivers Digital Optical Monitoring (DOM / DDM dBm - Model #74)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>STATUS</th>
                <th style={{ padding: '10px 14px' }}>DEVICE / ROUTER</th>
                <th style={{ padding: '10px 14px' }}>PORT</th>
                <th style={{ padding: '10px 14px' }}>OPTICAL MODULE</th>
                <th style={{ padding: '10px 14px' }}>RX POWER</th>
                <th style={{ padding: '10px 14px' }}>TX POWER</th>
                <th style={{ padding: '10px 14px' }}>WAVELENGTH</th>
                <th style={{ padding: '10px 14px' }}>TEMP</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSCEIVERS.map(tr => (
                <tr key={tr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: tr.status === 'OPTIMAL' ? '#dcfce7' : '#fef3c7', color: tr.status === 'OPTIMAL' ? '#15803d' : '#b45309', fontWeight: 700, fontSize: '0.72rem' }}>
                      {tr.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{tr.deviceHostname}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{tr.portName}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0284c7' }}>{tr.type}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: tr.rxPowerDbm < -15 ? '#dc2626' : '#16a34a', fontSize: '0.82rem' }}>
                    {tr.rxPowerDbm} dBm
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0284c7', fontSize: '0.82rem' }}>
                    {tr.txPowerDbm} dBm
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{tr.wavelengthNm} nm</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#d97706' }}>{tr.temperatureC}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* IPsec VPN */}
      {subTab === 'vpn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_IPSEC_TUNNELS.map(vpn => (
            <div key={vpn.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="status-badge status-up">
                  <span className="pulse-dot up" /> {vpn.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 700 }}>
                  {vpn.ikeVersion}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{vpn.tunnelName}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Encryption: {vpn.encryption}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Local Endpoint:</span><span style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{vpn.localEndpoint}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Remote Peer:</span><span style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{vpn.remoteEndpoint}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Data Transferred:</span><span style={{ color: '#16a34a', fontWeight: 700 }}>{(vpn.bytesInMb / 1024).toFixed(1)} GB In / {(vpn.bytesOutMb / 1024).toFixed(1)} GB Out</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SSL Certificates */}
      {subTab === 'ssl' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {MOCK_SSL_CERTS.map(ssl => (
            <div key={ssl.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: ssl.status === 'VALID' ? '#dcfce7' : '#fef3c7', color: ssl.status === 'VALID' ? '#15803d' : '#b45309', fontWeight: 700, fontSize: '0.72rem' }}>
                  {ssl.status}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: ssl.daysRemaining < 30 ? '#dc2626' : '#16a34a' }}>
                  {ssl.daysRemaining} Days Left
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{ssl.domain}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Issuer: {ssl.issuer}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.75rem', color: '#334155' }}>
                <span>Valid: {ssl.validFrom}</span>
                <span>Expires: {ssl.validTo}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
