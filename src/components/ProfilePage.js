// src/components/ProfilePage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import './ProfilePage.css';

import { 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert,
  Wallet,
  LogOut 
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();

  // Mock-данные
  const userData = {
    id: 1612,
    email: 'ias.mid@yandex.ru',
    registrationDate: '01.11.2025',
    isVerified: false,
    rubAccount: '2281337',
    usdAccount: '7878'
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <div className="profile-page">
      <AppHeader />

      <main className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-placeholder">
              <User size={48} strokeWidth={1.5} />
            </div>
            <h1 className="profile-title">Личный кабинет</h1>
            <p className="profile-subtitle">ID: {userData.id}</p>
          </div>

          <div className="profile-grid">
            <div className="info-item">
              <Mail className="icon" size={20} />
              <div>
                <span className="label">Email</span>
                <span className="value">{userData.email}</span>
              </div>
            </div>

            <div className="info-item">
              <Calendar className="icon" size={20} />
              <div>
                <span className="label">Дата регистрации</span>
                <span className="value">{userData.registrationDate}</span>
              </div>
            </div>

            <div className="info-item">
              {userData.isVerified ? (
                <ShieldCheck className="icon verified" size={20} />
              ) : (
                <ShieldAlert className="icon not-verified" size={20} />
              )}
              <div>
                <span className="label">Верификация аккаунта</span>
                <span className={`value status ${userData.isVerified ? 'verified' : 'not-verified'}`}>
                  {userData.isVerified ? 'Верифицирован' : 'Не верифицирован'}
                </span>
              </div>
            </div>
          </div>

          <div className="accounts-section">
            <h3 className="section-title">
              <Wallet size={20} />
              Счета для выплаты дивидендов
            </h3>

            <div className="account-field">
              <label>Рублёвый счёт (RUB)</label>
              <div className="account-input">
                <span>{userData.rubAccount}</span>
              </div>
            </div>

            <div className="account-field">
              <label>Долларовый счёт (USD)</label>
              <div className="account-input">
                <span>{userData.usdAccount}</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!userData.isVerified && (
              <Link to="/verification" className="btn-primary">
                Пройти верификацию
              </Link>
            )}

            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={18} />
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;