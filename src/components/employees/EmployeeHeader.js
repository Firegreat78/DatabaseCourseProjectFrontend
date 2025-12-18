// src/components/EmployeeHeader.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  User,
  LogOut
} from 'lucide-react';
import '../AppHeader.css';

const EmployeeHeader = () => {
  const { user, employee_logout } = useAuth();

  // Если пользователь не авторизован — хедер не отображаем
  // (на страницах логина/регистрации он и не нужен)
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из аккаунта?')) {
      employee_logout(); // очистит localStorage и перенаправит на /login
    }
  };

  return (
    <header className="app-header">
      {/* Логотип — ведёт на список счетов */}
        <div className="logo">
          <div className="logo-icon">
            <Wallet size={28} strokeWidth={2} />
          </div>
          <h1 className="logo-text">МИД</h1>
          <div className="logo-glow"></div>
        </div>

      {/* Основная навигация */}

      {/* Правая часть: профиль + выход */}
      <div className="header-right">
       <NavLink
        to="/employee/profile"
        className={({ isActive }) => `profile-link ${isActive ? 'active' : ''}`}
       >

          <div className="profile-avatar">
            <User size={22} strokeWidth={2} />
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="logout-button"
          title="Выйти из аккаунта"
          aria-label="Выйти"
        >
          <LogOut size={20} strokeWidth={2} />
          <span className="logout-text">Выйти</span>
        </button>
      </div>
    </header>
  );
};

export default EmployeeHeader;