import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeHeader from './EmployeeHeader';
import './AdminEmployeeEdit.css'; // используем ТОТ ЖЕ стиль
import { useAuth } from '../../context/AuthContext';

const roleOptions = [
  { value: 1, label: 'Мегаадминистратор' },
  { value: 2, label: 'Администратор' },
  { value: 3, label: 'Брокер' },
  { value: 4, label: 'Верификатор' },
];



const AdminEmployeeCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    login: '',
    password: '',
    contractNumber: '',
    employmentStatus: 'Активен',
    role: 3,
  });

  const { user } = useAuth();
// Ограничение для не-мегаадмина
const availableRoles = user?.role === '1'
  ? roleOptions
  : roleOptions.filter(r => r.value > 2); // только брокер и верификатор


  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.login || !form.password) {
      alert('Логин и пароль обязательны');
      return;
    }

    setSaving(true);

    // 👉 API POST /admin/employees
    console.log('CREATE:', form);

    setTimeout(() => {
      setSaving(false);
      navigate('/admin/employees');
    }, 800);
  };

  return (
    <div className="admin-page">
      <EmployeeHeader />

      <main className="admin-content">
        <div className="admin-employee-edit">
          <h1>Добавить сотрудника</h1>

          <div className="form-group">
            <label>Логин</label>
            <input
              value={form.login}
              onChange={(e) => handleChange('login', e.target.value)}
              placeholder="Введите логин"
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Введите пароль"
            />
          </div>

          <div className="form-group">
            <label>Номер договора</label>
            <input
              value={form.contractNumber}
              onChange={(e) => handleChange('contractNumber', e.target.value)}
              placeholder="EMP-2024-XXX"
            />
          </div>

          <div className="form-group">
            <label>Статус трудоустройства</label>
            <select
              value={form.employmentStatus}
              onChange={(e) =>
                handleChange('employmentStatus', e.target.value)
              }
            >
              <option>Активен</option>
              <option>Отпуск</option>
              <option>Уволен</option>
            </select>
          </div>

          <div className="form-group">
            <label>Уровень прав</label>
            <select
  value={form.role}
  onChange={(e) => handleChange('role', Number(e.target.value))}
>
  {availableRoles.map((r) => (
    <option key={r.value} value={r.value}>
      {r.label}
    </option>
  ))}
</select>

          </div>

          <button onClick={handleCreate} disabled={saving}>
            {saving ? 'Создание...' : 'Создать сотрудника'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminEmployeeCreate;
