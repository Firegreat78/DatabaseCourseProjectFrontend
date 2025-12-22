import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeHeader from "./EmployeeHeader";
import "./AdminMain.css";

const API_BASE_URL = "http://localhost:8000";

const BrokerDealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeal = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/broker/proposal/${id}`
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Ошибка загрузки заявки");
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
  if (!token) {
    alert("Требуется авторизация");
    navigate("/login");
    return;
  }

  setActionLoading(true);
  try {
    const verify = action === "approve";
    const response = await fetch(
      `${API_BASE_URL}/api/proposal/${id}/process`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verify }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      // Проверяем, есть ли сообщение об ошибке в ответе
      throw new Error(data.detail || data.message || `Ошибка ${response.status}`);
    }

    alert(data.message || "Заявка успешно обработана");
    navigate("/broker/main");
  } catch (err) {
    console.error("Ошибка обработки заявки:", err);
    alert(`Ошибка: ${err.message}`);
  } finally {
    setActionLoading(false);
  }
};

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;
  if (!dealData) return <div className="admin-content">Заявка не найдена</div>;

  const { security, amount, proposal_type, account, status } = dealData;

  const statusText = {
    1: "Отклонена",
    2: "Подтверждена",
  };

  return (
    <div className="admin-page">
      <EmployeeHeader />

      <div className="admin-content">
        <div className="page-header">
          <h1>Заявка №{dealData.id}</h1>
        </div>

        <div className="admin-list">
          <div className="admin-row">
            <div className="admin-left">
              <div className="admin-name">
                <b>Счёт:</b> {account}
              </div>

              <div className="admin-name">
                <b>Сумма:</b>{" "}
                {amount?.toLocaleString("ru-RU", {
                  minimumFractionDigits: 2,
                })}{" "}
                
              </div>

              <div className="admin-name">
                <b>Ценная бумага:</b> {security?.name}
              </div>

              <div className="admin-name">
                <b>Тип заявки:</b> {proposal_type?.type}
              </div>
            </div>
          </div>

          {/* КНОПКИ ИЛИ СТАТУС */}
          {status === 3 && token ? (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                className="admin-row add-row"
                onClick={() => handleAction("approve")}
                disabled={actionLoading}
              >
                {actionLoading ? "Обработка..." : "Принять заявку"}
              </button>

              <button
                className="admin-row add-row reject-btn"
                onClick={() => handleAction("reject")}
                disabled={actionLoading}
              >
                {actionLoading ? "Обработка..." : "Отклонить заявку"}
              </button>
            </div>
          ) : (
            <div className="admin-name" style={{ marginTop: "1rem" }}>
              <b>Статус:</b> {statusText[status] || "Неизвестен"}
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
