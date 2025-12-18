// src/components/ClientProfilePage.jsx
import React, { useEffect, useState } from 'react';
import AppHeader from './AppHeader';
import './ProfilePage.css';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck, ShieldAlert, Wallet, LogOut, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/user/${user?.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Ошибка загрузки профиля');
        }

        setClientData({
          email: data.email,
          registrationDate: data.registration_date,
          isVerified: data.is_verified,
          rubAccount: data.rub_account,
          usdAccount: data.usd_account,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  if (loading) {
    return <div className="profile-content">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="profile-content">
        <AlertTriangle /> {error}
      </div>
    );
  }

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
              {clientData.isVerified ? (
                <ShieldCheck size={20} />
              ) : (
                <ShieldAlert size={20} />
              )}
              <div>
                <span className="label">Верификация аккаунта</span>
                <span className={`value status ${clientData.isVerified ? 'verified' : 'not-verified'}`}>
                  {clientData.isVerified = 2 ? 'Верифицирован' : 'Не верифицирован'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!(clientData.isVerified = 2) && (
              <button onClick={() => navigate('/verification')} className="btn-primary">
                Пройти верификацию
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
