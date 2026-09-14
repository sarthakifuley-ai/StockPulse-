import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import apiClient from '../api/client';
import KPICard from '../components/KPICard';
import StockChart from '../components/StockChart';
import { DollarSign, TrendingUp, TrendingDown, BrainCircuit, Newspaper, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { selectedTicker, selectedStockSummary } = useMarket();
  const [stockDetail, setStockDetail] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [stockRes, newsRes] = await Promise.all([
          apiClient.get(`/stocks/${selectedTicker}`),
          apiClient.get(`/news/${selectedTicker}`).catch(() => ({ data: null }))
        ]);
        setStockDetail(stockRes.data);
        setNews(newsRes.data);

        // Fetch prediction if user logged in, or generic metrics
        try {
          const predRes = await apiClient.post('/predict/generate', { ticker: selectedTicker });
          setPrediction(predRes.data);
        } catch (e) {
          // If unauthenticated or model not ready
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedTicker]);

  if (loading || !stockDetail) {
    return <div style={{ padding: '40px', color: '#9ca3af' }}>Loading Market Dashboard...</div>;
  }

  const { summary, historical_data, technical_indicators } = stockDetail;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb' }}>
            {summary.display_name} ({summary.ticker}) Overview
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
            Historical dataset range: {summary.data_range} | Total Records: {summary.total_records.toLocaleString()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => navigate('/prediction')}>
            <BrainCircuit size={16} /> Run ML Prediction
          </button>
          <button className="btn-secondary" onClick={() => navigate('/analysis')}>
            Full Technical View
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <KPICard
          title="LATEST CLOSE PRICE"
          value={`$${summary.latest_close.toFixed(2)}`}
          subtext={`As of ${summary.latest_date}`}
          badge={{
            type: summary.change >= 0 ? 'up' : 'down',
            text: `${summary.change >= 0 ? '+' : ''}${summary.change.toFixed(2)} (${summary.change_percent.toFixed(2)}%)`
          }}
          icon={<DollarSign size={20} />}
          accentColor="#3b82f6"
        />

        <KPICard
          title="ML PREDICTED NEXT CLOSE"
          value={prediction ? `$${prediction.predicted_next_close.toFixed(2)}` : 'Sign in to Predict'}
          subtext={prediction ? `Model: ${prediction.regressor_model_used}` : 'Chronological Time-Series Model'}
          badge={prediction ? {
            type: prediction.predicted_direction === 'UP' ? 'up' : 'down',
            text: `Direction: ${prediction.predicted_direction}`
          } : null}
          icon={<BrainCircuit size={20} />}
          accentColor="#8b5cf6"
        />

        <KPICard
          title="LIVE MARKET SENTIMENT"
          value={news ? `${news.sentiment_distribution.positive} Pos / ${news.sentiment_distribution.negative} Neg` : 'PhraseBank Model'}
          subtext={news ? `Avg Confidence: ${(news.average_confidence * 100).toFixed(1)}%` : 'No recent news'}
          badge={news ? {
            type: news.sentiment_distribution.positive >= news.sentiment_distribution.negative ? 'up' : 'down',
            text: `${news.total_news} Articles Scanned`
          } : null}
          icon={<Newspaper size={20} />}
          accentColor="#06b6d4"
        />

        <KPICard
          title="HISTORICAL VOLUME"
          value={summary.volume.toLocaleString()}
          subtext="Daily Trading Volume"
          icon={<TrendingUp size={20} />}
          accentColor="#10b981"
        />
      </div>

      {/* Main Interactive Candlestick Chart */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f3f4f6' }}>Historical Price & Technical Overlay</h2>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Calculated from raw OHLCV datasets</span>
        </div>
        <StockChart
          historicalData={historical_data.slice(-300)}
          technicalIndicators={technical_indicators.slice(-300)}
          ticker={summary.ticker}
        />
      </div>
    </div>
  );
}
