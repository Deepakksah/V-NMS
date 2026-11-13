import React, { useState } from 'react';
import { 
  Key, 
  Users, 
  Sliders, 
  Globe
} from 'lucide-react';
import { 
  MOCK_USERS, 
  MOCK_VAULT_SECRETS, 
  MOCK_SYSTEM_CONFIGS, 
  MOCK_PEERING_IXPS 
} from '../../data/mockEnterpriseData';

export const SettingsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'users' | 'vault' | 'configs' | 'peering'>('users');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Users, Secret Vault & System Foundations</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #132 - #145 (14 Models)
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Role-Based Access Control (RBAC), AES-256-GCM Secret Vault, System Configs & PeeringDB IXP Integrations
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'users', label: 'User Accounts & RBAC (#132, #133)', icon: Users, count: MOCK_USERS.length },
          { id: 'vault', label: 'AES-256-GCM Secret Vault (#136)', icon: Key, count: MOCK_VAULT_SECRETS.length },
          { id: 'configs', label: 'System Engine Configs (#139)', icon: Sliders, count: MOCK_SYSTEM_CONFIGS.length },
          { id: 'peering', label: 'PeeringDB IXPs (#142, #143)', icon: Globe, count: MOCK_PEERING_IXPS.length }
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

      {/* Users */}
      {subTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            User Accounts & Role-Based Access Control (Model #132)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>USERNAME</th>
                <th style={{ padding: '10px 14px' }}>EMAIL</th>
                <th style={{ padding: '10px 14px' }}>ROLE</th>
                <th style={{ padding: '10px 14px' }}>2FA STATUS</th>
                <th style={{ padding: '10px 14px' }}>LAST LOGIN</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{u.username}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{u.email}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: u.role === 'superadmin' ? '#f3e8ff' : '#e0f2fe',
                      color: u.role === 'superadmin' ? '#7e22ce' : '#0369a1',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: u.twoFactorEnabled ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                    {u.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#64748b' }}>{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Secret Vault */}
      {subTab === 'vault' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_VAULT_SECRETS.map(sec => (
            <div key={sec.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                  {sec.cipher}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                  {sec.targetType.toUpperCase()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{sec.title}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Target: {sec.targetDevice}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.75rem', color: '#334155' }}>
                <span>Vault Encryption: Active</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>Key Stored In Hardware HSM</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* System Configs */}
      {subTab === 'configs' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            System Global Configurations & Engine Defaults (Model #139)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>SUBSYSTEM GROUP</th>
                <th style={{ padding: '10px 14px' }}>CONFIG KEY</th>
                <th style={{ padding: '10px 14px' }}>VALUE</th>
                <th style={{ padding: '10px 14px' }}>DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SYSTEM_CONFIGS.map(cfg => (
                <tr key={cfg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700 }}>
                      {cfg.group}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{cfg.key}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>{cfg.value}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{cfg.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PeeringDB IXPs */}
      {subTab === 'peering' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_PEERING_IXPS.map(ix => (
            <div key={ix.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7e22ce', fontWeight: 700 }}>
                  MODEL #142 PEERINGDB
                </span>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>{ix.speedGbps} Gbps Fabric</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{ix.ixName}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Location: {ix.city}, {ix.country}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div><span style={{ color: '#64748b' }}>IPv4 Subnet: </span><span style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{ix.ipv4Prefix}</span></div>
                <div><span style={{ color: '#64748b' }}>IPv6 Prefix: </span><span style={{ color: '#334155', fontFamily: 'var(--font-mono)' }}>{ix.ipv6Prefix}</span></div>
                <div><span style={{ color: '#64748b' }}>Connected ASNs: </span><span style={{ color: '#16a34a', fontWeight: 700 }}>{ix.participantsCount} Peers Connected</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
