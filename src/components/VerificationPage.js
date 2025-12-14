// src/components/VerificationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';
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

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    series: '',
    number: '',
    gender: 'м',
    birthDate: '',
    birthPlace: '',
    issueDate: '',
    issuedBy: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Исправлено: добавлена закрывающая скобка
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGender = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Мок-отправка
      await new Promise(res => setTimeout(res, 1800));

      setSuccess('Верификация успешно отправлена! Ожидайте подтверждения в течение 1–3 дней.');
      // setTimeout(() => navigate('/profile'), 3000);
    } catch (err) {
      setError('Ошибка отправки данных. Попробуйте позже.');
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
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                <label>Фамилия</label>
              </div>
              <div className="input-group">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <label>Имя</label>
              </div>
              <div className="input-group">
                <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} required />
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