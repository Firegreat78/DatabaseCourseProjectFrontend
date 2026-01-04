// src/components/AccountsList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowRight, RefreshCw, Plus, Lock } from 'lucide-react';
import './AccountsList.css';

const API_BASE_URL = 'http://localhost:8000';

const AccountsList = () => {
  const { user } = useAuth();

    const [totalBalance, setTotalBalance] = useState(null);  // теперь баланс в выбранной валюте
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(1);  // по умолчанию рубль (ID=1)
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState('₽');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Статус верификации
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);

  // Статус блокировки
  const [isBanned, setIsBanned] = useState(false);
  const [banCheckLoading, setBanCheckLoading] = useState(true);

  // --- Модальная форма ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [banks, setBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [newAccount, setNewAccount] = useState({
    bank_id: '',
    bik: '',
    currency_id: ''
  });

  // --- Проверка блокировки ---
  const checkBanStatus = async () => {
    if (!user?.token || !user?.id) {
      setIsBanned(false);
      setBanCheckLoading(false);
      return false;
    }

    setBanCheckLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user_ban_status/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setIsBanned(data.is_banned);
      return data.is_banned;
    } catch (err) {
      console.error('Ошибка проверки блокировки:', err);
      setIsBanned(false);
      return false;
    } finally {
      setBanCheckLoading(false);
    }
  };

  // --- Загрузка статуса верификации ---
  const fetchVerificationStatus = async () => {
    if (!user?.token || !user?.id) return;

    setVerificationLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user_verification_status/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsVerified(data.is_verified);
    } catch (err) {
      console.error('Ошибка загрузки статуса верификации:', err);
      setIsVerified(false);
    } finally {
      setVerificationLoading(false);
    }
  };

  // --- Загрузка основных данных ---
  const loadData = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (!isRefresh) setLoading(true);
    setError('');

    try {
      const [accountsRes, banksRes, currenciesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/brokerage-accounts`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API_BASE_URL}/api/bank`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API_BASE_URL}/api/currency`, { headers: { Authorization: `Bearer ${user.token}` } }),
      ]);

      // Загружаем баланс в выбранной валюте
      const balanceResSelected = await fetch(
        `${API_BASE_URL}/api/user/balance/${selectedCurrencyId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      let balanceInSelected = 0;
      if (balanceResSelected.ok) {
        const balanceData = await balanceResSelected.json();
        balanceInSelected = balanceData.total_balance_rub || 0;  // эндпоинт всё равно возвращает total_balance_rub
      } else {
        console.error('Ошибка загрузки баланса в выбранной валюте');
      }

      setTotalBalance(balanceInSelected);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }

      // Банки
      if (banksRes.ok) {
        const banksData = await banksRes.json();
        setBanks(Array.isArray(banksData) ? banksData : []);
      }

      // Валюты — только активные (не архивированные)
      if (currenciesRes.ok) {
        const currenciesData = await currenciesRes.json();
        const activeCurrencies = Array.isArray(currenciesData)
          ? currenciesData.filter(c => !c.is_archived)
          : [];
        setCurrencies(activeCurrencies);

        // Если рубль есть — выбираем его по умолчанию
        const rubCurrency = activeCurrencies.find(c => c.id === 1);
        if (rubCurrency) {
          setSelectedCurrencySymbol(rubCurrency.symbol);
        }
      }

    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkBanStatus();
    fetchVerificationStatus();
    loadData();
  }, [user?.id, loadData]);

  const handleRefresh = async () => {
    await checkBanStatus();
    loadData(true);
    fetchVerificationStatus();
  };

  // --- Смена валюты отображения баланса ---
  const handleCurrencyChange = async (e) => {
    const newCurrencyId = parseInt(e.target.value);
    const currency = currencies.find(c => c.id === newCurrencyId);
    if (!currency) return;

    setSelectedCurrencyId(newCurrencyId);
    setSelectedCurrencySymbol(currency.symbol);

    // Загружаем баланс в новой валюте
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/user/balance/${newCurrencyId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTotalBalance(data.total_balance_rub || 0);
      } else {
        setError('Не удалось загрузить баланс в выбранной валюте');
        setTotalBalance(null);
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка связи с сервером');
    } finally {
      setLoading(false);
    }
  };

  // --- Открытие формы создания счёта с проверкой блокировки ---
  const handleOpenCreateForm = async () => {
    const banned = await checkBanStatus();
    if (banned) {
      return; // Не открываем форму — рендер покажет блокировку
    }
    setShowCreateForm(true);
  };

  // --- Создание брокерского счёта с финальной проверкой блокировки ---
  const handleCreateAccount = async () => {
    if (!newAccount.bank_id || !newAccount.currency_id) {
      alert('Выберите банк и валюту');
      return;
    }

    // Финальная проверка блокировки перед отправкой
    const banned = await checkBanStatus();
    if (banned) {
      setShowCreateForm(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/brokerage-accounts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          balance: 0,
          bank_id: parseInt(newAccount.bank_id),
          bik: newAccount.bik,
          currency_id: parseInt(newAccount.currency_id)
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ошибка при создании счёта');
      }

      const data = await res.json();
      alert('Счёт создан, ID: ' + data.account_id);
      setShowCreateForm(false);
      setNewAccount({ bank_id: '', bik: '', currency_id: '' });
      loadData(true);
    } catch (err) {
      console.error(err);
      alert('Не удалось создать счёт: ' + err.message);
    }
  };

  // --- Обновление БИК при выборе банка ---
  const handleBankChange = (e) => {
    const bankId = e.target.value;
    const bank = banks.find(b => b.id === parseInt(bankId));
    setNewAccount({
      ...newAccount,
      bank_id: bankId,
      bik: bank ? bank.bik : ''
    });
  };

  // Если пользователь не авторизован
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

  // Если пользователь заблокирован
  if (isBanned) {
    return (
      <div className="accounts-page">
        <AppHeader />
        <main className="accounts-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Lock size={64} color="#ef4444" />
          <h2 style={{ margin: '20px 0', color: '#dc2626' }}>Ваш аккаунт заблокирован</h2>
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            Доступ к брокерским счетам ограничен. Обратитесь в поддержку.
          </p>
        </main>
      </div>
    );
  }

  // Пока идёт проверка блокировки
  if (banCheckLoading) {
    return (
      <div className="accounts-page">
        <AppHeader />
        <main className="accounts-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          Проверка статуса аккаунта...
        </main>
      </div>
    );
  }

  const displayBalance = totalBalance;

  return (
    <div className="accounts-page">
      <AppHeader />
      <main className="accounts-content">
        <div className="page-header">
          <h1>Мои счета</h1>
                      <div className="header-actions">
              <button className="refresh-btn" onClick={handleRefresh} disabled={loading || verificationLoading}>
                <RefreshCw size={22} style={{ animation: (loading || verificationLoading) ? 'spin 1s linear infinite' : 'none' }} />
              </button>

              {/* Выпадающий список валют */}
              <select 
                className="currency-select"
                value={selectedCurrencyId} 
                onChange={handleCurrencyChange}
                disabled={loading}
              >
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.symbol} — {c.name || c.code}
                  </option>
                ))}
              </select>

              {verificationLoading ? (
                <span>Проверка верификации...</span>
              ) : isVerified ? (
                <button className="create-account-btn" onClick={handleOpenCreateForm} disabled={loading}>
                  <Plus size={18} style={{marginRight:'6px'}} /> Создать счёт
                </button>
              ) : (
                <span className="verification-warning">
                  Для создания счёта требуется верификация аккаунта
                </span>
              )}
            </div>
        </div>

        {/* Общий баланс */}
        <div className="total-balance-card">
          <div className="balance-header">
            <Wallet size={28} strokeWidth={2} />
            <h2>Общий баланс</h2>
          </div>
          {loading ? <div className="loading-text">Загрузка данных...</div> :
            error ? <div className="error-text">{error}</div> :
            displayBalance !== null ?
              <div className="balance-amount">
                <span className="amount">{displayBalance.toLocaleString('ru-RU', {minimumFractionDigits:0, maximumFractionDigits:2})}</span>
                                <span className="currency">{selectedCurrencySymbol}</span>
              </div>
              :
              <div className="error-text">Баланс недоступен</div>
          }
        </div>

        {/* Блок с предупреждением или списком счетов */}
        {verificationLoading ? (
          <div className="status-message loading">Проверка статуса верификации...</div>
        ) : !isVerified ? (
          <div className="verification-required-block">
            <p className="verification-title">Доступ к брокерским счетам ограничен</p>
            <p className="verification-subtitle">
              Для просмотра и управления брокерскими счетами необходимо верифицировать аккаунт.
            </p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Нет брокерских счетов</p>
            <p className="empty-subtitle">Создайте первый счёт, чтобы начать торговлю.</p>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map(acc => (
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
                        <span className="label">БИК</span>
                        <span className="value">{acc.bik}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Валюта</span>
                        <span className="value">{acc.currency_symbol}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Модальная форма */}
        {showCreateForm && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Новый брокерский счёт</h3>
              <select value={newAccount.bank_id} onChange={handleBankChange}>
                <option value="">Выберите банк</option>
                {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input type="text" placeholder="БИК" value={newAccount.bik} disabled />
              <select value={newAccount.currency_id} onChange={e=>setNewAccount({...newAccount, currency_id:e.target.value})}>
                <option value="">Выберите валюту</option>
                {currencies.map(c => <option key={c.id} value={c.id}>{c.symbol} - {c.name}</option>)}
              </select>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleCreateAccount}>Создать</button>
                <button className="btn-secondary" onClick={()=>setShowCreateForm(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AccountsList;