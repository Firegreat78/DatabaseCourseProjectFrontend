import React, { useState } from "react";
import AdminHeader from "./AdminHeader";
import { Search, ArrowRight, Filter, User, Mail, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useFetchTable } from "./useFetchTable";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import './AdminMain.css';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const { data: users, loading, error, refetch } = useFetchTable("user", token);
  const [query, setQuery] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'blocked', 'verified'

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;

  // Фильтрация данных
  let filteredUsers = users.slice();

  // Применение фильтров
  if (activeFilter === 'pending') {
    filteredUsers = filteredUsers.filter(u => u.verification_status_id === 3);
  } else if (activeFilter === 'blocked') {
    filteredUsers = filteredUsers.filter(u => u.block_status_id === 2);
  } else if (activeFilter === 'verified') {
    filteredUsers = filteredUsers.filter(u => u.verification_status_id === 2);
  }

  // Применение поиска
  filteredUsers = filteredUsers.filter(
    u =>
      u.login.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      String(u.id).includes(query)
  );

  // Сортировка по дате регистрации (новые сверху)
  filteredUsers.sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));

  const getVerificationStatusLabel = (statusId) => {
    switch(statusId) {
      case 1: return "Не верифицирован";
      case 2: return "Верифицирован";
      case 3: return "Ожидает верификации";
      default: return "Неизвестно";
    }
  };

  const getVerificationStatusIcon = (statusId) => {
    switch(statusId) {
      case 1: return <XCircle size={16} />;
      case 2: return <CheckCircle size={16} />;
      case 3: return <Clock size={16} />;
      default: return null;
    }
  };

  const getVerificationStatusClass = (statusId) => {
    switch(statusId) {
      case 1: return "not-verified";
      case 2: return "verified";
      case 3: return "pending";
      default: return "";
    }
  };

  const getBlockStatusLabel = (statusId) => {
    switch(statusId) {
      case 1: return "Активен";
      case 2: return "Заблокирован";
      default: return "Неизвестно";
    }
  };

  const getBlockStatusClass = (statusId) => {
    return statusId === 1 ? "active" : "blocked";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleUserClick = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleRefresh = () => {
    refetch && refetch();
  };

  // Статистика
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.verification_status_id === 3).length;
  const blockedUsers = users.filter(u => u.block_status_id === 2).length;
  const verifiedUsers = users.filter(u => u.verification_status_id === 2).length;

  return (
    <div className="admin-page">
      <AdminHeader />

      <div className="admin-content">
        <div className="page-header">
          <div className="header-left">
            <h1>Управление пользователями</h1>
            <button className="refresh-btn" onClick={handleRefresh}>
              Обновить
            </button>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Всего пользователей:</span>
              <span className="stat-value">{totalUsers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ожидают верификации:</span>
              <span className="stat-value pending">{pendingUsers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Верифицированы:</span>
              <span className="stat-value verified">{verifiedUsers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Заблокированы:</span>
              <span className="stat-value blocked">{blockedUsers}</span>
            </div>
          </div>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Поиск по ID, логину или email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <div 
              className={`filter-toggle ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <User size={16} />
              <span>Все пользователи</span>
            </div>
            
            <div 
              className={`filter-toggle ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pending')}
            >
              <Clock size={16} />
              <span>Ожидают верификации</span>
            </div>
            
            <div 
              className={`filter-toggle ${activeFilter === 'verified' ? 'active' : ''}`}
              onClick={() => setActiveFilter('verified')}
            >
              <CheckCircle size={16} />
              <span>Верифицированные</span>
            </div>
            
            <div 
              className={`filter-toggle ${activeFilter === 'blocked' ? 'active' : ''}`}
              onClick={() => setActiveFilter('blocked')}
            >
              <XCircle size={16} />
              <span>Заблокированные</span>
            </div>
          </div>
        </div>

        <div className="admin-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className="admin-row user-row"
                onClick={() => handleUserClick(u.id)}
              >
                <div className="admin-left">
                  <div className="user-main-info">
                    <div className="admin-id">ID: {u.id}</div>
                    <div className="admin-name">
                      <User size={16} />
                      <span>{u.login}</span>
                    </div>
                    <div className="user-email">
                      <Mail size={16} />
                      <span>{u.email}</span>
                    </div>
                    <div className="user-reg-date">
                      <Calendar size={16} />
                      <span>Регистрация: {formatDate(u.registration_date)}</span>
                    </div>
                  </div>
                  <div className="user-meta-info">
                    <div className={`verification-status ${getVerificationStatusClass(u.verification_status_id)}`}>
                      {getVerificationStatusIcon(u.verification_status_id)}
                      <span>{getVerificationStatusLabel(u.verification_status_id)}</span>
                    </div>
                    <div className={`block-status ${getBlockStatusClass(u.block_status_id)}`}>
                      {getBlockStatusLabel(u.block_status_id)}
                    </div>
                  </div>
                </div>
                <div className="admin-right">
                  <ArrowRight size={20} className="arrow-icon" />
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              Пользователи не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;