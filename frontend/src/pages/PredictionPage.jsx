import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { BrainCircuit, TrendingUp, TrendingDown, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PredictionPage() {
  const { selectedTicker, selectedStockSummary } = useMarket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictionData = async () => {
      setLoading(true);
      try {
        const [predRes, metricsRes] = await Promise.all([
          apiClient.post('/predict/generate', { ticker: selectedTicker }),
          apiClient.get('/predict/metrics').catch(() => ({ data: null }))
        ]);
        setPrediction(predRes.data);
        setMetrics(metricsRes.data);
      } catch (err) {
        console.error('Error fetching prediction:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictionData();
  }, [selectedTicker]);

  if (loading) {
    return <div style={{ padding: '40px', color: '#9ca3af' }}>Running ML models & chronological backtesting...</div>;
  }

  const tickerMetrics = metrics ? metrics[selectedTicker] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrainCircuit size={24} color="#8b5cf6" /> ML Price & Direction Prediction Workbench
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
          Strict Chronological Split (70% Train / 15% Val / 15% Test) — Zero Future Data Leakage
        </p>
      </div>

      {/* Main Prediction Display Card */}
      {prediction && (
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px' }}>
                TARGET: NEXT TRADING DAY CLOSING PRICE
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                {prediction.display_name} ({prediction.ticker})
              </h2>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                Base Price (as of {prediction.latest_date}): ${prediction.current_close.toFixed(2)}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={prediction.predicted_direction === 'UP' ? 'badge-up' : 'badge-down'} style={{ fontSize: '14px', padding: '6px 12px' }}>
                DIRECTION: {prediction.predicted_direction} {prediction.predicted_direction === 'UP' ? <TrendingUp size={16} style={{ display: 'inline' }} /> : <TrendingDown size={16} style={{ display: 'inline' }} />}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', background: '#0d1322', padding: '20px', borderRadius: '10px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>PREDICTED NEXT CLOSE</span>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
                ${prediction.predicted_next_close.toFixed(2)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>ESTIMATED CHANGE</span>
              <div style={{ fontSize: '32px', fontWeight: 700, color: prediction.price_change >= 0 ? '#10b981' : '#ef4444' }}>
                {prediction.price_change >= 0 ? '+' : ''}${prediction.price_change.toFixed(2)} ({prediction.price_change_percent.toFixed(2)}%)
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>SELECTED MODELS</span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6', marginTop: '6px' }}>
                Regressor: {prediction.regressor_model_used} (Test R²: {prediction.regressor_test_r2.toFixed(4)})
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6', marginTop: '2px' }}>
                Classifier: {prediction.classifier_model_used} (Test Acc: {(prediction.classifier_test_accuracy * 100).toFixed(1)}%)
              </div>
            </div>
          </div>

          {user && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
              <CheckCircle size={16} /> Saved to your Prediction History log.
              <button className="btn-secondary" onClick={() => navigate('/history')} style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '12px' }}>
                View Prediction History <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Model Benchmark & Comparison Table */}
      {tickerMetrics && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>
            Model Evaluation & Chronological Backtest Benchmark ({selectedTicker})
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                  <th style={{ padding: '10px' }}>Model Name</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Validation MAE</th>
                  <th style={{ padding: '10px' }}>Validation RMSE</th>
                  <th style={{ padding: '10px' }}>Validation MAPE</th>
                  <th style={{ padding: '10px' }}>Validation R² / Acc</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tickerMetrics.all_reg_val_metrics).map(([mName, mVal]) => (
                  <tr key={mName} style={{ borderBottom: '1px solid #1f2937', color: '#e5e7eb' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{mName}</td>
                    <td style={{ padding: '10px', color: '#3b82f6' }}>Price Regressor</td>
                    <td style={{ padding: '10px' }}>${mVal.mae.toFixed(2)}</td>
                    <td style={{ padding: '10px' }}>${mVal.rmse.toFixed(2)}</td>
                    <td style={{ padding: '10px' }}>{mVal.mape.toFixed(2)}%</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: mVal.r2 > 0.8 ? '#10b981' : '#f59e0b' }}>
                      R²: {mVal.r2.toFixed(4)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {tickerMetrics.best_regressor.name === mName ? (
                        <span className="badge-up">BEST REGRESSOR</span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Evaluated</span>
                      )}
                    </td>
                  </tr>
                ))}

                {Object.entries(tickerMetrics.all_cls_val_metrics).map(([mName, mVal]) => (
                  <tr key={mName} style={{ borderBottom: '1px solid #1f2937', color: '#e5e7eb' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{mName}</td>
                    <td style={{ padding: '10px', color: '#8b5cf6' }}>Direction Classifier</td>
                    <td style={{ padding: '10px' }}>-</td>
                    <td style={{ padding: '10px' }}>-</td>
                    <td style={{ padding: '10px' }}>-</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#10b981' }}>
                      Acc: {(mVal.accuracy * 100).toFixed(1)}% | F1: {mVal.f1.toFixed(3)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {tickerMetrics.best_classifier.name === mName ? (
                        <span className="badge-up">BEST CLASSIFIER</span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Evaluated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
