// src/components/admin/AdminUserEdit.js
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
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const [touched, setTouched] = useState({});
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setErrors({});
        setServerErrors({});
        
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
        setErrors({ general: `Не удалось загрузить данные пользователя: ${err.message}` });
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
    
    // Отмечаем поле как "тронутое"
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Очищаем ошибки для этого поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    if (serverErrors[field]) {
      setServerErrors(prev => {
        const newServerErrors = { ...prev };
        delete newServerErrors[field];
        return newServerErrors;
      });
    }
  };

  const validateField = (fieldName) => {
    if (!touched[fieldName]) return;

    const newErrors = { ...errors };
    let hasError = false;

    switch (fieldName) {
      case 'login':
        // Логин может быть пустым (оставляем старый)
        // Проверяем только если не пустой и меньше 3 символов
        if (form.login.trim() !== '' && form.login.length < 3) {
          newErrors.login = 'Логин должен содержать минимум 3 символа';
          hasError = true;
        } else {
          delete newErrors.login;
        }
        break;
        
      case 'email':
        // Email может быть пустым (оставляем старый)
        // Проверяем только если не пустой и невалидный
        if (form.email.trim() !== '' && !/\S+@\S+\.\S+/.test(form.email)) {
          newErrors.email = 'Введите корректный email';
          hasError = true;
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        // Проверяем пароль только если он указан
        if (form.password && form.password.length > 0 && form.password.length < 6) {
          newErrors.password = 'Пароль должен содержать минимум 6 символов';
          hasError = true;
        } else {
          delete newErrors.password;
        }
        break;
        
      default:
        break;
    }

    if (hasError || (errors[fieldName] && !hasError)) {
      setErrors(newErrors);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Проверка логина (только если не пустой)
    if (form.login.trim() !== '' && form.login.length < 3) {
      newErrors.login = 'Логин должен содержать минимум 3 символа';
      isValid = false;
    }

    // Проверка email (только если не пустой)
    if (form.email.trim() !== '' && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Введите корректный email';
      isValid = false;
    }

    // Проверка пароля (если указан)
    if (form.password && form.password.length > 0 && form.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    setErrors(newErrors);
    
    // Отмечаем как тронутые только если поля не пустые
    setTouched({
      login: form.login.trim() !== '',
      email: form.email.trim() !== '',
      password: !!form.password
    });
    
    return isValid;
  };

  const getFieldError = (fieldName) => {
    return serverErrors[fieldName] || errors[fieldName];
  };

  const isFormValid = () => {
    // Форма валидна, если нет ошибок валидации
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setErrors({});
    setServerErrors({});
    setSuccess(false);
    
    try {
      // Подготовка данных для отправки
      const updateData = {
        verification_status_id: parseInt(form.verification_status_id),
        block_status_id: parseInt(form.block_status_id),
      };
      
      // Добавляем логин только если он не пустой
      if (form.login.trim() !== '') {
        updateData.login = form.login;
      }
      
      // Добавляем email только если он не пустой
      if (form.email.trim() !== '') {
        updateData.email = form.email;
      }
      
      // Добавляем пароль только если он был указан
      if (form.password && form.password.trim() !== '') {
        updateData.password = form.password;
      }
      
      // Проверка на изменения
      const hasChanges = Object.keys(updateData).some(key => {
        if (key === 'password') return true; // Пароль всегда считается изменением если указан
        // Для логина и email проверяем только если они переданы (не пустые)
        if (key === 'login' && updateData.login) {
          return form.originalData[key] !== updateData[key];
        }
        if (key === 'email' && updateData.email) {
          return form.originalData[key] !== updateData[key];
        }
        if (key === 'verification_status_id' || key === 'block_status_id') {
          return form.originalData[key] !== updateData[key];
        }
        return false;
      });
      
      if (!hasChanges) {
        setErrors({ general: 'Нет изменений для сохранения' });
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
        // Обработка ошибок с сервера
        if (responseData.detail === "Логин уже занят") {
          setServerErrors(prev => ({ ...prev, login: "Этот логин уже занят" }));
          setTouched(prev => ({ ...prev, login: true }));
        } else if (responseData.detail === "Email уже зарегистрирован") {
          setServerErrors(prev => ({ ...prev, email: "Этот email уже зарегистрирован" }));
          setTouched(prev => ({ ...prev, email: true }));
        } else if (responseData.detail && typeof responseData.detail === 'string') {
          setErrors({ general: responseData.detail });
        } else {
          setErrors({ general: responseData.message || `Ошибка ${response.status}: ${response.statusText}` });
        }
        return;
      }
      
      // Обновляем оригинальные данные после успешного сохранения
      // Для логина и email используем значения из ответа сервера
      setForm(prev => ({
        ...prev,
        login: responseData.login || prev.login,
        email: responseData.email || prev.email,
        verification_status_id: responseData.verification_status_id,
        block_status_id: responseData.block_status_id,
        originalData: { 
          ...prev.originalData, 
          login: responseData.login || prev.originalData.login,
          email: responseData.email || prev.originalData.email,
          verification_status_id: responseData.verification_status_id,
          block_status_id: responseData.block_status_id
        },
        password: '' // Сбрасываем поле пароля после сохранения
      }));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Ошибка при обновлении пользователя:', err);
      setErrors({ general: err.message || 'Не удалось обновить данные пользователя' });
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

  if (errors.general && !form) {
    return (
      <div className="admin-user-edit">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Ошибка загрузки</h2>
          <p>{errors.general}</p>
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

      {errors.general && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{errors.general}</span>
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
            <label>Логин</label>
            <input
              value={form.login}
              onChange={(e) => handleChange('login', e.target.value)}
              onBlur={() => handleBlur('login')}
              className={getFieldError('login') && touched.login ? 'input-error' : ''}
              placeholder={`Текущий`}
            />
            {getFieldError('login') && touched.login && (
              <span className="field-error">{getFieldError('login')}</span>
            )}
            <div className="form-hint">
              {form.login.trim() === '' 
                ? `Оставьте пустым, чтобы сохранить текущий логин` 
                : 'Введите новый логин (минимум 3 символа)'}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getFieldError('email') && touched.email ? 'input-error' : ''}
              placeholder={`Текущий: ${form.originalData.email}`}
            />
            {getFieldError('email') && touched.email && (
              <span className="field-error">{getFieldError('email')}</span>
            )}
            <div className="form-hint">
              {form.email.trim() === '' 
                ? `Оставьте пустым, чтобы сохранить текущий email: ${form.originalData.email}` 
                : 'Введите новый email'}
            </div>
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
              onBlur={() => handleBlur('password')}
              className={getFieldError('password') && touched.password ? 'input-error' : ''}
              placeholder="Введите новый пароль (минимум 6 символов)"
            />
            {getFieldError('password') && touched.password && (
              <span className="field-error">{getFieldError('password')}</span>
            )}
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
          disabled={!isFormValid() || saving}
          className={`save-btn ${(!isFormValid() || saving) ? 'button-disabled' : ''}`}
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