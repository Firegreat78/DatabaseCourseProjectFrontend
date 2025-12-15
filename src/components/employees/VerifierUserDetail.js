import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeHeader from "./EmployeeHeader";
import { useAuth } from "../../context/AuthContext";
import './AdminMain.css';

const API_BASE_URL = "http://localhost:8000";

const VerifierUserDetail = () => {
  const { id } = useParams(); // ID пользователя из URL
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const { user } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Ошибка загрузки данных пользователя");
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, token]);

  const handleVerify = async (statusId) => {
    if (!window.confirm(statusId === 1 ? "Верифицировать пользователя?" : "Отклонить заявку?")) return;
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ verification_status_id: statusId })
      });
      if (!response.ok) throw new Error("Ошибка обновления статуса");
      const updatedUser = await response.json();
      setUserData(updatedUser);
      alert("Статус обновлён");
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;
  if (!userData) return <div className="admin-content">Пользователь не найден</div>;

  return (
    <div className="admin-page">
      <EmployeeHeader />

      <div className="admin-content">
        <div className="page-header">
          <h1>Данные пользователя: {userData.login || userData.name}</h1>
        </div>

        <div className="admin-list">
          <div className="admin-row">
            <div className="admin-left">
              <div className="admin-id">ID: {userData.id}</div>
              <div className="admin-name">ФИО: {userData.name}</div>
              <div className="admin-name">Дата рождения: {userData.birth_date}</div>
              <div className="admin-name">Серия паспорта: {userData.passport_series}</div>
              <div className="admin-name">Номер паспорта: {userData.passport_number}</div>
              <div className="admin-name">Выдан: {userData.passport_issued_by}</div>
              <div className="admin-name">Дата выдачи: {userData.passport_issue_date}</div>
            </div>
          </div>

          {userData.verification_status_id === 3 && (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                className="admin-row add-row"
                onClick={() => handleVerify(1)}
                disabled={updating}
              >
                Верифицировать
              </button>
              <button
                className="admin-row add-row"
                onClick={() => handleVerify(2)}
                disabled={updating}
              >
                Отклонить
              </button>
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <button
              className="admin-row add-row"
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

export default VerifierUserDetail;
