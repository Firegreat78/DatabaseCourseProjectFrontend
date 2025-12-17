// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, role, token, isStaff }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Восстановление сессии при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');        // может быть строка или число в виде строки
    const isStaff = localStorage.getItem('isStaff') === 'true';

    if (token && userId) {
      setUser({
        id: userId,
        role: role,              // оставляем как есть (строка)
        token,
        isStaff,                 // флаг, сотрудник или обычный пользователь
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const { token, user_id, role = 'user', isStaff = false } = userData;

    // Сохраняем в localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', user_id);
    localStorage.setItem('role', role);                    // роль как строка (для клиентов) или число как строка (для staff)
    localStorage.setItem('isStaff', isStaff ? 'true' : 'false');

    // Сохраняем в состояние
    setUser({
      id: user_id,
      role: role,          // оставляем как пришло
      token,
      isStaff,
    });
  };

  const employee_logout = () =>{
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/employee-login');
  }

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('isStaff');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, employee_logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};