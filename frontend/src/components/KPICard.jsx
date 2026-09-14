import React from 'react';

export default function KPICard({ title, value, subtext, badge, icon, accentColor = '#3b82f6' }) {
  return (
    <div className="glass-card" style={{ padding: '20px', flex: 1, minWidth: '200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af' }}>{title}</span>
        {icon && (
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            background: `${accentColor}20`,
            color: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb', marginBottom: '6px' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
        {badge && (
          <span className={badge.type === 'up' ? 'badge-up' : badge.type === 'down' ? 'badge-down' : 'badge-neutral'}>
            {badge.text}
          </span>
        )}
        {subtext && <span style={{ color: '#6b7280' }}>{subtext}</span>}
      </div>
    </div>
  );
}
