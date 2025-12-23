import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import "./ModifyCurrencyPage.css";

const API_BASE_URL = "http://localhost:8000";

const ModifyCurrencyPage = () => {
  const token = localStorage.getItem("authToken");

  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCurrency, setNewCurrency] = useState({
    code: "",
    symbol: ""
  });

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/currencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Ошибка загрузки валют");
      const data = await res.json();
      setCurrencies(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleAddCurrency = async () => {
    if (!newCurrency.code || !newCurrency.symbol) {
      alert("Пожалуйста, заполните код и символ валюты");
      return;
    }

    try {
      // Отправляем POST запрос с данными в теле запроса
      const res = await fetch(`${API_BASE_URL}/api/add_currency`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currency_code: newCurrency.code,
          currency_symbol: newCurrency.symbol
        })
      });

      if (!res.ok) {
        // Пробуем получить текст ошибки
        try {
          const errData = await res.json();
          alert(errData.detail || `Ошибка ${res.status}: ${res.statusText}`);
        } catch {
          alert(`Ошибка ${res.status}: ${res.statusText}`);
        }
        return;
      }

      // Очищаем форму и обновляем список
      setNewCurrency({ code: "", symbol: "" });
      fetchCurrencies();
      alert("Валюта успешно добавлена!");
      
    } catch (error) {
      console.error("Ошибка добавления валюты:", error);
      alert("Ошибка соединения с сервером");
    }
  };

  // Обработка нажатия Enter в полях ввода
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCurrency();
    }
  };

  const handleUpdateCurrency = async (id, field, value) => {
    const currency = currencies.find(c => c.id === id);
    if (!currency) return;

    try {
      await fetch(`${API_BASE_URL}/api/currencies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...currency, [field]: value })
      });
      fetchCurrencies();
    } catch {
      alert("Ошибка обновления валюты");
    }
  };

  return (
    <div className="admin-page">
      <AdminHeader />

      <div className="admin-content">
        <h1>Редактирование валют</h1>

        {loading && <div>Загрузка...</div>}
        {error && <div className="error-text">{error}</div>}

        {/* Добавление валюты */}
        <div className="currency-add-card">
          <input
            placeholder="Код (USD)"
            maxLength={3}
            value={newCurrency.code}
            onChange={e => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
            onKeyPress={handleKeyPress}
          />
          <input
            placeholder="Символ ($)"
            value={newCurrency.symbol}
            onChange={e => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
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
            </tr>
          </thead>
          <tbody>
            {currencies.map(curr => (
              <tr key={curr.id}>
                <td>{curr.id}</td>
                <td>
                  <input
                    value={curr.code}
                    maxLength={3}
                    onBlur={e => handleUpdateCurrency(curr.id, "code", e.target.value)}
                    onChange={e =>
                      setCurrencies(prev =>
                        prev.map(c =>
                          c.id === curr.id ? { ...c, code: e.target.value.toUpperCase() } : c
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    value={curr.symbol}
                    onBlur={e => handleUpdateCurrency(curr.id, "symbol", e.target.value)}
                    onChange={e =>
                      setCurrencies(prev =>
                        prev.map(c =>
                          c.id === curr.id ? { ...c, symbol: e.target.value } : c
                        )
                      )
                    }
                  />
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