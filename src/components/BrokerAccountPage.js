// src/components/BrokerAccountPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppHeader from './AppHeader';
import {
  ArrowLeft,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  Lock,
  RefreshCw,
} from 'lucide-react';
import './BrokerAccountPage.css';

const API_BASE_URL = 'http://localhost:8000';

const BrokerAccountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'deposit' | 'withdraw'
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Статус блокировки
  const [isBanned, setIsBanned] = useState(false);
  const [banCheckLoading, setBanCheckLoading] = useState(true);

  // Проверка статуса блокировки (с возвратом результата)
  const checkBanStatus = async () => {
    if (!user?.id || !user?.token) {
      setIsBanned(false);
      setBanCheckLoading(false);
      return false;
    }

    setBanCheckLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user_ban_status/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.ok) throw new Error('Не удалось проверить статус аккаунта');

      const data = await response.json();
      setIsBanned(data.is_banned);
      return data.is_banned;
    } catch (err) {
      console.error('Ошибка проверки блокировки:', err);
      setError('Не удалось проверить статус аккаунта');
      setIsBanned(false);
      return false;
    } finally {
      setBanCheckLoading(false);
    }
  };

  // Загрузка данных счёта и операций
  const fetchAccountData = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${user.token}`,
      };
      const [accountRes, txRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/brokerage-accounts/${id}`, { headers }),
        fetch(`${API_BASE_URL}/api/brokerage-accounts/${id}/operations`, { headers }),
      ]);

      if (!accountRes.ok) throw new Error('Счёт не найден');
      if (!txRes.ok) throw new Error('Не удалось загрузить операции');

      const accountData = await accountRes.json();
      const txData = await txRes.json();

      setAccount(accountData);
      setTransactions(txData);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить данные счёта');
    } finally {
      setLoading(false);
    }
  };

  // Обновление данных
  const handleRefresh = async () => {
    await checkBanStatus();
    fetchAccountData();
  };

  useEffect(() => {
    checkBanStatus();
    fetchAccountData();
  }, [id, user]);

  // Открытие модального окна с проверкой блокировки
  const handleOpenModal = async (type) => {
    const banned = await checkBanStatus();
    if (banned) {
      return; // Не открываем модалку — рендер покажет блокировку
    }
    setModalType(type);
    setAmount('');
    setShowModal(true);
  };

  // Подтверждение операции — финальная проверка блокировки
  const handleSubmit = async (e) => {
    e.preventDefault();

    const value = parseFloat(amount);
    if (!value || value <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    // Финальная проверка: вдруг заблокировали прямо сейчас
    const banned = await checkBanStatus();
    if (banned) {
      setShowModal(false); // Закрываем модалку
      return; // Ничего не отправляем — рендер покажет блокировку
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      };
      const response = await fetch(
        `${API_BASE_URL}/api/brokerage-accounts/${id}/balance-change-requests`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: (modalType === 'deposit' ? value : -value).toFixed(2),
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ошибка при изменении баланса');
      }

      alert('Запрос на изменение баланса отправлен');
      setShowModal(false);
      fetchAccountData();
    } catch (err) {
      alert('Не удалось изменить баланс: ' + err.message);
    }
  };

  // Если пользователь заблокирован
  if (isBanned) {
    return (
      <div className="broker-page">
        <AppHeader />
        <main className="content-center">
          <Lock size={64} color="#ef4444" />
          <h2 style={{ margin: '20px 0', color: '#dc2626' }}>Ваш аккаунт заблокирован</h2>
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            Доступ к брокерскому счёту ограничен. Обратитесь в поддержку.
          </p>
        </main>
      </div>
    );
  }

  // Пока идёт проверка блокировки
  if (banCheckLoading) {
    return (
      <div className="broker-page">
        <AppHeader />
        <main className="content-center">
          <Loader2 size={48} className="spin" />
          <p>Проверка статуса аккаунта...</p>
        </main>
      </div>
    );
  }

  // Загрузка данных счёта
  if (loading) {
    return (
      <div className="broker-page">
        <AppHeader />
        <main className="content-center">
          <Loader2 size={48} className="spin" />
        </main>
      </div>
    );
  }

  // Ошибка или счёт не найден
  if (error || !account) {
    return (
      <div className="broker-page">
        <AppHeader />
        <main className="content-center">
          <AlertCircle size={64} color="#dc2626" />
          <h2>Счёт не найден</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={18} /> Назад
          </button>
        </main>
      </div>
    );
  }

  // Основной контент
  return (
    <div className="broker-page">
      <AppHeader />
      <main className="broker-content">
        <div className="account-card">
          <div className="card-header">
            <button onClick={() => navigate(-1)} className="back-button">
              <ArrowLeft size={22} />
            </button>
            <h1>Брокерский счёт</h1>
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="Обновить данные"
            >
              <RefreshCw size={20} className={loading ? "spin" : ""} />
            </button>
          </div>

          <div className="balance-section">
            <div className="account-number">
              <Wallet size={20} />
              <span>Счёт №{account.id}</span>
            </div>
            <div className="balance-amount">
              <span className="currency">{account.currency}</span>
              <span className="amount">{account.balance.toLocaleString('ru-RU')}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={() => handleOpenModal('deposit')} className="btn-deposit">
              <Plus size={20} />
              Пополнить
            </button>
            <button
              onClick={() => handleOpenModal('withdraw')}
              className="btn-withdraw"
              disabled={account.balance === 0}
            >
              <Minus size={20} />
              Вывести
            </button>
          </div>

          <div className="transactions-section">
            <h3>
              <History size={20} />
              История операций
            </h3>
            {transactions.length === 0 ? (
              <p className="empty-state">Операций пока нет</p>
            ) : (
              <div className="transactions-list">
                {transactions.map((tx, index) => (
                  <div key={index} className="transaction-item">
                    <div className="tx-info">
                      <span className="tx-type">{tx['Тип операции']}</span>
                      <span className="tx-id">
                        {new Date(tx['Время']).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <div className="tx-amount-wrapper">
                      <span
                        className={`tx-amount ${
                          tx['Сумма операции'] > 0 ? 'positive' : 'negative'
                        }`}
                      >
                        {tx['Сумма операции'] > 0 ? '+' : ''}
                        {Math.abs(tx['Сумма операции']).toLocaleString('ru-RU')}{' '}
                        {tx['Символ валюты']}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalType === 'deposit' ? (
                <>
                  <ArrowUpCircle size={24} className="icon-deposit" />
                  Пополнить счёт
                </>
              ) : (
                <>
                  <ArrowDownCircle size={24} className="icon-withdraw" />
                  Вывести средства
                </>
              )}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  autoFocus
                />
                <label>Сумма ({account.currency})</label>
              </div>
              {modalType === 'withdraw' && (
                <p className="available">
                  Доступно: {account.balance.toLocaleString('ru-RU')} {account.currency}
                </p>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Отмена
                </button>
                <button type="submit" className={`btn-confirm ${modalType}`}>
                  {modalType === 'deposit' ? 'Пополнить' : 'Вывести'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerAccountPage;