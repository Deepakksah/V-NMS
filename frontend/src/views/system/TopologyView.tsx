import React, { useState } from 'react';
import { 
  ZoomIn, 
  Maximize2,
  Server
} from 'lucide-react';
import { MOCK_TOPOLOGY_NODES, MOCK_TOPOLOGY_LINKS } from '../../data/mockEnterpriseData';
import type { TopologyNode, TopologyLink } from '../../types';

export const TopologyView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(MOCK_TOPOLOGY_NODES[0]);
  const [selectedLink, setSelectedLink] = useState<TopologyLink | null>(null);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'core_router': return '#0284c7';
      case 'switch': return '#4f46e5';
      case 'firewall': return '#dc2626';
      case 'server': return '#16a34a';
      case 'ap': return '#7c3aed';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Custom Maps & Network Topology Canvas</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              LLDP / CDP Auto-Map
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Interactive vector topology diagram, LLDP/CDP link protocol auto-mapping & real-time link traffic color styling
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            LLDP Auto-Discovery: 8 Links Live
          </span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px' }}>
        {/* SVG Interactive Canvas */}
        <div className="glass-panel" style={{
          position: 'relative',
          height: '520px',
          overflow: 'hidden',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}>
          {/* Controls Overlay */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}>
            <button style={{ padding: '6px 10px', background: '#ffffff', color: '#0f172a', cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ZoomIn size={14} /> Zoom
            </button>
            <button style={{ padding: '6px 10px', background: '#ffffff', color: '#0f172a', cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Maximize2 size={14} /> Reset View
            </button>
          </div>

          {/* SVG Map */}
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 800 450">
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Links / Edges */}
            {MOCK_TOPOLOGY_LINKS.map(link => {
              const src = MOCK_TOPOLOGY_NODES.find(n => n.id === link.source);
              const tgt = MOCK_TOPOLOGY_NODES.find(n => n.id === link.target);
              if (!src || !tgt) return null;

              const isSelected = selectedLink?.id === link.id;
              const strokeColor = link.utilizationPercent > 70 ? '#dc2626' : link.utilizationPercent > 50 ? '#d97706' : '#0284c7';

              return (
                <g key={link.id} onClick={() => setSelectedLink(link)} style={{ cursor: 'pointer' }}>
                  <line 
                    x1={src.x} 
                    y1={src.y} 
                    x2={tgt.x} 
                    y2={tgt.y} 
                    stroke={strokeColor} 
                    strokeWidth={isSelected ? 4 : 2}
                    strokeDasharray={isSelected ? '6,6' : 'none'}
                    opacity={isSelected ? 1 : 0.75}
                  />
                  {/* Traffic Badge */}
                  <rect
                    x={(src.x + tgt.x) / 2 - 25}
                    y={(src.y + tgt.y) / 2 - 10}
                    width="50"
                    height="18"
                    rx="4"
                    fill="#ffffff"
                    stroke={strokeColor}
                    strokeWidth="1"
                  />
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 + 3}
                    fill="#0f172a"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {link.utilizationPercent}%
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {MOCK_TOPOLOGY_NODES.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.type);

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => { setSelectedNode(node); setSelectedLink(null); }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glowing Ring */}
                  {isSelected && (
                    <circle r="26" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4,4" opacity="0.8">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Main Circle */}
                  <circle r="18" fill="#ffffff" stroke={color} strokeWidth={isSelected ? 3 : 2} />

                  {/* Inner Status dot */}
                  <circle r="4" fill="#16a34a" cy="-8" cx="12" />

                  {/* Node Label */}
                  <text y="32" fill="#0f172a" fontSize="11" fontWeight="700" textAnchor="middle">
                    {node.label}
                  </text>
                  <text y="44" fill="#64748b" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
                    {node.ip}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node or Link Inspector */}
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              {selectedLink ? 'TOPOLOGY LINK INSPECTOR' : 'NODE DETAILS'}
            </span>

            {selectedNode && !selectedLink && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Server size={20} color="#0284c7" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{selectedNode.label}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Operational • Active Host</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>IP Address:</span><span style={{ color: '#0284c7', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{selectedNode.ip}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Node Type:</span><span style={{ color: '#0f172a', textTransform: 'capitalize', fontWeight: 600 }}>{selectedNode.type.replace('_', ' ')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Canvas Position:</span><span style={{ color: '#334155' }}>X: {selectedNode.x}, Y: {selectedNode.y}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Discovered Neighbors:</span><span style={{ color: '#0284c7', fontWeight: 700 }}>2 Links Active</span></div>
                </div>
              </div>
            )}

            {selectedLink && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{selectedLink.label}</h3>
                <p style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Active LLDP Neighbor Link</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Source:</span><span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedLink.source}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Target:</span><span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedLink.target}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Capacity:</span><span style={{ color: '#0284c7', fontWeight: 700 }}>{selectedLink.speedGbps} Gbps</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Current Traffic:</span><span style={{ color: selectedLink.utilizationPercent > 70 ? '#dc2626' : '#16a34a', fontWeight: 800 }}>{selectedLink.utilizationPercent}%</span></div>
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button className="glow-btn" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}>
              Inspect Device Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
