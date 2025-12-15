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

      // 🔑 КЛЮЧЕВОЕ МЕСТО
      login({
        token: data.access_token,
        user_id: data.user_id,
        role: data.role,
      });

      // редирект по роли
      const role = Number(data.role);
      if (role === 1 || role === 2) {
        navigate('/admin/main');
      } else if (role === 3) {
        navigate('/broker/main');
      } else if (role === 4) {
        navigate('/verifier/main');
      } else {
        navigate('/employee/dashboard');
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

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              placeholder="Логин"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
            />
            <button disabled={isLoading}>
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
