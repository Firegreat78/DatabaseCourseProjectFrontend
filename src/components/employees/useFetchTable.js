import { useState, useEffect } from "react";

export const useFetchTable = (tableName, token) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return; // если нет токена, не запрашиваем

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/public/${tableName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Ошибка получения данных");
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, token]);

  return { data, loading, error };
};
