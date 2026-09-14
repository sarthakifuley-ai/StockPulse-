import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, Newspaper, BrainCircuit, Wallet, Bell, History } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/analysis', label: 'Stock Analysis', icon: <LineChart size={18} /> },
    { path: '/news', label: 'News & Sentiment', icon: <Newspaper size={18} /> },
    { path: '/prediction', label: 'ML Prediction', icon: <BrainCircuit size={18} /> },
    { path: '/portfolio', label: 'Portfolio', icon: <Wallet size={18} /> },
    { path: '/alerts', label: 'Price Alerts', icon: <Bell size={18} /> },
    { path: '/history', label: 'Prediction History', icon: <History size={18} /> },
  ];

  return (
    <aside style={{
      width: '240px',
      background: '#0d1322',
      borderRight: '1px solid #1f2937',
      minHeight: 'calc(100vh - 64px)',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', padding: '0 12px 8px 12px', letterSpacing: '0.5px' }}>
        NAVIGATION
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#ffffff' : '#9ca3af',
            background: isActive ? 'linear-gradient(90deg, rgba(37,99,235,0.2), rgba(37,99,235,0.05))' : 'transparent',
            borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
            transition: 'all 0.15s ease'
          })}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
