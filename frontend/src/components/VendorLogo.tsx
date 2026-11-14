import React from 'react';

export interface VendorLogoProps {
  vendor: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const VendorLogo: React.FC<VendorLogoProps> = ({
  vendor,
  size = 'md',
  showLabel = true,
}) => {
  const norm = (vendor || '').toLowerCase();

  const config = {
    xs: { icon: 12, font: '0.62rem', pad: '1px 5px', gap: '3px', height: '18px' },
    sm: { icon: 13, font: '0.68rem', pad: '2px 6px', gap: '4px', height: '22px' },
    md: { icon: 16, font: '0.74rem', pad: '3px 8px', gap: '5px', height: '26px' },
    lg: { icon: 20, font: '0.82rem', pad: '4px 10px', gap: '6px', height: '30px' },
  }[size];

  const baseStyle: React.CSSProperties = {
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
    boxSizing: 'border-box'
  };

  // 1. Microsoft / Windows
  if (norm.includes('microsoft') || norm.includes('window') || norm.includes('win')) {
    return (
      <span style={{ ...baseStyle, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 88 88" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <path d="M0 0H41.6V41.6H0V0Z" fill="#F25022" />
          <path d="M46.4 0H88V41.6H46.4V0Z" fill="#7FBA00" />
          <path d="M0 46.4H41.6V88H0V46.4Z" fill="#00A4EF" />
          <path d="M46.4 46.4H88V88H46.4V46.4Z" fill="#FFB900" />
        </svg>
        {showLabel && <span>Windows</span>}
      </span>
    );
  }

  // 2. Cisco
  if (norm.includes('cisco')) {
    const ciscoWidth = Math.round(config.icon * 1.4);
    return (
      <span style={{ ...baseStyle, background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1' }}>
        <svg width={ciscoWidth} height={config.icon} viewBox="0 0 100 60" fill="#049FD9" style={{ width: `${ciscoWidth}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <rect x="2" y="32" width="6" height="26" rx="3" />
          <rect x="14" y="16" width="6" height="42" rx="3" />
          <rect x="26" y="32" width="6" height="26" rx="3" />
          <rect x="38" y="2" width="6" height="56" rx="3" />
          <rect x="50" y="2" width="6" height="56" rx="3" />
          <rect x="62" y="32" width="6" height="26" rx="3" />
          <rect x="74" y="16" width="6" height="42" rx="3" />
          <rect x="86" y="32" width="6" height="26" rx="3" />
        </svg>
        {showLabel && <span>CISCO</span>}
      </span>
    );
  }

  // 3. Dell
  if (norm.includes('dell')) {
    return (
      <span style={{ ...baseStyle, background: '#eff6ff', border: '1px solid #93c5fd', color: '#0076CE' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <circle cx="50" cy="50" r="46" stroke="#0076CE" strokeWidth="8" />
          <text x="50" y="62" textAnchor="middle" fill="#0076CE" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="36" letterSpacing="-1">DELL</text>
        </svg>
        {showLabel && <span>DELL</span>}
      </span>
    );
  }

  // 4. HP / Hewlett Packard
  if (norm.includes('hp') || norm.includes('hewlett')) {
    return (
      <span style={{ ...baseStyle, background: '#ecfeff', border: '1px solid #a5f3fc', color: '#0891b2' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <circle cx="50" cy="50" r="48" fill="#0096D6" />
          <text x="50" y="66" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" fontSize="48">hp</text>
        </svg>
        {showLabel && <span>HP</span>}
      </span>
    );
  }

  // 5. Red Hat / Enterprise Linux / RHEL / CentOS / Rocky
  if (norm.includes('red hat') || norm.includes('redhat') || norm.includes('rhel') || norm.includes('rocky') || norm.includes('centos')) {
    return (
      <span style={{ ...baseStyle, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <path d="M12 58C16 52 28 48 46 47C38 34 38 18 55 18C70 18 78 28 80 43C88 44 94 48 94 56C94 66 76 74 50 74C22 74 12 66 12 58Z" fill="#EE0000" />
          <path d="M46 47C49 46 54 45 60 45C68 45 74 46 80 43C78 28 70 18 55 18C38 18 38 34 46 47Z" fill="#111111" />
          <path d="M46 47C50 49 56 50 63 50C71 50 77 48 80 43C80 44 80 45 80 46C76 49 68 52 60 52C53 52 48 50 46 47Z" fill="#FFFFFF" />
        </svg>
        {showLabel && <span>Red Hat</span>}
      </span>
    );
  }

  // 6. Ubuntu / Canonical
  if (norm.includes('ubuntu') || norm.includes('canonical')) {
    return (
      <span style={{ ...baseStyle, background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <circle cx="50" cy="50" r="48" fill="#E95420" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#FFFFFF" strokeWidth="8" />
          <circle cx="20" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="65" cy="24" r="7" fill="#FFFFFF" />
          <circle cx="65" cy="76" r="7" fill="#FFFFFF" />
        </svg>
        {showLabel && <span>Ubuntu</span>}
      </span>
    );
  }

  // 7. Generic Linux
  if (norm.includes('linux')) {
    return (
      <span style={{ ...baseStyle, background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <rect x="10" y="15" width="80" height="70" rx="8" fill="#1e293b" />
          <path d="M25 40L40 50L25 60" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="48" y1="60" x2="70" y2="60" stroke="#facc15" strokeWidth="8" strokeLinecap="round" />
        </svg>
        {showLabel && <span>Linux</span>}
      </span>
    );
  }

  // 6. Check Point / Palo Alto Security
  if (norm.includes('check point') || norm.includes('checkpoint') || norm.includes('palo alto') || norm.includes('polta')) {
    const isPalo = norm.includes('palo') || norm.includes('polta');
    return (
      <span style={{ ...baseStyle, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <path d="M50 8L15 24V50C15 72 30 90 50 96C70 90 85 72 85 50V24L50 8Z" fill="#EB1C24" stroke="#B30006" strokeWidth="4" />
          <path d="M35 48L46 59L66 38" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {showLabel && <span>{isPalo ? 'Palo Alto' : 'Check Point'}</span>}
      </span>
    );
  }

  // 7. Microchip (NTP Stratum-1 SyncServer)
  if (norm.includes('microchip') || norm.includes('syncserver') || norm.includes('stratum')) {
    return (
      <span style={{ ...baseStyle, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <circle cx="50" cy="50" r="46" fill="#be123c" />
          <path d="M26 35L42 65L50 50L58 65L74 35" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {showLabel && <span>Microchip</span>}
      </span>
    );
  }

  // 8. Ubiquiti Networks
  if (norm.includes('ubiquiti') || norm.includes('unifi')) {
    return (
      <span style={{ ...baseStyle, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="#0559C9" />
          <path d="M35 32V60C35 68 41 74 50 74C59 74 65 68 65 60V32" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
        </svg>
        {showLabel && <span>Ubiquiti</span>}
      </span>
    );
  }

  // 9. Supermicro
  if (norm.includes('supermicro')) {
    return (
      <span style={{ ...baseStyle, background: '#f8fafc', border: '1px solid #cbd5e1', color: '#002D62' }}>
        <svg width={config.icon} height={config.icon} viewBox="0 0 100 100" fill="none" style={{ width: `${config.icon}px`, height: `${config.icon}px`, flexShrink: 0, display: 'inline-block' }}>
          <circle cx="50" cy="50" r="46" fill="#002D62" />
          <path d="M26 62C26 62 36 34 56 34C70 34 76 44 72 54C68 64 54 66 46 66C38 66 30 70 30 70" stroke="#CC0000" strokeWidth="8" strokeLinecap="round" />
          <circle cx="70" cy="36" r="6" fill="#CC0000" />
        </svg>
        {showLabel && <span>Supermicro</span>}
      </span>
    );
  }

  // Generic Fallback
  return (
    <span style={{ ...baseStyle, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}>
      <span style={{ width: `${Math.max(4, config.icon - 8)}px`, height: `${Math.max(4, config.icon - 8)}px`, borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }}></span>
      {showLabel && <span style={{ textTransform: 'capitalize' }}>{vendor || 'Appliance'}</span>}
    </span>
  );
};

export interface DeviceTypeBadgeProps {
  type: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const DeviceTypeBadge: React.FC<DeviceTypeBadgeProps> = ({ type, size = 'sm' }) => {
  const norm = (type || '').toLowerCase();
  const iconPx = size === 'xs' ? 10 : size === 'sm' ? 11 : 13;
  const fontPx = size === 'xs' ? '0.62rem' : size === 'sm' ? '0.67rem' : '0.74rem';
  const pad = size === 'xs' ? '1px 5px' : '2px 6px';
  const height = size === 'xs' ? '18px' : '22px';

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    padding: pad,
    height: height,
    borderRadius: '4px',
    fontSize: fontPx,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    flexShrink: 0,
    boxSizing: 'border-box'
  };

  const svgStyle: React.CSSProperties = {
    width: `${iconPx}px`,
    height: `${iconPx}px`,
    minWidth: `${iconPx}px`,
    maxWidth: `${iconPx}px`,
    minHeight: `${iconPx}px`,
    maxHeight: `${iconPx}px`,
    flexShrink: 0,
    display: 'inline-block'
  };

  switch (norm) {
    case 'server':
      return (
        <span style={{ ...badgeStyle, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
          <svg style={svgStyle} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="7" rx="2" />
            <rect x="2" y="14" width="20" height="7" rx="2" />
            <line x1="6" y1="6.5" x2="6.01" y2="6.5" />
            <line x1="6" y1="17.5" x2="6.01" y2="17.5" />
          </svg>
          <span>SERVER</span>
        </span>
      );
    case 'workstation':
      return (
        <span style={{ ...badgeStyle, background: '#ecfeff', color: '#0e7490', border: '1px solid #a5f3fc' }}>
          <svg style={svgStyle} viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <line x1="2" y1="20" x2="22" y2="20" />
          </svg>
          <span>WORKSTATION</span>
        </span>
      );
    case 'router':
      return (
        <span style={{ ...badgeStyle, background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
          <svg style={svgStyle} viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>GATEWAY</span>
        </span>
      );
    case 'firewall':
      return (
        <span style={{ ...badgeStyle, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          <svg style={svgStyle} viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>FIREWALL</span>
        </span>
      );
    case 'ntp':
      return (
        <span style={{ ...badgeStyle, background: '#fefce8', color: '#a16207', border: '1px solid #fef08a' }}>
          <svg style={svgStyle} viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>NTP CLOCK</span>
        </span>
      );
    case 'switch':
      return (
        <span style={{ ...badgeStyle, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          <svg style={svgStyle} viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="10" cy="12" r="1.5" />
            <circle cx="14" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
          </svg>
          <span>SWITCH</span>
        </span>
      );
    default:
      return (
        <span style={{ ...badgeStyle, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
          <svg style={svgStyle} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="12" x2="2" y2="12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            <line x1="6" y1="16" x2="6.01" y2="16" />
            <line x1="10" y1="16" x2="10.01" y2="16" />
          </svg>
          <span>NODE</span>
        </span>
      );
  }
};
