// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, role, type ("staff"|"client"), staff_id, user_id, token }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Восстановление сессии при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const userType = localStorage.getItem('userType'); // "staff" или "client"
    const staffId = localStorage.getItem('staffId');

    if (token && userId) {
      setUser({
        id: Number(userId),
        role: userType === 'staff' ? Number(role) : role, // для staff — число, для клиента — "user"
        type: userType,
        staff_id: staffId ? Number(staffId) : null,
        user_id: userType === 'client' ? Number(userId) : null,
        token,
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const { token, role, staff_id, user_id } = userData; // backend кладёт в токен sub (логин), role, staff_id или user_id

    let userType, idToSave, roleToSave;

    if (staff_id !== undefined) {
      userType = 'staff';
      idToSave = staff_id;
      roleToSave = Number(role); // роль сотрудника всегда число
    } else if (user_id !== undefined && role === 'user') {
      userType = 'client';
      idToSave = user_id;
      roleToSave = 'user';
    } else {
      throw new Error('Некорректные данные авторизации');
    }

    // Сохраняем в localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', String(idToSave));           // общий id
    localStorage.setItem('role', String(roleToSave));
    localStorage.setItem('userType', userType);
    if (userType === 'staff') {
      localStorage.setItem('staffId', String(staff_id));
    }

    // Сохраняем в состояние
    setUser({
      id: idToSave,
      role: roleToSave,
      type: userType,
      staff_id: userType === 'staff' ? staff_id : null,
      user_id: userType === 'client' ? user_id : null,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userType');
    localStorage.removeItem('staffId');
    setUser(null);
    navigate('/login');
  };

  const employee_logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userType');
    localStorage.removeItem('staffId');
    setUser(null);
    navigate('/employee-login');
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