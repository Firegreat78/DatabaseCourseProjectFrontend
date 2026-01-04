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
    rights_level: '',
    employment_status_id: '',
  });

  const [rightsLevels, setRightsLevels] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =======================
     Загрузка справочников
     ======================= */
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const [rightsRes, statusRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/rights_levels`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/employment_statuses`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }),
        ]);

        if (!rightsRes.ok) throw new Error('Ошибка загрузки уровней прав');
        if (!statusRes.ok) throw new Error('Ошибка загрузки статусов');

        const rightsData = await rightsRes.json();
        const statusData = await statusRes.json();

        setRightsLevels(rightsData);
        setStatuses(statusData);
      } catch (err) {
        console.error(err);
        alert('Не удалось загрузить справочники');
      }
    };

    fetchDictionaries();
  }, []);

  /* =======================
     Обработчики формы
     ======================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));

    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    if (serverErrors[name]) {
      setServerErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  /* =======================
     Валидация
     ======================= */
  const validateField = (field) => {
    if (!touched[field] && !formSubmitted) return;

    const newErrors = { ...errors };

    switch (field) {
      case 'login':
        if (!formData.login.trim()) {
          newErrors.login = 'Логин обязателен';
        } else if (formData.login.length < 3) {
          newErrors.login = 'Минимум 3 символа';
        } else {
          delete newErrors.login;
        }
        break;

      case 'password':
        if (!formData.password.trim()) {
          newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Минимум 6 символов';
        } else {
          delete newErrors.password;
        }
        break;

      case 'contract_number':
        if (!formData.contract_number.trim()) {
          newErrors.contract_number = 'Номер договора обязателен';
        } else {
          delete newErrors.contract_number;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.login.trim()) newErrors.login = 'Логин обязателен';
    if (!formData.password.trim()) newErrors.password = 'Пароль обязателен';
    if (!formData.contract_number.trim()) newErrors.contract_number = 'Номер договора обязателен';
    if (!formData.rights_level) newErrors.rights_level = 'Выберите роль';
    if (!formData.employment_status_id) newErrors.employment_status_id = 'Выберите статус';

    setErrors(newErrors);
    setTouched({
      login: true,
      password: true,
      contract_number: true,
      rights_level: true,
      employment_status_id: true,
    });
    setFormSubmitted(true);

    return Object.keys(newErrors).length === 0;
  };

  /* =======================
     Создание сотрудника
     ======================= */
  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail === 'Логин уже занят') {
          setServerErrors({ login: 'Этот логин уже занят' });
        } else if (data.detail === 'Номер договора уже существует') {
          setServerErrors({ contract_number: 'Этот номер договора уже используется' });
        } else {
          alert(data.detail || 'Ошибка создания');
        }
        return;
      }

      alert('Сотрудник успешно создан');
      navigate('/admin/main');
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании сотрудника');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field) => serverErrors[field] || errors[field];

  /* =======================
     Render
     ======================= */
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
          className={getFieldError('login') ? 'input-error' : ''}
        />
        {getFieldError('login') && <span className="error-message">{getFieldError('login')}</span>}
      </div>

      <div className="form-group">
        <label>Пароль *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={getFieldError('password') ? 'input-error' : ''}
        />
        {getFieldError('password') && <span className="error-message">{getFieldError('password')}</span>}
      </div>

      <div className="form-group">
        <label>Номер договора *</label>
        <input
          name="contract_number"
          value={formData.contract_number}
          onChange={handleChange}
          onBlur={handleBlur}
          className={getFieldError('contract_number') ? 'input-error' : ''}
        />
        {getFieldError('contract_number') && (
          <span className="error-message">{getFieldError('contract_number')}</span>
        )}
      </div>

      <div className="form-group select-with-arrow">
        <label>Уровень прав *</label>
        <select
          name="rights_level"
          value={formData.rights_level}
          onChange={handleChange}
          className={getFieldError('rights_level') ? 'input-error' : ''}
        >
          <option value="">Выберите роль</option>
          {rightsLevels
            .filter(level => {
              const role = Number(user?.role);
              if (role === 1) return level.id !== 1;
              if (role === 2) return level.id === 3 || level.id === 4;
              return false;
            })
            .map(level => (
              <option key={level.id} value={level.id}>
                {level.rights_level}
              </option>
            ))}
        </select>
        {getFieldError('rights_level') && (
          <span className="error-message">{getFieldError('rights_level')}</span>
        )}
      </div>

      <div className="form-group select-with-arrow">
        <label>Статус трудоустройства *</label>
        <select
          name="employment_status_id"
          value={formData.employment_status_id}
          onChange={handleChange}
          className={getFieldError('employment_status_id') ? 'input-error' : ''}
        >
          <option value="">Выберите статус</option>
          {statuses.map(status => (
            <option key={status.id} value={status.id}>
              {status.status}
            </option>
          ))}
        </select>
        {getFieldError('employment_status_id') && (
          <span className="error-message">{getFieldError('employment_status_id')}</span>
        )}
      </div>

      <button
        onClick={handleCreate}
        disabled={isSubmitting}
        className={isSubmitting ? 'button-disabled' : ''}
      >
        {isSubmitting ? 'Создание...' : 'Создать сотрудника'}
      </button>

      <p className="required-note">* Обязательные поля</p>
    </div>
  );
};

export default AdminEmployeeCreate;
