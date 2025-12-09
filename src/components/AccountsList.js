// src/components/AccountsList.jsx

import React from 'react';
import AppHeader from './AppHeader';
import './AccountsList.css';

const AccountsList = () => {
  const mockData = {
    balance: 77777,
    growth: 5,
    accounts: [
      { id: 1, number: '№2281337', amount: 17, currency: '$' },
      { id: 2, number: '№5252', amount: 52, currency: '$' },
      { id: 3, number: '№5051', amount: 1000, currency: '₽' },
    ]
  };

  return (
    <div className="accounts-container">
      <AppHeader /> {/* ← подключаем шапку */}

      <main className="content">
        <div className="balance-section">
          <h2>Баланс</h2>
          <div className="balance-value">
            {mockData.balance} руб.
            <button className="refresh-btn">🔄</button>
          </div>
          <div className={`growth ${mockData.growth >= 0 ? 'positive' : 'negative'}`}>
            {mockData.growth >= 0 ? '+' : ''}{mockData.growth}% за все время
          </div>
        </div>

        <div className="accounts-list">
          {mockData.accounts.map(account => (
            <div key={account.id} className="account-item">
              <span>счёт {account.number}</span>
              <span className="amount">{account.currency} {account.amount}</span>
            </div>
          ))}
          <div className="account-item add-button">
            <span>+</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountsList;