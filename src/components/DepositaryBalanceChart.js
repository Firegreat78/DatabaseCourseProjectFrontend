import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000';

const DepositaryBalanceChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/charts/depositary-balance`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error('Ошибка загрузки данных');
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные для диаграммы');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [user]);

  if (loading) {
    return <p>Загрузка диаграммы...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (data.length === 0) {
    return <p>Нет данных для отображения</p>;
  }

  return (
    <div style={{ width: '100%', height: 420 }}>
      <h2 style={{ marginBottom: 20 }}>
        Баланс депозитарного счёта
      </h2>

      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="security_name"
            angle={-15}
            textAnchor="end"
            interval={0}
            height={70}
          />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              `${Number(value).toLocaleString('ru-RU')} шт.`
            }
          />

          <Bar dataKey="quantity" fill="#2563eb">
            {/* 👇 подпись значения ПОД столбцом */}
            <LabelList
              dataKey="quantity"
              position="bottom"
              formatter={(value) =>
                Number(value).toLocaleString('ru-RU')
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepositaryBalanceChart;
