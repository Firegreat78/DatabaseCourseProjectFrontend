// src/components/ExchangePage.jsx

import React from 'react';
import AppHeader from './AppHeader';
import './ExchangePage.css';

const ExchangePage = () => {
  // Mock-данные
  const mockData = {
    stocks: [
      { id: 1, ticker: 'SBER', price: 2, currency: '$', change: 3 }, // +3%
      { id: 2, ticker: 'VTBR', price: 15, currency: '₽', change: -5 }, // -5%
    ]
  };

  return (
    <div className="exchange-container">
      <AppHeader /> {/* ← подключаем общую шапку */}

      <main className="content">
        <h2 className="page-title">Биржа</h2>

        <div className="stocks-list">
          {mockData.stocks.map(stock => (
            <div key={stock.id} className="stock-item">
              <span className="ticker">{stock.ticker}</span>
              <div className="price-change">
                <span className="price">{stock.price}{stock.currency}</span>
                <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExchangePage;