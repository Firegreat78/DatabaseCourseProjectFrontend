import React, { useEffect, useState } from "react";
import AppHeader from "./EmployeeHeader";
import { RefreshCw, Plus, AlertCircle } from "lucide-react";
import "./ExchangeAdminPage.css";

const API_BASE_URL = "http://localhost:8000";

const ExchangeAdminPage = () => {
  const token = localStorage.getItem("authToken");

  const [stocks, setStocks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Загрузка списка акций
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

  // Загрузка валют
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

      if (!response.ok) throw new Error(`Не удалось загрузить валюты (статус ${response.status})`);

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

  useEffect(() => {
    fetchStocks();
    fetchCurrencies();
  }, []);

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
          has_dividends: has_dividends,
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

  return (
    <div className="ExchangeAdminPage-exchange-container">
      <AppHeader />

      <main className="ExchangeAdminPage-content">
        <div className="ExchangeAdminPage-exchange-header">
          <h2 className="ExchangeAdminPage-page-title">Биржа — Управление акциями</h2>

          <div className="ExchangeAdminPage-header-actions">
            <button
              className="ExchangeAdminPage-refresh-btn"
              onClick={fetchStocks}
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? "ExchangeAdminPage-spin" : ""} />
              Обновить
            </button>

            <button
              className="ExchangeAdminPage-add-btn"
              onClick={() => setShowForm(prev => !prev)}
            >
              <Plus size={20} />
              Добавить акцию
            </button>
          </div>
        </div>

        {/* Форма добавления акции */}
        {showForm && (
          <div className="ExchangeAdminPage-form-card">
            <h3 className="ExchangeAdminPage-form-title">Новая акция</h3>
            <form onSubmit={handleAddStock}>
              <div className="ExchangeAdminPage-form-group">
                <label>Тикер</label>
                <input
                  type="text"
                  name="ticker"
                  placeholder="Например: AAPL"
                  value={formData.ticker}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ExchangeAdminPage-form-group">
                <label>ISIN</label>
                <input
                  type="text"
                  name="isin"
                  placeholder="Например: US0378331005"
                  value={formData.isin}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ExchangeAdminPage-form-group">
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

              <div className="ExchangeAdminPage-form-group">
                <label>Цена за лот</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0.01"
                  placeholder="Текущая цена"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ExchangeAdminPage-form-group">
                <label>Валюта</label>
                {currenciesLoading ? (
                  <div className="ExchangeAdminPage-loading-small">Загрузка валют...</div>
                ) : currencies.length === 0 ? (
                  <div className="ExchangeAdminPage-warning">
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

              <div className="ExchangeAdminPage-form-group ExchangeAdminPage-checkbox-group">
                <label className="ExchangeAdminPage-checkbox-label">
                  <input
                    type="checkbox"
                    name="has_dividends"
                    checked={formData.has_dividends}
                    onChange={handleChange}
                  />
                  <span>Выплачивает дивиденды</span>
                </label>
              </div>

              <div className="ExchangeAdminPage-form-actions">
                <button
                  type="button"
                  className="ExchangeAdminPage-btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </button>
                <button type="submit" disabled={formLoading} className="ExchangeAdminPage-btn-primary">
                  {formLoading ? "Добавление..." : "Добавить акцию"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Состояния загрузки и ошибок */}
        {loading && <div className="ExchangeAdminPage-loading-text">Загрузка данных биржи...</div>}
        {error && <div className="ExchangeAdminPage-error-text">{error}</div>}

        {/* Список акций */}
        <div className="ExchangeAdminPage-stocks-list">
          {stocks.length === 0 && !loading ? (
            <div className="ExchangeAdminPage-empty-state">
              <p>На бирже пока нет акций</p>
            </div>
          ) : (
            stocks.map(stock => (
              <div key={stock.id} className="ExchangeAdminPage-stock-card">
                <div className="ExchangeAdminPage-stock-info">
                  <h3 className="ExchangeAdminPage-ticker">{stock.ticker}</h3>
                  <p className="ExchangeAdminPage-isin">ISIN: {stock.isin || "—"}</p>
                </div>
                <div className="ExchangeAdminPage-price-info">
                  <span className="ExchangeAdminPage-current-price">
                    {stock.price.toLocaleString('ru-RU')} {stock.currency}
                  </span>
                  <span className={`ExchangeAdminPage-change ${stock.change >= 0 ? "ExchangeAdminPage-positive" : "ExchangeAdminPage-negative"}`}>
                    {stock.change >= 0 ? "+" : ""}{stock.change}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ExchangeAdminPage;