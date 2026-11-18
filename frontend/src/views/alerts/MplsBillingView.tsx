import React, { useState } from 'react';
import { 
  GitBranch, 
  CreditCard, 
  Repeat
} from 'lucide-react';
import { 
  MOCK_MPLS_LSPS, 
  MOCK_PSEUDOWIRES, 
  MOCK_BILLS 
} from '../../data/mockEnterpriseData';
import { PageHeader } from '../../components/PageHeader';

export const MplsBillingView: React.FC = () => {
  const [subTab, setSubTab] = useState<'billing' | 'mpls' | 'pseudowires'>('billing');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Enterprise Dark NOC Header */}
      <PageHeader
        icon={CreditCard}
        title="MPLS, Carrier WAN & 95th% Bandwidth Billing"
        subtitle="MPLS Label Switched Paths (LSP), Layer 2 Pseudowires (EoMPLS), CDR quotas & 95th Percentile ISP Billing Contracts"
        badge="Models #81 - #99"
        badgeColor="purple"
      />

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'billing', label: '95th Percentile Customer Invoicing (#91-#99)', icon: CreditCard, count: MOCK_BILLS.length },
          { id: 'mpls', label: 'MPLS LSPs & Hops (#81-#89)', icon: GitBranch, count: MOCK_MPLS_LSPS.length },
          { id: 'pseudowires', label: 'Layer 2 Pseudowires (#90)', icon: Repeat, count: MOCK_PSEUDOWIRES.length }
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

      {/* 95th Percentile Billing */}
      {subTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
            {MOCK_BILLS.map(bill => (
              <div key={bill.id} className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: bill.overageStatus === 'OK' ? '#dcfce7' : '#fee2e2',
                    color: bill.overageStatus === 'OK' ? '#15803d' : '#b91c1c'
                  }}>
                    {bill.overageStatus}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{bill.billPeriod}</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{bill.customerName}</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>Contract Type: 95th Percentile Transit Burst</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Committed CIR</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                      {(bill.committedMbps / 1000).toFixed(0)} Gbps
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Current 95th%</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: bill.current95thMbps > bill.committedMbps ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
                      {(bill.current95thMbps / 1000).toFixed(1)} Gbps
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  Assigned Billing Ports: {bill.assignedPorts.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MPLS LSPs */}
      {subTab === 'mpls' && (
        <div className="glass-panel" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
            MPLS Label Switched Paths (LSP) Status
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>STATUS</th>
                <th style={{ padding: '6px 10px' }}>LSP TUNNEL NAME</th>
                <th style={{ padding: '6px 10px' }}>INGRESS ROUTER</th>
                <th style={{ padding: '6px 10px' }}>EGRESS ROUTER</th>
                <th style={{ padding: '6px 10px' }}>CIRCUIT BANDWIDTH</th>
                <th style={{ padding: '6px 10px' }}>FAST REROUTE (FRR)</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MPLS_LSPS.map(lsp => (
                <tr key={lsp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '4px 10px' }}>
                    <span className="status-badge status-up" style={{ padding: '1.5px 6px', fontSize: '0.67rem' }}>
                      <span className="pulse-dot up" style={{ width: '5px', height: '5px' }} /> {lsp.operStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '4px 10px', fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>{lsp.lspName}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#334155' }}>{lsp.sourceRouter}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#334155' }}>{lsp.destRouter}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>
                    {(lsp.bandwidthMbps / 1000).toFixed(0)} Gbps
                  </td>
                  <td style={{ padding: '4px 10px', fontSize: '0.72rem', color: lsp.fastReroute ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                    {lsp.fastReroute ? 'Enabled' : 'Disabled'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pseudowires */}
      {subTab === 'pseudowires' && (
        <div className="glass-panel" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
            Layer 2 Pseudowires (EoMPLS / L2VPN Circuits)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>STATUS</th>
                <th style={{ padding: '6px 10px' }}>PW ID</th>
                <th style={{ padding: '6px 10px' }}>VC ID</th>
                <th style={{ padding: '6px 10px' }}>CIRCUIT TYPE</th>
                <th style={{ padding: '6px 10px' }}>LOCAL INTERFACE</th>
                <th style={{ padding: '6px 10px' }}>PEER ROUTER IP</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PSEUDOWIRES.map(pw => (
                <tr key={pw.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '4px 10px' }}>
                    <span className="status-badge status-up" style={{ padding: '1.5px 6px', fontSize: '0.67rem' }}>
                      <span className="pulse-dot up" style={{ width: '5px', height: '5px' }} /> {pw.operStatus}
                    </span>
                  </td>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#0f172a', fontWeight: 600 }}>#{pw.pwId}</td>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>VC-{pw.vcId}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#334155' }}>{pw.circuitType}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#7e22ce' }}>{pw.localInterface}</td>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#0284c7' }}>{pw.peerRouter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
