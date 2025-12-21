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

const API_BASE_URL = 'http://localhost:8000';

const AdminEmployeeEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  
  const availableRoles = user?.role === '1'
    ? roleOptions.filter(r => r.value < 5)
    : roleOptions.filter(r => r.value > 2 && r.value < 5);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        const data = await response.json();
        setForm({
          id: data.id,
          login: data.login,
          password: '',
          contractNumber: data.contract_number,
          role: data.rights_level,
          employmentStatus: data.employment_status_id,
        });
      } catch (err) {
        console.error('Ошибка загрузки сотрудника:', err);
      }
    };

    fetchStaffData();
  }, [id]);

  if (!form) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении');

      alert('Сотрудник успешно обновлён');
    } catch (err) {
      console.error(err);
      alert('Не удалось обновить сотрудника');
    } finally {
      setSaving(false);
    }
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

      <div className="form-group select-with-arrow">
        <label>Статус трудоустройства</label>
        <select
          value={form.employmentStatus}
          onChange={(e) => handleChange('employmentStatus', e.target.value)}
        >
          <option value="1">Активен</option>
          <option value="2">Уволен</option>
          <option value="3">Отпуск</option>
        </select>
      </div>

      <div className="form-group select-with-arrow">
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