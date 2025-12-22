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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const availableRoles = user?.role === '1'
    ? roleOptions.filter(r => r.value < 5)
    : roleOptions.filter(r => r.value > 2 && r.value < 5);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
          },
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setForm({
          id: data.id,
          login: data.login,
          password: '',
          contractNumber: data.contract_number,
          role: data.rights_level, // Может быть строкой, но мы преобразуем в число для селекта
          employmentStatus: data.employment_status_id,
        });
      } catch (err) {
        console.error('Ошибка загрузки сотрудника:', err);
        alert('Не удалось загрузить данные сотрудника');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!form) return <div>Не удалось загрузить данные сотрудника</div>;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Подготавливаем данные для отправки
      const requestData = {};
      
      // Добавляем логин, если он изменился
      if (form.login !== undefined && form.login !== '') {
        requestData.login = form.login;
      }
      
      // Добавляем пароль, если он не пустой
      if (form.password && form.password.trim() !== '') {
        requestData.password = form.password;
      }
      
      // Добавляем номер договора
      if (form.contractNumber !== undefined) {
        requestData.contract_number = form.contractNumber;
      }
      
      // Добавляем уровень прав - отправляем как есть (может быть строкой или числом)
      if (form.role !== undefined) {
        // Преобразуем в строку, чтобы не было проблем с БД
        requestData.rights_level = String(form.role);
      }
      
      // Добавляем статус трудоустройства
      if (form.employmentStatus !== undefined) {
        requestData.employment_status_id = parseInt(form.employmentStatus);
      }

      console.log('Отправляемые данные:', requestData);

      const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Ошибка ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      alert(result.message || 'Сотрудник успешно обновлён');
      
      // Обновляем форму с сервера, чтобы получить актуальные данные
      const updatedResponse = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
        },
      });
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setForm({
          id: updatedData.id,
          login: updatedData.login,
          password: '', // Сбрасываем поле пароля
          contractNumber: updatedData.contract_number,
          role: updatedData.rights_level,
          employmentStatus: updatedData.employment_status_id,
        });
      }
      
    } catch (err) {
      console.error('Ошибка обновления сотрудника:', err);
      alert(err.message || 'Не удалось обновить сотрудника');
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
          value={form.login || ''}
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
          value={form.contractNumber || ''}
          onChange={(e) => handleChange('contractNumber', e.target.value)}
        />
      </div>

      <div className="form-group select-with-arrow">
        <label>Статус трудоустройства</label>
        <select
          value={form.employmentStatus || ''}
          onChange={(e) => handleChange('employmentStatus', e.target.value)}
        >
          <option value="">Выберите статус</option>
          <option value="1">Активен</option>
          <option value="2">Уволен</option>
          <option value="3">Отпуск</option>
        </select>
      </div>

      <div className="form-group select-with-arrow">
        <label>Уровень прав</label>
        <select
          value={form.role || ''}
          onChange={(e) => handleChange('role', e.target.value)}
        >
          <option value="">Выберите роль</option>
          {availableRoles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleSave} 
        disabled={saving || !form.login || !form.contractNumber}
      >
        {saving ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
    </div>
  );
};

export default AdminEmployeeEdit;