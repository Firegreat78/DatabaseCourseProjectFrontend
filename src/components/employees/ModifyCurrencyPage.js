import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import "./ModifyCurrencyPage.css";

const API_BASE_URL = "http://localhost:8000";

const ModifyCurrencyPage = () => {
  const token = localStorage.getItem("authToken");

  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const [newCurrency, setNewCurrency] = useState({
    code: "",
    symbol: "",
    rate: ""
  });

  const fetchCurrencies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/currencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Ошибка загрузки валют");
      }
      const data = await res.json();

      // Добавляем поля для локального редактирования
      const enriched = data.map(curr => ({
        ...curr,
        edited_code: curr.code,
        edited_symbol: curr.symbol,
        // Для архивных валют используем прочерк вместо значения курса
        edited_rate: curr.archived ? "—" : (curr.rate_to_ruble !== null ? parseFloat(curr.rate_to_ruble).toFixed(4) : "")
      }));

      setCurrencies(enriched);
    } catch (e) {
      setError(e.message || "Не удалось загрузить валюты");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleAddCurrency = async () => {
    if (!newCurrency.code.trim() || !newCurrency.symbol.trim()) {
      alert("Пожалуйста, заполните код и символ валюты");
      return;
    }

    const rate = newCurrency.rate.trim() ? parseFloat(newCurrency.rate.replace(",", ".")) : null;
    if (newCurrency.rate.trim() && (isNaN(rate) || rate <= 0)) {
      alert("Курс должен быть положительным числом");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/currencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: newCurrency.code.toUpperCase(),
          symbol: newCurrency.symbol,
          rate_to_ruble: rate
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || `Ошибка добавления валюты`);
        return;
      }

      setNewCurrency({ code: "", symbol: "", rate: "" });
      fetchCurrencies();
      alert("Валюта успешно добавлена!");
    } catch (error) {
      console.error("Ошибка добавления валюты:", error);
      alert("Ошибка соединения с сервером");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddCurrency();
    }
  };

  const handleApplyChanges = async (id) => {
    const currency = currencies.find((c) => c.id === id);
    if (!currency) return;

    setSavingId(id);

    try {
      const body = {};

      if (currency.edited_code !== currency.code) {
        body.code = currency.edited_code.toUpperCase();
      }
      if (currency.edited_symbol !== currency.symbol) {
        body.symbol = currency.edited_symbol;
      }
      // Не позволяем изменять курс для архивных валют
      if (!currency.archived && 
          currency.edited_rate !== "" && 
          currency.edited_rate !== "—" &&
          currency.edited_rate !== (currency.rate_to_ruble !== null ? parseFloat(currency.rate_to_ruble).toFixed(4) : "")) {
        const numValue = parseFloat(currency.edited_rate.replace(",", "."));
        if (isNaN(numValue) || numValue <= 0) {
          alert("Курс должен быть положительным числом");
          setSavingId(null);
          return;
        }
        body.rate_to_ruble = numValue;
      }

      if (Object.keys(body).length === 0) {
        setSavingId(null);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/currencies/${id}`, {
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
        fetchCurrencies();
        return;
      }

      fetchCurrencies();
    } catch {
      alert("Ошибка сохранения изменений");
      fetchCurrencies();
    } finally {
      setSavingId(null);
    }
  };

  const handleArchiveCurrency = async (id) => {
    setSavingId(id);

    try {
      const res = await fetch(`${API_BASE_URL}/api/archive_currency/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Ошибка при архивации валюты");
        return;
      }

      fetchCurrencies();
      alert("Валюта успешно архивирована");
    } catch (error) {
      console.error("Ошибка архивации:", error);
      alert("Ошибка соединения с сервером");
    } finally {
      setSavingId(null);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setCurrencies((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const handleRateChange = (id, value) => {
    const currency = currencies.find(c => c.id === id);
    if (currency && currency.archived) {
      // Не позволяем менять значение для архивных валют
      return;
    }
    handleFieldChange(id, 'edited_rate', value);
  };

  const hasChanges = (curr) => {
    // Для архивных валют нет изменений
    if (curr.archived) return false;
    
    return (
      curr.edited_code !== curr.code ||
      curr.edited_symbol !== curr.symbol ||
      (curr.edited_rate !== "" && 
       curr.edited_rate !== "—" &&
       curr.edited_rate !== (curr.rate_to_ruble !== null ? parseFloat(curr.rate_to_ruble).toFixed(4) : ""))
    );
  };

  const formatRateForDisplay = (currency) => {
    if (currency.archived) {
      return "—";
    }
    return currency.rate_to_ruble !== null ? parseFloat(currency.rate_to_ruble).toFixed(4) : "";
  };

  return (
    <div className="admin-page">
      <AdminHeader />

      <div className="admin-content">
        <h1>Редактирование валют</h1>

        {loading && <div className="loading">Загрузка...</div>}
        {error && <div className="error-text">{error}</div>}

        {/* Добавление валюты */}
        <div className="currency-add-card">
          <input
            placeholder="Код валюты"
            maxLength={3}
            value={newCurrency.code}
            onChange={(e) =>
              setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })
            }
            onKeyPress={handleKeyPress}
          />
          <input
            placeholder="Символ валюты"
            value={newCurrency.symbol}
            onChange={(e) =>
              setNewCurrency({ ...newCurrency, symbol: e.target.value })
            }
            onKeyPress={handleKeyPress}
          />
          <input
            placeholder="Курс валюты к RUB"
            value={newCurrency.rate}
            onChange={(e) =>
              setNewCurrency({ ...newCurrency, rate: e.target.value })
            }
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleAddCurrency}>Добавить</button>
        </div>

        {/* Список валют */}
        <table className="currency-table">
          <thead>
            <tr>
              <th>ID валюты</th>
              <th>Код валюты</th>
              <th>Символ валюты</th>
              <th>Курс валюты к RUB</th>
              <th>Архивная</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currencies.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="no-data">
                  Нет валют в списке
                </td>
              </tr>
            )}
            {currencies.map((curr) => (
              <tr key={curr.id} className={curr.archived ? "archived-row" : ""}>
                <td>{curr.id}</td>
                <td>
                  <input
                    value={curr.edited_code ?? curr.code}
                    maxLength={3}
                    onChange={(e) =>
                      setCurrencies((prev) =>
                        prev.map((c) =>
                          c.id === curr.id
                            ? { ...c, edited_code: e.target.value.toUpperCase() }
                            : c
                        )
                      )
                    }
                    disabled={curr.archived || curr.id === 1}
                    className={curr.archived ? "archived-input" : ""}
                  />
                </td>
                <td>
                  <input
                    value={curr.edited_symbol ?? curr.symbol}
                    onChange={(e) =>
                      setCurrencies((prev) =>
                        prev.map((c) =>
                          c.id === curr.id ? { ...c, edited_symbol: e.target.value } : c
                        )
                      )
                    }
                    disabled={curr.archived || curr.id === 1}
                    className={curr.archived ? "archived-input" : ""}
                  />
                </td>
                <td>
                  {curr.archived ? (
                    <span className="archived-rate">—</span>
                  ) : (
                    <input
                      type="text"
                      value={curr.edited_rate ?? formatRateForDisplay(curr)}
                      placeholder={curr.rate_to_ruble == null ? "Не установлен" : ""}
                      onChange={(e) => handleRateChange(curr.id, e.target.value)}
                      disabled={curr.archived || curr.id === 1}
                    />
                  )}
                </td>
                <td className="archived-cell">
                  {curr.archived ? "Да" : "Нет"}
                </td>
                <td className="actions-cell">
                  {/* Кнопка "Применить изменения" */}
                  {hasChanges(curr) && !curr.archived && curr.id !== 1 && (
                    <button
                      onClick={() => handleApplyChanges(curr.id)}
                      className="apply-btn"
                      disabled={savingId === curr.id}
                    >
                      {savingId === curr.id ? "Сохранение..." : "Применить изменения"}
                    </button>
                  )}

                  {/* Кнопка "Архивировать" — только для неархивных валют, кроме id=1 */}
                  {!curr.archived && curr.id !== 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm("Вы уверены, что хотите архивировать валюту? Это действие невозможно отменить.")) {
                          handleArchiveCurrency(curr.id);
                        }
                      }}
                      className="archive-btn"
                      disabled={savingId === curr.id}
                    >
                      Архивировать
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModifyCurrencyPage;