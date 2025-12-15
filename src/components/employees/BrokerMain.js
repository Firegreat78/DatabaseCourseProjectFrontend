// src/components/BrokerMain.jsx

import React from 'react';
import EmployeeHeader from './EmployeeHeader';
import './BrokerMain.css';

const BrokerMainPage = () => {
  const deals = [
    { id: "2025-Покупка-1789", description: "Покупка нефти", status: "active" },
    { id: "7892-Продажа-5863", description: "Продажа газа", status: "blocked" },
    { id: "7676-Продажа-9A2P", description: "Экспорт угля", status: "suspended" }
  ];

  return (
    <div className="employee-page">
      <EmployeeHeader />
      
      <main className="content">
        <h2 className="page-title">Ведение сделок</h2>
        
        <div className="user-list">
          {deals.map((deal) => (
            <div key={deal.id} className="user-item">
              <span className="user-info">ИД: {deal.id} {deal.description}</span>
              <div className={`status-indicator ${deal.status}`}></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrokerMainPage;