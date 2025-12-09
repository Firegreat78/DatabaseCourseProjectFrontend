// src/components/PortfolioPage.jsx

import React from 'react';
import './PortfolioPage.css';
import AppHeader from './AppHeader';

const PortfolioPage = () => {
  // Mock-данные
  const mockData = {
    accountInfo: 'счёт №7878 договор №5252 открыт 01.12.25',
    balance: 5252,
    growth: 2, // %
    assets: [
      { id: 1, ticker: 'SBER', quantity: 25, price: 2, currency: '$' },
      { id: 2, ticker: 'VTBR', quantity: 10, price: 15, currency: '₽' },
    ]
  };

  return (
    <div className="portfolio-container">
      {/* 🟢 Верхняя панель — теперь можно переиспользовать */}
      <header className="app-header">
        <AppHeader /> {/* ← новая шапка */}
      </header>

      {/* 📊 Основное содержимое */}
      <main className="content">
        <div className="account-info">{mockData.accountInfo}</div>

        <div className="balance-section">
          <h2>Портфель</h2>
          <div className="balance-value">
            {mockData.balance} руб.
            <button className="refresh-btn">🔄</button>
          </div>
          <div className={`growth ${mockData.growth >= 0 ? 'positive' : 'negative'}`}>
            {mockData.growth >= 0 ? '+' : ''}{mockData.growth}% за все время
          </div>
        </div>

        <div className="assets-list">
          {mockData.assets.map(asset => (
            <div key={asset.id} className="asset-item">
              <span className="ticker">{asset.ticker}</span>
              <span className="quantity">{asset.quantity} шт.</span>
              <span className="price">{asset.price}{asset.currency}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PortfolioPage;