// src/components/OffersPage.jsx

import React from 'react';
import AppHeader from './AppHeader';
import './OffersPage.css';

const OffersPage = () => {
  // Mock-данные
  const mockData = {
    offers: [
      { id: 9999, type: 'Продажа', ticker: 'GAZP', quantity: 17, price: 34, currency: '$' },
      { id: 7888, type: 'Покупка', ticker: 'SBER', quantity: 4, price: 800, currency: '₽' },
    ]
  };

  return (
    <div className="offers-container">
      {/* 🟢 Верхняя панель — копируем из других страниц */}
      <header className="app-header">
        <AppHeader /> {/* ← шапка */}
      </header>

      {/* 📊 Основное содержимое */}
      <main className="content">
        <h2 className="page-title">Предложения</h2>

        <div className="offers-list">
          {mockData.offers.map(offer => (
            <div key={offer.id} className="offer-item">
              <div className="offer-id">ID: {offer.id}</div>
              <div className="offer-details">
                <span>{offer.type} {offer.ticker}</span>
                <span>{offer.quantity} шт.</span>
                <span>{offer.currency} {offer.price}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OffersPage;