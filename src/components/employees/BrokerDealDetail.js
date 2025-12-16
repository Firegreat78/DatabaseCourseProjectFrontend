import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeHeader from "./EmployeeHeader";
import './AdminMain.css';

const API_BASE_URL = "http://localhost:8000";

const BrokerDealDetail = () => {
  const { id } = useParams(); // ID сделки/заявки
  const navigate = useNavigate();
  // Токен больше не нужен для GET-запроса, но сохраняем для PATCH-запросов
  const token = localStorage.getItem("authToken");

  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeal = async () => {
    setLoading(true);
    try {
      // Убираем заголовок авторизации для GET-запроса
      const response = await fetch(`${API_BASE_URL}/api/broker/proposal/${id}`);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Ошибка загрузки сделки");
      }
      
      const data = await response.json();
      setDealData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const handleAction = async (action) => {
    // Проверяем наличие токена перед выполнением действий
    if (!token) {
      alert("Требуется авторизация для выполнения этого действия");
      navigate("/login");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/proposal/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Ошибка при обновлении статуса");
      }

      // Обновляем данные после действия
      fetchDeal();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;
  if (!dealData) return <div className="admin-content">Сделка не найдена</div>;

  const { user, security, amount, proposal_type } = dealData;

  return (
    <div className="admin-page">
      <EmployeeHeader />

      <div className="admin-content">
        <div className="page-header">
          <h1>Детали сделки: {dealData.id}</h1>
        </div>

        <div className="admin-list">
          <div className="admin-row">
            <div className="admin-left">
              <div className="admin-name"><b>Пользователь:</b> {user.login} ({user.email})</div>
              <div className="admin-name"><b>Статус верификации:</b> {
                user.verification_status_id === 1 ? "Верифицирован" :
                user.verification_status_id === 2 ? "Не верифицирован" :
                "Заявка на верификацию"
              }</div>
              <div className="admin-name"><b>Паспорт:</b> {user.passports?.[0] ? 
                `${user.passports[0].series} ${user.passports[0].number}, ${user.passports[0].last_name} ${user.passports[0].first_name} ${user.passports[0].patronymic}` 
                : "Не указан"
              }</div>
              <div className="admin-name"><b>Сумма сделки:</b> {amount?.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</div>
              <div className="admin-name"><b>Ценная бумага:</b> {security.name}</div>
              <div className="admin-name"><b>Тип предложения:</b> {proposal_type.type}</div>
              <div className="admin-name"><b>Дата создания:</b> {new Date(dealData.created_at).toLocaleString('ru-RU')}</div>
            </div>
          </div>

          {/* Показываем кнопки только если есть токен (авторизованный пользователь) */}
          {token && user.verification_status_id === 3 && (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                className="admin-row add-row"
                onClick={() => handleAction("approve")}
                disabled={actionLoading}
              >
                {actionLoading ? "Обработка..." : "Верифицировать"}
              </button>
              <button
                className="admin-row add-row reject-btn"
                onClick={() => handleAction("reject")}
                disabled={actionLoading}
              >
                {actionLoading ? "Обработка..." : "Отклонить"}
              </button>
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <button
              className="admin-row add-row back-btn"
              onClick={() => navigate(-1)}
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDealDetail;