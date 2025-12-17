// src/components/ExchangePage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppHeader from './AppHeader';
import { RefreshCw, PlusCircle } from 'lucide-react';
import './ExchangePage.css';

const API_BASE_URL = 'http://localhost:8000';

const ExchangePage = () => {
  const { user } = useAuth(); // { token, id }

  const [stocks, setStocks] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Модальное окно
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [offerType, setOfferType] = useState('sell'); // 'sell' или 'buy'
  const [lots, setLots] = useState('');
  const [price, setPrice] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Загрузка списка акций с биржи
  const fetchStocks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange/stocks`);
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();
      setStocks(data);
    } catch (err) {
      setError('Не удалось загрузить данные биржи');
    } finally {
      setLoading(false);
    }
  };

  // Проверка верификации пользователя (через путь /user_verification_status/{user_id})
  const checkVerification = async () => {
  if (!user?.id || !user?.token) {
    console.log('🔴 Нет user.id или token → верификация = false');
    setIsVerified(false);
    setVerificationLoading(false);
    return;
  }
  console.log('🔍 Проверяем верификацию для user.id:', user.id);
  try {
    const response = await fetch(
  `${API_BASE_URL}/api/user_verification_status/${user.id}`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',  // помогает с preflight
    },
    mode: 'cors',
    credentials: 'omit',  // важно: не отправляем credentials, чтобы не было preflight из-за cookies
  }
);
    console.log('📡 Ответ от бэкенда:', response.status, response.statusText);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('❌ Ошибка ответа:', errData);
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Ответ бэкенда:', data);
    const verified = data.is_verified === true;
    setIsVerified(verified);
    console.log('🟢 Установлен isVerified =', verified);
  } catch (err) {
    console.error('💥 Ошибка при проверке верификации:', err);
    setIsVerified(false);
  } finally {
    setVerificationLoading(false);
  }
};

  useEffect(() => {
    fetchStocks();
    checkVerification();
  }, [user]);

  // Открытие модалки — загрузка доступных позиций по бумаге
  const openOfferModal = async (stock) => {
    setSelectedStock(stock);
    setModalLoading(true);
    setModalError('');
    setAvailablePositions([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/exchange/available-positions?user_id=${user.id}&security_id=${stock.id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Не удалось загрузить позиции');
      }

      const data = await response.json();
      setAvailablePositions(data);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }

    setOfferType('sell');
    setLots('');
    setPrice('');
    setModalOpen(true);
  };

  // Создание предложения
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setModalError('');

    const maxLots = availablePositions.reduce((sum, pos) => sum + pos.lots_available, 0);
    const lotsNum = parseInt(lots);

    if (isNaN(lotsNum) || lotsNum <= 0 || lotsNum > maxLots) {
      setModalError(`Некорректное количество лотов (доступно: ${maxLots})`);
      setSubmitLoading(false);
      return;
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setModalError('Введите корректную цену');
      setSubmitLoading(false);
      return;
    }

    const payload = {
      security_id: selectedStock.id,
      type: offerType,
      lots: lotsNum,
      price: parseFloat(price),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Ошибка создания предложения');
      alert('Предложение успешно создано!');
      setModalOpen(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

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

        {/* Отладочная информация о верификации */}
        <div style={{
          padding: '12px',
          margin: '12px 0',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          border: '1px solid #ddd'
        }}>
          <strong>Отладка верификации:</strong><br />
          User ID: {user?.id || 'не авторизован'}<br />
          Токен: {user?.token ? 'присутствует' : 'отсутствует'}<br />
          Загрузка верификации: {verificationLoading ? 'да' : 'нет'}<br />
          <strong>isVerified: {isVerified.toString().toUpperCase()}</strong><br />
          Кнопки "Новое предложение": {isVerified ? 'ДОЛЖНЫ БЫТЬ ВИДНЫ' : 'СКРЫТЫ'}
        </div>

        {loading && <div className="loading-text">Загрузка данных...</div>}
        {error && <div className="error-text">{error}</div>}

        <div className="stocks-list">
          {stocks.map((stock) => (
            <div key={stock.id} className="stock-item">
              <div className="stock-info">
                <span className="ticker">{stock.ticker}</span>
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

              {isVerified && (
                <button
                  className="btn-new-offer"
                  onClick={() => openOfferModal(stock)}
                >
                  <PlusCircle size={18} />
                  Новое предложение
                </button>
              )}

              {/* Подсказка, если кнопка скрыта */}
              {!isVerified && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                  Кнопка скрыта (пользователь не верифицирован)
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Модальное окно создания предложения */}
      {modalOpen && selectedStock && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Новое предложение: {selectedStock.ticker}</h3>

            {modalLoading && <div className="loading-text">Загрузка позиций...</div>}
            {modalError && <div className="error-text">{modalError}</div>}

            {!modalLoading && availablePositions.length === 0 && !modalError && (
              <p className="empty-state">
                {offerType === 'sell'
                  ? 'У вас нет доступных лотов этой бумаги для продажи.'
                  : 'Выберите покупку — цена будет указана вручную.'}
              </p>
            )}

            {availablePositions.length > 0 && offerType === 'sell' && (
              <div className="positions-info">
                <p>Доступно для продажи:</p>
                {availablePositions.map((pos, i) => (
                  <div key={i}>
                    {pos.lots_available} лотов ({pos.lot_size} шт. в лоте)
                  </div>
                ))}
                <p>Всего: {availablePositions.reduce((s, p) => s + p.lots_available, 0)} лотов</p>
              </div>
            )}

            <form onSubmit={handleCreateOffer}>
              <div className="form-group">
                <label>Тип</label>
                <select value={offerType} onChange={(e) => setOfferType(e.target.value)}>
                  <option value="sell">Продажа</option>
                  <option value="buy">Покупка</option>
                </select>
              </div>

              <div className="form-group">
                <label>Количество лотов</label>
                <input
                  type="number"
                  min="1"
                  value={lots}
                  onChange={(e) => setLots(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Цена за лот ({selectedStock.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" disabled={submitLoading}>
                  {submitLoading ? 'Создание...' : 'Создать предложение'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangePage;