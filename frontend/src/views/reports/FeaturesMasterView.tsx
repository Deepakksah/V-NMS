import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
  Table,
  Cpu,
  Sparkles,
  Server,
  Network,
  Thermometer,
  Globe,
  AlertTriangle,
  Radio,
  GitBranch,
  CreditCard,
  PlayCircle,
  Map,
  FileText,
  Activity,
  Lock
} from 'lucide-react';
import { ALL_145_FEATURES, CATEGORIES_LIST } from '../../data/featuresRegistry';
import type { FeatureDefinition } from '../../types';

interface FeaturesMasterViewProps {
  onNavigateToTab: (tab: string) => void;
}

// Icon mapper for categories
const getCategoryIcon = (num: number) => {
  switch (num) {
    case 1: return Server;
    case 2: return Network;
    case 3: return Thermometer;
    case 4: return Globe;
    case 5: return AlertTriangle;
    case 6: return Radio;
    case 7: return GitBranch;
    case 8: return CreditCard;
    case 9: return Layers;
    case 10: return PlayCircle;
    case 11: return Map;
    case 12: return FileText;
    case 13: return Activity;
    case 14: return Lock;
    default: return Cpu;
  }
};

export const FeaturesMasterView: React.FC<FeaturesMasterViewProps> = ({ onNavigateToTab }) => {
  const [viewMode, setViewMode] = useState<'suites' | 'table' | 'architecture'>('suites');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(1);
  const [inspectedFeature, setInspectedFeature] = useState<FeatureDefinition | null>(null);

  // Pagination for table view
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredFeatures = useMemo(() => {
    return ALL_145_FEATURES.filter(f => {
      const matchCat = selectedCategory === 'ALL' || f.categoryNumber === selectedCategory;
      const matchSearch = searchQuery === '' ||
        f.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.targetImplementation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredFeatures.length / pageSize);
  const paginatedFeatures = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFeatures.slice(start, start + pageSize);
  }, [filteredFeatures, currentPage]);

  const toggleCategoryExpand = (num: number) => {
    setExpandedCategory(prev => prev === num ? null : num);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Executive Hero Banner - Clean Professional White Card with Subtle Slate Accent */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: '#eff6ff',
              color: '#0284c7',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid #bfdbfe'
            }}>
              <Sparkles size={13} />
              145 / 145 LIBRENMS ENTERPRISE MODELS
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: '#16a34a',
              background: '#dcfce7',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontWeight: 700
            }}>
              POSTGRESQL 18 + GO RUNTIME
            </span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Enterprise Architecture & Solutions Matrix
          </h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.5 }}>
            Comprehensive architectural modernization of all 145 LibreNMS subsystems into 15 high-concurrency Go poller routines, unified PostgreSQL partitioned storage, and responsive reactive TypeScript views.
          </p>
        </div>

        {/* View Mode Switcher Pills */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setViewMode('suites')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'suites' ? '#ffffff' : 'transparent',
              color: viewMode === 'suites' ? '#0284c7' : '#64748b',
              fontWeight: viewMode === 'suites' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'suites' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Layers size={15} />
            <span>15 Domain Suites</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'table' ? '#ffffff' : 'transparent',
              color: viewMode === 'table' ? '#0284c7' : '#64748b',
              fontWeight: viewMode === 'table' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Table size={15} />
            <span>Model Directory Table</span>
          </button>

          <button
            onClick={() => setViewMode('architecture')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'architecture' ? '#ffffff' : 'transparent',
              color: viewMode === 'architecture' ? '#0284c7' : '#64748b',
              fontWeight: viewMode === 'architecture' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'architecture' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Cpu size={15} />
            <span>Engine Architecture</span>
          </button>
        </div>
      </div>

      {/* Quick Executive Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL MODELS CATALOGED</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>145 Models</div>
          <p style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>100% Architecture Coverage</p>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ENTERPRISE DOMAINS</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>15 Solution Suites</div>
          <p style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: '4px', fontWeight: 600 }}>Decoupled Micro-Modules</p>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>CONCURRENT GO RUNTIME</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>112 Goroutines</div>
          <p style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>Sub-Second Worker Pools</p>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>DATABASE UNIFICATION</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7e22ce', marginTop: '4px' }}>PostgreSQL 18</div>
          <p style={{ fontSize: '0.72rem', color: '#6d28d9', marginTop: '4px', fontWeight: 600 }}>Partitioned Time-Series Tables</p>
        </div>
      </div>

      {/* MODE 1: PROFESSIONAL 15 DOMAIN SUITES (Accordion-based, Not an endless raw row dump!) */}
      {viewMode === 'suites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Functional Architecture Suites (15 Enterprise Domains)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Click any suite to inspect models or launch live view
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {CATEGORIES_LIST.map(cat => {
              const Icon = getCategoryIcon(cat.num);
              const isExpanded = expandedCategory === cat.num;
              const catModels = ALL_145_FEATURES.filter(f => f.categoryNumber === cat.num);

              return (
                <div
                  key={cat.num}
                  style={{
                    background: '#ffffff',
                    border: isExpanded ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Suite Header Summary Row */}
                  <div
                    onClick={() => toggleCategoryExpand(cat.num)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isExpanded ? '#f0f9ff' : '#ffffff',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: isExpanded ? '#0284c7' : '#eff6ff',
                        color: isExpanded ? '#ffffff' : '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={20} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                            SUITE #{String(cat.num).padStart(2, '0')}
                          </span>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            {cat.name}
                          </h4>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                          Mapped to V-Nms Tab: <strong style={{ color: '#0284c7' }}>{cat.tab.toUpperCase()}</strong> • {cat.count} Native Models
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {cat.count} Models
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToTab(cat.tab);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#eff6ff',
                          color: '#0284c7',
                          border: '1px solid #bfdbfe',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <span>Launch View</span>
                        <ArrowRight size={13} />
                      </button>

                      <div style={{ color: '#64748b' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Model Details Drawer */}
                  {isExpanded && (
                    <div style={{
                      padding: '16px 20px',
                      borderTop: '1px solid #e2e8f0',
                      background: '#f8fafc'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '12px'
                      }}>
                        {catModels.map(m => (
                          <div
                            key={m.id}
                            onClick={() => setInspectedFeature(m)}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '8px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 800,
                                color: '#0284c7',
                                background: '#eff6ff',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                #{m.id} {m.modelName}
                              </span>
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '1px 6px',
                                borderRadius: '9999px',
                                background: '#dcfce7',
                                color: '#15803d',
                                fontWeight: 700
                              }}>
                                BUILT
                              </span>
                            </div>

                            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                              {m.displayName}
                            </p>
                            <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                              {m.description}
                            </p>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderTop: '1px solid #f1f5f9',
                              paddingTop: '6px',
                              fontSize: '0.68rem',
                              color: '#64748b'
                            }}>
                              <Database size={11} />
                              <span style={{ fontFamily: 'var(--font-mono)' }}>{m.targetImplementation.split('+')[0].trim()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: SEARCHABLE COMPACT DATA TABLE */}
      {viewMode === 'table' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Search & Category Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              width: '360px'
            }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search by model, name, or Go routine..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Filter Suite:</span>
              <select
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                <option value="ALL">All 15 Domains (145 Models)</option>
                {CATEGORIES_LIST.map(c => (
                  <option key={c.num} value={c.num}>Suite {c.num}: {c.name} ({c.count})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clean Data Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.70rem', fontWeight: 700 }}>
                <th style={{ padding: '6px 10px', width: '45px' }}>#</th>
                <th style={{ padding: '6px 10px' }}>LIBRENMS MODEL</th>
                <th style={{ padding: '6px 10px' }}>DISPLAY NAME &amp; SCOPE</th>
                <th style={{ padding: '6px 10px' }}>SUITE DOMAIN</th>
                <th style={{ padding: '6px 10px' }}>TARGET GO &amp; POSTGRESQL ENGINE</th>
                <th style={{ padding: '6px 10px' }}>STATUS</th>
                <th style={{ padding: '6px 10px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFeatures.map(f => (
                <tr
                  key={f.id}
                  onClick={() => setInspectedFeature(f)}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748b' }}>
                    #{f.id}
                  </td>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>
                    {f.modelName}
                  </td>
                  <td style={{ padding: '4px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.75rem' }}>{f.displayName}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.description}
                    </div>
                  </td>
                  <td style={{ padding: '4px 10px', fontSize: '0.72rem', color: '#334155' }}>
                    Suite {f.categoryNumber}: {f.categoryName}
                  </td>
                  <td style={{ padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#16a34a' }}>
                    {f.targetImplementation}
                  </td>
                  <td style={{ padding: '4px 10px' }}>
                    <span style={{
                      padding: '1.5px 6px',
                      borderRadius: '4px',
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.67rem',
                      fontWeight: 700
                    }}>
                      {f.status}
                    </span>
                  </td>
                  <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToTab(f.viewTab);
                      }}
                      style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: '#eff6ff',
                        color: '#0284c7',
                        border: '1px solid #bfdbfe',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Open View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Clean Pagination Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b' }}>
            <span>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredFeatures.length)} of {filteredFeatures.length} models
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                  color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 600, color: '#0f172a' }}>
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                  color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: HIGH-LEVEL ARCHITECTURE PIPELINE */}
      {viewMode === 'architecture' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              End-to-End Core Architecture Pipeline
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              How V-Nms collects, processes, stores, and presents all 145 models with zero PHP lag
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7' }}>LAYER 1: INGESTION</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '6px', marginBottom: '8px' }}>
                SNMP v1/v2c/v3 & Telemetry
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                Concurrent UDP poller communicating with Cisco, Arista, Juniper, and Linux nodes at 1-minute intervals.
              </p>
            </div>

            <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>LAYER 2: GO CORE ENGINE</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '6px', marginBottom: '8px' }}>
                Goroutine Poller Pools
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                112 asynchronous workers processing 145 models concurrently without thread starvation or memory leaks.
              </p>
            </div>

            <div style={{ background: '#faf5ff', padding: '20px', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7e22ce' }}>LAYER 3: STORAGE</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '6px', marginBottom: '8px' }}>
                PostgreSQL 18 Unified
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                Relational tables for topology & metadata, combined with declarative partitioned tables for high-frequency metrics.
              </p>
            </div>

            <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7' }}>LAYER 4: PRESENTATION</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '6px', marginBottom: '8px' }}>
                Reactive Light UI
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                Clean, high-contrast, accessible enterprise dashboard giving instant access to all 15 operational domains.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Model Inspector Modal Dialog */}
      {inspectedFeature && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            width: '580px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#eff6ff',
                  color: '#0284c7',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  Feature #{inspectedFeature.id}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Suite {inspectedFeature.categoryNumber}: {inspectedFeature.categoryName}
                </span>
              </div>

              <button
                onClick={() => setInspectedFeature(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              {inspectedFeature.displayName} ({inspectedFeature.modelName})
            </h3>
            <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
              {inspectedFeature.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  LibreNMS Legacy Architecture Model
                </span>
                <code style={{ fontSize: '0.82rem', color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  app/Models/{inspectedFeature.modelName}.php
                </code>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  V-Nms Target Go Engine Service
                </span>
                <code style={{ fontSize: '0.82rem', color: '#16a34a', fontFamily: 'var(--font-mono)' }}>
                  {inspectedFeature.targetImplementation}
                </code>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Direct Operational View Tab
                </span>
                <span style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
                  Tab: {inspectedFeature.viewTab.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setInspectedFeature(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = inspectedFeature.viewTab;
                  setInspectedFeature(null);
                  onNavigateToTab(target);
                }}
                className="glow-btn"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                Launch Module View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
