import React, { useState } from 'react';
import { 
  FileText, 
  Terminal, 
  AppWindow, 
  Search
} from 'lucide-react';
import { 
  MOCK_SYSLOG, 
  MOCK_EVENT_LOGS, 
  MOCK_MONITORED_APPS 
} from '../../data/mockEnterpriseData';

export const LogsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'syslog' | 'events' | 'apps'>('syslog');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredSyslog = MOCK_SYSLOG.filter(l => {
    const matchSev = severityFilter === 'ALL' || l.severity === severityFilter;
    const matchSearch = search === '' || 
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.host.toLowerCase().includes(search.toLowerCase()) ||
      l.program.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Logs, Events, Syslog & Monitored Apps</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #118 - #127
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            High-speed UDP port 514 Syslog receiver, kernel events, auth audit logs & application-specific telemetry
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'syslog', label: 'Real-Time Syslog UDP 514 (#119)', icon: Terminal, count: MOCK_SYSLOG.length },
          { id: 'events', label: 'Device Event Logs (#118)', icon: FileText, count: MOCK_EVENT_LOGS.length },
          { id: 'apps', label: 'Monitored Applications (#124, #125)', icon: AppWindow, count: MOCK_MONITORED_APPS.length }
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

      {/* Syslog Feed */}
      {subTab === 'syslog' && (
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
                placeholder="Search syslog messages, host or tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'crit', 'warning', 'notice', 'info'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    border: severityFilter === sev ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    background: severityFilter === sev ? '#eff6ff' : '#ffffff',
                    color: severityFilter === sev ? '#0369a1' : '#64748b'
                  }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>TIME</th>
                <th style={{ padding: '10px 14px' }}>SEVERITY</th>
                <th style={{ padding: '10px 14px' }}>HOST</th>
                <th style={{ padding: '10px 14px' }}>PROGRAM</th>
                <th style={{ padding: '10px 14px' }}>SYSLOG MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {filteredSyslog.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#334155', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      background: log.severity === 'crit' ? '#fee2e2' : log.severity === 'warning' ? '#fef3c7' : '#e0f2fe',
                      color: log.severity === 'crit' ? '#b91c1c' : log.severity === 'warning' ? '#b45309' : '#0369a1'
                    }}>
                      {log.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{log.host}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#7e22ce', fontFamily: 'var(--font-mono)' }}>{log.program}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#334155' }}>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Events */}
      {subTab === 'events' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Significant Device Event Logs
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>TIMESTAMP</th>
                <th style={{ padding: '10px 14px' }}>DEVICE HOSTNAME</th>
                <th style={{ padding: '10px 14px' }}>EVENT TYPE</th>
                <th style={{ padding: '10px 14px' }}>DETAILS & AUDIT MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_EVENT_LOGS.map(evt => (
                <tr key={evt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#334155' }}>{evt.timestamp}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{evt.deviceHostname}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700 }}>
                      {evt.eventType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{evt.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monitored Apps */}
      {subTab === 'apps' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_MONITORED_APPS.map(app => (
            <div key={app.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="status-badge status-up">
                  <span className="pulse-dot up" /> {app.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 700 }}>
                  v{app.version}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{app.appName}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Host: {app.deviceHostname}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.78rem' }}>
                {Object.entries(app.metrics).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>{k}:</span>
                    <span style={{ color: '#0284c7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
