import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AdminEmployeeEdit.css';
import { useAuth } from '../../context/AuthContext';

const roleOptions = [
  { value: 1, label: 'Мегаадминистратор' },
  { value: 2, label: 'Администратор' },
  { value: 3, label: 'Брокер' },
  { value: 4, label: 'Верификатор' },
  { value: 5, label: 'Система'}
];

const API_BASE_URL = 'http://localhost:8000';

const AdminEmployeeEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Состояния для валидации
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  
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
          role: data.rights_level,
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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
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
    
    // Очищаем серверные ошибки при изменении поля
    if (serverErrors[field]) {
      setServerErrors(prev => {
        const newServerErrors = { ...prev };
        delete newServerErrors[field];
        return newServerErrors;
      });
    }
  };

  // Валидация поля при потере фокуса
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Валидация отдельного поля
  const validateField = (fieldName) => {
    if (!touched[fieldName] && !formSubmitted) return;

    const newErrors = { ...errors };
    let hasError = false;

    switch (fieldName) {
      case 'login':
        if (!form.login || !form.login.trim()) {
          newErrors.login = 'Логин обязателен';
          hasError = true;
        } else if (form.login.length < 3) {
          newErrors.login = 'Логин должен содержать минимум 3 символа';
          hasError = true;
        } else {
          delete newErrors.login;
        }
        break;
        
      case 'password':
        // Пароль не обязателен при редактировании, но если введен - проверяем длину
        if (form.password && form.password.trim() && form.password.length < 6) {
          newErrors.password = 'Пароль должен содержать минимум 6 символов';
          hasError = true;
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'contractNumber':
        if (!form.contractNumber || !form.contractNumber.trim()) {
          newErrors.contractNumber = 'Номер договора обязателен';
          hasError = true;
        } else {
          delete newErrors.contractNumber;
        }
        break;
        
      case 'role':
        if (!form.role) {
          newErrors.role = 'Уровень прав обязателен';
          hasError = true;
        } else {
          delete newErrors.role;
        }
        break;
        
      case 'employmentStatus':
        if (!form.employmentStatus) {
          newErrors.employmentStatus = 'Статус трудоустройства обязателен';
          hasError = true;
        } else {
          delete newErrors.employmentStatus;
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
    if (!form.login || !form.login.trim()) {
      newErrors.login = 'Логин обязателен';
      isValid = false;
    } else if (form.login.length < 3) {
      newErrors.login = 'Логин должен содержать минимум 3 символа';
      isValid = false;
    }

    // Проверка пароля (только если введен)
    if (form.password && form.password.trim() && form.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    // Проверка номера договора
    if (!form.contractNumber || !form.contractNumber.trim()) {
      newErrors.contractNumber = 'Номер договора обязателен';
      isValid = false;
    }

    // Проверка уровня прав
    if (!form.role) {
      newErrors.role = 'Уровень прав обязателен';
      isValid = false;
    }

    // Проверка статуса трудоустройства
    if (!form.employmentStatus) {
      newErrors.employmentStatus = 'Статус трудоустройства обязателен';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      login: true,
      password: true,
      contractNumber: true,
      role: true,
      employmentStatus: true
    });
    setFormSubmitted(true);
    
    return isValid;
  };

  // Функция для объединения ошибок валидации и серверных ошибок
  const getFieldError = (fieldName) => {
    return serverErrors[fieldName] || errors[fieldName];
  };

  const handleSave = async () => {
    if (!validateForm()) return; // Прерываем отправку при ошибках валидации
    
    setSaving(true);
    setServerErrors({});
    
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
        
        // Обработка ошибок с сервера
        if (errorData.detail === "Логин уже занят") {
          setServerErrors(prev => ({ ...prev, login: "Этот логин уже занят" }));
          setTouched(prev => ({ ...prev, login: true }));
          throw new Error("Логин уже занят");
        } else if (errorData.detail === "Номер договора уже существует") {
          setServerErrors(prev => ({ ...prev, contractNumber: "Этот номер договора уже используется" }));
          setTouched(prev => ({ ...prev, contractNumber: true }));
          throw new Error("Номер договора уже существует");
        } else if (errorData.detail && typeof errorData.detail === 'string') {
          throw new Error(errorData.detail);
        } else if (errorData.detail) {
          // Обработка ошибок валидации Pydantic
          const newServerErrors = {};
          Object.keys(errorData.detail).forEach(key => {
            const fieldName = key;
            const errorMessage = errorData.detail[key].msg || errorData.detail[key];
            newServerErrors[fieldName] = errorMessage;
            setTouched(prev => ({ ...prev, [fieldName]: true }));
          });
          setServerErrors(newServerErrors);
          throw new Error("Ошибки валидации данных");
        } else {
          throw new Error(errorData.detail || `Ошибка ${response.status}: ${response.statusText}`);
        }
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
        // Сбрасываем ошибки после успешного сохранения
        setErrors({});
        setServerErrors({});
        setFormSubmitted(false);
      }
      
    } catch (err) {
      console.error('Ошибка обновления сотрудника:', err);
      if (!serverErrors.login && !serverErrors.contractNumber) {
        alert(err.message || 'Не удалось обновить сотрудника');
      }
    } finally {
      setSaving(false);
    }
  };

  // Проверка заполнения обязательных полей для активации кнопки
  const isFormValid = () => {
    return (
      form &&
      form.login && form.login.trim() &&
      form.contractNumber && form.contractNumber.trim() &&
      form.role &&
      form.employmentStatus &&
      Object.keys(errors).length === 0
    );
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!form) return <div>Не удалось загрузить данные сотрудника</div>;

  return (
    <div className="admin-employee-edit">
      <h1>Редактирование сотрудника</h1>

      <div className="form-group">
        <label>ID</label>
        <input value={form.id} disabled />
      </div>

      <div className="form-group">
        <label>Логин *</label>
        <input
          value={form.login || ''}
          onChange={(e) => handleChange('login', e.target.value)}
          onBlur={() => handleBlur('login')}
          className={getFieldError('login') && (touched.login || formSubmitted) ? 'input-error' : ''}
        />
        {getFieldError('login') && (touched.login || formSubmitted) && (
          <span className="error-message">{getFieldError('login')}</span>
        )}
      </div>

      <div className="form-group">
        <label>Пароль</label>
        <input
          type="password"
          placeholder="Оставьте пустым, чтобы не менять"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          className={getFieldError('password') && (touched.password || formSubmitted) ? 'input-error' : ''}
        />
        {getFieldError('password') && (touched.password || formSubmitted) && (
          <span className="error-message">{getFieldError('password')}</span>
        )}
      </div>

      <div className="form-group">
        <label>Номер договора *</label>
        <input
          value={form.contractNumber || ''}
          onChange={(e) => handleChange('contractNumber', e.target.value)}
          onBlur={() => handleBlur('contractNumber')}
          className={getFieldError('contractNumber') && (touched.contractNumber || formSubmitted) ? 'input-error' : ''}
        />
        {getFieldError('contractNumber') && (touched.contractNumber || formSubmitted) && (
          <span className="error-message">{getFieldError('contractNumber')}</span>
        )}
      </div>

      <div className="form-group select-with-arrow">
        <label>Статус трудоустройства *</label>
        <select
          value={form.employmentStatus || ''}
          onChange={(e) => handleChange('employmentStatus', e.target.value)}
          onBlur={() => handleBlur('employmentStatus')}
          className={getFieldError('employmentStatus') && (touched.employmentStatus || formSubmitted) ? 'input-error' : ''}
        >
          <option value="">Выберите статус</option>
          <option value="1">Активен</option>
          <option value="2">Уволен</option>
          <option value="3">Отпуск</option>
        </select>
        {getFieldError('employmentStatus') && (touched.employmentStatus || formSubmitted) && (
          <span className="error-message">{getFieldError('employmentStatus')}</span>
        )}
      </div>

      <div className="form-group select-with-arrow">
        <label>Уровень прав *</label>
        <select
          value={form.role || ''}
          onChange={(e) => handleChange('role', e.target.value)}
          onBlur={() => handleBlur('role')}
          className={getFieldError('role') && (touched.role || formSubmitted) ? 'input-error' : ''}
        >
          <option value="">Выберите роль</option>
          {availableRoles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {getFieldError('role') && (touched.role || formSubmitted) && (
          <span className="error-message">{getFieldError('role')}</span>
        )}
      </div>

      <button 
        onClick={handleSave} 
        disabled={saving || !isFormValid()}
        className={(!isFormValid() || saving) ? 'button-disabled' : ''}
      >
        {saving ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
      
      <p className="required-note">* Обязательные поля</p>
    </div>
  );
};

export default AdminEmployeeEdit;