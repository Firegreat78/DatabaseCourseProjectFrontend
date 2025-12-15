// src/components/AccountsList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowRight, RefreshCw } from 'lucide-react'; // Убрали Plus
import './AccountsList.css';

const API_BASE_URL = 'http://localhost:8000';
const FALLBACK_RATE = 92.5;

const AccountsList = () => {
  const { user } = useAuth();

  const [selectedCurrency, setSelectedCurrency] = useState('₽');
  const [totalBalanceRUB, setTotalBalanceRUB] = useState(null);
  const [usdRate, setUsdRate] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async (isRefresh = false) => {
    if (!user) return;

    if (!isRefresh) setLoading(true);
    setError('');

    try {
      const [balanceRes, rateRes, accountsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/balance`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`${API_BASE_URL}/api/currency/usd-rate`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`${API_BASE_URL}/api/brokerage-accounts`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
      ]);

      if (!balanceRes.ok) throw new Error('Не удалось загрузить баланс');
      const balanceData = await balanceRes.json();
      setTotalBalanceRUB(balanceData.total_balance_rub);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);
      }

      if (rateRes.ok) {
        const rateData = await rateRes.json();
        setUsdRate(rateData.rate_to_rub);
        setIsUsingFallback(false);
      } else if (usdRate === null) {
        console.warn('Курс USD недоступен, используется демо-курс:', FALLBACK_RATE);
        setUsdRate(FALLBACK_RATE);
        setIsUsingFallback(true);
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить данные');
      if (usdRate === null) {
        setUsdRate(FALLBACK_RATE);
        setIsUsingFallback(true);
      }
    } finally {
      setLoading(false);
    }
  }, [user, usdRate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => loadData(true);

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

  const currentRate = usdRate || FALLBACK_RATE;
  const totalBalanceUSD = totalBalanceRUB !== null
    ? Math.round(100 * totalBalanceRUB / currentRate) / 100
    : null;

  const displayBalance = selectedCurrency === '₽' ? totalBalanceRUB : totalBalanceUSD;
  const displayCurrency = selectedCurrency;

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
              disabled={loading}
              title="Обновить данные"
            >
              <RefreshCw
                size={22}
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
              />
            </button>
            <div className="currency-toggle">
              <button
                className={`currency-btn ${selectedCurrency === '₽' ? 'active' : ''}`}
                onClick={() => setSelectedCurrency('₽')}
                disabled={loading}
              >
                ₽
              </button>
              <button
                className={`currency-btn ${selectedCurrency === '$' ? 'active' : ''}`}
                onClick={() => setSelectedCurrency('$')}
                disabled={loading}
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
          {loading ? (
            <div className="loading-text">Загрузка данных...</div>
          ) : error ? (
            <div className="error-text">{error}</div>
          ) : displayBalance !== null ? (
            <>
              <div className="balance-amount">
                <span className="amount">
                  {displayBalance.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
                <span className="currency">{displayCurrency}</span>
              </div>
              <p className="balance-hint">
                {selectedCurrency === '₽' ? (
                  'Эквивалент во всех валютах'
                ) : (
                  <>
                    По курсу ≈ {currentRate.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ₽ за 1 $
                    {isUsingFallback && <span style={{ color: '#ff6b6b', fontSize: '0.85em', marginLeft: '8px' }}>(демо-курс)</span>}
                  </>
                )}
              </p>
            </>
          ) : (
            <div className="error-text">Баланс недоступен</div>
          )}
        </div>

        <div className="accounts-grid">
          {accounts.map((acc) => (
            <Link key={acc.account_id} to={`/account/${acc.account_id}`} className="account-card-link">
              <div className="account-card">
                <div className="card-header">
                  <span className="account-number">Счёт №{acc.account_id}</span>
                  <ArrowRight size={18} className="arrow-icon" />
                </div>
                <div className="card-details">
                  <div className="card-balance">
                    <span className="amount">{acc.balance.toLocaleString('ru-RU')}</span>
                    <span className="currency">{acc.currency_symbol}</span>
                  </div>
                  <div className="card-bank-info">
                    <div className="info-row">
                      <span className="label">Банк</span>
                      <span className="value bank-name">{acc.bank_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">ИНН</span>
                      <span className="value">{acc.inn}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">БИК</span>
                      <span className="value">{acc.bik}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AccountsList;