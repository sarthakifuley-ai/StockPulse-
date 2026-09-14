import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import DashboardPage from './pages/DashboardPage';
import StockAnalysisPage from './pages/StockAnalysisPage';
import NewsSentimentPage from './pages/NewsSentimentPage';
import PredictionPage from './pages/PredictionPage';
import PortfolioPage from './pages/PortfolioPage';
import PriceAlertsPage from './pages/PriceAlertsPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MarketProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#090d16' }}>
            <Navbar />
            <div style={{ display: 'flex', flex: 1 }}>
              <Sidebar />
              <main style={{ flex: 1, padding: '24px', overflowY: 'auto', maxWidth: '1400px' }}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/analysis" element={<StockAnalysisPage />} />
                  <Route path="/news" element={<NewsSentimentPage />} />
                  <Route path="/prediction" element={<PredictionPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/alerts" element={<PriceAlertsPage />} />
                  <Route path="/history" element={<PredictionHistoryPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </MarketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
