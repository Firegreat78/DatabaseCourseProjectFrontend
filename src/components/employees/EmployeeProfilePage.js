import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmployeeHeader from './EmployeeHeader';
import './EmployeeProfilePage.css';

import {
  User,
  FileText,
  ShieldCheck,
  Briefcase,
  LogOut,
} from 'lucide-react';

const roleMap = {
  1: 'Мегаадминистратор',
  2: 'Администратор',
  3: 'Брокер',
  4: 'Верификатор',
};

const EmployeeProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // 🔧 Мок-данные (потом заменишь на API)
  const employeeData = {
    contractNumber: `EMP-${user.id}-2024`,
    employmentStatus: 'Активен',
    roleLevel: roleMap[user.role] || 'Неизвестно',
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
