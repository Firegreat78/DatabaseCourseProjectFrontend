import React, { useEffect, useState } from 'react';
import EmployeeHeader from './EmployeeHeader';
import './EmployeeProfilePage.css';
import { User, FileText, ShieldCheck, Briefcase, LogOut, AlertTriangle } from 'lucide-react';

const STAFF_ID = 1;

const roleMap = {
  1: 'Мегаадминистратор',
  2: 'Администратор',
  3: 'Брокер',
  4: 'Верификатор',
  5: 'Старший верификатор',
  6: 'Системный администратор'
};

const EmployeeProfilePage = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/staff/${STAFF_ID}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Ошибка загрузки профиля');
        }

        setEmployeeData({
          contractNumber: data.contract_number ?? 'Не указан',
          employmentStatus: data.employment_status,
          roleLevel: roleMap[data.rights_level] ?? 'Неизвестно',
          login: data.login,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  if (loading) {
    return <div className="admin-content">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="admin-content">
        <AlertTriangle /> {error}
      </div>
    );
  }

  return (
    <div className="employee-profile-page">
      <EmployeeHeader />

      <main className="employee-profile-content">
        <div className="employee-profile-card">
          <div className="employee-profile-header">
            <User size={48} />
            <h1>Профиль сотрудника</h1>
            <p>ID сотрудника: {STAFF_ID}</p>
            <p>Логин: {employeeData.login}</p>
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
                <span className="label">Статус</span>
                <span className="value">{employeeData.employmentStatus}</span>
              </div>
            </div>

            <div className="info-row">
              <ShieldCheck size={20} />
              <div>
                <span className="label">Роль</span>
                <span className="value">{employeeData.roleLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfilePage;
