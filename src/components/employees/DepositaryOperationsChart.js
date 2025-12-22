import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const API_BASE_URL = "http://localhost:8000";

const DepositaryOperationsChart = () => {
  const token = localStorage.getItem("authToken");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Нет авторизации");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/charts/depositary-operations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.detail || "Ошибка загрузки данных");
        }

        const result = await response.json();

        // === ВРЕМЕННЫЙ ДЕБАГ === 
        // Откройте консоль браузера (F12 → Console) и посмотрите, что именно пришло
        console.log("=== RAW JSON от /api/depositary-operations ===");
        console.log(JSON.stringify(result, null, 2));
        console.log("Тип результата:", typeof result);
        console.log("Это массив?", Array.isArray(result));
        // === КОНЕЦ ДЕБАГА ===

        // Защищённая установка (чтобы приложение не падало во время отладки)
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error("Данные не массив! Смотрите лог выше.");
          setData([]);
          setError("Полученные данные имеют неожиданный формат (см. консоль)");
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div>Загрузка диаграммы...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ width: "100%", height: 420 }}>
      <h3 style={{ marginBottom: 20 }}>
        Операции по типам и ценным бумагам
      </h3>

      <ResponsiveContainer>
        <BarChart data={Array.isArray(data) ? data : []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="security_name"
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="total_amount"
            name="Общая сумма"
            fill="#3b82f6"
          />
          <Bar
            dataKey="operations_count"
            name="Количество операций"
            fill="#22c55e"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepositaryOperationsChart;
