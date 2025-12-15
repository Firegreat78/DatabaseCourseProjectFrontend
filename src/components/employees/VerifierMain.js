// src/components/VerifierMain.jsx

import React from 'react';
import EmployeeHeader from './EmployeeHeader';
import './VerifierMain.css';

const VerifierMainPage = () => {
  const users = [
    { id: 7875, name: "Иванов И.И.", status: "active" },
    { id: 7860, name: "Сидоров С.С.", status: "blocked" },
    { id: 7878, name: "Петров П.П.", status: "suspended" }
  ];

  return (
    <div className="employee-page">
      <EmployeeHeader />
      
      <main className="content">
        <h2 className="page-title">Управление пользователями</h2>
        
        <div className="user-list">
          {users.map((user) => (
            <div key={user.id} className="user-item">
              <span className="user-info">ИД: {user.id} {user.name}</span>
              <div className={`status-indicator ${user.status}`}></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VerifierMainPage;