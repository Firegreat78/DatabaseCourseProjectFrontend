// src/components/ExchangePage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppHeader from './AppHeader';
import { RefreshCw, Lock } from 'lucide-react';
import './ExchangePage.css';

const API_BASE_URL = 'http://localhost:8000';

const ExchangePage = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [banCheckLoading, setBanCheckLoading] = useState(true);
  const checkBanStatus = async () => {
    if (!user?.token || !user?.id) {
      setBanCheckLoading(false);
      return;
    }
    setBanCheckLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/user_ban_status/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.ok) throw new Error('Не удалось проверить статус аккаунта');

      const data = await response.json();
      setIsBanned(data.is_banned);
    } catch (err) {
      console.error('Ошибка проверки блокировки:', err);
      setIsBanned(false);
    } finally {
      setBanCheckLoading(false);
    }
  };
  const fetchStocks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/exchange/stocks`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ошибка загрузки данных');
      }
      const data = await response.json();
      setStocks(data);
    } catch (err) {
      setError('Не удалось загрузить данные биржи');
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = async () => {
    await checkBanStatus();
    fetchStocks();
  };

  useEffect(() => {
    checkBanStatus();
    fetchStocks();
  }, [user]);
  if (!user) {
    return (
      <div className="exchange-container">
        <AppHeader />
        <main className="content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p className="auth-message">Пожалуйста, войдите в аккаунт для просмотра биржи.</p>
        </main>
      </div>
    );
  }
  if (isBanned) {
    return (
      <div className="exchange-container">
        <AppHeader />
        <main className="content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Lock size={64} color="#ef4444" />
          <h2 style={{ margin: '20px 0', color: '#dc2626' }}>Ваш аккаунт заблокирован</h2>
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            Доступ к бирже ограничен. Обратитесь в поддержку.
          </p>
        </main>
      </div>
    );
  }
  if (banCheckLoading) {
    return (
      <div className="exchange-container">
        <AppHeader />
        <main className="content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          Проверка статуса аккаунта...
        </main>
      </div>
    );
  }

  return (
    <div className="exchange-container">
      <AppHeader />
      <main className="content">
        <div className="exchange-header">
          <h2 className="page-title">Биржа</h2>
          <button
            className="refresh-btn"
            onClick={handleRefresh}
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
          {stocks.length === 0 && !loading ? (
            <div className="no-results">На бирже пока нет акций</div>
          ) : (
            stocks.map((stock) => (
              <div key={stock.id} className="stock-item">
                <div className="stock-info">
                  <span className="ticker">{stock.ticker} ({stock.isin})</span>
                  <div className="lot-size">Размер лота: {stock.lot_size}</div>
                  <div className="price-change">
                    <span className="price">
                      {stock.price} {stock.currency}
                    </span>
                    <span
                      className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ExchangePage;