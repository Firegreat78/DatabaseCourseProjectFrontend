// src/components/VerificationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Calendar,
  MapPin,
  Building,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import './VerificationPage.css';

const VerificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    series: '',
    number: '',
    gender: 'м',
    birthDate: '',
    birthPlace: '',
    registrationPlace: '',
    issueDate: '',
    issuedBy: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['lastName', 'firstName', 'middleName'].includes(name)) {
      const cleanedValue = value.replace(/[^А-Яа-яЁё\-\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleGender = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };
  const nameRegex = /^[А-Яа-яЁё\- ]+$/;
  const digitsOnly = /^\d+$/;
  const calculateAge = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    let years = to.getFullYear() - from.getFullYear();
    const monthDiff = to.getMonth() - from.getMonth();
    const dayDiff = to.getDate() - from.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      years--;
    }
    return years;
  };
  const validateForm = () => {
    if (!nameRegex.test(formData.lastName) || formData.lastName.length < 2) {
      return 'Фамилия должна содержать только кириллицу и быть не короче 2 символов';
    }
    if (!nameRegex.test(formData.firstName) || formData.firstName.length < 2) {
      return 'Имя должно содержать только кириллицу и быть не короче 2 символов';
    }
    if (!nameRegex.test(formData.middleName) || formData.middleName.length < 2) {
      return 'Отчество должно содержать только кириллицу и быть не короче 2 символов';
    }
    if (!digitsOnly.test(formData.series) || formData.series.length !== 4) {
      return 'Серия паспорта должна состоять из 4 цифр';
    }
    if (!digitsOnly.test(formData.number) || formData.number.length !== 6) {
      return 'Номер паспорта должен состоять из 6 цифр';
    }
    if (!['м', 'ж'].includes(formData.gender)) {
      return 'Некорректно указан пол';
    }
    const birthDate = new Date(formData.birthDate);
    const issueDate = new Date(formData.issueDate);
    const now = new Date();
    if (issueDate < birthDate) {
      return 'Дата выдачи паспорта не может быть меньше даты рождения';
    }
    if (issueDate > now) {
      return 'Дата выдачи паспорта не может быть в будущем';
    }
    if (birthDate > now) {
      return 'Дата рождения не может быть в будущем';
    }

    const ageAtIssue = calculateAge(formData.birthDate, formData.issueDate);
    if (ageAtIssue < 14) {
      return 'Паспорт не может быть выдан лицу, которому не исполнилось 14 лет';
    }
    const currentAge = calculateAge(formData.birthDate, new Date());
    if (currentAge < 18) {
      return 'Регистрация возможна только для лиц, достигших совершеннолетия';
    }
    if (formData.birthPlace.length < 5) {
      return 'Место рождения указано некорректно';
    }
    if (formData.registrationPlace.length < 5) {
      return 'Место прописки указано некорректно';
    }
    if (formData.issuedBy.length < 5) {
      return 'Поле "Кем выдан" заполнено некорректно';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (!user?.token) {
        setError('Пользователь не авторизован');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/user/passport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка сервера');
      }

      setSuccess('Верификация успешно отправлена! Ожидайте подтверждения в течение 1–3 дней.');
    } catch (err) {
      setError(err.message || 'Ошибка отправки данных. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="verification-page">
      <AppHeader />

      <main className="verification-content">
        <div className="verification-card">
          <div className="card-header">
            <button onClick={() => navigate(-1)} className="back-btn">
              <ArrowLeft size={22} />
            </button>
            <h1>Верификация аккаунта</h1>
            <p>Заполните паспортные данные для получения возможности покупать и продавать акции у брокера</p>
          </div>

          {error && (
            <div className="alert error">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="alert success">
              <CheckCircle2 size={20} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="verification-form">
            <div className="form-grid">
              <div className="input-group">
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Иванов"
                />
                <label>Фамилия</label>
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Иван"
                />
                <label>Имя</label>
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  name="middleName" 
                  value={formData.middleName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Иванович"
                />
                <label>Отчество</label>
              </div>
            </div>

            <div className="passport-row">
              <div className="input-group short">
                <input type="text" name="series" value={formData.series} onChange={handleChange} maxLength="4" required />
                <label>Серия</label>
              </div>
              <div className="input-group long">
                <input type="text" name="number" value={formData.number} onChange={handleChange} maxLength="6" required />
                <label>Номер</label>
              </div>
            </div>

            <div className="gender-group">
              <span className="gender-label">Пол</span>
              <div className="gender-buttons">
                <button type="button" className={formData.gender === 'м' ? 'active' : ''} onClick={() => handleGender('м')}>
                  Мужской
                </button>
                <button type="button" className={formData.gender === 'ж' ? 'active' : ''} onClick={() => handleGender('ж')}>
                  Женский
                </button>
              </div>
            </div>

            <div className="input-group">
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
              <label><Calendar size={18} /> Дата рождения</label>
            </div>

            <div className="input-group">
              <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} required />
              <label><MapPin size={18} /> Место рождения</label>
            </div>

            <div className="input-group">
              <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
              <label><Calendar size={18} /> Дата выдачи паспорта</label>
            </div>

            <div className="input-group">
              <input type="text" name="issuedBy" value={formData.issuedBy} onChange={handleChange} required />
              <label><Building size={18} /> Кем выдан</label>
            </div>
            <div className="input-group">
              <input
                type="text" name="registrationPlace" value={formData.registrationPlace} onChange={handleChange} required
              />
              <label><Building size={18} /> Место прописки</label>
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? (
                <>
                  <Loader2 className="spin" size={20} />
                  Отправка...
                </>
              ) : (
                'Отправить на проверку'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default VerificationPage;