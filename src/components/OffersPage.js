// src/components/OffersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppHeader from './AppHeader';
import { RefreshCw } from 'lucide-react';
import './OffersPage.css';

const API_BASE_URL = 'http://localhost:8000';

const OffersPage = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchOffers = async (isRefresh = false) => {
    if (!user?.id || !user?.token) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    if (!isRefresh) setLoading(true);
    if (isRefresh) setRefreshing(true);
    setError('');

    try {
      // Запрос без ?user_id — пользователь берётся из токена на бэкенде
      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ошибка загрузки предложений');
      }

      const data = await response.json();
      setOffers(data);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить предложения');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user?.id]);

  const handleRefresh = () => fetchOffers(true);

  if (!user) {
    return (
      <div className="offers-container">
        <AppHeader />
        <div className="content">
          <p className="auth-message">Пожалуйста, войдите в аккаунт для просмотра предложений.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offers-container">
      <AppHeader />

      <div className="content">
        <div className="page-header">
  <h1>Мои предложения</h1>
  <div className="header-actions">
    <button
      onClick={() => setShowCreateModal(true)}
      className="btn-new-offer"
    >
      + Новое предложение
    </button>
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
</div>

        {loading && !refreshing ? (
          <div className="status-message loading">Загрузка предложений...</div>
        ) : error ? (
          <div className="status-message error">{error}</div>
        ) : offers.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Нет активных предложений</p>
            <p className="empty-subtitle">Вы пока не выставляли заявки на покупку или продажу.</p>
          </div>
        ) : (
          <div className="offers-list">
            {offers.map((offer, index) => (
              <div key={index} className="offer-card">
                <div className="offer-header">
                  <span className={`offer-type ${offer["Тип предложения"].toLowerCase()}`}>
                    {offer["Тип предложения"]}
                  </span>
                  <span className="offer-ticker">{offer["Название бумаги"]}</span>
                </div>

                <div className="offer-details">
                  <div className="detail-row">
                    <span className="label">Количество</span>
                    <span className="value">{Number(offer["Количество"]).toLocaleString('ru-RU')} шт.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно создания нового предложения */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal create-offer-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Новое предложение</h2>
              <p className="modal-subtitle">
                Здесь будет форма для создания заявки на покупку или продажу.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-cancel"
                >
                  Закрыть
                </button>
                {/* В будущем здесь будет кнопка "Создать" после реализации формы */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default OffersPage;