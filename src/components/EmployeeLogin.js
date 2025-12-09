// src/EmployeeLogin.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EmployeeLogin.css';

const API_BASE_URL = 'http://localhost:8000';

const EmployeeLogin = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Неизвестная ошибка');
      }

      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('role', 'staff');
      navigate('/employee/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="employee-login-page">
      <header className="header">
        <div className="logo">
          <span className="dollar-sign">$</span>
          <span className="logo-text">МИД</span>
        </div>
      </header>

      <main className="main-content">
        <div className="login-container">
          <h1>Вход для сотрудников</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder=" "
                required
                disabled={isLoading}
              />
              <label>Логин</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                disabled={isLoading}
              />
              <label>Пароль</label>
            </div>
            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'ВХОД...' : 'ВОЙТИ'}
            </button>
          </form>

          <div className="client-link">
            Вход для клиентов? <Link to="/login">Вход</Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <span className="footer-text">Техническая поддержка: help@mid.gov</span>
      </footer>
    </div>
  );
};

export default EmployeeLogin;