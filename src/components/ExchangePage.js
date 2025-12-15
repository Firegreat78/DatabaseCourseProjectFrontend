// src/components/ExchangePage.jsx

import React, { useEffect, useState } from 'react';
import AppHeader from './AppHeader';
import { RefreshCw } from 'lucide-react';
import './ExchangePage.css';

const API_BASE_URL = 'http://localhost:8000';

const ExchangePage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStocks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange/stocks`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setStocks(data);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить данные биржи');
    } finally {
      setLoading(false);
    }
  };

  // первая загрузка
  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <div className="exchange-container">
      <AppHeader />

      <main className="content">
        <div className="exchange-header">
          <h2 className="page-title">Биржа</h2>

          <button
            className="refresh-btn"
            onClick={fetchStocks}
            disabled={loading}
            title="Обновить данные"
          >
            <RefreshCw
              size={20}
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            />
          </button>
        </div>

        {loading && <div className="loading-text">Загрузка данных...</div>}
        {error && <div className="error-text">{error}</div>}

        <div className="stocks-list">
          {stocks.map(stock => (
            <div key={stock.id} className="stock-item">
              <span className="ticker">{stock.ticker}</span>

              <div className="price-change">
                <span className="price">
                  {stock.price} {stock.currency}
                </span>

                <span
                  className={`change ${
                    stock.change >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change}%
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
