import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeHeader from "./EmployeeHeader";
import "./AdminMain.css";

const API_BASE_URL = "http://localhost:8000";

const BrokerMainPage = () => {
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Загрузка списка ID заявок
  const fetchProposalIds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/broker/proposal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Ошибка загрузки заявок");
      }

      const data = await response.json();
      return data.map((p) => p.id);
    } catch (err) {
      throw err;
    }
  };

  // Загрузка полной информации по каждой заявке
  const fetchProposalById = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/broker/proposal/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Ошибка загрузки заявки");
      }

      return await response.json();
    } catch (err) {
      console.error("Ошибка загрузки заявки", id, err.message);
      return null;
    }
  };

  const fetchAllProposals = async () => {
    setLoading(true);
    try {
      const ids = await fetchProposalIds();
      const dataPromises = ids.map((id) => fetchProposalById(id));
      const results = await Promise.all(dataPromises);
      setProposals(results.filter((p) => p !== null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProposals();
  }, [token]);

  const formatAmount = (amount) =>
    Number(amount).toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Фильтр поиска
  const filteredProposals = proposals.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toString().includes(q) ||
      p.account.toString().includes(q) ||
      p.security?.name?.toLowerCase().includes(q) ||
      p.proposal_type?.type?.toLowerCase().includes(q) ||
      p.amount.toString().includes(q)
    );
  });

  // Преобразование статуса в текст и цвет
  const getStatusLabel = (status) => {
    switch (status) {
      case 1:
        return { text: "Отклонена", color: "red" };
      case 2:
        return { text: "Подтверждена", color: "green" };
      case 3:
        return { text: "Ожидает подтверждения", color: "blue" };
      default:
        return { text: "Неизвестно", color: "gray" };
    }
  };

  if (loading)
    return (
      <div className="admin-content">Загрузка...</div>
    );

  if (error)
    return (
      <div className="admin-content">Ошибка: {error}</div>
    );

  return (
    <div className="admin-page">
      <EmployeeHeader />
      <div className="admin-content">
        <h1>Заявки брокера</h1>

        <div className="admin-search">
          <input
            type="text"
            placeholder="Поиск по заявкам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-list">
          {filteredProposals.length > 0 ? (
            filteredProposals.map((p) => {
              const { security, proposal_type, amount, account, status } = p;
              const statusLabel = getStatusLabel(status);

              return (
                <div
                  className="admin-row"
                  key={p.id}
                  onClick={() => navigate(`/broker/deals/${p.id}`)}
                >
                  <div className="admin-left">
                    <div className="admin-id">ID заявки: {p.id}</div>
                    <div className="admin-name">Счёт № {account}</div>
                    <div className="admin-action">
                      {security?.name ?? "—"} {proposal_type?.type ?? "—"} • {formatAmount(amount)}
                    </div>
                    <div
                      className="admin-status"
                      style={{
                        marginTop: "4px",
                        fontWeight: "bold",
                        color: statusLabel.color,
                      }}
                    >
                      {statusLabel.text}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="admin-row">
              <div className="admin-name">Заявки не найдены</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerMainPage;
