import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AdminEmployeeEdit.css';
import { useAuth } from '../../context/AuthContext';


const roleOptions = [
  { value: 1, label: 'Мегаадминистратор' },
  { value: 2, label: 'Администратор' },
  { value: 3, label: 'Брокер' },
  { value: 4, label: 'Верификатор' },
];




const AdminEmployeeEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  // Ограничение для не-мегаадмина
const availableRoles = user?.role === '1'
  ? roleOptions
  : roleOptions.filter(r => r.value > 2); // только брокер и верификатор

  useEffect(() => {
    // 🔧 mock загрузка
    setForm({
      id,
      login: 'broker01',
      password: '',
      contractNumber: 'EMP-2024-001',
      employmentStatus: 'Активен',
      role: 3,
    });
  }, [id]);

  if (!form) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    // 👉 отправка на API
    console.log('SAVE:', form);

    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div className="admin-employee-edit">
      <h1>Редактирование сотрудника</h1>

      <div className="form-group">
        <label>ID</label>
        <input value={form.id} disabled />
      </div>

      <div className="form-group">
        <label>Логин</label>
        <input
          value={form.login}
          onChange={(e) => handleChange('login', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Пароль</label>
        <input
          type="password"
          placeholder="Оставьте пустым, чтобы не менять"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Номер договора</label>
        <input
          value={form.contractNumber}
          onChange={(e) => handleChange('contractNumber', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Статус трудоустройства</label>
        <select
          value={form.employmentStatus}
          onChange={(e) => handleChange('employmentStatus', e.target.value)}
        >
          <option>Активен</option>
          <option>Уволен</option>
          <option>Отпуск</option>
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

      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
    </div>
  );
};

export default AdminEmployeeEdit;
