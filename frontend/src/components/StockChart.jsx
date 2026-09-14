import React, { useState } from 'react';
import Plot from 'react-plotly.js';

export default function StockChart({ historicalData = [], technicalIndicators = [], ticker = 'AAPL' }) {
  const [indicators, setIndicators] = useState({
    sma20: true,
    sma50: false,
    ema12: false,
    ema26: false,
    bollinger: true,
    rsi: false,
    macd: false
  });

  const toggleIndicator = (key) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!historicalData || historicalData.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading interactive chart...</div>;
  }

  const dates = historicalData.map(d => d.date);
  const opens = historicalData.map(d => d.open);
  const highs = historicalData.map(d => d.high);
  const lows = historicalData.map(d => d.low);
  const closes = historicalData.map(d => d.close);
  const volumes = historicalData.map(d => d.volume);

  const plotData = [
    // 1. Candlestick
    {
      x: dates,
      open: opens,
      high: highs,
      low: lows,
      close: closes,
      type: 'candlestick',
      name: `${ticker} OHLC`,
      increasing: { line: { color: '#10b981' } },
      decreasing: { line: { color: '#ef4444' } },
      xaxis: 'x',
      yaxis: 'y'
    },
    // 2. Volume Bars
    {
      x: dates,
      y: volumes,
      type: 'bar',
      name: 'Volume',
      marker: { color: 'rgba(59, 130, 246, 0.3)' },
      xaxis: 'x',
      yaxis: 'y2'
    }
  ];

  // Technical Indicator Traces
  if (indicators.sma20) {
    plotData.push({
      x: dates,
      y: technicalIndicators.map(t => t.sma_20),
      type: 'scatter',
      mode: 'lines',
      name: 'SMA (20)',
      line: { color: '#f59e0b', width: 1.5 },
      xaxis: 'x', yaxis: 'y'
    });
  }

  if (indicators.sma50) {
    plotData.push({
      x: dates,
      y: technicalIndicators.map(t => t.sma_50),
      type: 'scatter',
      mode: 'lines',
      name: 'SMA (50)',
      line: { color: '#8b5cf6', width: 1.5 },
      xaxis: 'x', yaxis: 'y'
    });
  }

  if (indicators.ema12) {
    plotData.push({
      x: dates,
      y: technicalIndicators.map(t => t.ema_12),
      type: 'scatter',
      mode: 'lines',
      name: 'EMA (12)',
      line: { color: '#06b6d4', width: 1.5 },
      xaxis: 'x', yaxis: 'y'
    });
  }

  if (indicators.ema26) {
    plotData.push({
      x: dates,
      y: technicalIndicators.map(t => t.ema_26),
      type: 'scatter',
      mode: 'lines',
      name: 'EMA (26)',
      line: { color: '#ec4899', width: 1.5 },
      xaxis: 'x', yaxis: 'y'
    });
  }

  if (indicators.bollinger) {
    plotData.push(
      {
        x: dates,
        y: technicalIndicators.map(t => t.bollinger_upper),
        type: 'scatter', mode: 'lines',
        name: 'Bollinger Upper',
        line: { color: 'rgba(156, 163, 175, 0.4)', dash: 'dot', width: 1 },
        xaxis: 'x', yaxis: 'y'
      },
      {
        x: dates,
        y: technicalIndicators.map(t => t.bollinger_lower),
        type: 'scatter', mode: 'lines',
        name: 'Bollinger Lower',
        line: { color: 'rgba(156, 163, 175, 0.4)', dash: 'dot', width: 1 },
        xaxis: 'x', yaxis: 'y'
      }
    );
  }

  if (indicators.rsi) {
    plotData.push({
      x: dates,
      y: technicalIndicators.map(t => t.rsi_14),
      type: 'scatter', mode: 'lines',
      name: 'RSI (14)',
      line: { color: '#3b82f6', width: 1.5 },
      xaxis: 'x', yaxis: 'y3'
    });
  }

  if (indicators.macd) {
    plotData.push(
      {
        x: dates,
        y: technicalIndicators.map(t => t.macd),
        type: 'scatter', mode: 'lines',
        name: 'MACD',
        line: { color: '#10b981', width: 1.5 },
        xaxis: 'x', yaxis: 'y4'
      },
      {
        x: dates,
        y: technicalIndicators.map(t => t.macd_signal),
        type: 'scatter', mode: 'lines',
        name: 'MACD Signal',
        line: { color: '#ef4444', width: 1.5 },
        xaxis: 'x', yaxis: 'y4'
      }
    );
  }

  // Layout configuration for Plotly
  const layout = {
    dragmode: 'zoom',
    autosize: true,
    height: 520,
    margin: { l: 50, r: 20, t: 30, b: 30 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: true,
    legend: { orientation: 'h', x: 0, y: 1.15, font: { color: '#9ca3af', size: 11 } },
    xaxis: {
      autorange: true,
      rangeslider: { visible: false },
      type: 'date',
      gridcolor: '#1f2937',
      color: '#9ca3af'
    },
    yaxis: {
      domain: indicators.rsi || indicators.macd ? [0.35, 1] : [0.2, 1],
      gridcolor: '#1f2937',
      color: '#9ca3af',
      title: 'Price ($)'
    },
    yaxis2: {
      domain: [0, 0.18],
      gridcolor: '#1f2937',
      color: '#6b7280',
      showticklabels: false
    },
    yaxis3: indicators.rsi ? {
      domain: [0.2, 0.32],
      gridcolor: '#1f2937',
      color: '#9ca3af',
      title: 'RSI'
    } : undefined,
    yaxis4: indicators.macd ? {
      domain: [0.2, 0.32],
      gridcolor: '#1f2937',
      color: '#9ca3af',
      title: 'MACD'
    } : undefined
  };

  return (
    <div>
      {/* Indicator Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          INDICATOR OVERLAYS:
        </span>
        {[
          { key: 'sma20', label: 'SMA (20)' },
          { key: 'sma50', label: 'SMA (50)' },
          { key: 'ema12', label: 'EMA (12)' },
          { key: 'ema26', label: 'EMA (26)' },
          { key: 'bollinger', label: 'Bollinger Bands' },
          { key: 'rsi', label: 'RSI (14)' },
          { key: 'macd', label: 'MACD' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => toggleIndicator(item.key)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #374151',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: indicators[item.key] ? '#3b82f6' : '#1f2937',
              color: indicators[item.key] ? '#ffffff' : '#9ca3af'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Plotly Interactive Canvas */}
      <div className="glass-card" style={{ padding: '12px', overflow: 'hidden' }}>
        <Plot
          data={plotData}
          layout={layout}
          config={{ responsive: true, displayModeBar: true, displaylogo: false }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
