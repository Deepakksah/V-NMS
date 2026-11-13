import React from 'react';
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
  Sparkles,
  CheckCircle2,
  FolderTree
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertsCount: number;
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
  alertsCount
}) => {
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
          id: 'all_features', 
          label: 'Architecture & 145 Models', 
          icon: Sparkles, 
          iconColor: '#7c3aed', 
          iconBg: '#ede9fe', 
          count: '145', 
          highlight: true 
        },
        { 
          id: 'devices', 
          label: 'Devices & Hardware', 
          icon: Server, 
          iconColor: '#0284c7', 
          iconBg: '#e0f2fe', 
          count: '12' 
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
          id: 'topology', 
          label: 'Topology Maps & LLDP', 
          icon: Map, 
          iconColor: '#059669', 
          iconBg: '#d1fae5', 
          count: '5' 
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
    }
  ];

  return (
    <aside style={{
      width: '270px',
      borderRight: '1px solid #e2e8f0',
      padding: '16px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      height: 'calc(100vh - 65px)',
      position: 'sticky',
      top: '65px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sections.map((sec, secIdx) => (
          <div key={secIdx}>
            <p style={{
              fontSize: '0.66rem',
              textTransform: 'uppercase',
              fontWeight: 800,
              color: '#64748b',
              letterSpacing: '0.06em',
              marginBottom: '6px',
              paddingLeft: '10px'
            }}>
              {sec.title}
            </p>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sec.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                      borderLeft: isActive ? `4px solid ${item.iconColor}` : '4px solid transparent',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#0f172a' : '#334155',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.83rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      width: '100%',
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
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: item.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: isActive ? `0 1px 3px ${item.iconColor}33` : 'none'
                    }}>
                      <Icon size={16} color={item.iconColor} />
                    </div>

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
                          : item.id === 'all_features'
                          ? '#f3e8ff'
                          : '#e2e8f0',
                        color: item.highlight && item.id === 'alerts'
                          ? '#b91c1c'
                          : item.id === 'all_features'
                          ? '#7e22ce'
                          : '#475569'
                      }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Enterprise Database & Backend Engine Status Card */}
      <div style={{
        marginTop: 'auto',
        padding: '12px 14px',
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '5px',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={13} color="#16a34a" />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d' }}>PostgreSQL 18 Live</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#475569', margin: '2px 0' }}>145 LibreNMS Models Mapped</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
          <span>Engine: Go 1.27</span>
          <span style={{ color: '#0284c7', fontWeight: 700 }}>Port 8081</span>
        </div>
      </div>
    </aside>
  );
};
