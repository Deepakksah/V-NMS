import React from 'react';
// Category 10: Poller Architecture & Clustering
import { MOCK_POLLER_NODES } from '../../data/mockEnterpriseData';

export const PollersView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Distributed Poller Engine & Cluster</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #109 - #112
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
            {MOCK_POLLER_NODES.length} Online
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Zero-Downtime High Availability</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TOTAL GOROUTINE WORKERS</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '8px' }}>
            112 Workers
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Non-blocking concurrent channels</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>AVG CYCLE DURATION</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '8px' }}>
            14.2s
          </div>
          <p style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '4px' }}>Target: &lt; 60 seconds</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CLUSTER MEMORY</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7e22ce', marginTop: '8px' }}>
            184 MB
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Go lightweight runtime footprint</p>
        </div>
      </div>

      {/* Cluster Nodes Table */}
      <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          Distributed Poller Cluster Nodes (Model #109, #110, #111)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
              <th style={{ padding: '10px 14px' }}>STATUS</th>
              <th style={{ padding: '10px 14px' }}>NODE NAME</th>
              <th style={{ padding: '10px 14px' }}>IP ADDRESS</th>
              <th style={{ padding: '10px 14px' }}>GEOGRAPHIC REGION</th>
              <th style={{ padding: '10px 14px' }}>CONCURRENT WORKERS</th>
              <th style={{ padding: '10px 14px' }}>ASSIGNED DEVICES</th>
              <th style={{ padding: '10px 14px' }}>AVG CYCLE TIME</th>
              <th style={{ padding: '10px 14px' }}>MEMORY</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_POLLER_NODES.map(node => (
              <tr key={node.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px' }}>
                  <span className="status-badge status-up">
                    <span className="pulse-dot up" /> {node.status}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{node.name}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0284c7' }}>{node.ipAddress}</td>
                <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{node.region}</td>
                <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0369a1', fontWeight: 700 }}>{node.activeWorkers} Goroutines</td>
                <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0f172a' }}>{node.devicesAssigned} devices</td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#16a34a', fontSize: '0.82rem' }}>{node.avgCycleSeconds}s</td>
                <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#7e22ce' }}>{node.memoryUsageMb} MB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
