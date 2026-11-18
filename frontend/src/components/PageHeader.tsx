import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type PageHeaderBadgeColor = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' | 'emerald';

export interface PageHeaderProps {
  icon: LucideIcon;
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  badge?: string | React.ReactNode;
  badgeColor?: PageHeaderBadgeColor;
  actions?: React.ReactNode;
  extraContent?: React.ReactNode;
  style?: React.CSSProperties;
}

const badgeColorMap: Record<PageHeaderBadgeColor, { bg: string; color: string; border: string }> = {
  blue: {
    bg: 'rgba(2, 132, 199, 0.22)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.35)'
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.22)',
    color: '#22d3ee',
    border: '1px solid rgba(34, 211, 238, 0.35)'
  },
  green: {
    bg: 'rgba(34, 197, 94, 0.20)',
    color: '#4ade80',
    border: '1px solid rgba(74, 222, 128, 0.35)'
  },
  emerald: {
    bg: 'rgba(16, 185, 129, 0.20)',
    color: '#34d399',
    border: '1px solid rgba(52, 211, 153, 0.35)'
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.20)',
    color: '#fbbf24',
    border: '1px solid rgba(251, 191, 36, 0.35)'
  },
  red: {
    bg: 'rgba(239, 68, 68, 0.20)',
    color: '#f87171',
    border: '1px solid rgba(248, 113, 113, 0.35)'
  },
  purple: {
    bg: 'rgba(168, 85, 247, 0.20)',
    color: '#c084fc',
    border: '1px solid rgba(192, 132, 252, 0.35)'
  }
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  actions,
  extraContent,
  style
}) => {
  const bStyle = badgeColorMap[badgeColor] || badgeColorMap.blue;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
        ...style
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          width: '100%'
        }}
      >
        {/* Left Side: Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)',
              flexShrink: 0
            }}
          >
            <Icon size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}
              >
                {title}
              </h2>
              {badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    background: bStyle.bg,
                    color: bStyle.color,
                    border: bStyle.border
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p
                style={{
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  margin: '3px 0 0 0',
                  lineHeight: 1.4
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Actions */}
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Extra Content (Subtabs, Horizon Bar, Filters if nested in header) */}
      {extraContent && (
        <div style={{ width: '100%', borderTop: '1px solid #334155', paddingTop: '10px' }}>
          {extraContent}
        </div>
      )}
    </div>
  );
};

