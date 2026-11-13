import React, { useState } from 'react';
import { 
  Layers, 
  Server, 
  Activity, 
  Terminal
} from 'lucide-react';
import { 
  MOCK_LOAD_BALANCERS, 
  MOCK_VMS, 
  MOCK_PROCESSES, 
  MOCK_SYNTHETIC_SERVICES 
} from '../../data/mockEnterpriseData';

export const VirtualizationView: React.FC = () => {
  const [subTab, setSubTab] = useState<'lb' | 'vms' | 'processes' | 'synthetic'>('lb');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Load Balancers, Virtualization & Host Systems</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #100 - #108
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
          { id: 'lb', label: 'Load Balancers VIP (#100-#102)', icon: Server, count: MOCK_LOAD_BALANCERS.length },
          { id: 'vms', label: 'Hypervisor VMs (#103)', icon: Layers, count: MOCK_VMS.length },
          { id: 'processes', label: 'OS Processes (#106)', icon: Terminal, count: MOCK_PROCESSES.length },
          { id: 'synthetic', label: 'Synthetic Health Checks (#107, #108)', icon: Activity, count: MOCK_SYNTHETIC_SERVICES.length }
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

      {/* Load Balancers */}
      {subTab === 'lb' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_LOAD_BALANCERS.map(lb => (
            <div key={lb.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="status-badge status-up">
                  <span className="pulse-dot up" /> {lb.status}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                  {lb.healthyBackends} / {lb.totalBackends} Backends Healthy
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{lb.vipName}</h3>
              <p style={{ fontSize: '0.82rem', color: '#0284c7', fontFamily: 'var(--font-mono)', marginBottom: '14px', fontWeight: 600 }}>
                {lb.vipAddress}:{lb.port} ({lb.protocol})
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748b' }}>Active Connections:</span>
                <span style={{ fontWeight: 800, color: '#16a34a' }}>{lb.activeConnections.toLocaleString()} conns</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hypervisor VMs */}
      {subTab === 'vms' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Discovered Virtual Machines &amp; Guest Telemetry
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>STATE</th>
                <th style={{ padding: '10px 14px' }}>VM GUEST NAME</th>
                <th style={{ padding: '10px 14px' }}>HYPERVISOR HOST</th>
                <th style={{ padding: '10px 14px' }}>GUEST OS</th>
                <th style={{ padding: '10px 14px' }}>vCPU</th>
                <th style={{ padding: '10px 14px' }}>RAM</th>
                <th style={{ padding: '10px 14px' }}>CPU UTILIZATION</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_VMS.map(vm => (
                <tr key={vm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="status-badge status-up">
                      <span className="pulse-dot up" /> {vm.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{vm.vmName}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{vm.hypervisor}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{vm.os}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>{vm.vCpu} Cores</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#7e22ce', fontWeight: 600 }}>{vm.ramGb} GB</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: vm.cpuPercent > 60 ? '#d97706' : '#16a34a', fontSize: '0.82rem' }}>
                    {vm.cpuPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* OS Processes */}
      {subTab === 'processes' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Active Host Processes Polled via SNMP Agent
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>PID</th>
                <th style={{ padding: '10px 14px' }}>COMMAND / PROCESS NAME</th>
                <th style={{ padding: '10px 14px' }}>HOST DEVICE</th>
                <th style={{ padding: '10px 14px' }}>USER</th>
                <th style={{ padding: '10px 14px' }}>CPU %</th>
                <th style={{ padding: '10px 14px' }}>RESIDENT MEMORY</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PROCESSES.map(proc => (
                <tr key={proc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#64748b' }}>{proc.pid}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7', fontSize: '0.85rem' }}>{proc.processName}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{proc.deviceHostname}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{proc.user}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>{proc.cpuPercent}%</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>{proc.memoryMb} MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Synthetic Probes */}
      {subTab === 'synthetic' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {MOCK_SYNTHETIC_SERVICES.map(svc => (
            <div key={svc.id} className="glass-panel" style={{ padding: '22px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.72rem' }}>
                  {svc.checkType} PROBE
                </span>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>{svc.status}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{svc.serviceName}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                {svc.target}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748b' }}>Response Latency:</span>
                <span style={{ fontWeight: 800, color: '#16a34a' }}>{svc.responseTimeMs} ms</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
