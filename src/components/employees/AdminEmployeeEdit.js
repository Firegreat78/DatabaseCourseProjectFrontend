import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AdminEmployeeEdit.css';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000';

const AdminEmployeeEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [rightsLevels, setRightsLevels] = useState([]);
  const [employmentStatuses, setEmploymentStatuses] = useState([]);
  const [, setDictLoading] = useState(true);

  const isMegaAdmin = form?.id === 1;

  const extractErrorMessage = async (response) => {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      return `Ошибка ${response.status}`;
    }
    if (!errorData.detail) {
      return `Ошибка ${response.status}`;
    }
    if (typeof errorData.detail === 'string') {
      return errorData.detail;
    }
    if (Array.isArray(errorData.detail)) {
      return errorData.detail
        .map(err => err.msg)
        .join(', ');
    }
    if (typeof errorData.detail === 'object') {
      return Object.values(errorData.detail)
        .map(err => err.msg || err)
        .join(', ');
    }
    return 'Неизвестная ошибка';
  };

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
          const message = await extractErrorMessage(response);
          throw new Error(message);
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
        console.error('Ошибка загрузки сотрудника:', err.message);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id]);

  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const [rightsRes, statusRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/rights_levels`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
          }),
          fetch(`${API_BASE_URL}/api/admin/employment_statuses`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
          })
        ]);

        if (!rightsRes.ok) throw new Error('Ошибка загрузки уровней прав');
        if (!statusRes.ok) throw new Error('Ошибка загрузки статусов');

        const rightsData = await rightsRes.json();
        const statusData = await statusRes.json();

        console.log('Уровни прав:', rightsData);
        console.log('Статусы трудоустройства:', statusData);

        setRightsLevels(Array.isArray(rightsData) ? rightsData : []);
        setEmploymentStatuses(Array.isArray(statusData) ? statusData : []);
      } catch (err) {
        console.error('Ошибка загрузки справочников:', err);
        alert('Не удалось загрузить справочники');
      } finally {
        setDictLoading(false);
      }
    };

    fetchDictionaries();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
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

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!form.login || !form.login.trim()) {
      newErrors.login = 'Логин обязателен';
      isValid = false;
    } else if (form.login.length < 3) {
      newErrors.login = 'Логин должен содержать минимум 3 символа';
      isValid = false;
    }
    if (form.password && form.password.trim() && form.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }
    if (!form.contractNumber || !form.contractNumber.trim()) {
      newErrors.contractNumber = 'Номер договора обязателен';
      isValid = false;
    }
    if (!form.role) {
      newErrors.role = 'Уровень прав обязателен';
      isValid = false;
    }
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

  const getFieldError = (fieldName) => {
    return serverErrors[fieldName] || errors[fieldName];
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setServerErrors({});
    
    try {
      const requestData = {};
      
      if (form.login !== undefined && form.login !== '') {
        requestData.login = form.login;
      }
      
      if (form.password && form.password.trim() !== '') {
        requestData.password = form.password;
      }
      
      if (form.contractNumber !== undefined) {
        requestData.contract_number = form.contractNumber;
      }
      
      if (isMegaAdmin) {
        requestData.rights_level = "1";
      } else if (form.role !== undefined) {
        requestData.rights_level = String(form.role);
      }
      
      if (form.employmentStatus !== undefined) {
        requestData.employment_status_id = parseInt(form.employmentStatus);
      }

      console.log('Отправляемые данные:', requestData);

      const response = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const result = await response.json();
      alert(result.message || 'Сотрудник успешно обновлён');
      
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
          password: '',
          contractNumber: updatedData.contract_number,
          role: updatedData.rights_level,
          employmentStatus: updatedData.employment_status_id,
        });
        setErrors({});
        setServerErrors({});
        setFormSubmitted(false);
      }
      
    } catch (err) {
      console.error('Ошибка обновления сотрудника:', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

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
          {employmentStatuses
            .filter((status) => !isMegaAdmin || status.id !== 2)
            .map((status) => (
              <option key={status.id} value={status.id}>
                {status.status}
              </option>
            ))}
        </select>
        {getFieldError('employmentStatus') && (touched.employmentStatus || formSubmitted) && (
          <span className="error-message">{getFieldError('employmentStatus')}</span>
        )}
      </div>

      {!isMegaAdmin ? (
        <div className="form-group select-with-arrow">
          <label>Уровень прав *</label>
          <select
            value={form.role || ''}
            onChange={(e) => handleChange('role', e.target.value)}
            onBlur={() => handleBlur('role')}
            className={getFieldError('role') && (touched.role || formSubmitted) ? 'input-error' : ''}
          >
            <option value="">Выберите роль</option>
            {rightsLevels
              .filter((level) => {
                const roleNum = Number(user?.role);
                if (roleNum === 1) {
                  return level.id !== 1;
                }
                return level.id === 3 || level.id === 4;
              })
              .map((level) => (
                <option key={level.id} value={level.id}>
                  {level.rights_level}
                </option>
              ))}
          </select>
          {getFieldError('role') && (touched.role || formSubmitted) && (
            <span className="error-message">{getFieldError('role')}</span>
          )}
        </div>
      ) : (
        <div className="form-group">
          <label>Уровень прав</label>
          <input value="Мегаадминистратор" disabled />
          <input type="hidden" value={form.role || ''} />
        </div>
      )}

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