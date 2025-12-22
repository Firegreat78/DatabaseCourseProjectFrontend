import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import { RefreshCw, Plus, AlertCircle } from "lucide-react";
import "./ExchangeAdminPage.css";
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

const ExchangeAdminPage = () => {
  const token = localStorage.getItem("authToken");

  const [stocks, setStocks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [error, setError] = useState("");

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ticker: "",
    isin: "",
    lot_size: "1.00",
    price: "",
    currency_id: "",
    has_dividends: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchStocks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange/stocks`);
      if (!response.ok) throw new Error("Ошибка загрузки данных");
      const data = await response.json();
      setStocks(data);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить данные биржи");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    if (!token) {
      setCurrencies([]);
      setCurrenciesLoading(false);
      return;
    }
    setCurrenciesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/currencies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Не удалось загрузить валюты`);
      const data = await response.json();
      const currenciesList = Array.isArray(data) ? data : [];
      setCurrencies(currenciesList);
      if (currenciesList.length > 0) {
        setFormData(prev => ({ ...prev, currency_id: String(currenciesList[0].id) }));
      }
    } catch (err) {
      console.error(err);
      setCurrencies([]);
    } finally {
      setCurrenciesLoading(false);
    }
  };

  const fetchDepositaryOperations = async () => {
    if (!token) {
      setChartError("Нет авторизации");
      setChartLoading(false);
      return;
    }
    setChartLoading(true);
    setChartError("");
    try {
      const response = await fetch(`${API_BASE_URL}/charts/depositary-operations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Ошибка загрузки данных операций");
      }
      const result = await response.json();
      setChartData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setChartError(err.message || "Не удалось загрузить данные операций");
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchCurrencies();
    fetchDepositaryOperations();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Требуется авторизация");
      return;
    }
    const { ticker, isin, lot_size, price, currency_id, has_dividends } = formData;
    if (!ticker || !isin || !price || !currency_id) {
      alert("Заполните все обязательные поля");
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
          ticker: ticker.trim(),
          isin: isin.trim(),
          lot_size: Number(lot_size),
          price: Number(price),
          currency_id: Number(currency_id),
          has_dividends,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Ошибка добавления акции");
      }
      alert("Акция успешно добавлена!");
      setFormData({
        ticker: "",
        isin: "",
        lot_size: "1.00",
        price: "",
        currency_id: currencies[0]?.id?.toString() || "",
        has_dividends: false,
      });
      setShowForm(false);
      fetchStocks();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const totalStocks = stocks.length;

  return (
    <div className="admin-page">
      <AdminHeader />

      <div className="admin-content">
        {/* Заголовок и статистика */}
        <div className="page-header">
          <div className="header-left">
            <h1>Управление биржей</h1>
            <button className="refresh-btn" onClick={fetchStocks} disabled={loading}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Обновить
            </button>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Акций на бирже:</span>
              <span className="stat-value">{totalStocks}</span>
            </div>
          </div>
        </div>

        {/* Кнопка добавления акции */}
        <div className="add-stock-section">
          <button
            className="add-stock-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={20} />
            {showForm ? "Отмена" : "Добавить акцию"}
          </button>
        </div>

        {/* Форма добавления */}
        {showForm && (
          <div className="form-card">
            <h2>Новая акция</h2>
            <form onSubmit={handleAddStock}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Тикер</label>
                  <input
                    type="text"
                    name="ticker"
                    placeholder="AAPL"
                    value={formData.ticker}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ISIN</label>
                  <input
                    type="text"
                    name="isin"
                    placeholder="US0378331005"
                    value={formData.isin}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Размер лота</label>
                  <input
                    type="number"
                    name="lot_size"
                    step="0.01"
                    min="0.01"
                    value={formData.lot_size}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Цена за лот</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Валюта</label>
                  {currenciesLoading ? (
                    <div className="loading-small">Загрузка...</div>
                  ) : currencies.length === 0 ? (
                    <div className="warning">
                      <AlertCircle size={16} />
                      Нет доступных валют
                    </div>
                  ) : (
                    <select name="currency_id" value={formData.currency_id} onChange={handleChange} required>
                      <option value="">Выберите валюту</option>
                      {currencies.map(curr => (
                        <option key={curr.id} value={curr.id}>
                          {curr.code} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="has_dividends"
                      checked={formData.has_dividends}
                      onChange={handleChange}
                    />
                    <span>Выплачивает дивиденды</span>
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={formLoading} className="btn-primary">
                  {formLoading ? "Добавление..." : "Добавить акцию"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Состояния загрузки и ошибок */}
        {loading && <div className="loading-text">Загрузка акций...</div>}
        {error && <div className="error-text">{error}</div>}

        {/* Список акций */}
        <div className="admin-list">
          {stocks.length === 0 && !loading ? (
            <div className="no-results">На бирже пока нет акций</div>
          ) : (
            stocks.map(stock => (
              <div key={stock.id} className="admin-row stock-row">
                <div className="admin-left">
                  <div className="stock-main">
                    <div className="ticker">{stock.ticker}</div>
                    <div className="isin">ISIN: {stock.isin || "—"}</div>
                  </div>
                  <div className="stock-meta">
                    <div className="lot-size">Лот: {stock.lot_size}</div>
                    {stock.has_dividends && <div className="dividends-badge">Дивиденды</div>}
                  </div>
                </div>
                <div className="admin-right price-section">
                  <div className="current-price">
                    {stock.price.toLocaleString('ru-RU')} {stock.currency}
                  </div>
                  <div className={`change ${stock.change >= 0 ? "positive" : "negative"}`}>
                    {stock.change >= 0 ? "+" : ""}{stock.change}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Отчёт по операциям */}
        <div className="report-section">
          <h2>Отчёт по депозитарным операциям</h2>

          {chartLoading && <div className="loading-text">Загрузка данных операций...</div>}
          {chartError && <div className="error-text">{chartError}</div>}

          {!chartLoading && !chartError && chartData.length > 0 && (
            <>
              <div className="chart-card">
                <h3>Операции по типам и ценным бумагам</h3>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="security_name" angle={-20} textAnchor="end" interval={0} height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_amount" name="Общая сумма" fill="#3b82f6" />
                    <Bar dataKey="operations_count" name="Кол-во операций" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="table-card">
                <h3>Таблица операций</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Тип операции</th>
                        <th>Ценная бумага</th>
                        <th style={{ textAlign: "right" }}>Кол-во операций</th>
                        <th style={{ textAlign: "right" }}>Общая сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.operation_type}</td>
                          <td>{row.security_name}</td>
                          <td style={{ textAlign: "right" }}>{row.operations_count}</td>
                          <td style={{ textAlign: "right" }}>
                            {Number(row.total_amount).toLocaleString("ru-RU", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!chartLoading && !chartError && chartData.length === 0 && (
            <div className="no-results">Нет данных об операциях</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeAdminPage;