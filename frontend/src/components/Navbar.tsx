import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Server,
  AlertTriangle,
  LogOut,
  ChevronDown,
  UserCheck,
  Shield,
  Key,
  KeyRound,
  FolderTree,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Plus,
  Zap
} from 'lucide-react';
import type { AuthUser } from '../types';
import { soundAlerts } from '../utils/audioAlerts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalDevices: number;
  upDevices: number;
  criticalAlertsCount: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenChangePassword?: () => void;
  onTriggerScan?: () => void;
  onOpenAddDevice?: () => void;
  isScanning?: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
  onRefresh,
  isRefreshing,
  totalDevices,
  upDevices,
  criticalAlertsCount,
  currentUser,
  onLogout,
  onOpenChangePassword,
  onTriggerScan,
  onOpenAddDevice,
  isScanning,
  isSidebarCollapsed,
  onToggleSidebar,
  theme = 'light',
  onToggleTheme
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(soundAlerts.getMuted());
  const prevCriticalCount = useRef(criticalAlertsCount);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Play siren when new critical alerts arrive and sound is enabled
  useEffect(() => {
    if (criticalAlertsCount > 0 && criticalAlertsCount > prevCriticalCount.current) {
      soundAlerts.playCriticalSiren();
    }
    prevCriticalCount.current = criticalAlertsCount;
  }, [criticalAlertsCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const username = currentUser?.username || 'admin';
  const role = currentUser?.role || 'superadmin';
  const email = currentUser?.email || 'admin@v-nms.com';
  const initials = username
    .split(/[\._\-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'AD';

  const isSuperAdmin = role.toLowerCase() === 'superadmin';
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 20px',
      borderBottom: '1px solid #1e293b',
      background: '#0b1120',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Left: Brand Identity & Active Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: isSidebarCollapsed ? '#1e293b' : '#0f172a',
              color: isSidebarCollapsed ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#1e293b';
              e.currentTarget.style.color = '#38bdf8';
              e.currentTarget.style.borderColor = '#0284c7';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = isSidebarCollapsed ? '#1e293b' : '#0f172a';
              e.currentTarget.style.color = isSidebarCollapsed ? '#38bdf8' : '#94a3b8';
              e.currentTarget.style.borderColor = '#334155';
            }}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}

        <div
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title="Veracity V-NMS Enterprise Dashboard"
        >
          {/* Official Brand Logo Capsule */}
          <div style={{
            background: '#ffffff',
            padding: '3px 7px',
            borderRadius: '5px',
            display: 'inline-flex',
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
          }}>
            <img
              src="/Veracity_logo.png"
              alt="Veracity"
              style={{
                height: '22px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          <div style={{ width: '1px', height: '22px', background: '#334155' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>V-NMS</span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                background: '#082f49',
                color: '#38bdf8',
                border: '1px solid #0c4a6e',
                letterSpacing: '0.04em'
              }}>
                ENTERPRISE NOC
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Network Operations Center</p>
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', background: '#1e293b' }} />

        {/* System Core Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '3px 8px',
            borderRadius: '5px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16, 185, 129, 0.7)' }} />
            <span style={{ color: '#6ee7b7', fontWeight: 600 }}>System Online</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            padding: '3px 8px',
            borderRadius: '5px'
          }}>
            <Server size={12} color="#38bdf8" />
            <span style={{ color: '#94a3b8' }}>Devices:</span>
            <span style={{ color: '#f8fafc', fontWeight: 700 }}>{upDevices}/{totalDevices} UP</span>
          </div>

          {criticalAlertsCount > 0 && (
            <div
              onClick={() => setActiveTab('alerts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '5px',
                cursor: 'pointer',
                color: '#fca5a5',
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            >
              <AlertTriangle size={12} color="#fca5a5" />
              <span>{criticalAlertsCount} Alerts</span>
            </div>
          )}

          {/* NOC Audio Alarm Toggle */}
          <button
            onClick={() => {
              const next = soundAlerts.toggleMute();
              setIsAudioMuted(next);
            }}
            title={isAudioMuted ? "Audible Sirens Muted (Click to enable audio alarms)" : "Audible Sirens Active (Click to mute sound)"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '5px',
              background: isAudioMuted ? 'rgba(100, 116, 139, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              border: `1px solid ${isAudioMuted ? '#475569' : '#0284c7'}`,
              color: isAudioMuted ? '#94a3b8' : '#38bdf8',
              cursor: 'pointer',
              fontSize: '0.70rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            {isAudioMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            <span>{isAudioMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      {/* Center: Global Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px',
        borderRadius: '7px',
        background: '#1e293b',
        border: '1px solid #334155',
        width: '290px'
      }}>
        <Search size={14} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search hosts, IP, MAC, hardware, OS..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f8fafc',
            fontSize: '0.80rem',
            width: '100%'
          }}
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch('')}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Right: Actions & User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onRefresh}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 11px',
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px'
          }}
          title="Refresh All Telemetry"
        >
          <RefreshCw size={13} color="#38bdf8" className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>

        {onOpenAddDevice && (
          <button
            onClick={onOpenAddDevice}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              color: '#38bdf8',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(2, 132, 199, 0.45)',
              borderRadius: '6px',
              transition: 'all 0.15s ease'
            }}
            title="Register a new hardware device node manually"
          >
            <Plus size={13} color="#38bdf8" />
            <span>+ Add Device</span>
          </button>
        )}

        {onTriggerScan && (
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              color: isScanning ? '#38bdf8' : '#34d399',
              cursor: isScanning ? 'wait' : 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: isScanning ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${isScanning ? '#0284c7' : 'rgba(16, 185, 129, 0.35)'}`,
              borderRadius: '6px'
            }}
            title="Scan local network subnet for all live devices"
          >
            <Zap size={13} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Scanning...' : 'Auto Scan'}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('tree_view')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 11px',
            borderRadius: '6px',
            background: activeTab === 'tree_view' ? '#0369a1' : '#1e293b',
            border: `1px solid ${activeTab === 'tree_view' ? '#0284c7' : '#334155'}`,
            color: activeTab === 'tree_view' ? '#ffffff' : '#cbd5e1',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600
          }}
        >
          <FolderTree size={13} />
          <span>Tree View</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 11px',
            borderRadius: '6px',
            background: activeTab === 'reports' ? '#6b21a8' : '#1e293b',
            border: `1px solid ${activeTab === 'reports' ? '#7e22ce' : '#334155'}`,
            color: activeTab === 'reports' ? '#ffffff' : '#cbd5e1',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600
          }}
          title="Open Performance Reports & Uptime SLA Heatmap"
        >
          <TrendingUp size={13} />
          <span>Reports &amp; SLA</span>
        </button>

        {/* User Profile & Session Dropdown (Dark Themed) */}
        <div ref={dropdownRef} style={{ position: 'relative', borderLeft: '1px solid #1e293b', paddingLeft: '10px' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: showDropdown ? '#1e293b' : 'transparent',
              border: '1px solid',
              borderColor: showDropdown ? '#334155' : 'transparent',
              borderRadius: '8px',
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isSuperAdmin ? '#0369a1' : '#047857',
              border: `1px solid ${isSuperAdmin ? '#0284c7' : '#059669'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#ffffff',
              fontSize: '0.82rem'
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1, margin: 0 }}>{username}</p>
              <p style={{
                fontSize: '0.68rem',
                color: '#38bdf8',
                fontWeight: 600,
                textTransform: 'capitalize',
                margin: 0
              }}>
                {role}
              </p>
            </div>
            <ChevronDown size={14} color="#94a3b8" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>

          {/* Dropdown Menu (Dark NOC Mode) */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '260px',
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #1e293b',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              {/* Profile Card Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', background: '#111827' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>{username}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#082f49',
                    color: '#38bdf8',
                    border: '1px solid #0c4a6e'
                  }}>
                    {role}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, wordBreak: 'break-all' }}>{email}</p>
              </div>

              {/* Session Information */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', fontSize: '0.74rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Shield size={13} color="#10b981" />
                  <span>Session: <strong style={{ color: '#10b981' }}>Active &amp; Secure</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={13} color="#38bdf8" />
                  <span>Expires: <strong>24 Hours</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '6px' }}>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setActiveTab('settings');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <UserCheck size={14} color="#94a3b8" />
                  <span>Account &amp; Permissions</span>
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    if (onOpenChangePassword) onOpenChangePassword();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <KeyRound size={14} color="#38bdf8" />
                  <span>Change Password (OTP)</span>
                </button>

                {onToggleTheme && (
                  <button
                    onClick={() => {
                      onToggleTheme();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#818cf8" />}
                    <span>{theme === 'dark' ? 'Switch to Normal Mode' : 'Switch to Dark Mode'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    if (onLogout) onLogout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#f87171',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: 600
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={14} color="#f87171" />
                  <span>Sign Out (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
