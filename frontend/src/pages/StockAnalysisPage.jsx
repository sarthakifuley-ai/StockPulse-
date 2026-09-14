import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import apiClient from '../api/client';
import StockChart from '../components/StockChart';
import { LineChart, Table } from 'lucide-react';

export default function StockAnalysisPage() {
  const { selectedTicker } = useMarket();
  const [stockDetail, setStockDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1Y'); // '1M', '6M', '1Y', '5Y', 'ALL'

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/stocks/${selectedTicker}`);
        setStockDetail(res.data);
      } catch (err) {
        console.error('Error fetching stock detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [selectedTicker]);

  if (loading || !stockDetail) {
    return <div style={{ padding: '40px', color: '#9ca3af' }}>Loading Technical Analysis...</div>;
  }

  const { summary, historical_data, technical_indicators } = stockDetail;

  // Timeframe filtering helper
  const filterByTimeframe = (data) => {
    if (timeframe === '1M') return data.slice(-22);
    if (timeframe === '6M') return data.slice(-126);
    if (timeframe === '1Y') return data.slice(-252);
    if (timeframe === '5Y') return data.slice(-1260);
    return data;
  };

  const filteredHistory = filterByTimeframe(historical_data);
  const filteredIndicators = filterByTimeframe(technical_indicators);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Timeframe Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LineChart size={24} color="#3b82f6" /> {summary.display_name} Technical Analysis
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
            Calculated Indicators: SMA 20/50, EMA 12/26, RSI 14, MACD, Bollinger Bands, Volatility
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div style={{ display: 'flex', gap: '6px', background: '#111827', padding: '4px', borderRadius: '8px', border: '1px solid #1f2937' }}>
          {['1M', '6M', '1Y', '5Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                background: timeframe === tf ? '#2563eb' : 'transparent',
                color: timeframe === tf ? '#ffffff' : '#9ca3af'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Candlestick & Technical Chart */}
      <StockChart
        historicalData={filteredHistory}
        technicalIndicators={filteredIndicators}
        ticker={summary.ticker}
      />

      {/* Technical Indicators Summary Table */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Table size={18} color="#06b6d4" /> Recent Technical Indicator Records
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Close</th>
                <th style={{ padding: '10px' }}>SMA (20)</th>
                <th style={{ padding: '10px' }}>EMA (12)</th>
                <th style={{ padding: '10px' }}>RSI (14)</th>
                <th style={{ padding: '10px' }}>MACD</th>
                <th style={{ padding: '10px' }}>Bollinger Upper</th>
                <th style={{ padding: '10px' }}>Bollinger Lower</th>
                <th style={{ padding: '10px' }}>Daily Volatility</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndicators.slice(-15).reverse().map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1f2937', color: '#e5e7eb' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{row.date}</td>
                  <td style={{ padding: '10px', color: '#f3f4f6', fontWeight: 600 }}>${row.close.toFixed(2)}</td>
                  <td style={{ padding: '10px', color: '#f59e0b' }}>{row.sma_20 ? `$${row.sma_20.toFixed(2)}` : '-'}</td>
                  <td style={{ padding: '10px', color: '#06b6d4' }}>{row.ema_12 ? `$${row.ema_12.toFixed(2)}` : '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <span className={row.rsi_14 >= 70 ? 'badge-down' : row.rsi_14 <= 30 ? 'badge-up' : 'badge-neutral'}>
                      {row.rsi_14 ? row.rsi_14.toFixed(1) : '-'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: row.macd >= 0 ? '#10b981' : '#ef4444' }}>
                    {row.macd ? row.macd.toFixed(3) : '-'}
                  </td>
                  <td style={{ padding: '10px', color: '#9ca3af' }}>{row.bollinger_upper ? `$${row.bollinger_upper.toFixed(2)}` : '-'}</td>
                  <td style={{ padding: '10px', color: '#9ca3af' }}>{row.bollinger_lower ? `$${row.bollinger_lower.toFixed(2)}` : '-'}</td>
                  <td style={{ padding: '10px', color: '#9ca3af' }}>{row.volatility ? `${(row.volatility * 100).toFixed(2)}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
