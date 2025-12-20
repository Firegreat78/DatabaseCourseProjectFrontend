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
  XCircle
} from 'lucide-react';
import './BrokerAccountPage.css';


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
  const [cancellingId, setCancellingId] = useState(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const [accountRes, txRes] = await Promise.all([
          fetch(`http://localhost:8000/api/brokerage-accounts/${id}`, { headers }),
          fetch(`http://localhost:8000/api/brokerage-accounts/${id}/operations`, { headers }),
        ]);

        if (!accountRes.ok) throw new Error('Счёт не найден');
        if (!txRes.ok) throw new Error('Не удалось загрузить операции');

        const txData = await txRes.json();

        // Фильтруем: показываем только операции, где status_id !== 2 (не отменённые)
        const filteredTx = txData.filter(tx => tx.status_id !== 2);

        setAccount(await accountRes.json());
        setTransactions(filteredTx);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить данные счёта');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [id, user]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setAmount('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      };

      const response = await fetch(
        `http://localhost:8000/api/brokerage-accounts/${id}/balance-change-requests`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: (modalType === 'deposit' ? value : -value).toFixed(2),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при создании запроса');
      }

      setShowModal(false);
      alert('Запрос отправлен и ожидает обработки');
      // Можно перезагрузить операции
      // fetchAccountData(); // если хочешь сразу увидеть новый запрос
    } catch (err) {
      alert('Не удалось отправить запрос: ' + err.message);
    }
  };

  const handleCancelRequest = async (requestId) => {
    setShowConfirmCancel(requestId);
  };

  const confirmCancel = async () => {
    if (!showConfirmCancel) return;
    const requestId = showConfirmCancel;
    setShowConfirmCancel(null);

    try {
      setCancellingId(requestId);
      const response = await fetch(
        `http://localhost:8000/api/brokerage-accounts/${id}/balance-change-requests/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ status_id: 2 }), // 2 = Отменён
        }
      );

      if (!response.ok) {
        throw new Error('Не удалось отменить запрос');
      }

      // Удаляем отменённый запрос из списка
      setTransactions((prev) => prev.filter((tx) => tx.request_id !== requestId));

      alert('Запрос успешно отменён');
    } catch (err) {
      alert('Ошибка при отмене: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

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

  if (error || !account) {
    return (
      <div className="broker-page">
        <AppHeader />
        <main className="content-center">
          <AlertCircle size={64} />
          <h2>Счёт не найден</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={18} /> Назад
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="broker-page">
      <AppHeader />
      <main className="broker-content">
        <div className="account-card">
          {/* Заголовок */}
          <div className="card-header">
            <button onClick={() => navigate(-1)} className="back-button">
              <ArrowLeft size={22} />
            </button>
            <h1>Брокерский счёт</h1>
          </div>

          {/* Основная информация */}
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

          {/* Кнопки действий */}
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

          {/* История операций */}
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
                  <div
                    key={index}
                    className={`transaction-item ${
                      tx['Источник'] === 'Запрос на изменение' ? 'pending-request' : ''
                    }`}
                  >
                    <div className="tx-info">
                      <span className="tx-type">{tx['Тип операции']}</span>
                      <span className="tx-id">
                        {new Date(tx['Время']).toLocaleString('ru-RU')}
                      </span>
                      {tx['Источник'] === 'Запрос на изменение' && (
                        <span className="tx-source"> (Ожидает подтверждения)</span>
                      )}
                    </div>

                    <div className="tx-amount-wrapper">
                      <span
                        className={`tx-amount ${
                          tx['Сумма операции'] > 0 ? 'positive' : 'negative'
                        }`}
                      >
                        {tx['Сумма операции'] > 0 ? '+' : ''}
                        {Math.abs(tx['Сумма операции']).toLocaleString('ru-RU')} {tx['Символ валюты']}
                      </span>

                      {tx['Источник'] === 'Запрос на изменение' && (
                        <button
                          onClick={() => handleCancelRequest(tx.request_id)}
                          className="btn-cancel-request"
                          disabled={cancellingId === tx.request_id}
                        >
                          {cancellingId === tx.request_id ? 'Отмена...' : 'Отменить'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно пополнения/вывода */}
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

      {/* Модальное окно подтверждения отмены */}
      {showConfirmCancel && (
        <div className="modal-overlay" onClick={() => setShowConfirmCancel(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Отменить запрос?</h3>
            <p>Это действие нельзя отменить.</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowConfirmCancel(null)} className="btn-cancel">
                Нет
              </button>
              <button type="button" onClick={confirmCancel} className="btn-confirm danger">
                Да, отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerAccountPage;