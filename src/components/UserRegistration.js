import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserRegistration.css';

const API_BASE_URL = 'http://localhost:8000';

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
      const response = await fetch(`${API_BASE_URL}/api/public/register/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: login.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
  let message = 'Ошибка регистрации';

  if (Array.isArray(data.detail)) {
    message = data.detail
      .map(err => err.msg)
      .join(', ');
  } else if (typeof data.detail === 'string') {
    message = data.detail;
  }

  throw new Error(message);
}


      alert('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login');

    } catch (err) {
      setError(err.message || 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-registration-page">
      <main className="main-content">
        <div className="registration-container">
          <h1>Регистрация</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="registration-input-group">
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

            <div className="registration-input-group">
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

            <div className="registration-input-group">
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

            <div className="registration-input-group">
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

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Регистрация...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </button>
          </form>

          <div className="login-link">
            Уже зарегистрированы? <Link to="/login">Вход</Link>
          </div>
          
          <div className="footer-link">
            <Link to="/employee-login">Вход для сотрудников</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserRegistration;