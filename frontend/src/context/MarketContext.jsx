import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [tickersList, setTickersList] = useState([]);
  const [loadingTickers, setLoadingTickers] = useState(true);

  const fetchTickers = async () => {
    setLoadingTickers(true);
    try {
      const res = await apiClient.get('/stocks');
      setTickersList(res.data);
    } catch (err) {
      console.error('Error fetching stock tickers:', err);
    } finally {
      setLoadingTickers(false);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, []);

  const selectedStockSummary = tickersList.find(t => t.ticker === selectedTicker) || null;

  return (
    <MarketContext.Provider
      value={{
        selectedTicker,
        setSelectedTicker,
        tickersList,
        loadingTickers,
        selectedStockSummary,
        refreshTickers: fetchTickers
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
