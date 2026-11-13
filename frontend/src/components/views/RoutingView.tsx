import React, { useState } from 'react';
import { 
  Search, 
  Tag, 
  Share, 
  Navigation, 
  Zap, 
  Users, 
  Box
} from 'lucide-react';
import { 
  MOCK_SUBNETS, 
  MOCK_ARP, 
  MOCK_VLANS, 
  MOCK_VRFS, 
  MOCK_ROUTES, 
  MOCK_BGP_PEERS, 
  MOCK_OSPF_NEIGHBORS 
} from '../../data/mockEnterpriseData';

export const RoutingView: React.FC = () => {
  const [subTab, setSubTab] = useState<'subnets' | 'arp' | 'vlans' | 'vrf' | 'routes' | 'bgp' | 'ospf'>('subnets');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>IP, Routing, Switching & Protocols</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Models #36 - #55
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            IPAM Subnet pools, ARP cache, 802.1Q VLANs, VRFs, IP routing tables, BGP peer sessions & OSPF adjacencies
          </p>
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'subnets', label: 'IPAM Subnets (#36, #38)', icon: Box, count: MOCK_SUBNETS.length },
          { id: 'arp', label: 'ARP / IPv4-MAC (#37, #40)', icon: Search, count: MOCK_ARP.length },
          { id: 'vlans', label: '802.1Q VLANs (#42)', icon: Tag, count: MOCK_VLANS.length },
          { id: 'vrf', label: 'VRF Instances (#43)', icon: Share, count: MOCK_VRFS.length },
          { id: 'routes', label: 'Routing Tables (#44)', icon: Navigation, count: MOCK_ROUTES.length },
          { id: 'bgp', label: 'BGP Neighbor Sessions (#46, #47)', icon: Zap, count: MOCK_BGP_PEERS.length },
          { id: 'ospf', label: 'OSPF Adjacencies (#48-#55)', icon: Users, count: MOCK_OSPF_NEIGHBORS.length }
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

      {/* Subnets Tab */}
      {subTab === 'subnets' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            IP Address Management (IPAM) Subnet Pools (Model #36, #38)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>SUBNET PREFIX</th>
                <th style={{ padding: '10px 14px' }}>VLAN ID</th>
                <th style={{ padding: '10px 14px' }}>DESCRIPTION</th>
                <th style={{ padding: '10px 14px' }}>USED / TOTAL IPS</th>
                <th style={{ padding: '10px 14px' }}>UTILIZATION</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SUBNETS.map(sub => {
                const percent = Math.round((sub.usedIps / sub.totalIps) * 100);
                return (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#0284c7', fontWeight: 700 }}>
                      {sub.prefix}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>VLAN {sub.vlanId}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{sub.description}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>
                      {sub.usedIps} / {sub.totalIps} hosts
                    </td>
                    <td style={{ padding: '12px 14px', width: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: percent > 80 ? '#dc2626' : '#16a34a' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', width: '35px' }}>{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ARP Table */}
      {subTab === 'arp' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            IPv4 to MAC Address ARP Resolution Table (Model #37)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>IP ADDRESS</th>
                <th style={{ padding: '10px 14px' }}>MAC ADDRESS</th>
                <th style={{ padding: '10px 14px' }}>RESOLVED HOST</th>
                <th style={{ padding: '10px 14px' }}>INTERFACE</th>
                <th style={{ padding: '10px 14px' }}>OUI VENDOR</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ARP.map(arp => (
                <tr key={arp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0284c7', fontWeight: 700 }}>
                    {arp.ipAddress}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#334155' }}>
                    {arp.macAddress}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{arp.deviceHostname}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{arp.interfaceName}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>{arp.manufacturer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BGP Peers */}
      {subTab === 'bgp' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            BGP Autonomous System Peer Sessions (Model #46, #47)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>STATE</th>
                <th style={{ padding: '10px 14px' }}>PEER IP</th>
                <th style={{ padding: '10px 14px' }}>REMOTE ASN</th>
                <th style={{ padding: '10px 14px' }}>LOCAL ASN</th>
                <th style={{ padding: '10px 14px' }}>PREFIXES RCVD / ACCEPTED</th>
                <th style={{ padding: '10px 14px' }}>PEER UPTIME</th>
                <th style={{ padding: '10px 14px' }}>HOST ROUTER</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BGP_PEERS.map(bgp => (
                <tr key={bgp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.72rem' }}>
                      {bgp.state.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0284c7', fontWeight: 700 }}>
                    {bgp.peerIp}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>AS{bgp.remoteAsn}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>AS{bgp.localAsn}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#0369a1', fontWeight: 600 }}>
                    {bgp.prefixesReceived.toLocaleString()} / {bgp.prefixesAccepted.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>{bgp.uptime}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{bgp.deviceHostname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* OSPF */}
      {subTab === 'ospf' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            OSPF Routing Neighbor Adjacencies (Model #48 - #55)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>ADJACENCY STATE</th>
                <th style={{ padding: '10px 14px' }}>ROUTER ID</th>
                <th style={{ padding: '10px 14px' }}>NEIGHBOR IP</th>
                <th style={{ padding: '10px 14px' }}>OSPF AREA</th>
                <th style={{ padding: '10px 14px' }}>INTERFACE</th>
                <th style={{ padding: '10px 14px' }}>LOCAL HOST</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_OSPF_NEIGHBORS.map(ospf => (
                <tr key={ospf.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: ospf.state === 'Full' ? '#dcfce7' : '#fef3c7', color: ospf.state === 'Full' ? '#15803d' : '#b45309', fontWeight: 700, fontSize: '0.72rem' }}>
                      {ospf.state.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{ospf.routerId}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>{ospf.neighborIp}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>Area {ospf.area}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{ospf.interfaceName}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{ospf.deviceHostname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VLANs */}
      {subTab === 'vlans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {MOCK_VLANS.map(vlan => (
            <div key={vlan.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7' }}>
                  VLAN #{vlan.vlanId}
                </span>
                <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                  ACTIVE
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{vlan.name}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>Switch: {vlan.deviceHostname}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div><span style={{ color: '#64748b' }}>Tagged: </span><span style={{ color: '#334155' }}>{vlan.taggedPorts.join(', ') || 'None'}</span></div>
                <div><span style={{ color: '#64748b' }}>Untagged: </span><span style={{ color: '#334155' }}>{vlan.untaggedPorts.join(', ') || 'None'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VRFs */}
      {subTab === 'vrf' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {MOCK_VRFS.map(vrf => (
            <div key={vrf.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7e22ce', fontWeight: 700 }}>
                VRF INSTANCE
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '8px', marginBottom: '4px' }}>{vrf.name}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>Router: {vrf.deviceHostname}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div><span style={{ color: '#64748b' }}>RD: </span><span style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{vrf.routeDistinguisher}</span></div>
                <div><span style={{ color: '#64748b' }}>Target Export: </span><span style={{ color: '#334155', fontFamily: 'var(--font-mono)' }}>{vrf.routeTargetExport}</span></div>
                <div><span style={{ color: '#64748b' }}>Interfaces: </span><span style={{ color: '#16a34a', fontWeight: 700 }}>{vrf.interfacesCount} bound</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Routes */}
      {subTab === 'routes' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            IP Routing Tables (Model #44)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>PROTOCOL</th>
                <th style={{ padding: '10px 14px' }}>DESTINATION PREFIX</th>
                <th style={{ padding: '10px 14px' }}>NEXT HOP GATEWAY</th>
                <th style={{ padding: '10px 14px' }}>METRIC</th>
                <th style={{ padding: '10px 14px' }}>EGRESS INTERFACE</th>
                <th style={{ padding: '10px 14px' }}>DEVICE</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROUTES.map(rt => (
                <tr key={rt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700 }}>
                      {rt.protocol.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>{rt.destination}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#0284c7' }}>{rt.gateway}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{rt.metric}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{rt.interfaceName}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#334155' }}>{rt.deviceHostname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
