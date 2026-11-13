import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Send, 
  Check
} from 'lucide-react';
import { 
  MOCK_ALERTS_ACTIVE, 
  MOCK_ALERT_RULES, 
  MOCK_ALERT_SCHEDULES, 
  MOCK_ALERT_TRANSPORTS 
} from '../../data/mockEnterpriseData';
import type { AlertIncident } from '../../types';

interface AlertsViewProps {
  realAlerts?: any[];
}

export const AlertsView: React.FC<AlertsViewProps> = () => {
  const [subTab, setSubTab] = useState<'active' | 'rules' | 'schedules' | 'transports'>('active');
  const [incidents, setIncidents] = useState<AlertIncident[]>(MOCK_ALERTS_ACTIVE);

  const handleAcknowledge = (id: number) => {
    setIncidents(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Alerts, Notifications & Incident Faults</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>
              Models #56 - #70
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Live triggered incidents, SQL-like rule evaluator, scheduled maintenance windows & multi-channel dispatchers
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'active', label: 'Triggered Incidents (#56, #59)', icon: AlertTriangle, count: incidents.length, alert: true },
          { id: 'rules', label: 'Alert Rule Evaluator (#57)', icon: CheckCircle2, count: MOCK_ALERT_RULES.length, alert: false },
          { id: 'schedules', label: 'Maintenance Windows (#60)', icon: Calendar, count: MOCK_ALERT_SCHEDULES.length, alert: false },
          { id: 'transports', label: 'Dispatch Channels (#64, #65)', icon: Send, count: MOCK_ALERT_TRANSPORTS.length, alert: false }
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
                border: isActive ? '1px solid #dc2626' : '1px solid #e2e8f0',
                background: isActive ? '#fef2f2' : '#ffffff',
                color: isActive ? '#b91c1c' : '#64748b',
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
                background: tab.alert ? '#fee2e2' : '#f1f5f9',
                color: tab.alert ? '#b91c1c' : '#64748b',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Incidents */}
      {subTab === 'active' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Live Active Network Faults & Alarms (Model #56)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>SEVERITY</th>
                <th style={{ padding: '10px 14px' }}>RULE TRIGGERED</th>
                <th style={{ padding: '10px 14px' }}>DEVICE HOST</th>
                <th style={{ padding: '10px 14px' }}>FAULT ENTITY</th>
                <th style={{ padding: '10px 14px' }}>TRIGGER VALUE</th>
                <th style={{ padding: '10px 14px' }}>TIME FIRED</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: inc.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                      color: inc.severity === 'CRITICAL' ? '#b91c1c' : '#b45309',
                      border: inc.severity === 'CRITICAL' ? '1px solid #fecaca' : '1px solid #fde68a'
                    }}>
                      {inc.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                    {inc.ruleTitle}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{inc.deviceHostname}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    {inc.entityName} ({inc.entityType})
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#dc2626', fontSize: '0.82rem' }}>{inc.value}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#64748b' }}>{inc.triggeredAt}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    {inc.acknowledged ? (
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Ack'd
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(inc.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rules */}
      {subTab === 'rules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_ALERT_RULES.map(rule => (
            <div key={rule.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: rule.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                  color: rule.severity === 'CRITICAL' ? '#b91c1c' : '#b45309',
                  fontWeight: 800
                }}>
                  {rule.severity}
                </span>

                <span style={{ fontSize: '0.72rem', color: rule.enabled ? '#16a34a' : '#64748b', fontWeight: 700 }}>
                  {rule.enabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{rule.name}</h3>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <code style={{ fontSize: '0.78rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                  {rule.queryRule}
                </code>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Notification Dispatchers:</span>
                <span style={{ color: '#334155' }}>{rule.notifyChannels.join(' • ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance Schedules */}
      {subTab === 'schedules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {MOCK_ALERT_SCHEDULES.map(sch => (
            <div key={sch.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                {sch.status}
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '8px', marginBottom: '4px' }}>
                {sch.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                Target Scope: {sch.targetScope}
              </p>
              <div style={{ fontSize: '0.78rem', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div>Start: {sch.startTime}</div>
                <div>End: {sch.endTime}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatch Channels */}
      {subTab === 'transports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {MOCK_ALERT_TRANSPORTS.map(tr => (
            <div key={tr.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                  {tr.type.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>{tr.status}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{tr.name}</h3>
              <p style={{ fontSize: '0.78rem', color: '#334155', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                {tr.target}
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                Last dispatched: {tr.lastDispatched}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
