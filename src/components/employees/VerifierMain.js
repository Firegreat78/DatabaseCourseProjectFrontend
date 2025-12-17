import React, { useState, useEffect } from "react";
import EmployeeHeader from "./EmployeeHeader";
import { Search, ArrowRight } from 'lucide-react';
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

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;

  // Сначала фильтруем и сортируем: заявки на верификацию первыми
  const sortedUsers = users
    .slice() // копируем массив
    .sort((a, b) => (a.verification_status_id === 3 ? -1 : 1));

  // Применяем поиск
  const filteredUsers = sortedUsers.filter(
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

        <div className="admin-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по ID или логину..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="admin-list">
          {filteredUsers.map((u) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerifierMainPage;
