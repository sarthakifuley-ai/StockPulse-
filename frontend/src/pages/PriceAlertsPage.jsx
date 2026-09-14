import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import apiClient from '../api/client';
import { Bell, Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PriceAlertsPage() {
  const { user } = useAuth();
  const { tickersList } = useMarket();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    ticker: 'AAPL',
    condition: 'GREATER_EQUAL',
    target_price: 200
  });

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/alerts', {
        ticker: formData.ticker,
        condition: formData.condition,
        target_price: parseFloat(formData.target_price)
      });
      setShowAddModal(false);
      fetchAlerts();
    } catch (err) {
      alert('Failed to set price alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await apiClient.delete(`/alerts/${id}`);
      fetchAlerts();
    } catch (err) {
      alert('Failed to delete alert');
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
        <Bell size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>User Authentication Required</h2>
        <p style={{ color: '#9ca3af', marginTop: '8px', marginBottom: '24px' }}>
          Please log in to set target threshold price alerts for your favorite stock tickers.
        </p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Log In / Register
        </button>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '40px', color: '#9ca3af' }}>Evaluating Price Alerts...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={24} color="#f59e0b" /> Real-time Price Alerts Center
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
            Automated monitoring of target price thresholds against historical & current market prices
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Price Alert
        </button>
      </div>

      {/* Alerts Table */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>
          Your Price Alerts ({alerts.length})
        </h3>

        {alerts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            No price alerts created yet. Click "Create Price Alert" to configure target price notifications.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                  <th style={{ padding: '10px' }}>Ticker</th>
                  <th style={{ padding: '10px' }}>Condition</th>
                  <th style={{ padding: '10px' }}>Target Threshold</th>
                  <th style={{ padding: '10px' }}>Current Market Price</th>
                  <th style={{ padding: '10px' }}>Alert Status</th>
                  <th style={{ padding: '10px' }}>Triggered Time</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #1f2937', color: '#e5e7eb' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#3b82f6' }}>{a.ticker}</td>
                    <td style={{ padding: '10px' }}>
                      {a.condition === 'GREATER_EQUAL' ? 'Price ≥ Target' : 'Price ≤ Target'}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>${a.target_price.toFixed(2)}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#ffffff' }}>${a.current_price.toFixed(2)}</td>
                    <td style={{ padding: '10px' }}>
                      {a.is_triggered ? (
                        <span className="badge-down" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> TRIGGERED (${a.triggered_price?.toFixed(2)})
                        </span>
                      ) : (
                        <span className="badge-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px', color: '#9ca3af' }}>
                      {a.triggered_at ? new Date(a.triggered_at).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => handleDeleteAlert(a.id)}
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

      {/* Add Alert Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '400px', padding: '24px', background: '#111827' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>Create Price Alert</h3>
            <form onSubmit={handleAddAlert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CONDITION</label>
                <select
                  className="input-field"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  <option value="GREATER_EQUAL">Price Rise Above or Equal (Price ≥ Target)</option>
                  <option value="LESS_EQUAL">Price Drop Below or Equal (Price ≤ Target)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>TARGET PRICE THRESHOLD ($)</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={formData.target_price}
                  onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Set Alert</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
