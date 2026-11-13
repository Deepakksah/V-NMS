import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  Plus, 
  Server, 
  Zap, 
  AlertTriangle,
  LogOut,
  ChevronDown,
  UserCheck,
  Shield,
  Key,
  FolderTree
} from 'lucide-react';
import type { AuthUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAddDevice: () => void;
  totalDevices: number;
  upDevices: number;
  criticalAlertsCount: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
  onRefresh,
  isRefreshing,
  onOpenAddDevice,
  totalDevices,
  upDevices,
  criticalAlertsCount,
  currentUser,
  onLogout
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const username = currentUser?.username || 'deepak.sah';
  const role = currentUser?.role || 'superadmin';
  const email = currentUser?.email || 'deepak.sah@vnms.local';
  const initials = username
    .split(/[\._\-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'DS';

  const isSuperAdmin = role.toLowerCase() === 'superadmin';
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 28px',
      borderBottom: '1px solid #e2e8f0',
      background: '#ffffff',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Left: Brand Identity & Active Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div 
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
          }}>
            <Activity size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>V-NMS</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '4px',
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd'
              }}>
                145 FEATURES
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Enterprise Network Operations Center</p>
          </div>
        </div>

        <div style={{ width: '1px', height: '26px', background: '#e2e8f0' }} />

        {/* System Core Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ color: '#334155', fontWeight: 600 }}>PostgreSQL 18 Connected</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={14} color="#0284c7" />
            <span style={{ color: '#64748b' }}>Devices:</span>
            <span style={{ color: '#0f172a', fontWeight: 700 }}>{upDevices}/{totalDevices} UP</span>
          </div>

          {criticalAlertsCount > 0 && (
            <div 
              onClick={() => setActiveTab('alerts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#b91c1c',
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            >
              <AlertTriangle size={13} />
              <span>{criticalAlertsCount} Alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search across 145 models */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 14px',
        borderRadius: '8px',
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        width: '360px'
      }}>
        <Search size={15} color="#64748b" />
        <input 
          type="text" 
          placeholder="Search 145 models, devices, ports, IPs, VLANs..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#0f172a',
            fontSize: '0.84rem',
            width: '100%'
          }}
        />
        {globalSearch && (
          <button 
            onClick={() => setGlobalSearch('')}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Right: Actions & User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onRefresh}
          className="glass-panel"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 13px',
            color: '#0f172a',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: '#ffffff'
          }}
          title="Refresh All Telemetry"
        >
          <RefreshCw size={14} color="#0284c7" className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>

        <button
          onClick={onOpenAddDevice}
          className="glow-btn"
          style={{ padding: '7px 15px', fontSize: '0.82rem' }}
        >
          <Plus size={15} />
          <span>Add Device</span>
        </button>

        <button
          onClick={() => setActiveTab('tree_view')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 13px',
            borderRadius: '8px',
            background: activeTab === 'tree_view' ? '#0284c7' : '#e0f2fe',
            border: '1px solid #bae6fd',
            color: activeTab === 'tree_view' ? '#ffffff' : '#0369a1',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <FolderTree size={14} />
          <span>Tree View</span>
        </button>

        <button
          onClick={() => setActiveTab('all_features')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 13px',
            borderRadius: '8px',
            background: '#f3e8ff',
            border: '1px solid #d8b4fe',
            color: '#7e22ce',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <Zap size={14} />
          <span>145 Models</span>
        </button>

        {/* User Profile & Session Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative', borderLeft: '1px solid #e2e8f0', paddingLeft: '10px' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: showDropdown ? '#f1f5f9' : 'transparent',
              border: '1px solid',
              borderColor: showDropdown ? '#cbd5e1' : 'transparent',
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
              background: isSuperAdmin ? '#e0f2fe' : '#f0fdf4',
              border: `1px solid ${isSuperAdmin ? '#bae6fd' : '#bbf7d0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: isSuperAdmin ? '#0284c7' : '#16a34a',
              fontSize: '0.82rem'
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{username}</p>
              <p style={{
                fontSize: '0.68rem',
                color: isSuperAdmin ? '#0284c7' : '#16a34a',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {role}
              </p>
            </div>
            <ChevronDown size={14} color="#64748b" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '260px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              {/* Profile Card Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{username}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isSuperAdmin ? '#e0f2fe' : '#dcfce7',
                    color: isSuperAdmin ? '#0369a1' : '#15803d',
                    border: `1px solid ${isSuperAdmin ? '#bae6fd' : '#bbf7d0'}`
                  }}>
                    {role}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, wordBreak: 'break-all' }}>{email}</p>
              </div>

              {/* Session Information */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.74rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Shield size={13} color="#16a34a" />
                  <span>Session: <strong style={{ color: '#16a34a' }}>JWT Authenticated</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={13} color="#0284c7" />
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
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <UserCheck size={14} color="#64748b" />
                  <span>Account & Permissions</span>
                </button>

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
                    color: '#dc2626',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: 600
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={14} color="#dc2626" />
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
