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

      // Для каждой валюты загружаем курс
      const currenciesWithRate = await Promise.all(
        data.map(async (curr) => {
          try {
            const rateRes = await fetch(`${API_BASE_URL}/api/rate_to_ruble/${curr.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (rateRes.ok) {
              const rateData = await rateRes.json();
              return { ...curr, current_rate: rateData.rate_to_rub };
            }
          } catch {
            // Если курса нет — оставляем null
          }
          return { ...curr, current_rate: null };
        })
      );

      setCurrencies(currenciesWithRate);
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
          rate_to_ruble: rate // если указан — отправляем, иначе сервер установит по умолчанию
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

  const handleUpdateCurrency = async (id, field, value) => {
    setSavingId(id);
    try {
      let body = {};
      if (field === "code") body.code = value.toUpperCase();
      if (field === "symbol") body.symbol = value;
      if (field === "rate") {
        const numValue = parseFloat(value.replace(",", "."));
        if (isNaN(numValue) || numValue <= 0) {
          alert("Курс должен быть положительным числом");
          fetchCurrencies();
          return;
        }
        body.rate_to_ruble = numValue;
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
        alert(errData.detail || "Ошибка обновления валюты");
        fetchCurrencies();
        return;
      }

      fetchCurrencies();
    } catch {
      alert("Ошибка обновления валюты");
      fetchCurrencies();
    } finally {
      setSavingId(null);
    }
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
            placeholder="Код (USD)"
            maxLength={3}
            value={newCurrency.code}
            onChange={(e) =>
              setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })
            }
            onKeyPress={handleKeyPress}
          />
          <input
            placeholder="Символ ($)"
            value={newCurrency.symbol}
            onChange={(e) =>
              setNewCurrency({ ...newCurrency, symbol: e.target.value })
            }
            onKeyPress={handleKeyPress}
          />
          <input
            placeholder="Курс к RUB (опционально)"
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
              <th>ID</th>
              <th>Код</th>
              <th>Символ</th>
              <th>Курс к RUB</th>
              <th>Архивная</th>
            </tr>
          </thead>
          <tbody>
            {currencies.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="no-data">
                  Нет валют в списке
                </td>
              </tr>
            )}
            {currencies.map((curr) => (
              <tr key={curr.id} className={curr.is_archived ? "archived-row" : ""}>
                <td>{curr.id}</td>
                <td>
                  <input
                    value={curr.code}
                    maxLength={3}
                    onBlur={(e) =>
                      handleUpdateCurrency(curr.id, "code", e.target.value)
                    }
                    onChange={(e) =>
                      setCurrencies((prev) =>
                        prev.map((c) =>
                          c.id === curr.id ? { ...c, code: e.target.value.toUpperCase() } : c
                        )
                      )
                    }
                    disabled={curr.is_archived}
                  />
                </td>
                <td>
                  <input
                    value={curr.symbol}
                    onBlur={(e) =>
                      handleUpdateCurrency(curr.id, "symbol", e.target.value)
                    }
                    onChange={(e) =>
                      setCurrencies((prev) =>
                        prev.map((c) =>
                          c.id === curr.id ? { ...c, symbol: e.target.value } : c
                        )
                      )
                    }
                    disabled={curr.is_archived}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={curr.current_rate ?? ""}
                    placeholder={curr.current_rate == null ? "Не установлен" : ""}
                    onBlur={(e) =>
                      handleUpdateCurrency(curr.id, "rate", e.target.value)
                    }
                    onChange={(e) =>
                      setCurrencies((prev) =>
                        prev.map((c) =>
                          c.id === curr.id ? { ...c, current_rate: e.target.value } : c
                        )
                      )
                    }
                    disabled={curr.is_archived}
                    className={savingId === curr.id ? "saving-input" : ""}
                  />
                </td>
                <td className="archived-cell">
                  {curr.is_archived ? "Да" : "Нет"}
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