// src/components/OffersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppHeader from './AppHeader';
import { RefreshCw, X } from 'lucide-react';
import './OffersPage.css';

const API_BASE_URL = 'http://localhost:8000';

const OffersPage = () => {
  const { user } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Модалка
  const [modalOpen, setModalOpen] = useState(false);
  const [securities, setSecurities] = useState([]);
  const [selectedSecurity, setSelectedSecurity] = useState('');
  const [quantity, setQuantity] = useState('');
  const [accounts, setAccounts] = useState([]); // брокерские счета пользователя
  const [selectedAccount, setSelectedAccount] = useState(''); // выбранный счёт

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setSelectedSecurity('');
    setQuantity('');
    setSelectedAccount('');
  };

  // ====== Загрузка данных ======
  const fetchOffers = async (isRefresh = false) => {
    if (!user?.id || !user?.token) return;
    if (!isRefresh) setLoading(true);
    if (isRefresh) setRefreshing(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/offers`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Ошибка загрузки предложений');
      const data = await res.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Не удалось загрузить предложения');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSecurities = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/security`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Ошибка загрузки акций');
      const data = await res.json();
      setSecurities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки акций', err);
      setSecurities([]);
    }
  };

  const fetchAccounts = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/brokerage-accounts`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Ошибка загрузки брокерских счетов');
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
      // Автоматически выбираем первый счёт, если он есть
      if (data.length > 0) {
        setSelectedAccount(data[0].account_id);
      }
    } catch (err) {
      console.error('Ошибка загрузки брокерских счетов', err);
      setAccounts([]);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchSecurities();
    fetchAccounts();
  }, [user?.id]);

  const handleRefresh = () => fetchOffers(true);

  // ====== Создание нового предложения ======
  const handleSubmit = async (proposalTypeId) => {
    const q = Number(quantity);
    if (!selectedSecurity || !q || !selectedAccount) {
      alert('Выберите акцию, брокерский счёт и укажите количество > 0');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          account_id: Number(selectedAccount),
          proposal_type_id: proposalTypeId,
          security_id: Number(selectedSecurity),
          quantity: q,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ошибка создания предложения');
      }

      const newOffer = await res.json();
      setOffers((prev) => [
        ...prev,
        {
          'Тип предложения': newOffer.proposal_type.type,
          'Название бумаги': newOffer.security.name,  // берём название прямо из ответа сервера
          'Количество': newOffer.amount,
        },
      ]);

      closeModal();
    } catch (err) {
      console.error('Ошибка создания предложения:', err);
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="offers-container">
        <AppHeader />
        <div className="content">
          <p className="auth-message">
            Пожалуйста, войдите в аккаунт для просмотра предложений.
          </p>
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
          <div className="page-header-actions">
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              title="Обновить данные"
            >
              <RefreshCw
                size={20}
                style={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </button>
            <button
              className="add-offer-btn"
              onClick={openModal}
              disabled={loading || refreshing}
              title="Добавить новое предложение"
            >
              Добавить предложение
            </button>
          </div>
        </div>

        {loading && !refreshing ? (
          <div className="status-message loading">
            Загрузка предложений...
          </div>
        ) : error ? (
          <div className="status-message error">{error}</div>
        ) : offers.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Нет активных предложений</p>
            <p className="empty-subtitle">
              Вы пока не выставляли заявки на покупку или продажу.
            </p>
          </div>
        ) : (
          <div className="offers-list">
            {offers.map((offer, index) => (
              <div key={index} className="offer-card">
                <div className="offer-header">
                  <span
                    className={`offer-type ${offer[
                      'Тип предложения'
                    ].toLowerCase()}`}
                  >
                    {offer['Тип предложения']}
                  </span>
                  <span className="offer-ticker">
                    {offer['Название бумаги']}
                  </span>
                </div>
                <div className="offer-details">
                  <div className="detail-row">
                    <span className="label">Количество</span>
                    <span className="value">
                      {Number(offer['Количество']).toLocaleString('ru-RU')} шт.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
              <h2>Добавить предложение</h2>

              <div className="modal-row">
                <label>Выберите акцию:</label>
                <select
                  value={selectedSecurity}
                  onChange={(e) => setSelectedSecurity(e.target.value)}
                >
                  <option value="">Выберите акцию</option>
                  {securities.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-row">
                <label>Брокерский счёт:</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  <option value="">Выберите счёт</option>
                  {accounts.map((acc) => (
                    <option key={acc.account_id} value={acc.account_id}>
                      Счёт №{acc.account_id} ({acc.currency_symbol} •{' '}
                      {acc.balance.toLocaleString('ru-RU')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-row">
                <label>Количество:</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Введите количество"
                />
              </div>

              <div className="modal-actions">
                <button
                  className="buy-btn"
                  onClick={() => handleSubmit(1)} // Купить
                  disabled={!selectedSecurity || !quantity || !selectedAccount}
                >
                  Купить
                </button>
                <button
                  className="sell-btn"
                  onClick={() => handleSubmit(2)} // Продать
                  disabled={!selectedSecurity || !quantity || !selectedAccount}
                >
                  Продать
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;