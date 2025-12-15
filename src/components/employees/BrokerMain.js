import React from "react";
import EmployeeHeader from "./EmployeeHeader";
import "./AdminMain.css";
import { useFetchTable } from "./useFetchTable";
import { useAuth } from '../../context/AuthContext';
const BrokerMainPage = () => {
  const { user } = useAuth(); // токен и роль сотрудника
  const token = localStorage.getItem("authToken"); // можно взять из контекста
  const { data: deals, loading, error } = useFetchTable("brokerage_account", token);

  if (loading) return <div className="admin-content">Загрузка...</div>;
  if (error) return <div className="admin-content">Ошибка: {error}</div>;

  return (
    <div className="admin-page">
      <EmployeeHeader />

      <div className="admin-content">
        <div className="page-header">
          <h1>Ведение сделок</h1>
        </div>

        <div className="admin-list">
          {deals.map((deal) => (
            <div key={deal.id} className="admin-row">
              <div className="admin-left">
                <div className="admin-id">ИД: {deal.id}</div>
                <div className="admin-name">{deal.description || deal.account_name}</div>
              </div>
              <div className={`admin-action ${deal.status || "active"}`}>
                {deal.status === "active" && "Активна"}
                {deal.status === "blocked" && "Заблокирована"}
                {deal.status === "suspended" && "Приостановлена"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrokerMainPage;
