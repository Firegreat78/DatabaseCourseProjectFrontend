import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminUserEdit.css';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

// Опции для статусов
const verificationStatusOptions = [
  { value: 1, label: 'Не верифицирован' },
  { value: 2, label: 'Верифицирован' },
  { value: 3, label: 'Ожидает верификации' },
];

const blockStatusOptions = [
  { value: 1, label: 'Активен' },
  { value: 2, label: 'Заблокирован' },
];

const AdminUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Преобразуем дату для отображения
        const formattedDate = data.registration_date 
          ? new Date(data.registration_date).toLocaleDateString('ru-RU')
          : 'Не указана';
        
        setForm({
          id: data.id,
          login: data.login || '',
          email: data.email || '',
          password: '', // Пароль оставляем пустым по умолчанию
          verification_status_id: data.verification_status_id || 1,
          block_status_id: data.block_status_id || 1,
          registration_date: formattedDate,
          originalData: data // Сохраняем оригинальные данные для сравнения
        });
      } catch (err) {
        console.error('Ошибка загрузки пользователя:', err);
        setError(`Не удалось загрузить данные пользователя: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Подготовка данных для отправки
      const updateData = {
        login: form.login,
        email: form.email,
        verification_status_id: parseInt(form.verification_status_id),
        block_status_id: parseInt(form.block_status_id),
      };
      
      // Добавляем пароль только если он был изменен
      if (form.password && form.password.trim() !== '') {
        updateData.password = form.password;
      }
      
      // Проверка на изменения
      const hasChanges = Object.keys(updateData).some(key => {
        if (key === 'password') return true; // Пароль всегда считается изменением если указан
        return form.originalData[key] !== updateData[key];
      });
      
      if (!hasChanges) {
        setError('Нет изменений для сохранения');
        setSaving(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }
      
      // Обновляем оригинальные данные после успешного сохранения
      setForm(prev => ({
        ...prev,
        originalData: { ...prev.originalData, ...updateData },
        password: '' // Сбрасываем поле пароля после сохранения
      }));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Ошибка при обновлении пользователя:', err);
      setError(err.message || 'Не удалось обновить данные пользователя');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  if (loading) {
    return (
      <div className="admin-user-edit">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка данных пользователя...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="admin-user-edit">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className="cancel-btn">
            <ArrowLeft size={16} />
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-edit">
      <div className="edit-header">
        <button onClick={handleCancel} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <h1>Редактирование пользователя</h1>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <Save size={18} />
          <span>Данные пользователя успешно обновлены!</span>
        </div>
      )}

      <div className="form-grid">
        <div className="form-section">
          <h2>Основная информация</h2>
          
          <div className="form-group">
            <label>ID пользователя</label>
            <input 
              value={form.id} 
              disabled 
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label>Логин *</label>
            <input
              value={form.login}
              onChange={(e) => handleChange('login', e.target.value)}
              placeholder="Введите логин"
            />
            <div className="form-hint">Уникальное имя пользователя</div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Введите email"
            />
            <div className="form-hint">Электронная почта пользователя</div>
          </div>

          <div className="form-group">
            <label>Дата регистрации</label>
            <input 
              value={form.registration_date} 
              disabled 
              className="disabled-input"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Безопасность и статусы</h2>
          
          <div className="form-group">
            <label>Новый пароль</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Введите новый пароль"
            />
            <div className="form-hint">Оставьте пустым, чтобы не менять пароль</div>
          </div>

          <div className="form-group">
            <label>Статус верификации</label>
            <div className="select-wrapper">
              <select
                value={form.verification_status_id}
                onChange={(e) => handleChange('verification_status_id', e.target.value)}
                className={form.verification_status_id === 3 ? 'pending-status' : ''}
              >
                {verificationStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
            <div className="form-hint">
              {form.verification_status_id === 1 && "Пользователь не прошел верификацию"}
              {form.verification_status_id === 2 && "Пользователь успешно верифицирован"}
              {form.verification_status_id === 3 && "Ожидает проверки верификатором"}
            </div>
          </div>

          <div className="form-group">
            <label>Статус блокировки</label>
            <div className="select-wrapper">
              <select
                value={form.block_status_id}
                onChange={(e) => handleChange('block_status_id', e.target.value)}
                className={form.block_status_id === 2 ? 'blocked-status' : ''}
              >
                {blockStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
            <div className="form-hint">
              {form.block_status_id === 1 && "Пользователь имеет доступ к системе"}
              {form.block_status_id === 2 && "Доступ пользователя заблокирован"}
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button 
          onClick={handleCancel} 
          className="cancel-btn"
          disabled={saving}
        >
          Отмена
        </button>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="save-btn"
        >
          {saving ? (
            <>
              <div className="save-spinner"></div>
              Сохранение...
            </>
          ) : (
            <>
              <Save size={18} />
              Сохранить изменения
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminUserEdit;