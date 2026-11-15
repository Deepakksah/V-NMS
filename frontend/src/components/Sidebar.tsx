import React, { useState } from 'react';
import { 
  BarChart3, 
  Server, 
  Network, 
  Thermometer, 
  Globe, 
  AlertTriangle, 
  Radio, 
  GitBranch, 
  Layers, 
  PlayCircle, 
  Map, 
  FileText, 
  Activity, 
  Lock, 
  CheckCircle2,
  FolderTree,
  Laptop,
  Shield,
  Clock,
  TrendingUp,
  Users,
  UserCheck,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Minus
} from 'lucide-react';
import type { Device } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertsCount: number;
  devices?: Device[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; color?: string }>;
  iconColor: string;
  iconBg: string;
  count: string | null;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  alertsCount,
  devices,
  isCollapsed,
  onToggleCollapse
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vnms_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const isSidebarCollapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('vnms_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  };
  const serversCount = devices ? devices.filter(d => (d.device_type || '').toLowerCase() === 'server').length : 12;
  const switchesCount = devices ? devices.filter(d => (d.device_type || '').toLowerCase() === 'switch').length : 3;
  const firewallsCount = devices ? devices.filter(d => (d.device_type || '').toLowerCase() === 'firewall').length : 1;
  const workstationsCount = devices ? devices.filter(d => (d.device_type || '').toLowerCase() === 'workstation').length : 16;
  const ntpCount = devices ? devices.filter(d => (d.device_type || '').toLowerCase() === 'ntp').length : 1;
  const totalCount = devices ? devices.length : 33;

  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  const toggleSection = (idx: number) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Core Operations & Inventory',
      items: [
        { 
          id: 'dashboard', 
          label: 'Executive Dashboard', 
          icon: BarChart3, 
          iconColor: '#2563eb', 
          iconBg: '#dbeafe', 
          count: null 
        },
        { 
          id: 'tree_view', 
          label: 'Infrastructure Tree View', 
          icon: FolderTree, 
          iconColor: '#0284c7', 
          iconBg: '#e0f2fe', 
          count: 'TREE', 
          highlight: true 
        },
        { 
          id: 'topology', 
          label: 'Topology Maps & LLDP', 
          icon: Map, 
          iconColor: '#059669', 
          iconBg: '#d1fae5', 
          count: '5',
          highlight: true 
        },
        { 
          id: 'reports', 
          label: 'Reports & SLA Heatmap', 
          icon: TrendingUp, 
          iconColor: '#7c3aed', 
          iconBg: '#ede9fe', 
          count: 'NOC', 
          highlight: true 
        },
        { 
          id: 'servers', 
          label: 'Servers & Compute', 
          icon: Server, 
          iconColor: '#2563eb', 
          iconBg: '#dbeafe', 
          count: String(serversCount) 
        },
        { 
          id: 'switches', 
          label: 'Network Switches', 
          icon: Network, 
          iconColor: '#059669', 
          iconBg: '#d1fae5', 
          count: String(switchesCount) 
        },
        { 
          id: 'firewalls', 
          label: 'Firewalls & Gateways', 
          icon: Shield, 
          iconColor: '#dc2626', 
          iconBg: '#fee2e2', 
          count: String(firewallsCount) 
        },
        { 
          id: 'workstations', 
          label: 'Machines & Endpoints', 
          icon: Laptop, 
          iconColor: '#0284c7', 
          iconBg: '#e0f2fe', 
          count: String(workstationsCount) 
        },
        { 
          id: 'ntp', 
          label: 'NTP Time Services', 
          icon: Clock, 
          iconColor: '#ca8a04', 
          iconBg: '#fef9c3', 
          count: String(ntpCount) 
        },
        { 
          id: 'devices', 
          label: 'All Network Nodes', 
          icon: Layers, 
          iconColor: '#4f46e5', 
          iconBg: '#e0e7ff', 
          count: String(totalCount) 
        },
        { 
          id: 'ports', 
          label: 'Ports & Physical Layer', 
          icon: Network, 
          iconColor: '#0d9488', 
          iconBg: '#ccfbf1', 
          count: '13' 
        },
        { 
          id: 'sensors', 
          label: 'Sensors & Metrics', 
          icon: Thermometer, 
          iconColor: '#d97706', 
          iconBg: '#fef3c7', 
          count: '10' 
        },
      ]
    },
    {
      title: 'Routing, Faults & Carrier WAN',
      items: [
        { 
          id: 'routing', 
          label: 'IP, Routing & Protocols', 
          icon: Globe, 
          iconColor: '#4f46e5', 
          iconBg: '#e0e7ff', 
          count: '20' 
        },
        { 
          id: 'alerts', 
          label: 'Alerts & Incidents', 
          icon: AlertTriangle, 
          iconColor: '#dc2626', 
          iconBg: '#fee2e2', 
          count: alertsCount > 0 ? `${alertsCount}!` : '15', 
          highlight: alertsCount > 0 
        },
        { 
          id: 'wireless', 
          label: 'Wireless & Telecom', 
          icon: Radio, 
          iconColor: '#9333ea', 
          iconBg: '#f3e8ff', 
          count: '10' 
        },
        { 
          id: 'mpls_billing', 
          label: 'MPLS & 95th% Billing', 
          icon: GitBranch, 
          iconColor: '#16a34a', 
          iconBg: '#dcfce7', 
          count: '19' 
        },
      ]
    },
    {
      title: 'Infrastructure & Engine Tools',
      items: [
        { 
          id: 'virtualization', 
          label: 'Virtualization & VMs', 
          icon: Layers, 
          iconColor: '#0284c7', 
          iconBg: '#e0f2fe', 
          count: '9' 
        },
        { 
          id: 'pollers', 
          label: 'Distributed Pollers', 
          icon: PlayCircle, 
          iconColor: '#ca8a04', 
          iconBg: '#fef9c3', 
          count: '4' 
        },
        { 
          id: 'logs', 
          label: 'Syslog UDP & App Logs', 
          icon: FileText, 
          iconColor: '#475569', 
          iconBg: '#f1f5f9', 
          count: '10' 
        },
        { 
          id: 'sla_qos', 
          label: 'SLA, QoS & Custom OIDs', 
          icon: Activity, 
          iconColor: '#c026d3', 
          iconBg: '#fae8ff', 
          count: '4' 
        },
        { 
          id: 'settings', 
          label: 'System & Secret Vault', 
          icon: Lock, 
          iconColor: '#0891b2', 
          iconBg: '#cffafe', 
          count: '6' 
        },
      ]
    },
    {
      title: 'Personnel, Alert Contacts & RBAC',
      items: [
        { 
          id: 'alert_contacts', 
          label: 'Alert Persons Directory', 
          icon: Users, 
          iconColor: '#0284c7', 
          iconBg: '#e0f2fe', 
          count: '+ ADD', 
          highlight: true 
        },
        { 
          id: 'alert_matrix', 
          label: 'Link Persons to Servers', 
          icon: Link2, 
          iconColor: '#059669', 
          iconBg: '#d1fae5', 
          count: 'MATRIX' 
        },
        { 
          id: 'users', 
          label: 'User Accounts & Sign Up', 
          icon: UserCheck, 
          iconColor: '#7c3aed', 
          iconBg: '#ede9fe', 
          count: 'RBAC' 
        },
      ]
    }
  ];

  return (
    <aside style={{
      width: isSidebarCollapsed ? '72px' : '270px',
      minWidth: isSidebarCollapsed ? '72px' : '270px',
      maxWidth: isSidebarCollapsed ? '72px' : '270px',
      borderRight: '1px solid #e2e8f0',
      padding: isSidebarCollapsed ? '12px 6px' : '14px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: isSidebarCollapsed ? '8px' : '14px',
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      height: 'calc(100vh - 65px)',
      position: 'sticky',
      top: '65px',
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), padding 0.22s ease',
      zIndex: 30
    }}>
      {/* Top Sidebar Header with Collapse / Unhide Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
        padding: isSidebarCollapsed ? '0 0 8px 0' : '2px 6px 8px 6px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '2px'
      }}>
        {!isSidebarCollapsed && (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Navigation
          </span>
        )}

        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isSidebarCollapsed ? '6px' : '4px 6px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            cursor: 'pointer',
            fontSize: '0.70rem',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = '#0284c7';
            e.currentTarget.style.color = '#0284c7';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#0f172a';
          }}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={15} />
          )}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: isSidebarCollapsed ? '4px' : '14px' }}>
        {sections.map((sec, secIdx) => {
          const isCollapsed = collapsedSections.has(secIdx) && !sec.items.some(i => i.id === activeTab);

          return (
            <div key={secIdx}>
              {/* Section Header or Divider */}
              {isSidebarCollapsed ? (
                secIdx > 0 && <div style={{ height: '1px', background: '#e2e8f0', margin: '6px 6px' }} />
              ) : (
                <div
                  onClick={() => toggleSection(secIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    userSelect: 'none',
                    transition: 'background-color 0.12s ease'
                  }}
                  title={isCollapsed ? "Expand section" : "Collapse section"}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <p style={{
                    fontSize: '0.66rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    color: '#64748b',
                    letterSpacing: '0.06em',
                    margin: 0
                  }}>
                    {sec.title}
                  </p>

                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      backgroundColor: isCollapsed ? '#e0f2fe' : '#f1f5f9',
                      color: isCollapsed ? '#0284c7' : '#64748b',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isCollapsed ? <Plus size={12} strokeWidth={2.5} /> : <Minus size={12} strokeWidth={2.5} />}
                  </div>
                </div>
              )}

              {(!isCollapsed || isSidebarCollapsed) && (
                <nav style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isSidebarCollapsed ? '5px' : '3px',
                  alignItems: isSidebarCollapsed ? 'center' : 'stretch'
                }}>
                  {sec.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isSidebarCollapsed ? `${item.label}${item.count ? ` (${item.count})` : ''}` : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                          gap: isSidebarCollapsed ? '0' : '10px',
                          padding: isSidebarCollapsed ? '4px 0' : '7px 10px',
                          borderRadius: '8px',
                          border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                          borderLeft: !isSidebarCollapsed && isActive ? `4px solid ${item.iconColor}` : undefined,
                          backgroundColor: isActive ? '#ffffff' : 'transparent',
                          color: isActive ? '#0f172a' : '#334155',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.83rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          width: isSidebarCollapsed ? '46px' : '100%',
                          height: isSidebarCollapsed ? '40px' : 'auto',
                          position: 'relative',
                          boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.04)' : 'none'
                        }}
                        onMouseEnter={e => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                        }}
                        onMouseLeave={e => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* Vibrant Colored Icon Container Box */}
                        <div style={{
                          width: isSidebarCollapsed ? '32px' : '28px',
                          height: isSidebarCollapsed ? '32px' : '28px',
                          borderRadius: '7px',
                          background: item.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isActive ? `0 1px 3px ${item.iconColor}44` : 'none',
                          border: isSidebarCollapsed && isActive ? `2px solid ${item.iconColor}` : 'none',
                          position: 'relative'
                        }}>
                          <Icon size={isSidebarCollapsed ? 17 : 16} color={item.iconColor} />

                          {/* Tiny badge dot in collapsed icon mode */}
                          {isSidebarCollapsed && item.count && (
                            <span style={{
                              position: 'absolute',
                              top: '-3px',
                              right: '-3px',
                              minWidth: '13px',
                              height: '13px',
                              padding: '0 2px',
                              borderRadius: '7px',
                              background: item.highlight && item.id === 'alerts' 
                                ? '#ef4444' 
                                : item.id === 'reports'
                                ? '#7c3aed'
                                : '#475569',
                              color: '#ffffff',
                              fontSize: '0.50rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1.5px solid #ffffff'
                            }}>
                              {item.count.length > 2 ? '•' : item.count}
                            </span>
                          )}
                        </div>

                        {!isSidebarCollapsed && (
                          <>
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.label}
                            </span>

                            {item.count && (
                              <span style={{
                                fontSize: '0.67rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '9999px',
                                background: item.highlight && item.id === 'alerts' 
                                  ? '#fee2e2' 
                                  : item.id === 'reports'
                                  ? '#f3e8ff'
                                  : '#e2e8f0',
                                color: item.highlight && item.id === 'alerts'
                                  ? '#b91c1c'
                                  : item.id === 'reports'
                                  ? '#7e22ce'
                                  : '#475569'
                              }}>
                                {item.count}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      {/* Enterprise System Health Indicator Card */}
      {isSidebarCollapsed ? (
        <div
          title="System Status: All Services Operational • Polling Active"
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'center',
            padding: '6px 0'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: 'auto',
          padding: '10px 12px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={12} color="#16a34a" />
            </div>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#15803d' }}>System Operational</span>
          </div>
          <p style={{ fontSize: '0.70rem', color: '#475569', margin: '2px 0 0 0' }}>Live Network Telemetry Active</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#64748b', marginTop: '5px', paddingTop: '5px', borderTop: '1px solid #f1f5f9' }}>
            <span>Telemetry Pipeline</span>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>Healthy</span>
          </div>
        </div>
      )}
    </aside>
  );
};
