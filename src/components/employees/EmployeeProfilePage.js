import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmployeeHeader from './EmployeeHeader';
import './EmployeeProfilePage.css';
import { User, FileText, ShieldCheck, Briefcase, LogOut, AlertTriangle } from 'lucide-react';

const roleMap = {
  '1': 'Мегаадминистратор',
  '2': 'Администратор',
  '3': 'Брокер',
  '4': 'Верификатор',
  '5': 'Старший верификатор',
  '6': 'Системный администратор'
};

const EmployeeProfilePage = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      if (!token) {
        setError("Необходима авторизация");
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
      return;
    }

    const fetchEmployee = async () => {
      try {
        console.log("Запрос данных сотрудника с ID:", user.id);
        console.log("Токен:", token.substring(0, 10) + '...');
        
        const response = await fetch(`http://localhost:8000/api/staff/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error("Ошибка ответа:", data);
          throw new Error(data.detail || `Ошибка ${response.status}: ${response.statusText}`);
        }

        console.log("Полученные данные сотрудника:", data);
        
        setEmployeeData({
          contractNumber: data.contract_number || data.contractNumber || 'Не указан',
          employmentStatus: data.employment_status_id 
            ? (data.employment_status_id === 1 ? 'Активен' : 'Неактивен')
            : (data.employmentStatus || 'Неизвестен'),
          roleLevel: roleMap[data.rights_level] || roleMap[data.rightsLevel] || 'Неизвестно',
          login: data.login || ''
        });
      } catch (err) {
        console.error("Ошибка загрузки данных сотрудника:", err);
        setError(err.message || "Не удалось загрузить данные профиля");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [user, token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return (
      <div className="employee-profile-page">
        <EmployeeHeader />
        <div className="admin-content" style={{ textAlign: 'center', padding: '2rem' }}>
          <AlertTriangle size={48} color="#ff9900" style={{ marginBottom: '1rem' }} />
          <h2>Пользователь не авторизован</h2>
          <p>Вы будете перенаправлены на страницу входа...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="employee-profile-page">
        <EmployeeHeader />
        <div className="admin-content" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" style={{ 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #3498db', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h2>Загрузка профиля...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-profile-page">
        <EmployeeHeader />
        <div className="admin-content" style={{ textAlign: 'center', padding: '2rem' }}>
          <AlertTriangle size={48} color="#e74c3c" style={{ marginBottom: '1rem' }} />
          <h2>Ошибка загрузки данных</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '1rem', 
              padding: '8px 16px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="employee-profile-page">
        <EmployeeHeader />
        <div className="admin-content" style={{ textAlign: 'center', padding: '2rem' }}>
          <AlertTriangle size={48} color="#e67e22" style={{ marginBottom: '1rem' }} />
          <h2>Данные сотрудника недоступны</h2>
          <p>Попробуйте обновить страницу или обратитесь к администратору</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '1rem', 
              padding: '8px 16px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-profile-page">
      <EmployeeHeader />
      <main className="employee-profile-content">
        <div className="employee-profile-card">
          <div className="employee-profile-header">
            <div className="avatar">
              <User size={48} strokeWidth={1.5} />
            </div>
            <h1>Профиль сотрудника</h1>
            <p>ID сотрудника: {user.id}</p>
            {employeeData.login && <p>Логин: {employeeData.login}</p>}
          </div>

          <div className="employee-info-list">
            <div className="info-row">
              <FileText size={20} />
              <div>
                <span className="label">Номер договора</span>
                <span className="value">{employeeData.contractNumber}</span>
              </div>
            </div>

            <div className="info-row">
              <Briefcase size={20} />
              <div>
                <span className="label">Статус трудоустройства</span>
                <span className={`value status ${employeeData.employmentStatus === 'Активен' ? 'active' : 'inactive'}`}>
                  {employeeData.employmentStatus}
                </span>
              </div>
            </div>

            <div className="info-row">
              <ShieldCheck size={20} />
              <div>
                <span className="label">Уровень прав</span>
                <span className="value">{employeeData.roleLevel}</span>
              </div>
            </div>
          </div>

          <div className="employee-profile-actions">
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={18} />
              Выйти из системы
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfilePage;