// src/components/employees/AdminEmployeeCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminEmployeeEdit.css';

const API_BASE_URL = 'http://localhost:8000';

const AdminEmployeeCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    contract_number: '',
    rights_level: '3',
    employment_status_id: '1',
  });
  const [statuses, setStatuses] = useState([]);
  const [errors, setErrors] = useState({}); // Для хранения ошибок валидации
  const [isSubmitting, setIsSubmitting] = useState(false); // Блокировка кнопки при отправке
  const [touched, setTouched] = useState({}); // Отслеживание "тронутых" полей
  const [formSubmitted, setFormSubmitted] = useState(false); // Флаг первой отправки формы

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/employment_status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        const data = await response.json();
        setStatuses(data);
      } catch (err) {
        console.error('Ошибка загрузки статусов:', err);
        alert('Не удалось загрузить статусы трудоустройства');
      }
    };
    fetchStatuses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Отмечаем поле как "тронутое"
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Очищаем ошибку для этого поля если она есть
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Валидация поля при потере фокуса
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  // Валидация отдельного поля
  const validateField = (fieldName) => {
    if (!touched[fieldName] && !formSubmitted) return;

    const newErrors = { ...errors };
    let hasError = false;

    switch (fieldName) {
      case 'login':
        if (!formData.login.trim()) {
          newErrors.login = 'Логин обязателен';
          hasError = true;
        } else if (formData.login.length < 3) {
          newErrors.login = 'Логин должен содержать минимум 3 символа';
          hasError = true;
        } else {
          delete newErrors.login;
        }
        break;
        
      case 'password':
        if (!formData.password.trim()) {
          newErrors.password = 'Пароль обязателен';
          hasError = true;
        } else if (formData.password.length < 6) {
          newErrors.password = 'Пароль должен содержать минимум 6 символов';
          hasError = true;
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'contract_number':
        if (!formData.contract_number.trim()) {
          newErrors.contract_number = 'Номер договора обязателен';
          hasError = true;
        } else {
          delete newErrors.contract_number;
        }
        break;
        
      default:
        break;
    }

    if (hasError || (errors[fieldName] && !hasError)) {
      setErrors(newErrors);
    }
  };

  // Полная валидация формы перед отправкой
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Проверка логина
    if (!formData.login.trim()) {
      newErrors.login = 'Логин обязателен';
      isValid = false;
    } else if (formData.login.length < 3) {
      newErrors.login = 'Логин должен содержать минимум 3 символа';
      isValid = false;
    }

    // Проверка пароля
    if (!formData.password.trim()) {
      newErrors.password = 'Пароль обязателен';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    // Проверка номера договора (теперь без ограничения на цифры)
    if (!formData.contract_number.trim()) {
      newErrors.contract_number = 'Номер договора обязателен';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      login: true,
      password: true,
      contract_number: true
    });
    setFormSubmitted(true);
    
    return isValid;
  };

  const handleCreate = async () => {
    if (!validateForm()) return; // Прерываем отправку при ошибках валидации
    
    setIsSubmitting(true); // Блокируем кнопку
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // Обработка ошибок с сервера
        if (responseData.detail === "Логин уже занят") {
          setErrors(prev => ({ ...prev, login: "Этот логин уже занят" }));
          setTouched(prev => ({ ...prev, login: true }));
        } else {
          throw new Error(responseData.detail || 'Ошибка при создании');
        }
        return;
      }

      alert('Сотрудник успешно создан');
      navigate('/admin/main');
    } catch (err) {
      console.error('Ошибка создания сотрудника:', err);
      alert(`Ошибка: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Проверка заполнения обязательных полей для активации кнопки
  const isFormValid = () => {
    return (
      formData.login.trim() &&
      formData.password.trim() &&
      formData.contract_number.trim() &&
      Object.keys(errors).length === 0
    );
  };

  return (
    <div className="admin-employee-edit">
      <h1>Создание нового сотрудника</h1>

      <div className="form-group">
        <label>Логин *</label>
        <input
          name="login"
          value={formData.login}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.login && touched.login ? 'input-error' : ''}
          placeholder="Введите логин (минимум 3 символа)"
        />
        {errors.login && touched.login && <span className="error-message">{errors.login}</span>}
      </div>

      <div className="form-group">
        <label>Пароль *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.password && touched.password ? 'input-error' : ''}
          placeholder="Введите пароль (минимум 6 символов)"
        />
        {errors.password && touched.password && <span className="error-message">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label>Номер договора *</label>
        <input
          name="contract_number"
          value={formData.contract_number}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.contract_number && touched.contract_number ? 'input-error' : ''}
          placeholder="Введите номер договора"
        />
        {errors.contract_number && touched.contract_number && <span className="error-message">{errors.contract_number}</span>}
      </div>

      <div className="form-group">
        <label>Уровень прав</label>
        <select
          name="rights_level"
          value={formData.rights_level}
          onChange={handleChange}
        >
          {user.role === '1' && (
            <>
              <option value="1">Мегаадмин</option>
              <option value="2">Админ</option>
            </>
          )}
          <option value="3">Брокер</option>
          <option value="4">Верификатор</option>
        </select>
      </div>

      <div className="form-group">
        <label>Статус трудоустройства</label>
        <select
          name="employment_status_id"
          value={formData.employment_status_id}
          onChange={handleChange}
        >
          {statuses.map(s => (
            <option key={s.id} value={s.id}>{s.status}</option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleCreate}
        disabled={!isFormValid() || isSubmitting}
        className={(!isFormValid() || isSubmitting) ? 'button-disabled' : ''}
      >
        {isSubmitting ? 'Создание...' : 'Создать сотрудника'}
      </button>
      
      <p className="required-note">* Обязательные поля</p>
    </div>
  );
};

export default AdminEmployeeCreate;