// src/components/AccountsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useAuth } from '../context/AuthContext';
import { Wallet, Plus, ArrowRight, RefreshCw } from 'lucide-react';
import './AccountsList.css';

const API_BASE_URL = 'http://localhost:8000';

const AccountsList = () => {
  const { user } = useAuth();

  const [selectedCurrency, setSelectedCurrency] = useState('₽');
  const [totalBalanceRUB, setTotalBalanceRUB] = useState(null);
  const [usdRate, setUsdRate] = useState(null); // реальный курс из БД
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingRate, setLoadingRate] = useState(true);
  const [error, setError] = useState('');

  // Демо-курс на случай ошибки загрузки
  const fallbackRate = 92.5;

  // Демо-карточки счетов
  const accounts = [
    { number: '2281337', amount: 17, currency: '$' },
    { number: '5252', amount: 52, currency: '$' },
    { number: '5051', amount: 1000, currency: '₽' },
  ];
  
  const handleRefreshRate = async () => {
  if (!user) return;
  setLoadingRate(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/currency/usd-rate`, {
      headers: { 'Authorization': `Bearer ${user.token}` },
    });

    if (!response.ok) throw new Error('Ошибка курса');

    const data = await response.json();
    setUsdRate(data.rate_to_rub);
  } catch (err) {
    console.warn('Не удалось обновить курс USD, используется предыдущий');
    // Не меняем usdRate — остаётся старый или fallback
  } finally {
    setLoadingRate(false);
  }
};

  // Загрузка баланса в рублях
  useEffect(() => {
    if (!user) return;

    const fetchBalance = async () => {
      setLoadingBalance(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/balance`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('Сессия истекла или доступ запрещён');
            return;
          }
          throw new Error('Ошибка сервера');
        }

        const data = await response.json();
        setTotalBalanceRUB(data.total_balance_rub);
      } catch (err) {
        setError('Не удалось загрузить баланс');
        console.error(err);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [user]);

  // Загрузка курса USD
  useEffect(() => {
    if (!user) return;

    const fetchUsdRate = async () => {
      setLoadingRate(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/currency/usd-rate`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });

        if (!response.ok) throw new Error('Ошибка курса');

        const data = await response.json();
        setUsdRate(data.rate_to_rub);
      } catch (err) {
        console.warn('Не удалось загрузить курс USD, используется демо-курс:', fallbackRate);
        setUsdRate(fallbackRate); // fallback
      } finally {
        setLoadingRate(false);
      }
    };

    fetchUsdRate();
  }, [user]);

  // Обновление баланса по кнопке (курс не перезагружаем — он редко меняется)
  const handleRefresh = async () => {
  if (!user) return;
  setLoadingBalance(true);
  setLoadingRate(true); // включаем индикатор и для курса
  setError('');

  try {
    // Параллельно загружаем баланс и курс
    const [balanceRes, rateRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/user/balance`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      }),
      fetch(`${API_BASE_URL}/api/currency/usd-rate`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      }),
    ]);

    if (!balanceRes.ok) throw new Error('Ошибка баланса');
    if (!rateRes.ok) console.warn('Ошибка курса, используется старый');

    const balanceData = await balanceRes.json();
    setTotalBalanceRUB(balanceData.total_balance_rub);

    if (rateRes.ok) {
      const rateData = await rateRes.json();
      setUsdRate(rateData.rate_to_rub);
    }
  } catch (err) {
    setError('Ошибка при обновлении данных');
    console.error(err);
  } finally {
    setLoadingBalance(false);
    setLoadingRate(false);
  }
};

  if (!user) {
    return (
      <div className="accounts-page">
        <AppHeader />
        <main className="accounts-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Доступ запрещён</h2>
          <p>Пожалуйста, войдите в аккаунт.</p>
          <Link to="/login" style={{ color: '#667eea', textDecoration: 'underline' }}>
            Перейти на страницу входа
          </Link>
        </main>
      </div>
    );
  }

  // Определяем текущий курс (реальный или fallback)
  const currentRate = usdRate || fallbackRate;

  // Пересчёт в USD
  const totalBalanceUSD = totalBalanceRUB !== null
    ? Math.round(100 * totalBalanceRUB / currentRate) / 100
    : null;

  const displayBalance = selectedCurrency === '₽' ? totalBalanceRUB : totalBalanceUSD;
  const displayCurrency = selectedCurrency;

  const isLoading = loadingBalance || loadingRate;

  return (
    <div className="accounts-page">
      <AppHeader />

      <main className="accounts-content">
        <div className="page-header">
          <h1>Мои счета</h1>
          <div className="header-actions">
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Обновить баланс"
            >
              <RefreshCw
                size={22}
                style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }}
              />
            </button>

            <div className="currency-toggle">
              <button
                className={`currency-btn ${selectedCurrency === '₽' ? 'active' : ''}`}
                onClick={() => setSelectedCurrency('₽')}
                disabled={isLoading}
              >
                ₽
              </button>
              <button
                className={`currency-btn ${selectedCurrency === '$' ? 'active' : ''}`}
                onClick={() => setSelectedCurrency('$')}
                disabled={isLoading}
              >
                $
              </button>
            </div>
          </div>
        </div>

        <div className="total-balance-card">
          <div className="balance-header">
            <Wallet size={28} strokeWidth={2} />
            <h2>Общий баланс</h2>
          </div>

          {isLoading ? (
            <div className="loading-text">Загрузка данных...</div>
          ) : error ? (
            <div className="error-text">{error}</div>
          ) : displayBalance !== null ? (
            <>
              <div className="balance-amount">
                <span className="amount">{displayBalance.toLocaleString('ru-RU')}</span>
                <span className="currency">{displayCurrency}</span>
              </div>
              <p className="balance-hint">
                {selectedCurrency === '₽'
                  ? 'Эквивалент во всех валютах'
                  : `По курсу ≈ ${currentRate.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ₽ за 1 $`}
              </p>
            </>
          ) : (
            <div className="error-text">Баланс недоступен</div>
          )}
        </div>

        <div className="accounts-grid">
          {accounts.map((acc) => (
            <Link key={acc.number} to={`/account/${acc.number}`} className="account-card-link">
              <div className="account-card">
                <div className="card-header">
                  <span className="account-number">Счёт №{acc.number}</span>
                  <ArrowRight size={18} className="arrow-icon" />
                </div>
                <div className="card-balance">
                  <span className="amount">{acc.amount.toLocaleString('ru-RU')}</span>
                  <span className="currency">{acc.currency}</span>
                </div>
              </div>
            </Link>
          ))}

          <div className="account-card add-account">
            <div className="add-icon">
              <Plus size={32} strokeWidth={2.5} />
            </div>
            <span>Добавить счёт</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountsList;