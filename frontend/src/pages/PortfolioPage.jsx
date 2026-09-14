import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import apiClient from '../api/client';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PortfolioPage() {
  const { user } = useAuth();
  const { tickersList } = useMarket();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    ticker: 'AAPL',
    quantity: 10,
    purchase_price: 150,
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const fetchPortfolio = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/portfolio');
      setPortfolio(res.data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAddHolding = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/portfolio', {
        ticker: formData.ticker,
        quantity: parseFloat(formData.quantity),
        purchase_price: parseFloat(formData.purchase_price),
        purchase_date: formData.purchase_date
      });
      setShowAddModal(false);
      fetchPortfolio();
    } catch (err) {
      alert('Failed to add holding: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteHolding = async (id) => {
    if (!window.confirm('Remove this holding from your portfolio?')) return;
    try {
      await apiClient.delete(`/portfolio/${id}`);
      fetchPortfolio();
    } catch (err) {
      alert('Failed to remove holding');
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
        <Wallet size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>User Authentication Required</h2>
        <p style={{ color: '#9ca3af', marginTop: '8px', marginBottom: '24px' }}>
          Please log in or create an account to manage your stock holdings and track real-time portfolio returns.
        </p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Log In / Register
        </button>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '40px', color: '#9ca3af' }}>Loading User Portfolio...</div>;
  }

  const { total_invested, total_current_value, total_profit_loss, total_profit_loss_percent, holdings } = portfolio || {
    total_invested: 0, total_current_value: 0, total_profit_loss: 0, total_profit_loss_percent: 0, holdings: []
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet size={24} color="#10b981" /> Portfolio Tracker
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
            User: {user.email} | Live valuation based on historical & current stock prices
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add New Holding
        </button>
      </div>

      {/* Portfolio Summary KPI Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>TOTAL INVESTED</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb', marginTop: '4px' }}>
            ${total_invested.toFixed(2)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>CURRENT VALUATION</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6', marginTop: '4px' }}>
            ${total_current_value.toFixed(2)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>TOTAL PROFIT / LOSS</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: total_profit_loss >= 0 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {total_profit_loss >= 0 ? '+' : ''}${total_profit_loss.toFixed(2)} ({total_profit_loss_percent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>
          Current Stock Holdings ({holdings.length})
        </h3>

        {holdings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            No stock holdings added yet. Click "Add New Holding" to start building your portfolio.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                  <th style={{ padding: '10px' }}>Ticker</th>
                  <th style={{ padding: '10px' }}>Quantity</th>
                  <th style={{ padding: '10px' }}>Avg Buy Price</th>
                  <th style={{ padding: '10px' }}>Current Price</th>
                  <th style={{ padding: '10px' }}>Total Invested</th>
                  <th style={{ padding: '10px' }}>Current Value</th>
                  <th style={{ padding: '10px' }}>Profit / Loss</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #1f2937', color: '#e5e7eb' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#3b82f6' }}>{h.ticker}</td>
                    <td style={{ padding: '10px' }}>{h.quantity}</td>
                    <td style={{ padding: '10px' }}>${h.purchase_price.toFixed(2)}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#ffffff' }}>${h.current_price.toFixed(2)}</td>
                    <td style={{ padding: '10px' }}>${h.total_invested.toFixed(2)}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>${h.current_value.toFixed(2)}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={h.profit_loss >= 0 ? 'badge-up' : 'badge-down'}>
                        {h.profit_loss >= 0 ? '+' : ''}${h.profit_loss.toFixed(2)} ({h.profit_loss_percent.toFixed(2)}%)
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => handleDeleteHolding(h.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Holding Modal Form */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '400px', padding: '24px', background: '#111827' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>Add Stock Holding</h3>
            <form onSubmit={handleAddHolding} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>TICKER SYMBOL</label>
                <select
                  className="input-field"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                >
                  {tickersList.map(t => (
                    <option key={t.ticker} value={t.ticker}>{t.ticker} - {t.display_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>QUANTITY (SHARES)</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>PURCHASE PRICE ($)</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>PURCHASE DATE</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Holding</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
