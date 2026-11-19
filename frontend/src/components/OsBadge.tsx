import React from 'react';

export type OsType = 'windows' | 'linux' | 'ubuntu' | 'redhat' | 'macos' | 'docker' | 'firewall' | 'switch' | 'generic';

export interface OsInfo {
  type: OsType;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  darkBg: string;
  darkBorder: string;
  darkText: string;
}

export function detectOsInfo(os?: string, hostname?: string, deviceType?: string): OsInfo {
  const normOs = (os || '').toLowerCase();
  const normHost = (hostname || '').toLowerCase();
  const normType = (deviceType || '').toLowerCase();

  // 1. Docker / Container
  if (
    normOs.includes('docker') ||
    normOs.includes('container') ||
    normOs.includes('k8s') ||
    normOs.includes('kubernetes') ||
    normHost.includes('docker') ||
    normHost.includes('container') ||
    normHost.includes('k8s') ||
    normHost.startsWith('cnt-') ||
    normType === 'container'
  ) {
    return {
      type: 'docker',
      label: 'Docker Container',
      shortLabel: 'Docker',
      badgeBg: '#ecfeff',
      badgeBorder: '#a5f3fc',
      badgeText: '#0891b2',
      darkBg: 'rgba(8, 145, 178, 0.16)',
      darkBorder: 'rgba(8, 145, 178, 0.38)',
      darkText: '#22d3ee'
    };
  }

  // 2. macOS / Apple Darwin
  if (
    normOs.includes('mac') ||
    normOs.includes('darwin') ||
    normOs.includes('apple') ||
    normOs.includes('osx') ||
    normHost.startsWith('mac-') ||
    normHost.includes('macbook') ||
    normHost.includes('imac') ||
    normHost.includes('apple')
  ) {
    return {
      type: 'macos',
      label: 'macOS Sonoma',
      shortLabel: 'macOS',
      badgeBg: '#f8fafc',
      badgeBorder: '#cbd5e1',
      badgeText: '#1e293b',
      darkBg: 'rgba(148, 163, 184, 0.16)',
      darkBorder: 'rgba(148, 163, 184, 0.38)',
      darkText: '#f1f5f9'
    };
  }

  // 3. Ubuntu Linux
  if (normOs.includes('ubuntu') || normHost.includes('ubuntu')) {
    return {
      type: 'ubuntu',
      label: 'Ubuntu Linux',
      shortLabel: 'Ubuntu',
      badgeBg: '#fff7ed',
      badgeBorder: '#fed7aa',
      badgeText: '#c2410c',
      darkBg: 'rgba(234, 88, 12, 0.16)',
      darkBorder: 'rgba(234, 88, 12, 0.38)',
      darkText: '#fb923c'
    };
  }

  // 4. Red Hat / RHEL / CentOS / Rocky
  if (
    normOs.includes('red hat') ||
    normOs.includes('redhat') ||
    normOs.includes('rhel') ||
    normOs.includes('centos') ||
    normOs.includes('rocky') ||
    normHost.includes('rhel') ||
    normHost.includes('centos')
  ) {
    return {
      type: 'redhat',
      label: 'Red Hat Enterprise Linux',
      shortLabel: 'RHEL',
      badgeBg: '#fef2f2',
      badgeBorder: '#fecaca',
      badgeText: '#b91c1c',
      darkBg: 'rgba(220, 38, 38, 0.16)',
      darkBorder: 'rgba(220, 38, 38, 0.38)',
      darkText: '#f87171'
    };
  }

  // 5. Generic / Enterprise Linux (Debian, Cockpit, PostgreSQL, MongoDB compute nodes)
  if (
    normOs.includes('linux') ||
    normOs.includes('debian') ||
    normOs.includes('alpine') ||
    normOs.includes('cockpit') ||
    normOs.includes('postgresql') ||
    normOs.includes('mongodb') ||
    normHost.startsWith('linux-') ||
    normHost.includes('-linux') ||
    normHost.startsWith('lnx-') ||
    normHost.includes('debian')
  ) {
    let lbl = 'Enterprise Linux';
    let sLbl = 'Linux';
    if (normOs.includes('cockpit')) {
      lbl = 'Enterprise Linux (Cockpit)';
      sLbl = 'Linux Node';
    } else if (normOs.includes('postgresql')) {
      lbl = 'Linux (PostgreSQL Cluster)';
      sLbl = 'Linux DB';
    } else if (normOs.includes('mongodb')) {
      lbl = 'Linux (MongoDB Cluster)';
      sLbl = 'Linux DB';
    }

    return {
      type: 'linux',
      label: lbl,
      shortLabel: sLbl,
      badgeBg: '#fefce8',
      badgeBorder: '#fef08a',
      badgeText: '#854d0e',
      darkBg: 'rgba(202, 138, 4, 0.16)',
      darkBorder: 'rgba(202, 138, 4, 0.38)',
      darkText: '#facc15'
    };
  }

  // 6. Windows (Server vs Desktop / Workstation)
  if (
    normOs.includes('win') ||
    normOs.includes('microsoft') ||
    normHost.startsWith('win-') ||
    normHost.startsWith('desktop-') ||
    normHost.startsWith('laptop-') ||
    normHost.startsWith('win') ||
    normHost.includes('windows')
  ) {
    const isWk = normHost.startsWith('desktop-') || normHost.startsWith('laptop-') || normType === 'workstation' || normOs.includes('10') || normOs.includes('11');

    if (!isWk) {
      return {
        type: 'windows',
        label: 'Windows Server',
        shortLabel: 'Win Server',
        badgeBg: '#eff6ff',
        badgeBorder: '#bfdbfe',
        badgeText: '#1d4ed8',
        darkBg: 'rgba(37, 99, 235, 0.16)',
        darkBorder: 'rgba(37, 99, 235, 0.38)',
        darkText: '#60a5fa'
      };
    }

    return {
      type: 'windows',
      label: 'Windows 11/10 Pro',
      shortLabel: 'Windows 11',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
      badgeText: '#0369a1',
      darkBg: 'rgba(2, 132, 199, 0.16)',
      darkBorder: 'rgba(2, 132, 199, 0.38)',
      darkText: '#38bdf8'
    };
  }

  // 7. Firewall OS
  if (
    normType === 'firewall' ||
    normOs.includes('firewall') ||
    normHost.startsWith('gw-') ||
    normHost.startsWith('fw-') ||
    normOs.includes('forti') ||
    normOs.includes('palo alto') ||
    normOs.includes('checkpoint')
  ) {
    return {
      type: 'firewall',
      label: 'Firewall OS',
      shortLabel: 'Firewall',
      badgeBg: '#fef2f2',
      badgeBorder: '#fecaca',
      badgeText: '#dc2626',
      darkBg: 'rgba(220, 38, 38, 0.16)',
      darkBorder: 'rgba(220, 38, 38, 0.38)',
      darkText: '#f87171'
    };
  }

  // 8. Switch / Router OS
  if (
    normType === 'switch' ||
    normType === 'router' ||
    normOs.includes('switch') ||
    normHost.startsWith('switch-') ||
    normHost.startsWith('sw-') ||
    normOs.includes('ios')
  ) {
    return {
      type: 'switch',
      label: 'Switch OS',
      shortLabel: 'Switch',
      badgeBg: '#ecfdf5',
      badgeBorder: '#a7f3d0',
      badgeText: '#047857',
      darkBg: 'rgba(16, 185, 129, 0.16)',
      darkBorder: 'rgba(16, 185, 129, 0.38)',
      darkText: '#34d399'
    };
  }

  // 9. Generic Appliance Fallback
  return {
    type: 'generic',
    label: os || 'Enterprise OS',
    shortLabel: 'OS',
    badgeBg: '#f1f5f9',
    badgeBorder: '#e2e8f0',
    badgeText: '#475569',
    darkBg: 'rgba(100, 116, 139, 0.16)',
    darkBorder: 'rgba(100, 116, 139, 0.38)',
    darkText: '#94a3b8'
  };
}

export interface OsIconProps {
  type: OsType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const OsIcon: React.FC<OsIconProps> = ({ type, size = 14, style }) => {
  const iconStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    maxWidth: `${size}px`,
    minHeight: `${size}px`,
    maxHeight: `${size}px`,
    flexShrink: 0,
    display: 'inline-block',
    verticalAlign: 'middle',
    ...style
  };

  switch (type) {
    case 'windows':
      // 4-Quadrant Windows Brand Colors
      return (
        <svg style={iconStyle} viewBox="0 0 88 88" fill="none">
          <path d="M0 0H41.6V41.6H0V0Z" fill="#F25022" />
          <path d="M46.4 0H88V41.6H46.4V0Z" fill="#7FBA00" />
          <path d="M0 46.4H41.6V88H0V46.4Z" fill="#00A4EF" />
          <path d="M46.4 46.4H88V88H46.4V46.4Z" fill="#FFB900" />
        </svg>
      );

    case 'ubuntu':
      // Ubuntu Circle of Friends
      return (
        <svg style={iconStyle} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" fill="#E95420" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#FFFFFF" strokeWidth="8" />
          <circle cx="20" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="65" cy="24" r="7" fill="#FFFFFF" />
          <circle cx="65" cy="76" r="7" fill="#FFFFFF" />
        </svg>
      );

    case 'redhat':
      // Red Hat Fedora Shadowman
      return (
        <svg style={iconStyle} viewBox="0 0 100 100" fill="none">
          <path d="M12 58C16 52 28 48 46 47C38 34 38 18 55 18C70 18 78 28 80 43C88 44 94 48 94 56C94 66 76 74 50 74C22 74 12 66 12 58Z" fill="#EE0000" />
          <path d="M46 47C49 46 54 45 60 45C68 45 74 46 80 43C78 28 70 18 55 18C38 18 38 34 46 47Z" fill="#111111" />
          <path d="M46 47C50 49 56 50 63 50C71 50 77 48 80 43C80 44 80 45 80 46C76 49 68 52 60 52C53 52 48 50 46 47Z" fill="#FFFFFF" />
        </svg>
      );

    case 'linux':
      // Tux Penguin (Official Linux Mascot)
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          {/* Black body */}
          <ellipse cx="12" cy="13" rx="7" ry="8.5" fill="#1e293b" />
          {/* White Belly */}
          <ellipse cx="12" cy="14" rx="4.5" ry="5.8" fill="#ffffff" />
          {/* Orange Feet */}
          <ellipse cx="8.5" cy="21.5" rx="3.2" ry="1.4" fill="#f59e0b" />
          <ellipse cx="15.5" cy="21.5" rx="3.2" ry="1.4" fill="#f59e0b" />
          {/* Eyes */}
          <circle cx="10" cy="8.5" r="1.4" fill="#ffffff" />
          <circle cx="10" cy="8.5" r="0.75" fill="#0f172a" />
          <circle cx="14" cy="8.5" r="1.4" fill="#ffffff" />
          <circle cx="14" cy="8.5" r="0.75" fill="#0f172a" />
          {/* Beak */}
          <polygon points="10,10.2 14,10.2 12,12.8" fill="#f59e0b" />
          {/* Flippers */}
          <path d="M 5,11 Q 3.5,15.5 6,18.5" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 19,11 Q 20.5,15.5 18,18.5" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'macos':
      // Apple Logo
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.13.64-2.81 1.44-.59.69-1.11 1.76-.97 2.81 1.07.08 2.15-.63 2.77-1.38z" />
        </svg>
      );

    case 'docker':
      // Docker Whale with Shipping Containers
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          <rect x="5.5" y="8" width="3" height="3" rx="0.4" fill="#0284c7" />
          <rect x="9.5" y="8" width="3" height="3" rx="0.4" fill="#0284c7" />
          <rect x="13.5" y="8" width="3" height="3" rx="0.4" fill="#0284c7" />
          <rect x="9.5" y="4" width="3" height="3" rx="0.4" fill="#0284c7" />
          <rect x="13.5" y="4" width="3" height="3" rx="0.4" fill="#0284c7" />
          <path d="M22 13.5c-.5-.4-1.6-.4-2.3-.2-.5-1.5-1.9-2.6-3.7-2.6H2.5c-.3 0-.5.2-.5.5 0 2.5 1 4.9 2.8 6.6 2 1.9 4.7 2.7 7.7 2.7 5.5 0 10-3.5 10.5-8.5.5.3 1.1.3 1.6 0 .4-.2.6-.6.6-1s-.4-.8-.7-.9l-2.5.4z" fill="#0284c7" />
          <circle cx="5" cy="15.5" r="0.8" fill="#ffffff" />
        </svg>
      );

    case 'firewall':
      // Network Security Shield
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 5.5v6.5C4 17.5 7.4 21.6 12 23c4.6-1.4 8-5.5 8-11V5.5L12 2z" fill="#dc2626" />
          <path d="M8.5 11.5L11 14l4.5-5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'switch':
      // Enterprise Switch / Router
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="20" height="12" rx="2.5" fill="#047857" />
          <line x1="6" y1="12" x2="18" y2="12" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" />
          <polyline points="15 9.5 18 12 15 14.5" fill="none" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="9 9.5 6 12 9 14.5" fill="none" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="8.5" r="0.8" fill="#ffffff" />
          <circle cx="10" cy="8.5" r="0.8" fill="#ffffff" />
          <circle cx="14" cy="8.5" r="0.8" fill="#ffffff" />
          <circle cx="18" cy="8.5" r="0.8" fill="#ffffff" />
        </svg>
      );

    default:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
  }
};

export interface OsBadgeProps {
  os?: string;
  hostname?: string;
  deviceType?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  short?: boolean;
  variant?: 'badge' | 'icon-only' | 'tag';
  isDark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const OsBadge: React.FC<OsBadgeProps> = ({
  os,
  hostname,
  deviceType,
  size = 'sm',
  showLabel = true,
  short = false,
  variant = 'badge',
  isDark = false,
  className = '',
  style = {}
}) => {
  const info = detectOsInfo(os, hostname, deviceType);

  const config = {
    xs: { icon: 11, font: '0.62rem', pad: '1px 5px', gap: '3px', height: '18px' },
    sm: { icon: 13, font: '0.68rem', pad: '2px 6px', gap: '4px', height: '22px' },
    md: { icon: 16, font: '0.74rem', pad: '3px 8px', gap: '5px', height: '26px' },
    lg: { icon: 20, font: '0.82rem', pad: '4px 10px', gap: '6px', height: '30px' }
  }[size];

  if (variant === 'icon-only') {
    return (
      <span
        className={className}
        title={`${info.label} (${hostname || 'Device'})`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: config.height,
          height: config.height,
          borderRadius: '4px',
          background: isDark ? info.darkBg : info.badgeBg,
          border: `1px solid ${isDark ? info.darkBorder : info.badgeBorder}`,
          flexShrink: 0,
          boxSizing: 'border-box',
          ...style
        }}
      >
        <OsIcon type={info.type} size={config.icon} />
      </span>
    );
  }

  const bg = isDark ? info.darkBg : info.badgeBg;
  const border = isDark ? info.darkBorder : info.badgeBorder;
  const color = isDark ? info.darkText : info.badgeText;
  const labelText = short ? info.shortLabel : info.label;

  return (
    <span
      className={className}
      title={`${info.label} (OS: ${os || 'Detected via Telemetry'})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: config.gap,
        padding: config.pad,
        borderRadius: '4px',
        height: config.height,
        fontSize: config.font,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        lineHeight: 1,
        background: bg,
        border: `1px solid ${border}`,
        color: color,
        boxSizing: 'border-box',
        ...style
      }}
    >
      <OsIcon type={info.type} size={config.icon} />
      {showLabel && <span>{labelText}</span>}
    </span>
  );
};

