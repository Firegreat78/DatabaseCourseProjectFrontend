import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Plus, AlertCircle, Save, Archive, ArchiveRestore } from "lucide-react";
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

import "./ExchangeAdminPage.css";

const API_BASE_URL = "http://localhost:8000";

const ExchangeAdminPage = () => {
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

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
    lot_size: "1",
    price: "",
    currency_id: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Состояния для валидации
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  // Состояние для сохранения изменений
  const [savingId, setSavingId] = useState(null);

  // Загрузка списка акций
  const fetchStocks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange/stocks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Ошибка загрузки данных");
      const data = await response.json();

      // Добавляем поля для локального редактирования
      const enriched = data.map(stock => ({
        ...stock,
        edited_ticker: stock.ticker,
        edited_isin: stock.isin,
        edited_lot_size: stock.lot_size?.toString() || "",
        edited_price: stock.price?.toString() || "",
        edited_currency: stock.currency || ""
      }));

      setStocks(enriched);
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
      setChartError(err.message || "Не удалось загрузить данных операций");
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

  // Функции для формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (serverErrors[name]) {
      setServerErrors(prev => {
        const newServerErrors = { ...prev };
        delete newServerErrors[name];
        return newServerErrors;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (fieldName) => {
    if (!touched[fieldName] && !formSubmitted) return;

    const newErrors = { ...errors };
    let hasError = false;

    switch (fieldName) {
      case 'ticker':
        if (!formData.ticker.trim()) {
          newErrors.ticker = 'Название ценной бумаги обязательно';
          hasError = true;
        } else {
          const tickerExists = stocks.some(stock => 
            stock && stock.ticker && 
            stock.ticker.toLowerCase() === formData.ticker.trim().toLowerCase()
          );
          if (tickerExists) {
            newErrors.ticker = 'Название ценной бумаги уже существует';
            hasError = true;
          } else {
            delete newErrors.ticker;
          }
        }
        break;
        
      case 'isin':
        if (!formData.isin.trim()) {
          newErrors.isin = 'ISIN обязателен';
          hasError = true;
        } else {
          const isinExists = stocks.some(stock => 
            stock && stock.isin && 
            stock.isin === formData.isin.trim()
          );
          if (isinExists) {
            newErrors.isin = 'ISIN уже существует';
            hasError = true;
          } else {
            delete newErrors.isin;
          }
        }
        break;
        
      case 'lot_size':
        if (!formData.lot_size.trim()) {
          newErrors.lot_size = 'Размер лота обязателен';
          hasError = true;
        } else {
          const lotSize = parseFloat(formData.lot_size);
          if (isNaN(lotSize)) {
            newErrors.lot_size = 'Размер лота должен быть числом';
            hasError = true;
          } else if (lotSize <= 0) {
            newErrors.lot_size = 'Размер лота должен быть больше 0';
            hasError = true;
          } else if (!Number.isInteger(lotSize)) {
            newErrors.lot_size = 'Размер лота должен быть целым числом';
            hasError = true;
          } else {
            delete newErrors.lot_size;
          }
        }
        break;
        
      case 'price':
        if (!formData.price.trim()) {
          newErrors.price = 'Цена обязательна';
          hasError = true;
        } else {
          const price = parseFloat(formData.price);
          if (isNaN(price)) {
            newErrors.price = 'Цена должна быть числом';
            hasError = true;
          } else if (price <= 0) {
            newErrors.price = 'Цена должна быть положительной';
            hasError = true;
          } else {
            delete newErrors.price;
          }
        }
        break;
        
      case 'currency_id':
        if (!formData.currency_id) {
          newErrors.currency_id = 'Валюта обязательна';
          hasError = true;
        } else {
          delete newErrors.currency_id;
        }
        break;
        
      default:
        break;
    }

    if (hasError || (errors[fieldName] && !hasError)) {
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Название ценной бумаги обязателен';
      isValid = false;
    } else {
      const tickerExists = stocks.some(stock => 
        stock && stock.ticker && 
        stock.ticker.toLowerCase() === formData.ticker.trim().toLowerCase()
      );
      if (tickerExists) {
        newErrors.ticker = 'Название ценной бумаги уже существует';
        isValid = false;
      }
    }

    if (!formData.isin.trim()) {
      newErrors.isin = 'ISIN обязателен';
      isValid = false;
    } else {
      const isinExists = stocks.some(stock => 
        stock && stock.isin && 
        stock.isin.toLowerCase() === formData.isin.trim().toLowerCase()
      );
      if (isinExists) {
        newErrors.isin = 'ISIN уже существует';
        isValid = false;
      }
    }

    if (!formData.lot_size.trim()) {
      newErrors.lot_size = 'Размер лота обязателен';
      isValid = false;
    } else {
      const lotSize = parseFloat(formData.lot_size);
      if (isNaN(lotSize)) {
        newErrors.lot_size = 'Размер лота должен быть числом';
        isValid = false;
      } else if (lotSize <= 0) {
        newErrors.lot_size = 'Размер лота должен быть больше 0';
        isValid = false;
      } else if (!Number.isInteger(lotSize)) {
        newErrors.lot_size = 'Размер лота должен быть целым числом';
        isValid = false;
      }
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Цена обязательна';
      isValid = false;
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        newErrors.price = 'Цена должна быть числом';
        isValid = false;
      } else if (price <= 0) {
        newErrors.price = 'Цена должна быть положительной';
        isValid = false;
      }
    }

    if (!formData.currency_id) {
      newErrors.currency_id = 'Валюта обязательна';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      ticker: true,
      isin: true,
      lot_size: true,
      price: true,
      currency_id: true
    });
    setFormSubmitted(true);
    
    return isValid;
  };

  const getFieldError = (fieldName) => {
    return serverErrors[fieldName] || errors[fieldName];
  };

  const handleAddStock = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Требуется авторизация");
      return;
    }

    if (!validateForm()) return;

    setFormLoading(true);
    setServerErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange/stocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticker: formData.ticker.trim(),
          isin: formData.isin.trim().toUpperCase(),
          lot_size: Number(formData.lot_size),
          price: Number(formData.price),
          currency_id: Number(formData.currency_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (typeof data.detail === "string") {
          if (data.detail.includes("ISIN")) {
            setServerErrors({ isin: data.detail });
          } else if (data.detail.includes("тикер")) {
            setServerErrors({ ticker: data.detail });
          } else {
            alert(data.detail);
          }
        } else {
          alert("Ошибка добавления акции");
        }
        return;
      }

      setShowForm(false);
      setFormData({
        ticker: "",
        isin: "",
        lot_size: "1",
        price: "",
        currency_id: currencies[0]?.id?.toString() || "",
      });

      setErrors({});
      setServerErrors({});
      setTouched({});
      setFormSubmitted(false);

      await fetchStocks();
      alert("Акция успешно добавлена!");

    } catch (err) {
      console.error(err);
      alert("Ошибка соединения с сервером");
    } finally {
      setFormLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.ticker.trim() &&
      formData.isin.trim() &&
      formData.lot_size.trim() &&
      formData.price.trim() &&
      formData.currency_id &&
      Object.keys(errors).length === 0
    );
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setFormData({
      ticker: "",
      isin: "",
      lot_size: "1",
      price: "",
      currency_id: currencies[0]?.id?.toString() || "",
    });
    setErrors({});
    setServerErrors({});
    setTouched({});
    setFormSubmitted(false);
  };

  // Функции для редактирования строк таблицы
  const handleFieldChange = (stockId, fieldName, value) => {
    const stock = stocks.find(s => s.id === stockId);
    if (stock && stock.is_archived) return; // Не позволяем редактировать архивные
    
    setStocks(prev =>
      prev.map(stock =>
        stock.id === stockId ? { ...stock, [fieldName]: value } : stock
      )
    );
  };

  // Проверка наличия изменений
  const hasChanges = (stock) => {
    if (stock.is_archived) return false; // Архивные нельзя изменять
    
    return (
      stock.edited_ticker !== stock.ticker ||
      stock.edited_isin !== stock.isin ||
      stock.edited_lot_size !== (stock.lot_size?.toString() || "") ||
      stock.edited_price !== (stock.price?.toString() || "")
    );
  };

  // Сохранение изменений акции
  const handleSaveChanges = async (stockId) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock || !hasChanges(stock) || stock.is_archived) return;

    setSavingId(stockId);

    try {
      const body = {};

      if (stock.edited_ticker !== stock.ticker) {
        body.ticker = stock.edited_ticker;
      }
      
      if (stock.edited_isin !== stock.isin) {
        body.isin = stock.edited_isin.toUpperCase();
      }
      
      if (stock.edited_lot_size !== stock.lot_size?.toString()) {
        const lotSize = parseInt(stock.edited_lot_size);
        if (isNaN(lotSize) || lotSize <= 0) {
          alert("Размер лота должен быть положительным целым числом");
          setSavingId(null);
          return;
        }
        body.lot_size = lotSize;
      }
      
      if (stock.edited_price !== stock.price?.toString()) {
        const price = parseFloat(stock.edited_price);
        if (isNaN(price) || price <= 0) {
          alert("Цена должна быть положительным числом");
          setSavingId(null);
          return;
        }
        body.price = price;
      }

      if (Object.keys(body).length === 0) {
        setSavingId(null);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/exchange/stocks/${stockId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Ошибка сохранения изменений");
        fetchStocks();
        return;
      }

      fetchStocks();
      alert("Изменения успешно сохранены!");
    } catch {
      alert("Ошибка соединения с сервером");
      fetchStocks();
    } finally {
      setSavingId(null);
    }
  };

  // Архивация/разархивация ценной бумаги
  const handleArchiveStock = async (stockId, archive = true) => {
    const action = archive ? "архивировать" : "разархивировать";
    const confirmMessage = archive 
      ? "Вы уверены, что хотите архивировать эту ценную бумагу? Архивные бумаги нельзя будет редактировать."
      : "Вы уверены, что хотите разархивировать эту ценную бумагу?";
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSavingId(stockId);

    try {
      const endpoint = archive 
        ? `${API_BASE_URL}/api/exchange/stocks/${stockId}/archive`
        : `${API_BASE_URL}/api/exchange/stocks/${stockId}/restore`;
      
      const method = archive ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ archive: archive })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || `Ошибка при ${action} ценной бумаги`);
        return;
      }

      fetchStocks();
      alert(`Ценная бумага успешно ${archive ? "архивирована" : "разархивирована"}!`);
    } catch (error) {
      console.error(`Ошибка ${action}:`, error);
      alert("Ошибка соединения с сервером");
    } finally {
      setSavingId(null);
    }
  };

  const totalStocks = stocks.length;
  const archivedStocks = stocks.filter(stock => stock.is_archived).length;
  const activeStocks = stocks.filter(stock => !stock.is_archived).length;

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
              <span className="stat-label">Всего бумаг:</span>
              <span className="stat-value">{totalStocks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Активных:</span>
              <span className="stat-value" style={{ color: '#10b981' }}>{activeStocks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Архивных:</span>
              <span className="stat-value" style={{ color: '#64748b' }}>{archivedStocks}</span>
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
              <div className="ExchangeAdminPage-form-group">
                <label>Название *</label>
                <input
                  type="text"
                  name="ticker"
                  placeholder="Например 'Сбербанк'"
                  value={formData.ticker}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldError('ticker') && (touched.ticker || formSubmitted) ? 'input-error' : ''}
                />
                {getFieldError('ticker') && (touched.ticker || formSubmitted) && (
                  <span className="error-message">{getFieldError('ticker')}</span>
                )}
              </div>

              <div className="ExchangeAdminPage-form-group">
                <label>ISIN (только латинские буквы) *</label>
                <input
                  type="text"
                  name="isin"
                  placeholder="Например: SBER"
                  value={formData.isin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldError('isin') && (touched.isin || formSubmitted) ? 'input-error' : ''}
                />
                {getFieldError('isin') && (touched.isin || formSubmitted) && (
                  <span className="error-message">{getFieldError('isin')}</span>
                )}
              </div>

              <div className="ExchangeAdminPage-form-group">
                <label>Размер лота * (целое положительное число)</label>
                <input
                  type="number"
                  name="lot_size"
                  placeholder="Целое положительное число"
                  step="1"
                  min="1"
                  value={formData.lot_size}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldError('lot_size') && (touched.lot_size || formSubmitted) ? 'input-error' : ''}
                />
                {getFieldError('lot_size') && (touched.lot_size || formSubmitted) && (
                  <span className="error-message">{getFieldError('lot_size')}</span>
                )}
              </div>

              <div className="ExchangeAdminPage-form-group">
                <label>Цена ценной бумаги в указанной валюте *</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0.01"
                  placeholder="Цена больше нуля"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldError('price') && (touched.price || formSubmitted) ? 'input-error' : ''}
                />
                {getFieldError('price') && (touched.price || formSubmitted) && (
                  <span className="error-message">{getFieldError('price')}</span>
                )}
              </div>

              <div className="ExchangeAdminPage-form-group">
                <label>Валюта *</label>
                {currenciesLoading ? (
                  <div className="ExchangeAdminPage-loading-small">Загрузка валют...</div>
                ) : currencies.length === 0 ? (
                  <div className="ExchangeAdminPage-warning">
                    <AlertCircle size={16} />
                    Нет доступных валют
                  </div>
                ) : (
                  <>
                    <select 
                      name="currency_id" 
                      value={formData.currency_id} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getFieldError('currency_id') && (touched.currency_id || formSubmitted) ? 'input-error' : ''}
                    >
                      <option value="">Выберите валюту</option>
                      {currencies.map(curr => (
                        <option key={curr.id} value={curr.id}>
                          {curr.code} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                    {getFieldError('currency_id') && (touched.currency_id || formSubmitted) && (
                      <span className="error-message">{getFieldError('currency_id')}</span>
                    )}
                  </>
                )}
              </div>

              <div className="ExchangeAdminPage-form-actions">
                <button
                  type="button"
                  className="ExchangeAdminPage-btn-secondary"
                  onClick={handleCancelForm}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading || !isFormValid()} 
                  className={`ExchangeAdminPage-btn-primary ${(!isFormValid() || formLoading) ? 'button-disabled' : ''}`}
                >
                  {formLoading ? "Добавление..." : "Добавить акцию"}
                </button>
              </div>
              <p className="required-note">* Обязательные поля</p>
            </form>
          </div>
        )}

        {/* Состояния загрузки и ошибок */}
        {loading && <div className="loading-text">Загрузка акций...</div>}
        {error && <div className="error-text">{error}</div>}

        {/* Таблица ценных бумаг */}
        <div className="admin-table-wrapper">
          <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Список ценных бумаг</h2>
          
          {stocks.length === 0 && !loading ? (
            <div className="no-data" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              На бирже пока нет акций
            </div>
          ) : (
            <table className="currency-table" style={{ width: '100%', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Тикер</th>
                  <th>ISIN</th>
                  <th>Размер лота</th>
                  <th>Цена</th>
                  <th>Валюта</th>
                  <th>Изменение</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map(stock => (
                  <tr key={stock.id} className={stock.is_archived ? "archived-row" : ""}>
                    <td>{stock.id}</td>
                    <td>
                      <input
                        value={stock.edited_ticker ?? stock.ticker}
                        onChange={(e) => handleFieldChange(stock.id, 'edited_ticker', e.target.value)}
                        className={`table-input ${stock.is_archived ? 'archived-input' : ''}`}
                        style={{ width: '100%' }}
                        disabled={stock.is_archived}
                      />
                    </td>
                    <td>
                      <input
                        value={stock.edited_isin ?? stock.isin}
                        onChange={(e) => handleFieldChange(stock.id, 'edited_isin', e.target.value.toUpperCase())}
                        className={`table-input ${stock.is_archived ? 'archived-input' : ''}`}
                        style={{ width: '100%' }}
                        disabled={stock.is_archived}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={stock.edited_lot_size ?? stock.lot_size}
                        onChange={(e) => handleFieldChange(stock.id, 'edited_lot_size', e.target.value)}
                        className={`table-input ${stock.is_archived ? 'archived-input' : ''}`}
                        style={{ width: '100%' }}
                        disabled={stock.is_archived}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={stock.edited_price ?? (stock.price?.toString() || "")}
                        onChange={(e) => handleFieldChange(stock.id, 'edited_price', e.target.value)}
                        className={`table-input ${stock.is_archived ? 'archived-input' : ''}`}
                        style={{ width: '100%' }}
                        disabled={stock.is_archived}
                      />
                    </td>
                    <td>{stock.currency}</td>
                    <td>
                      <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${stock.is_archived ? 'archived' : 'active'}`}>
                        {stock.is_archived ? 'Архивная' : 'Активная'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {hasChanges(stock) && !stock.is_archived && (
                        <button
                          onClick={() => handleSaveChanges(stock.id)}
                          className="apply-btn"
                          disabled={savingId === stock.id}
                          style={{ marginRight: '8px' }}
                        >
                          {savingId === stock.id ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <RefreshCw size={14} className="spin" />
                              Сохранение...
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Save size={14} />
                              Сохранить
                            </span>
                          )}
                        </button>
                      )}
                      
                      {stock.is_archived ? (
                        <button
                          onClick={() => handleArchiveStock(stock.id, false)}
                          className="restore-btn"
                          disabled={savingId === stock.id}
                          title="Разархивировать"
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ArchiveRestore size={14} />
                            {savingId === stock.id ? "..." : "Разархивировать"}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchiveStock(stock.id, true)}
                          className="archive-btn"
                          disabled={savingId === stock.id}
                          title="Архивировать"
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Archive size={14} />
                            {savingId === stock.id ? "..." : "Архивировать"}
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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