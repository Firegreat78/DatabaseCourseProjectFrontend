// src/components/AppHeader.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  TrendingUp,
  Package,
  ArrowLeftRight,
  User,
  LogOut
} from 'lucide-react';
import './AppHeader.css';

const AppHeader = () => {
  const { user, logout } = useAuth();

  // Если пользователь не авторизован — хедер не отображаем
  // (на страницах логина/регистрации он и не нужен)
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из аккаунта?')) {
      logout(); // очистит localStorage и перенаправит на /login
    }
  };

  return (
    <header className="app-header">
      {/* Логотип — ведёт на список счетов */}
      <NavLink to="/accounts" className="logo-link">
        <div className="logo">
          <div className="logo-icon">
            <Wallet size={28} strokeWidth={2} />
          </div>
          <h1 className="logo-text">МИД</h1>
          <div className="logo-glow"></div>
        </div>
      </NavLink>

      {/* Основная навигация */}
      <nav className="nav">
        <NavLink
          to="/portfolio"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <TrendingUp size={20} />
          <span>Портфель</span>
        </NavLink>

        <NavLink
          to="/offers"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={20} />
          <span>Предложения</span>
        </NavLink>

        <NavLink
          to="/exchange"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ArrowLeftRight size={20} />
          <span>Биржа</span>
        </NavLink>
      </nav>

      {/* Правая часть: профиль + выход */}
      <div className="header-right">
        <NavLink
          to="/profile"
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

export default AppHeader;