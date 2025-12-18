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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ===== Modal =====
  const [modalOpen, setModalOpen] = useState(false);
  const [securities, setSecurities] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [selectedSecurity, setSelectedSecurity] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [quantity, setQuantity] = useState('');

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setSelectedSecurity('');
    setSelectedAccount('');
    setQuantity('');
  };

  // ===== Fetch offers =====
  const fetchOffers = async (isRefresh = false) => {
    if (!user?.token) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/offers`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) {
        throw new Error('Ошибка загрузки предложений');
      }

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

  // ===== Fetch securities =====
  const fetchSecurities = async () => {
    if (!user?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/security`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setSecurities(Array.isArray(data) ? data : []);
    } catch {
      setSecurities([]);
    }
  };

  // ===== Fetch accounts =====
  const fetchAccounts = async () => {
    if (!user?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/brokerage-accounts`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);

      if (data?.length > 0) {
        setSelectedAccount(String(data[0].account_id));
      }
    } catch {
      setAccounts([]);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchSecurities();
    fetchAccounts();
  }, [user?.id]);

  const handleRefresh = () => fetchOffers(true);

  // ===== Create offer =====
  const handleSubmit = async (proposalTypeId) => {
    const qty = Number(quantity);

    if (!selectedSecurity || !selectedAccount || qty <= 0) {
      alert('Заполните все поля корректно');
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
          security_id: Number(selectedSecurity),
          quantity: qty,
          proposal_type_id: proposalTypeId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Ошибка создания предложения');
      }

      // 🔑 НЕ добавляем вручную — перечитываем список
      await fetchOffers();
      closeModal();
    } catch (err) {
      console.error(err);
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
              title="Обновить"
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
            >
              Добавить предложение
            </button>
          </div>
        </div>

        {loading && !refreshing ? (
          <div className="status-message loading">Загрузка...</div>
        ) : error ? (
          <div className="status-message error">{error}</div>
        ) : offers.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Нет активных предложений</p>
            <p className="empty-subtitle">
              Вы пока не выставляли заявки.
            </p>
          </div>
        ) : (
          <div className="offers-list">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <span className={`offer-type ${offer.type.toLowerCase()}`}>
                    {offer.type}
                  </span>
                  <span className="offer-ticker">
                    {offer.security_name}
                  </span>
                </div>

                <div className="offer-details">
                  <div className="detail-row">
                    <span className="label">Количество</span>
                    <span className="value">
                      {Number(offer.quantity).toLocaleString('ru-RU')} шт.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== Modal ===== */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>

              <h2>Добавить предложение</h2>

              <div className="modal-row">
                <label>Акция</label>
                <select
                  value={selectedSecurity}
                  onChange={(e) => setSelectedSecurity(e.target.value)}
                >
                  <option value="">Выберите акцию</option>
                  {securities.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-row">
                <label>Брокерский счёт</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  <option value="">Выберите счёт</option>
                  {accounts.map((a) => (
                    <option key={a.account_id} value={a.account_id}>
                      Счёт №{a.account_id} ({a.currency_symbol} •{' '}
                      {a.balance.toLocaleString('ru-RU')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-row">
                <label>Количество</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="buy-btn"
                  onClick={() => handleSubmit(1)}
                  disabled={!selectedSecurity || !selectedAccount || !quantity}
                >
                  Купить
                </button>
                <button
                  className="sell-btn"
                  onClick={() => handleSubmit(2)}
                  disabled={!selectedSecurity || !selectedAccount || !quantity}
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
