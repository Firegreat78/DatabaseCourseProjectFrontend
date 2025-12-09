// src/UserRegistration.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserRegistration.css';

const UserRegistration = () => {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Клиентская валидация
    if (password !== confirmPassword) {
      setError('Пароли не совпадают!');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // FastAPI возвращает detail в случае ошибки
        throw new Error(data.detail || 'Ошибка регистрации');
      }

      // Успешная регистрация
      alert('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login'); // Перенаправляем на страницу входа

    } catch (err) {
      setError(err.message || 'Произошла ошибка при регистрации');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <header className="header">
        <div className="logo">
          <span className="dollar-sign">$</span>
          <span className="logo-text">МИД</span>
        </div>
      </header>

      <main className="main-content">
        <div className="registration-container">
          <h1>Регистрация</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder=" "
                required
                disabled={loading}
              />
              <label>Логин</label>
            </div>

            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                disabled={loading}
              />
              <label>Email</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                minLength={6}
                disabled={loading}
              />
              <label>Пароль</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                required
                disabled={loading}
              />
              <label>Подтвердите пароль</label>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </button>
          </form>

          <div className="login-link">
            Уже зарегистрированы? <Link to="/login">Вход</Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <Link to="/employee-login">Вход для сотрудников</Link>
      </footer>
    </div>
  );
};

export default UserRegistration;