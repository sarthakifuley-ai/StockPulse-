import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import apiClient from '../api/client';
import { Newspaper, ThumbsUp, Minus, ThumbsDown, ExternalLink } from 'lucide-react';

export default function NewsSentimentPage() {
  const { selectedTicker, selectedStockSummary } = useMarket();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSentiment, setFilterSentiment] = useState('ALL');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/news/${selectedTicker}`);
        setNewsData(res.data);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [selectedTicker]);

  if (loading) {
    return <div style={{ padding: '40px', color: '#9ca3af' }}>Fetching financial news & analyzing NLP sentiment...</div>;
  }

  const { ticker, total_news, sentiment_distribution, average_confidence, news } = newsData || {
    ticker: selectedTicker, total_news: 0, sentiment_distribution: { positive: 0, neutral: 0, negative: 0 }, average_confidence: 0, news: []
  };

  const filteredNews = news.filter(item => {
    if (filterSentiment === 'ALL') return true;
    return item.sentiment_label.toUpperCase() === filterSentiment;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Newspaper size={24} color="#06b6d4" /> {selectedStockSummary?.display_name || ticker} Financial News & Sentiment
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
          Real-time news headlines evaluated via NLP model trained on Financial PhraseBank
        </p>
      </div>

      {/* Sentiment Summary Metrics */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 20px', flex: 1, borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600 }}>POSITIVE SENTIMENT</span>
            <ThumbsUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
            {sentiment_distribution.positive} Articles
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', flex: 1, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600 }}>NEUTRAL SENTIMENT</span>
            <Minus size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
            {sentiment_distribution.neutral} Articles
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', flex: 1, borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600 }}>NEGATIVE SENTIMENT</span>
            <ThumbsDown size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', marginTop: '4px' }}>
            {sentiment_distribution.negative} Articles
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterSentiment(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                background: filterSentiment === tab ? '#3b82f6' : '#1f2937',
                color: filterSentiment === tab ? '#ffffff' : '#9ca3af'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          Showing {filteredNews.length} of {total_news} articles
        </span>
      </div>

      {/* News Feed List */}
      {filteredNews.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          No financial news articles found for filter standard.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNews.map((item, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, paddingRight: '20px' }}>
                <a
                  href={item.link !== '#' ? item.link : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '15px', fontWeight: 600, color: '#f3f4f6', textDecoration: 'none', lineHeight: 1.4 }}
                >
                  {item.title} {item.link !== '#' && <ExternalLink size={14} style={{ display: 'inline', marginLeft: '4px' }} />}
                </a>

                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                  <span>Source: {item.publisher}</span>
                  {item.published_date && <span>Date: {item.published_date}</span>}
                  <span>Source Type: {item.source_type}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span className={item.sentiment_label === 'positive' ? 'badge-up' : item.sentiment_label === 'negative' ? 'badge-down' : 'badge-neutral'}>
                  {item.sentiment_label.toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {(item.sentiment_confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
