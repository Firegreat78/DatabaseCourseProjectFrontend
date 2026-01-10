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
      const response = await fetch(`${API_BASE_URL}/api/user/user_ban_status/${user.id}`, {
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
        fetch(`${API_BASE_URL}/api/user/brokerage-accounts/${id}`, { headers }),
        fetch(`${API_BASE_URL}/api/user/brokerage-accounts/${id}/operations`, { headers }),
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

  // --- Удаление счёта ---
  const handleDeleteRequest = async () => {
    const banned = await checkBanStatus();
    if (banned) {
      return; // Ничего не делаем — рендер покажет блокировку
    }

    const confirmed = window.confirm(
      'Вы уверены, что хотите полностью удалить этот брокерский счёт?\n\n' +
      'Все данные и история операций будут безвозвратно удалены.\n' +
      'Это действие нельзя отменить.'
    );

    if (!confirmed) {
      return;
    }

    // Финальная проверка блокировки перед отправкой
    const bannedAgain = await checkBanStatus();
    if (bannedAgain) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/brokerage-accounts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Не удалось удалить счёт');
      }

      alert('Брокерский счёт успешно удалён');
      navigate('/accounts'); // Переход обратно в список счетов
    } catch (err) {
      alert('Ошибка при удалении счёта: ' + err.message);
    }
  };

  useEffect(() => {
    checkBanStatus();
    fetchAccountData();
  }, [id, user]);

  // Открытие модального окна с проверкой блокировки
  const handleOpenModal = async (type) => {
    const banned = await checkBanStatus();
    if (banned) {
      return;
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

    const banned = await checkBanStatus();
    if (banned) {
      setShowModal(false);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      };
      const response = await fetch(
        `${API_BASE_URL}/api/user/brokerage-accounts/${id}/balance-change-requests`,
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

      alert('Баланс успешно изменён');
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
            <div className="header-actions">
              <button
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={loading}
                title="Обновить данные"
              >
                <RefreshCw size={20} className={loading ? "spin" : ""} />
              </button>
              <button
                className="delete-btn"
                onClick={handleDeleteRequest}
                title="Удалить счёт"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4H12M4 7H16M14.5 7L14.065 13.672C14.035 14.111 13.64 14.5 13.2 14.5H6.8C6.36 14.5 5.965 14.111 5.935 13.672L5.5 7H14.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
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