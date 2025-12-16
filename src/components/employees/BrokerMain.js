import React, { useState, useEffect } from "react";
import EmployeeHeader from "./EmployeeHeader";
import "./AdminMain.css"; // Используем предоставленный CSS
import { useNavigate } from 'react-router-dom';

const BrokerMainPage = () => {
  const token = localStorage.getItem("authToken");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/proposal", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Ошибка загрузки данных");
        }
        
        const data = await response.json();
        setDeals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [token]);

  const filteredDeals = deals.filter(deal => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      deal.id.toString().includes(query) ||
      deal.user?.login?.toLowerCase().includes(query) ||
      deal.security?.name?.toLowerCase().includes(query) ||
      deal.proposal_type?.type?.toLowerCase().includes(query)
    );
  });

  const formatAmount = (amount) => {
    if (!amount) return "0.00";
    return Number(amount).toLocaleString('ru-RU', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Не указана";
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="admin-page">
      <EmployeeHeader />
      <div className="admin-content">
        <div className="page-header">
          <h1>Ведение сделок</h1>
        </div>
        <div className="admin-list">
          <div className="admin-row">
            <div className="admin-left">
              <div className="admin-name">Загрузка...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="admin-page">
      <EmployeeHeader />
      <div className="admin-content">
        <div className="page-header">
          <h1>Ведение сделок</h1>
        </div>
        <div className="admin-list">
          <div className="admin-row">
            <div className="admin-left">
              <div className="admin-name">Ошибка: {error}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <EmployeeHeader />

      <div className="admin-content">
        <div className="page-header">
          <h1>Ведение сделок</h1>
        </div>

        {/* Строка поиска */}
        <div className="admin-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по сделкам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-list">
          {filteredDeals.map((deal) => (
            <div 
              className="admin-row" 
              key={deal.id} 
              onClick={() => navigate(`/broker/deals/${deal.id}`)}
            >
              <div className="admin-left">
                <div className="admin-id">ID: {deal.id}</div>
                <div className="admin-name">{deal.user?.login || "Пользователь не указан"}</div>
                <div className="admin-action">
                  {deal.security?.name || "Ценная бумага не указана"} • 
                  {deal.proposal_type?.type || "Тип не указан"} • 
                  {formatAmount(deal.amount)} ₽
                </div>
                <div className="admin-action">
                  {formatDate(deal.created_at)}
                </div>
              </div>
              <div className={`admin-action ${deal.status}`}>
                <div style={{ 
                  padding: "4px 12px", 
                  borderRadius: "20px", 
                  backgroundColor: deal.status === "active" ? "#dcfce7" : 
                                  deal.status === "blocked" ? "#fee2e2" : "#fef3c7",
                  color: deal.status === "active" ? "#166534" : 
                         deal.status === "blocked" ? "#b91c1c" : "#854d0e"
                }}>
                  {deal.status === "active" && "Активна"}
                  {deal.status === "blocked" && "Заблокирована"}
                  {deal.status === "suspended" && "На верификации"}
                </div>
              </div>
            </div>
          ))}
          
          {filteredDeals.length === 0 && (
            <div className="admin-row">
              <div className="admin-left">
                <div className="admin-name">Сделки не найдены</div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default BrokerMainPage;