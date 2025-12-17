import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeHeader from "./EmployeeHeader";
import "./AdminMain.css";

const API_BASE_URL = "http://localhost:8000";

const VerifierUserDetail = () => {
  const { id } = useParams(); // user_id
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user/${id}/passport`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Паспорт не найден");
          }
          throw new Error("Ошибка загрузки паспорта");
        }

        const data = await response.json();
        setPassport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [id, token]);

  const handleVerify = async (statusId) => {
    if (
      !window.confirm(
        statusId === 1
          ? "Верифицировать пользователя?"
          : "Отклонить пользователя?"
      )
    )
      return;

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verification_status_id: statusId }),
    });

    if (!response.ok) throw new Error("Ошибка обновления статуса");

    alert("Статус пользователя обновлён");
    navigate("/verifier/main");
      } catch (err) {
        alert(err.message);
      } finally {
        setUpdating(false);
      }
};

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;
  if (!passport)
    return <div className="admin-content">Паспорт не найден</div>;

  return (
    <div className="admin-page">
      <EmployeeHeader />

      <div className="admin-content">
        <div className="page-header">
          <h1>Паспорт пользователя (ID: {passport.user_id})</h1>
        </div>

        <div className="admin-list">
          <div className="admin-row">
            <div className="admin-left">
              <div className="admin-name">
                ФИО: {passport.last_name} {passport.first_name}{" "}
                {passport.patronymic}
              </div>

              <div className="admin-name">
                Пол: {passport.gender}
              </div>

              <div className="admin-name">
                Дата рождения: {passport.birth_date}
              </div>

              <div className="admin-name">
                Место рождения: {passport.birth_place}
              </div>

              <div className="admin-name">
                Паспорт: {passport.series} {passport.number}
              </div>

              <div className="admin-name">
                Кем выдан: {passport.issued_by}
              </div>

              <div className="admin-name">
                Дата выдачи: {passport.issue_date}
              </div>

              <div className="admin-name">
                Адрес регистрации: {passport.registration_place}
              </div>
            </div>
          </div>

          {passport.verification_status_id === 3 && (
  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
    <button
      className="admin-row add-row"
      onClick={() => handleVerify(2)}
      disabled={updating}
    >
      Верифицировать
    </button>

    <button
      className="admin-row add-row"
      onClick={() => handleVerify(1)}
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
