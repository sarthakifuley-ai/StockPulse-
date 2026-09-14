import React from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, User, LogOut, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { selectedTicker, setSelectedTicker, tickersList, selectedStockSummary } = useMarket();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleTickerChange = (e) => {
    setSelectedTicker(e.target.value);
  };

  return (
    <header style={{
      height: '64px',
      background: 'rgba(17, 24, 39, 0.95)',
      borderBottom: '1px solid #1f2937',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo & Ticker Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 'bold'
          }}>
            <TrendingUp size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#f9fafb' }}>StockPulse AI</span>
        </div>

        {/* Ticker Selection Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1f2937', padding: '4px 12px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>TICKER:</span>
          <select
            value={selectedTicker}
            onChange={handleTickerChange}
            style={{
              background: 'transparent',
              color: '#3b82f6',
              border: 'none',
              fontWeight: 700,
              fontSize: '15px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {tickersList.map((t) => (
              <option key={t.ticker} value={t.ticker} style={{ background: '#111827', color: '#fff' }}>
                {t.ticker} - {t.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Stock Live Bar */}
      {selectedStockSummary && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(31, 41, 55, 0.5)', padding: '6px 16px', borderRadius: '20px' }}>
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{selectedStockSummary.display_name}</span>
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#ffffff' }}>${selectedStockSummary.latest_close.toFixed(2)}</span>
          <span className={selectedStockSummary.change >= 0 ? 'badge-up' : 'badge-down'} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {selectedStockSummary.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {selectedStockSummary.change >= 0 ? '+' : ''}{selectedStockSummary.change.toFixed(2)} ({selectedStockSummary.change_percent.toFixed(2)}%)
          </span>
        </div>
      )}

      {/* Auth Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af' }}>
              <User size={18} />
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#f3f4f6' }}>{user.full_name || user.email}</span>
            </div>
            <button onClick={logout} className="btn-secondary" style={{ padding: '6px 12px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '6px 16px' }}>
            <LogIn size={16} /> Login
          </button>
        )}
      </div>
    </header>
  );
}
