// src/components/BrokerAccountPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import './BrokerAccountPage.css';

const BrokerAccountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'deposit' | 'withdraw'
  const [amount, setAmount] = useState('');

  // Mock-данные счетов
  const mockAccounts = [
    {
      number: '2281337',
      balance: 117,
      currency: '$',
      transactions: [
        { id: 7892, type: 'Снятие', amount: -17, currency: '$' },
        { id: 7888, type: 'Продажа акций', amount: +34, currency: '$' },
        { id: 7878, type: 'Пополнение', amount: +100, currency: '$' },
      ]
    },
    {
      number: '5252',
      balance: 52,
      currency: '$',
      transactions: [
        { id: 7893, type: 'Снятие', amount: -5, currency: '$' },
        { id: 7889, type: 'Пополнение', amount: +57, currency: '$' },
      ]
    },
    {
      number: '5051',
      balance: 1000,
      currency: '₽',
      transactions: [
        { id: 7894, type: 'Снятие', amount: -200, currency: '₽' },
        { id: 7890, type: 'Пополнение', amount: +1200, currency: '₽' },
      ]
    }
  ];

  const account = mockAccounts.find(acc => acc.number === id);

  // Если счёт не найден
  if (!account) {
    return (
      <div className="broker-page">
        <AppHeader />
        <main className="content-center">
          <div className="not-found">
            <AlertCircle size={64} strokeWidth={1.5} />
            <h2>Счёт не найден</h2>
            <p>Брокерский счёт с номером {id} не существует.</p>
            <button onClick={() => navigate(-1)} className="btn-back">
              <ArrowLeft size={18} /> Назад
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleOpenModal = (type) => {
    setModalType(type);
    setAmount('');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(amount);

    if (!value || value <= 0) {
      alert('Введите корректную сумму');
      return;
    }
    if (modalType === 'withdraw' && value > account.balance) {
      alert('Недостаточно средств на счёте');
      return;
    }

    const newTx = {
      id: Date.now(),
      type: modalType === 'deposit' ? 'Пополнение' : 'Снятие',
      amount: modalType === 'deposit' ? value : -value,
      currency: account.currency
    };

    // В реальном проекте — мутируем мок-данные или отправляем на бэкенд
    account.transactions.unshift(newTx);
    account.balance += newTx.amount;

    setShowModal(false);
  };

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
              <span>Счёт №{account.number}</span>
            </div>
            <div className="balance-amount">
              <span className="currency">{account.currency}</span>
              <span className="amount">{account.balance.toLocaleString('ru-RU')}</span>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="action-buttons">
            <button
              onClick={() => handleOpenModal('deposit')}
              className="btn-deposit"
            >
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
            {account.transactions.length === 0 ? (
              <p className="empty-state">Операций пока нет</p>
            ) : (
              <div className="transactions-list">
                {account.transactions.map(tx => (
                  <div key={tx.id} className="transaction-item">
                    <div className="tx-info">
                      <span className="tx-type">{tx.type}</span>
                      <span className="tx-id">#{tx.id}</span>
                    </div>
                    <span className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                      {tx.amount > 0 ? '+' : ''}{Math.abs(tx.amount).toLocaleString('ru-RU')} {tx.currency}
                    </span>
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
          <div className="modal" onClick={e => e.stopPropagation()}>
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
                  onChange={e => setAmount(e.target.value)}
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