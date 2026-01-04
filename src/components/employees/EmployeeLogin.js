// src/pages/EmployeeLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './EmployeeLogin.css';

const API_BASE_URL = 'http://localhost:8000';

const EmployeeLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: loginValue,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка входа');
      }

      // Новый формат для AuthContext.login — передаём staff_id и role
      login({
        token: data.access_token,
        staff_id: data.user_id,   // на бэкенде для сотрудников это staff_id
        role: data.role,          // число (1-5)
      });

      // Редирект по роли
      const roleNum = Number(data.role);
      if (isNaN(roleNum)) {
        throw new Error('Неизвестная роль');
      }

      if (roleNum === 1 || roleNum === 2) {
        navigate('/admin/main');
      } else if (roleNum === 3) {
        navigate('/broker/main');
      } else if (roleNum === 4) {
        navigate('/verifier/main');
      } else {
        throw new Error('Недостаточно прав для входа');
      }
    } catch (err) {
      setError(err.message || 'Ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="employee-login-page">
      <main className="main-content">
        <div className="login-container">
          <h1>Вход для сотрудников</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              placeholder="Логин"
              required
              disabled={isLoading}
            />
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              disabled={isLoading}
            />
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'ВХОД...' : 'ВОЙТИ'}
            </button>
          </form>
          
          <div className="client-link">
            Вход для клиентов? <Link to="/login">Вход</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeLogin;