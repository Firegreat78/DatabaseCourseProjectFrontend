// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const userType = localStorage.getItem('userType');
    const staffId = localStorage.getItem('staffId');

    if (token && userId) {
      setUser({
        id: Number(userId),
        role: userType === 'staff' ? Number(role) : role,
        type: userType,
        staff_id: staffId ? Number(staffId) : null,
        user_id: userType === 'client' ? Number(userId) : null,
        token,
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const { token, role, staff_id, user_id } = userData;

    let userType, idToSave, roleToSave;

    if (staff_id !== undefined) {
      userType = 'staff';
      idToSave = staff_id;
      roleToSave = Number(role);
    } else if (user_id !== undefined && role === 'user') {
      userType = 'client';
      idToSave = user_id;
      roleToSave = 'user';
    } else {
      throw new Error('Некорректные данные авторизации');
    }

    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', String(idToSave));
    localStorage.setItem('role', String(roleToSave));
    localStorage.setItem('userType', userType);
    if (userType === 'staff') {
      localStorage.setItem('staffId', String(staff_id));
    }

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