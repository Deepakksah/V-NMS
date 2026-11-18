import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, 
  Tag, 
  Zap, 
  Box,
  Radio,
  PhoneCall,
  BellRing,
  RefreshCw
} from 'lucide-react';
import type { Device } from '../../types';
import { ExportButtons } from '../../components/ExportButtons';

export interface RoutingViewProps {
  devices?: Device[];
}

export const RoutingView: React.FC<RoutingViewProps> = ({ devices = [] }) => {
  const [subTab, setSubTab] = useState<'subnets' | 'flows' | 'voip' | 'traps' | 'bgp' | 'arp' | 'vlans'>('subnets');
  const [flows, setFlows] = useState<any[]>([]);
  const [voip, setVoip] = useState<any[]>([]);
  const [traps, setTraps] = useState<any[]>([]);
  const [bgpPeers, setBgpPeers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTelecomData = async () => {
    setLoading(true);
    try {
      const [resF, resV, resT] = await Promise.allSettled([
        axios.get('http://127.0.0.1:8081/api/v1/network/flows', { timeout: 3500 }),
        axios.get('http://127.0.0.1:8081/api/v1/network/voip', { timeout: 3500 }),
        axios.get('http://127.0.0.1:8081/api/v1/network/traps', { timeout: 3500 })
      ]);

      if (resF.status === 'fulfilled' && resF.value.data?.flows) {
        setFlows(resF.value.data.flows);
      }
      if (resV.status === 'fulfilled' && resV.value.data?.voip_records) {
        setVoip(resV.value.data.voip_records);
      }
      if (resT.status === 'fulfilled') {
        if (resT.value.data?.traps) setTraps(resT.value.data.traps);
        if (resT.value.data?.bgp_peers) setBgpPeers(resT.value.data.bgp_peers);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelecomData();
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              IP Routing, NetFlow, VoIP MOS &amp; Telecom Telemetry
            </h2>
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              V-NMS Deep Network Flow Engine
            </span>
          </div>
          <p style={{ fontSize: '0.80rem', color: '#64748b', margin: '4px 0 0 0' }}>
            NetFlow UDP port 2055/6343, VoIP MOS Quality scoring, SNMP trap receiver &amp; BGP peer routing tables
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={fetchTelecomData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Flow</span>
          </button>

          {subTab === 'flows' && (
            <ExportButtons data={flows} filenamePrefix="vnms_netflows" title="NetFlow Records" />
          )}
          {subTab === 'voip' && (
            <ExportButtons data={voip} filenamePrefix="vnms_voip_mos" title="VoIP MOS Quality" />
          )}
          {subTab === 'traps' && (
            <ExportButtons data={traps} filenamePrefix="vnms_snmp_traps" title="SNMP Traps" />
          )}
          {subTab === 'bgp' && (
            <ExportButtons data={bgpPeers} filenamePrefix="vnms_bgp_peers" title="BGP Sessions" />
          )}
        </div>
      </div>

      {/* SubTab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'subnets', label: 'IPAM Subnets', icon: Box, count: liveSubnets.length },
          { id: 'flows', label: 'NetFlow & Top Talkers', icon: Radio, count: flows.length },
          { id: 'voip', label: 'VoIP Jitter & MOS Score', icon: PhoneCall, count: voip.length },
          { id: 'traps', label: 'SNMP Trap Receiver', icon: BellRing, count: traps.length },
          { id: 'bgp', label: 'BGP Neighbor Sessions', icon: Zap, count: bgpPeers.length },
          { id: 'arp', label: 'ARP / IPv4-MAC', icon: Search, count: liveArp.length },
          { id: 'vlans', label: '802.1Q VLANs', icon: Tag, count: liveSubnets.length }
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
                gap: '7px',
                padding: '7px 12px',
                borderRadius: '7px',
                border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#0369a1' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.66rem',
                padding: '1px 6px',
                borderRadius: '9999px',
                background: isActive ? '#bfdbfe' : '#f1f5f9',
                color: isActive ? '#1e40af' : '#64748b',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. IPAM Subnets */}
      {subTab === 'subnets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {liveSubnets.map(s => {
            const utilization = Math.round((s.usedIps / s.totalIps) * 100);
            return (
              <div key={s.prefix} className="glass-panel" style={{ padding: '18px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>VLAN {s.vlanId} Primary Subnet</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.usedIps} / {s.totalIps} Assigned</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>{s.prefix}</h3>
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(5, utilization)}%`, height: '100%', background: '#0284c7' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
                  <span>Utilization Rate</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{utilization}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. NetFlow & Top Talkers */}
      {subTab === 'flows' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                NetFlow / IPFIX Live Flow Collector &amp; Application Tagging (Points 17.2.1 - 17.2.3)
              </h3>
              <p style={{ fontSize: '0.70rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Capturing UDP port 2055/6343 flow packets • Categorized by application signatures (SAP, Teams, SQL, VoIP)
              </p>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
              Real-time Ingress/Egress Flows
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>APPLICATION TAG</th>
                <th style={{ padding: '6px 10px' }}>SOURCE ENDPOINT</th>
                <th style={{ padding: '6px 10px' }}>DESTINATION ENDPOINT</th>
                <th style={{ padding: '6px 10px' }}>PROTOCOL</th>
                <th style={{ padding: '6px 10px' }}>DATA VOLUME</th>
                <th style={{ padding: '6px 10px' }}>PACKETS</th>
                <th style={{ padding: '6px 10px' }}>FLOW DURATION</th>
              </tr>
            </thead>
            <tbody>
              {flows.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9', height: '32px' }}>
                  <td style={{ padding: '4px 10px', fontWeight: 800, color: '#0284c7' }}>
                    <span style={{
                      padding: '1.5px 7px',
                      borderRadius: '4px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      fontSize: '0.70rem'
                    }}>
                      {f.application}
                    </span>
                  </td>

                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                    {f.src_ip}:{f.src_port}
                  </td>

                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', color: '#475569' }}>
                    {f.dst_ip}:{f.dst_port}
                  </td>

                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: f.protocol === 'TCP' ? '#ede9fe' : '#fef3c7',
                      color: f.protocol === 'TCP' ? '#6d28d9' : '#b45309',
                      fontSize: '0.67rem',
                      fontWeight: 700
                    }}>
                      {f.protocol}
                    </span>
                  </td>

                  <td style={{ padding: '4px 10px', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-mono)' }}>
                    {(f.bytes_trans / (1024 * 1024)).toFixed(1)} MB
                  </td>

                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                    {f.packets.toLocaleString()} pkts
                  </td>

                  <td style={{ padding: '4px 10px', color: '#64748b' }}>
                    {(f.duration_ms / 1000).toFixed(1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. VoIP Jitter & MOS Scoring */}
      {subTab === 'voip' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              VoIP Packet Jitter &amp; MOS Quality Scoring (ITU-T G.107 Standard, Points 17.2.4 - 17.2.5)
            </h3>
            <p style={{ fontSize: '0.70rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Standard deviation jitter, packet loss &amp; RFC 3261 SIP OPTIONS latency to enterprise PBX servers
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>VOIP TRUNK / PBX</th>
                <th style={{ padding: '6px 10px' }}>SERVER ENDPOINT</th>
                <th style={{ padding: '6px 10px' }}>MOS SCORE (1.0 - 5.0)</th>
                <th style={{ padding: '6px 10px' }}>JITTER</th>
                <th style={{ padding: '6px 10px' }}>PACKET LOSS</th>
                <th style={{ padding: '6px 10px' }}>SIP OPTIONS RTT</th>
                <th style={{ padding: '6px 10px' }}>VOICE CALL QUALITY</th>
              </tr>
            </thead>
            <tbody>
              {voip.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9', height: '32px' }}>
                  <td style={{ padding: '4px 10px', fontWeight: 800, color: '#0f172a' }}>
                    {v.trunk_name}
                  </td>

                  <td style={{ padding: '4px 10px', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    {v.pbx_server}
                  </td>

                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.80rem',
                      color: v.mos_score >= 4.0 ? '#16a34a' : '#d97706'
                    }}>
                      {v.mos_score} / 5.0
                    </span>
                  </td>

                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                    {v.jitter_ms} ms
                  </td>

                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', color: v.packet_loss_pct > 0.02 ? '#dc2626' : '#16a34a' }}>
                    {v.packet_loss_pct}%
                  </td>

                  <td style={{ padding: '4px 10px', color: '#64748b' }}>
                    {v.sip_options_rtt_ms} ms (200 OK)
                  </td>

                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '1.5px 7px',
                      borderRadius: '4px',
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      fontWeight: 700,
                      fontSize: '0.67rem'
                    }}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. SNMP Trap Receiver */}
      {subTab === 'traps' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              SNMP Trap Receiver Daemon (UDP Port 162 Listener, Point 17.2.8)
            </h3>
            <p style={{ fontSize: '0.70rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Asynchronous trap notifications pushed directly from Cisco switches, firewalls &amp; enterprise servers
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>SENDER IP</th>
                <th style={{ padding: '6px 10px' }}>DEVICE HOSTNAME</th>
                <th style={{ padding: '6px 10px' }}>TRAP OID &amp; NAME</th>
                <th style={{ padding: '6px 10px' }}>SEVERITY</th>
                <th style={{ padding: '6px 10px' }}>MESSAGE TELEMETRY</th>
              </tr>
            </thead>
            <tbody>
              {traps.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', height: '32px' }}>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                    {t.sender_ip}
                  </td>

                  <td style={{ padding: '4px 10px', fontWeight: 700, color: '#0f172a' }}>
                    {t.device_name}
                  </td>

                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#475569' }}>
                    {t.trap_name}
                  </td>

                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      padding: '1.5px 6px',
                      borderRadius: '4px',
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      background: t.severity === 'Warning' ? '#fef3c7' : '#e0f2fe',
                      color: t.severity === 'Warning' ? '#b45309' : '#0369a1',
                      border: `1px solid ${t.severity === 'Warning' ? '#fde68a' : '#bae6fd'}`
                    }}>
                      {t.severity}
                    </span>
                  </td>

                  <td style={{ padding: '4px 10px', color: '#334155' }}>
                    {t.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. BGP Sessions */}
      {subTab === 'bgp' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              BGP4-MIB Peer Sessions &amp; Reset Counters (Points 17.2.6 &amp; 17.2.9)
            </h3>
            <p style={{ fontSize: '0.70rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Border Gateway Protocol autonomous system peering, active routes received &amp; peer flap telemetry
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>PEER IP</th>
                <th style={{ padding: '6px 10px' }}>PEER ASN</th>
                <th style={{ padding: '6px 10px' }}>LOCAL IP</th>
                <th style={{ padding: '6px 10px' }}>PEER STATE</th>
                <th style={{ padding: '6px 10px' }}>PREFIXES RX / TX</th>
                <th style={{ padding: '6px 10px' }}>SESSION UPTIME</th>
                <th style={{ padding: '6px 10px' }}>FLAP RESETS</th>
              </tr>
            </thead>
            <tbody>
              {bgpPeers.map(b => (
                <tr key={b.peer_ip} style={{ borderBottom: '1px solid #f1f5f9', height: '32px' }}>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                    {b.peer_ip}
                  </td>

                  <td style={{ padding: '4px 10px', fontWeight: 700, color: '#0f172a' }}>
                    AS{b.peer_as}
                  </td>

                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                    {b.local_ip}
                  </td>

                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      padding: '1.5px 7px',
                      borderRadius: '4px',
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #bbf7d0'
                    }}>
                      {b.state}
                    </span>
                  </td>

                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                    ↓ {b.prefixes_rx.toLocaleString()} / ↑ {b.prefixes_tx}
                  </td>

                  <td style={{ padding: '4px 10px', color: '#16a34a', fontWeight: 600 }}>
                    {b.uptime_hours} Hours Active
                  </td>

                  <td style={{ padding: '4px 10px', fontWeight: 700, color: b.reset_count === 0 ? '#16a34a' : '#dc2626' }}>
                    {b.reset_count} Flaps
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. ARP Table */}
      {subTab === 'arp' && (
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
            Live ARP Cache / IPv4 to MAC Address Resolution Table
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px' }}>IP ADDRESS</th>
                <th style={{ padding: '6px 10px' }}>MAC ADDRESS</th>
                <th style={{ padding: '6px 10px' }}>INTERFACE</th>
                <th style={{ padding: '6px 10px' }}>HOSTNAME</th>
                <th style={{ padding: '6px 10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {liveArp.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', height: '32px' }}>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, color: '#0284c7' }}>{a.ipAddress}</td>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#334155' }}>{a.macAddress}</td>
                  <td style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#64748b' }}>{a.interfaceName}</td>
                  <td style={{ padding: '4px 10px', fontWeight: 600, color: '#0f172a' }}>{a.deviceHostname}</td>
                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      padding: '1.5px 6px',
                      borderRadius: '4px',
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #bbf7d0'
                    }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
