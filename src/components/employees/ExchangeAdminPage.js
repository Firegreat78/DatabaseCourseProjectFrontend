import React, { useEffect, useState } from "react";
import AppHeader from "./EmployeeHeader";
import { RefreshCw, Plus } from "lucide-react";
import "../ExchangePage.css";

const API_BASE_URL = "http://localhost:8000";

const ExchangeAdminPage = () => {
  const token = localStorage.getItem("authToken");

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ticker: "",
    price: "",
    currency: "RUB",
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchStocks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange/stocks`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }

      const data = await response.json();
      setStocks(data);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить данные биржи");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStock = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Требуется авторизация");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange/stocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticker: formData.ticker,
          price: Number(formData.price),
          currency: formData.currency,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Ошибка добавления акции");
      }

      setFormData({ ticker: "", price: "", currency: "RUB" });
      setShowForm(false);
      fetchStocks();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="exchange-container">
      <AppHeader />

      <main className="content">
        <div className="exchange-header">
          <h2 className="page-title">Биржа (управление)</h2>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="refresh-btn"
              onClick={fetchStocks}
              disabled={loading}
              title="Обновить данные"
            >
              <RefreshCw
                size={20}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
            </button>

            <button
              className="refresh-btn"
              onClick={() => setShowForm((prev) => !prev)}
              title="Добавить акцию"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Форма добавления */}
        {showForm && (
          <form className="stock-item" onSubmit={handleAddStock}>
            <input
              type="text"
              name="ticker"
              placeholder="Тикер (AAPL)"
              value={formData.ticker}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Цена"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>

            <button type="submit" disabled={formLoading}>
              {formLoading ? "Добавление..." : "Добавить"}
            </button>
          </form>
        )}

        {loading && <div className="loading-text">Загрузка данных...</div>}
        {error && <div className="error-text">{error}</div>}

        <div className="stocks-list">
          {stocks.map((stock) => (
            <div key={stock.id} className="stock-item">
              <span className="ticker">{stock.ticker}</span>

              <div className="price-change">
                <span className="price">
                  {stock.price} {stock.currency}
                </span>

                <span
                  className={`change ${
                    stock.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExchangeAdminPage;
