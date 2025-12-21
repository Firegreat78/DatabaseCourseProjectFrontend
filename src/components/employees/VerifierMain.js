import React, { useState, useEffect } from "react";
import EmployeeHeader from "./EmployeeHeader";
import { Search, ArrowRight, Filter } from 'lucide-react';
import { useFetchTable } from "./useFetchTable";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import './AdminMain.css';

const VerifierMainPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const { data: users, loading, error } = useFetchTable("user", token);
  const [query, setQuery] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(true); // Состояние для переключателя

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;

  // Фильтрация и сортировка данных
  let filteredUsers = users.slice(); // Создаем копию массива

  // Фильтрация по статусу, если включен переключатель
  if (showPendingOnly) {
    filteredUsers = filteredUsers.filter(u => u.verification_status_id === 3);
    // Сортировка новых заявок первыми
    filteredUsers.sort((a, b) => b.id - a.id);
  } else {
    // Общая сортировка: ожидающие верификации вверху
    filteredUsers.sort((a, b) => {
      if (a.verification_status_id === 3 && b.verification_status_id !== 3) return -1;
      if (a.verification_status_id !== 3 && b.verification_status_id === 3) return 1;
      return 0;
    });
  }

  // Применение поиска
  filteredUsers = filteredUsers.filter(
    u =>
      u.login.toLowerCase().includes(query.toLowerCase()) ||
      String(u.id).includes(query)
  );

  const getStatusLabel = (statusId) => {
    switch(statusId) {
      case 1: return "Не верифицирован";
      case 2: return "Верифицирован";
      case 3: return "Ожидает верификации";
      default: return "Неизвестно";
    }
  };

  const getStatusClass = (statusId) => {
    switch(statusId) {
      case 1: return "blocked";
      case 2: return "active";
      case 3: return "suspended";
      default: return "";
    }
  };

  return (
    <div className="admin-page">
      <EmployeeHeader />

      <div className="admin-content">
        <div className="page-header">
          <h1>Верификация пользователей</h1>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Поиск по ID или логину..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div 
            className={`filter-toggle ${showPendingOnly ? 'active' : ''}`}
            onClick={() => setShowPendingOnly(!showPendingOnly)}
          >
            <Filter size={18} />
            <span>Только ожидающие верификации</span>
          </div>
        </div>

        <div className="admin-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className="admin-row"
                onClick={() => navigate(`/verifier/users/${u.id}`)}
              >
                <div className="admin-left">
                  <div className="admin-id">ID: {u.id}</div>
                  <div className="admin-name">{u.login || u.name}</div>
                </div>
                <div className={`admin-action ${getStatusClass(u.verification_status_id)}`}>
                  {getStatusLabel(u.verification_status_id)}
                </div>
                <ArrowRight size={20} className="arrow-icon" />
              </div>
            ))
          ) : (
            <div className="no-results">
              {showPendingOnly 
                ? "Нет заявок, ожидающих верификации" 
                : "Пользователи не найдены"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifierMainPage;