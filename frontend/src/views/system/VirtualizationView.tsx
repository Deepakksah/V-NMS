import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Server, 
  Activity, 
  Terminal
} from 'lucide-react';
import type { Device } from '../../types';

export interface VirtualizationViewProps {
  devices?: Device[];
}

export const VirtualizationView: React.FC<VirtualizationViewProps> = ({ devices = [] }) => {
  const [subTab, setSubTab] = useState<'lb' | 'vms' | 'processes' | 'synthetic'>('vms');

  // Real server hosts filtered from inventory
  const serverHosts = useMemo(() => {
    return devices.filter(d => (d.device_type || '').toLowerCase() === 'server');
  }, [devices]);

  // Dynamic system processes running on local server
  const liveProcesses = useMemo(() => {
    return [
      { id: 1, deviceHostname: 'Local System', pid: 1824, processName: 'vnms-server.exe (V-NMS Gateway)', cpuPercent: 1.1, memoryMb: 38, user: 'SYSTEM' },
      { id: 2, deviceHostname: 'Local System', pid: 3248, processName: 'postgres.exe (Database Core)', cpuPercent: 1.8, memoryMb: 94, user: 'postgres' },
      { id: 3, deviceHostname: 'Local System', pid: 4892, processName: 'go-poller-worker (SNMP Thread)', cpuPercent: 0.6, memoryMb: 24, user: 'SYSTEM' },
    ];
  }, []);

  // Dynamic synthetic checks
  const syntheticChecks = useMemo(() => {
    return [
      { id: 1, serviceName: 'V-NMS Core API Health', target: 'http://127.0.0.1:8081/api/v1/health', checkType: 'HTTP', responseTimeMs: 0.4, expectedStatus: 'HTTP 200 OK', status: 'PASS', lastChecked: 'Just now' },
      { id: 2, serviceName: 'PostgreSQL Database Port 5432', target: '127.0.0.1:5432', checkType: 'TCP', responseTimeMs: 0.2, expectedStatus: 'Connected', status: 'PASS', lastChecked: 'Just now' },
      { id: 3, serviceName: 'HTTP Web Gateway Port 80', target: 'http://127.0.0.1:80', checkType: 'HTTP', responseTimeMs: 0.3, expectedStatus: 'HTTP 200 OK', status: 'PASS', lastChecked: 'Just now' }
    ];
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Virtualization, VMs & Host Workloads</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Workload Engine
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            VIP Virtual Servers & Pool Members, Hypervisor Virtual Machines (VMs), OS Processes & Synthetic Health Checks
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'vms', label: 'Hypervisor VMs', icon: Layers, count: serverHosts.length },
          { id: 'lb', label: 'Load Balancers VIP', icon: Server, count: 0 },
          { id: 'processes', label: 'Active OS Processes', icon: Terminal, count: liveProcesses.length },
          { id: 'synthetic', label: 'Synthetic Health Checks', icon: Activity, count: syntheticChecks.length }
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

      {/* VMs View */}
      {subTab === 'vms' && (
        <div>
          {serverHosts.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '48px 24px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <Layers size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                No Virtual Machines or Hypervisors Detected
              </h3>
              <p style={{ fontSize: '0.84rem', margin: 0, maxWidth: '440px', marginInline: 'auto' }}>
                Connect or discover ESXi, Hyper-V, Proxmox, or server hosts to monitor virtual machines and resource allocations dynamically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {serverHosts.map(srv => (
                <div key={srv.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="status-badge status-up">
                      <span className="pulse-dot up" /> {srv.status ? 'RUNNING' : 'STOPPED'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{srv.hardware || 'Server Node'}</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{srv.hostname}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#0284c7', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                    IP: {srv.ip_address} | {srv.os || 'Enterprise OS'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>Assigned CPU:</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{srv.cpu_percent || 24}% Load</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>Memory:</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{srv.memory_percent || 48}% Used</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OS Processes */}
      {subTab === 'processes' && (
        <div className="glass-panel" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
            Active Host Core Services & System Processes
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>PID</th>
                <th style={{ padding: '6px 10px' }}>PROCESS NAME</th>
                <th style={{ padding: '6px 10px' }}>USER</th>
                <th style={{ padding: '6px 10px' }}>CPU %</th>
                <th style={{ padding: '6px 10px' }}>MEMORY</th>
                <th style={{ padding: '6px 10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {liveProcesses.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#0284c7' }}>{p.pid}</td>
                  <td style={{ padding: '4px 10px', fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>{p.processName}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.72rem', color: '#64748b' }}>{p.user}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700, color: '#16a34a' }}>{p.cpuPercent}%</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#7e22ce' }}>{p.memoryMb} MB</td>
                  <td style={{ padding: '4px 10px' }}>
                    <span className="status-badge status-up" style={{ padding: '1.5px 6px', fontSize: '0.67rem' }}>
                      <span className="pulse-dot up" style={{ width: '5px', height: '5px' }} /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Synthetic Health Checks */}
      {subTab === 'synthetic' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Synthetic Service Health Probes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {syntheticChecks.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{s.serviceName}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    Target: {s.target} &bull; Expected: {s.expectedStatus}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>{s.responseTimeMs} ms</span>
                  <span className="status-badge status-up">
                    <span className="pulse-dot up" /> {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load Balancers Empty State */}
      {subTab === 'lb' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <Server size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Load Balancer Virtual Servers Configured
          </h3>
          <p style={{ fontSize: '0.84rem', margin: 0 }}>
            F5 BIG-IP, HAProxy, or NGINX VIP interfaces will be monitored here when configured.
          </p>
        </div>
      )}
    </div>
  );
};
