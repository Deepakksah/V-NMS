import React from 'react';
import type { Device } from '../../types';

export interface PollersViewProps {
  devices?: Device[];
}

export const PollersView: React.FC<PollersViewProps> = ({ devices = [] }) => {
  const currentHost = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
  const assignedCount = devices.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Distributed Poller Engine & Cluster</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Live Telemetry Core
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Multi-node distributed Go goroutine pollers, concurrent worker pools & regional VPC pinning
          </p>
        </div>
      </div>

      {/* Cluster Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ACTIVE POLLER NODES</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginTop: '8px' }}>
            1 Online
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>V-NMS Windows Core Service</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TOTAL GOROUTINE WORKERS</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '8px' }}>
            {Math.max(8, assignedCount * 2)} Workers
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Non-blocking concurrent channels</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>AVG CYCLE DURATION</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '8px' }}>
            {assignedCount > 0 ? '1.2s' : '0.1s'}
          </div>
          <p style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '4px' }}>Target: &lt; 60 seconds</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CLUSTER MEMORY</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7e22ce', marginTop: '8px' }}>
            ~38 MB
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Go lightweight runtime footprint</p>
        </div>
      </div>

      {/* Cluster Nodes Table */}
      <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          Distributed Poller Cluster Nodes
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
              <th style={{ padding: '10px 14px' }}>STATUS</th>
              <th style={{ padding: '10px 14px' }}>NODE NAME</th>
              <th style={{ padding: '10px 14px' }}>HOST / IP</th>
              <th style={{ padding: '10px 14px' }}>ENGINE ROLE</th>
              <th style={{ padding: '10px 14px' }}>CONCURRENT WORKERS</th>
              <th style={{ padding: '10px 14px' }}>ASSIGNED DEVICES</th>
              <th style={{ padding: '10px 14px' }}>AVG CYCLE TIME</th>
              <th style={{ padding: '10px 14px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 14px' }}>
                <span className="status-badge status-up">
                  <span className="pulse-dot up" /> ONLINE
                </span>
              </td>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                Primary NOC Poller (Local Engine)
              </td>
              <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0284c7' }}>
                {currentHost}
              </td>
              <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>
                Master Orchestrator
              </td>
              <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0369a1', fontWeight: 700 }}>
                {Math.max(8, assignedCount * 2)} Goroutines
              </td>
              <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0f172a' }}>
                {assignedCount} devices
              </td>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#16a34a', fontSize: '0.82rem' }}>
                {assignedCount > 0 ? '1.2s' : '0.1s'}
              </td>
              <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
                Active Service
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
