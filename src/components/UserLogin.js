import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserLogin.css';

const API_BASE_URL = 'http://localhost:8000';

const UserLogin = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginResponse = await fetch(`${API_BASE_URL}/api/login/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.detail || 'Неверный логин или пароль');
      }

      const token = loginData.access_token;
      const user_id = loginData.user_id;

      if (!token || !user_id) {
        throw new Error('Сервер не вернул необходимые данные');
      }

      const banResponse = await fetch(`${API_BASE_URL}/api/user_ban_status/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!banResponse.ok) {
        const banErr = await banResponse.json().catch(() => ({}));
        throw new Error(banErr.detail || 'Ошибка проверки статуса аккаунта');
      }

      const banData = await banResponse.json();

      if (banData.is_banned) {
        throw new Error('Ваш аккаунт заблокирован. Обратитесь в поддержку.');
      }

      authLogin({
        token,
        user_id,
        role: loginData.role || 'user',
      });
      
      // Перенаправление после успешного входа
      navigate('/user/main');

    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-login-page">
      <main className="main-content">
        <div className="login-container">
          <h1>Вход</h1>
          
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
                autoComplete="username"
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
                autoComplete="current-password"
              />
              <label>Пароль</label>
            </div>
            
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'ВХОД...' : 'ВОЙТИ'}
            </button>
          </form>
          
          <div className="registration-link">
            Не зарегистрированы? <Link to="/register">Регистрация</Link>
          </div>
          
          <div className="footer-link">
            <Link to="/employee-login">Вход для сотрудников</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserLogin;