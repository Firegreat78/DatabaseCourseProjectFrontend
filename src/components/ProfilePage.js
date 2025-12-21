// src/components/ClientProfilePage.jsx
import React, { useEffect, useState } from 'react';
import AppHeader from './AppHeader';
import './ProfilePage.css';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck, ShieldAlert, LogOut, AlertTriangle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000';

const ProfilePage = () => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banCheckLoading, setBanCheckLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Проверка статуса блокировки
  const checkBanStatus = async () => {
    if (!user?.id || !user?.token) {
      setBanCheckLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user_ban_status/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.ok) {
        throw new Error('Не удалось проверить статус аккаунта');
      }

      const data = await response.json();
      setIsBanned(data.is_banned);
    } catch (err) {
      console.error('Ошибка проверки блокировки:', err);
      setError('Не удалось проверить статус аккаунта');
    } finally {
      setBanCheckLoading(false);
    }
  };

  // Загрузка данных профиля
  const fetchClient = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка загрузки профиля');
      }

      setClientData({
        email: data.email,
        registrationDate: data.registration_date,
        verificationStatusId: data.verification_status_id,
        rubAccount: data.rub_account,
        usdAccount: data.usd_account,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkBanStatus();
      fetchClient();
    } else {
      setLoading(false);
      setBanCheckLoading(false);
    }
  }, [user?.id]);

  const handleLogout = () => {
    logout();
  };

  const isVerified = clientData?.verificationStatusId === 2;
const isPendingVerification = clientData?.verificationStatusId === 3;
const isNotVerified = clientData?.verificationStatusId === 1 || clientData?.verificationStatusId === undefined;
  

  // Если пользователь заблокирован — показываем только хедер и сообщение
  if (isBanned) {
    return (
      <div className="client-profile-page">
        <AppHeader />
        <main className="profile-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Lock size={64} color="#ef4444" />
          <h2 style={{ margin: '20px 0', color: '#dc2626' }}>Ваш аккаунт заблокирован</h2>
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            Доступ к личному кабинету ограничен. Обратитесь в поддержку.
          </p>
        </main>
      </div>
    );
  }

  // Если идёт проверка блокировки
  if (banCheckLoading || loading) {
    return (
      <div className="client-profile-page">
        <AppHeader />
        <main className="profile-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          Загрузка...
        </main>
      </div>
    );
  }

  // Если ошибка
  if (error) {
    return (
      <div className="client-profile-page">
        <AppHeader />
        <main className="profile-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertTriangle size={48} color="#dc2626" />
          <p style={{ marginTop: '20px', color: '#dc2626' }}>{error}</p>
        </main>
      </div>
    );
  }

  // Обычный профиль
  return (
    <div className="client-profile-page">
      <AppHeader />

      <main className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <User size={48} />
            <h1>Личный кабинет</h1>
            <p>ID: {user?.id}</p>
          </div>

          <div className="profile-grid">
            <div className="info-item">
              <Mail size={20} />
              <div>
                <span className="label">Email</span>
                <span className="value">{clientData.email}</span>
              </div>
            </div>

            <div className="info-item">
              <Calendar size={20} />
              <div>
                <span className="label">Дата регистрации</span>
                <span className="value">{clientData.registrationDate}</span>
              </div>
            </div>

            <div className="info-item">
              {isVerified ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              <div>
                <span className="label">Верификация аккаунта</span>
                <span
                  className={`value status ${
                    isVerified ? 'verified' : isPendingVerification ? 'pending' : 'not-verified'
                  }`}
                >
                  {isVerified
                    ? 'Верифицирован'
                    : isPendingVerification
                    ? 'Ожидает верификации'
                    : 'Не верифицирован'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
  {clientData?.verificationStatusId === 1 && ( // <-- Изменённое условие
    <button 
      onClick={() => navigate('/verification')} 
      className="btn-primary"
    >
      Верифицировать аккаунт
    </button>
  )}

  <button onClick={handleLogout} className="btn-logout">
    <LogOut size={18} /> Выйти из аккаунта
  </button>
</div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;