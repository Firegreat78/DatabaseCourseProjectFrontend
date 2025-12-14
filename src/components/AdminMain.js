// src/components/AdminMain.jsx

import React from 'react';
import AppHeader from './AppHeader';
import './AdminMain.css';

const AdminMainPage = () => {
  const adminItems = [
    { id: 7879, name: "Трамп Д.", action: "Ведение сделок" },
    { id: 7878, name: "Трищечкин А.В.", action: "Управление пользователями" }
  ];

  return (
    <div className="admin-page">
      <header className="app-header">
        <AppHeader />
      </header>
      
      <main className="content">
        <h2 className="page-title">Администрирование</h2>
        
        <div className="search-bar">
          <input type="text" placeholder="Поиск..." className="search-input" />
          <button className="search-button">🔍</button>
        </div>
        
        <div className="admin-list">
          {adminItems.map((item) => (
            <div key={item.id} className="admin-item">
              <span className="admin-info">ID: {item.id} {item.name}</span>
              <span className="admin-action">{item.action}</span>
            </div>
          ))}
        </div>
        
        <button className="add-button">+</button>
      </main>
    </div>
  );
};

export default AdminMainPage;