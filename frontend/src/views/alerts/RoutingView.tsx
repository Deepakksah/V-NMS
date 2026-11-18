import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Tag, 
  Share, 
  Navigation, 
  Zap, 
  Users, 
  Box
} from 'lucide-react';
import type { Device } from '../../types';

export interface RoutingViewProps {
  devices?: Device[];
}

export const RoutingView: React.FC<RoutingViewProps> = ({ devices = [] }) => {
  const [subTab, setSubTab] = useState<'subnets' | 'arp' | 'vlans' | 'vrf' | 'routes' | 'bgp' | 'ospf'>('subnets');

  // Dynamic Subnets calculated from real devices
  const liveSubnets = useMemo(() => {
    if (!devices || devices.length === 0) return [];
    const map: { [prefix: string]: { prefix: string; totalIps: number; usedIps: number; vlanId: number } } = {};
    devices.forEach(d => {
      const parts = (d.ip_address || '').split('.');
      if (parts.length >= 3) {
        const prefix = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
        if (!map[prefix]) {
          map[prefix] = { prefix, totalIps: 254, usedIps: 0, vlanId: 1 };
        }
        map[prefix].usedIps++;
      }
    });
    return Object.values(map);
  }, [devices]);

  // Dynamic ARP entries from real devices
  const liveArp = useMemo(() => {
    if (!devices || devices.length === 0) return [];
    return devices.map((d, idx) => ({
      id: d.id || idx + 1,
      ipAddress: d.ip_address,
      macAddress: d.mac_address || '00:00:00:00:00:00',
      interfaceName: 'eth0',
      deviceHostname: d.hostname || d.ip_address,
      status: d.status ? 'REACHABLE' : 'STALE',
      vlan: 1
    }));
  }, [devices]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>IP, Routing, Switching & Protocols</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Live Routing Tables
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
          { id: 'subnets', label: 'IPAM Subnets', icon: Box, count: liveSubnets.length },
          { id: 'arp', label: 'ARP / IPv4-MAC', icon: Search, count: liveArp.length },
          { id: 'vlans', label: '802.1Q VLANs', icon: Tag, count: liveSubnets.length },
          { id: 'vrf', label: 'VRF Instances', icon: Share, count: 0 },
          { id: 'routes', label: 'Routing Tables', icon: Navigation, count: liveSubnets.length },
          { id: 'bgp', label: 'BGP Neighbor Sessions', icon: Zap, count: 0 },
          { id: 'ospf', label: 'OSPF Adjacencies', icon: Users, count: 0 }
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

      {/* EMPTY STATE */}
      {devices.length === 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <Navigation size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Routing Protocols or Subnets Registered
          </h3>
          <p style={{ fontSize: '0.84rem', margin: 0, maxWidth: '440px', marginInline: 'auto' }}>
            Dynamic routing tables, ARP entries, and VLAN segments will populate automatically upon device discovery.
          </p>
        </div>
      )}

      {/* Subnets View */}
      {devices.length > 0 && subTab === 'subnets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {liveSubnets.map(s => {
            const utilization = Math.round((s.usedIps / s.totalIps) * 100);
            return (
              <div key={s.prefix} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>VLAN {s.vlanId} Default</span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{s.usedIps} / {s.totalIps} Assigned</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>{s.prefix}</h3>
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(5, utilization)}%`, height: '100%', background: '#0284c7' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', marginTop: '6px' }}>
                  <span>Utilization</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{utilization}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ARP View */}
      {devices.length > 0 && subTab === 'arp' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Live ARP Cache / IPv4 to MAC Resolution Table
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 14px' }}>IP ADDRESS</th>
                <th style={{ padding: '10px 14px' }}>MAC ADDRESS</th>
                <th style={{ padding: '10px 14px' }}>INTERFACE</th>
                <th style={{ padding: '10px 14px' }}>HOSTNAME</th>
                <th style={{ padding: '10px 14px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {liveArp.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>{a.ipAddress}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#334155' }}>{a.macAddress}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>{a.interfaceName}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{a.deviceHostname}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="status-badge status-up">
                      <span className="pulse-dot up" /> {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Protocols Empty State */}
      {devices.length > 0 && (subTab === 'bgp' || subTab === 'ospf' || subTab === 'vrf') && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <Zap size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>No Dynamic Adjacencies Established</h4>
          <p style={{ fontSize: '0.8rem', margin: 0 }}>Configure BGP ASN peering or OSPF Area 0 on core routers to inspect neighbor states.</p>
        </div>
      )}
    </div>
  );
};
