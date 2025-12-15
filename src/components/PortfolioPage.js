// src/components/PortfolioPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppHeader from './AppHeader';
import { RefreshCw } from 'lucide-react';
import './PortfolioPage.css';

const API_BASE_URL = 'http://localhost:8000';

const PortfolioPage = () => {
  const { user } = useAuth();
  const [securities, setSecurities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolio = async (isRefresh = false) => {
    if (!user?.id || !user?.token) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    if (!isRefresh) setLoading(true);
    if (isRefresh) setRefreshing(true);
    setError('');

    try {
      // Убрали ?user_id — теперь бэкенд берёт из токена
      const response = await fetch(`${API_BASE_URL}/api/portfolio/securities`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ошибка загрузки портфеля');
      }

      const data = await response.json();
      setSecurities(data);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user?.id]); // Исправлено: user.id вместо user.user_id

  const handleRefresh = () => fetchPortfolio(true);

  // Вспомогательная функция для склонения
  const declOfNum = (number, titles) => {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[
      number % 100 > 4 && number % 100 < 20
        ? 2
        : cases[number % 10 < 5 ? number % 10 : 5]
    ];
  };

  if (!user) {
    return (
      <div className="portfolio-container">
        <AppHeader />
        <div className="content">
          <p className="auth-message">Пожалуйста, войдите в аккаунт для просмотра портфеля.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <AppHeader />

      <div className="content">
        <div className="page-header">
          <h1>Мой портфель</h1>
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            title="Обновить данные"
          >
            <RefreshCw
              size={20}
              style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
            />
          </button>
        </div>

        {loading && !refreshing ? (
          <div className="status-message loading">Загрузка портфеля...</div>
        ) : error ? (
          <div className="status-message error">{error}</div>
        ) : securities.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Портфель пуст</p>
            <p className="empty-subtitle">У вас пока нет ценных бумаг на депозитарном счёте.</p>
          </div>
        ) : (
          <div className="securities-list">
            {securities.map((asset, index) => {
              const totalShares = Number(asset.amount); // общее количество акций
              const lotSize = Number(asset.lot_size);
              const lots = lotSize > 0 ? totalShares / lotSize : 0;
              const fullLots = Math.floor(lots);
              const remainderShares = totalShares % lotSize;

              const shareWord = declOfNum(totalShares, ['акция', 'акции', 'акций']);
              const lotWord = declOfNum(fullLots, ['лот', 'лота', 'лотов']);

              return (
                <div key={index} className="security-card">
                  <div className="security-header">
                    <div className="security-name">{asset.security_name}</div>
                    {asset.has_dividends && <span className="dividends-badge">Дивиденды</span>}
                  </div>

                  <div className="security-details">
                    <div className="detail-row">
                      <span className="label">Количество</span>
                      <span className="value">
                        {totalShares.toLocaleString('ru-RU')} {shareWord}
                        {lotSize > 1 && (
                          <>
                            {' '}({fullLots} {lotWord}
                            {remainderShares > 0 && ` + ${remainderShares} ${declOfNum(remainderShares, ['акция', 'акции', 'акций'])}`})
                          </>
                        )}
                      </span>
                    </div>

                    {lotSize > 1 && (
                      <div className="detail-row">
                        <span className="label">Размер лота</span>
                        <span className="value">{lotSize.toLocaleString('ru-RU')} шт.</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span className="label">ISIN</span>
                      <span className="value isin">{asset.isin || '—'}</span>
                    </div>

                    <div className="detail-row">
                      <span className="label">Валюта</span>
                      <span className="value">{asset.currency_symbol}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;