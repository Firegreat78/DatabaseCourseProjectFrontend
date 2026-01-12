import React, { useState } from "react";
import AdminHeader from "./AdminHeader";
import { Search, ArrowRight, Filter, User, Mail, Calendar, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
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
  const [activeFilter, setActiveFilter] = useState('all');

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;
  let filteredUsers = users.slice();
  if (activeFilter === 'pending') {
    filteredUsers = filteredUsers.filter(u => u.verification_status_id === 3);
  } else if (activeFilter === 'blocked') {
    filteredUsers = filteredUsers.filter(u => u.block_status_id === 2);
  } else if (activeFilter === 'verified') {
    filteredUsers = filteredUsers.filter(u => u.verification_status_id === 2);
  }
  filteredUsers = filteredUsers.filter(
    u =>
      u.login.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      String(u.id).includes(query)
  );
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


  return (
    <div className="admin-page">
      <AdminHeader />

      <div className="admin-content">
        <div className="page-header">
          <div className="header-left">
            <h1>Управление пользователями</h1>
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