import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmployeeHeader from './EmployeeHeader';
import './EmployeeProfilePage.css';
import { User, FileText, ShieldCheck, Briefcase, LogOut } from 'lucide-react';

const roleMap = {
  1: 'Мегаадминистратор',
  2: 'Администратор',
  3: 'Брокер',
  4: 'Верификатор',
};

const EmployeeProfilePage = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ❌ useEffect больше не вызывается условно
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/staff/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Не удалось получить данные сотрудника');
        const data = await res.json();
        setEmployeeData({
          contractNumber: data.contract_number,
          employmentStatus: data.employment_status_id === 1 ? 'Активен' : 'Неактивен',
          roleLevel: roleMap[data.rights_level] || 'Неизвестно',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) return <p>Пользователь не авторизован</p>;
  if (loading) return <p>Загрузка...</p>;
  if (!employeeData) return <p>Данные сотрудника недоступны</p>;

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
                <span className="value status active">
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
