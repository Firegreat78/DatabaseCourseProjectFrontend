import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  Building2,
  Users,
  ArrowLeftRight,
  User,
  LogOut,
  Book
} from 'lucide-react';
import './../AppHeader.css';

const AdminHeader = () => {
  const { user, employee_logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из аккаунта?')) {
      employee_logout();
    }
  };

  return (
    <header className="app-header">
      <NavLink to="/admin/main" className="logo-link">
        <div className="logo">
          <div className="logo-icon">
            <Wallet size={28} strokeWidth={2} />
          </div>
          <h1 className="logo-text">МИД Admin</h1>
          <div className="logo-glow"></div>
        </div>
      </NavLink>

      <nav className="nav">
        <NavLink
          to="/admin/main"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Building2 size={20} />
          <span>Сотрудники</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={20} />
          <span>Клиенты</span>
        </NavLink>

        <NavLink
          to="/admin/exchange"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ArrowLeftRight size={20} />
          <span>Биржа</span>
        </NavLink>

        <NavLink
          to="/admin/modify_banks"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Building2 size={20} />
          <span>Банки</span>
        </NavLink>

        <NavLink
          to="/admin/modify_currency"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Wallet size={20} />
          <span>Валюты</span>
        </NavLink>
      </nav>

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

export default AdminHeader;