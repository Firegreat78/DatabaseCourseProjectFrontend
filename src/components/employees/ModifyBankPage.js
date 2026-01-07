import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import "./ModifyBankPage.css";

const API_BASE_URL = "http://localhost:8000";

const ModifyBankPage = () => {
  const token = localStorage.getItem("authToken");

  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [newBank, setNewBank] = useState({
    name: "",
    inn: "",
    ogrn: "",
    bik: "",
    license_expiry_date: ""
  });

  const fetchBanks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/banks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Ошибка загрузки банков");
      }
      const data = await res.json();

      // Добавляем поля для локального редактирования
      const enriched = data.map(bank => ({
        ...bank,
        edited_name: bank.name,
        edited_inn: bank.inn,
        edited_ogrn: bank.ogrn,
        edited_bik: bank.bik,
        edited_license_expiry_date: bank.license_expiry_date
      }));

      setBanks(enriched);
    } catch (e) {
      setError(e.message || "Не удалось загрузить банки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleAddBank = async () => {
    if (!newBank.name.trim() || !newBank.inn.trim() || !newBank.ogrn.trim() || !newBank.bik.trim() || !newBank.license_expiry_date) {
      alert("Все поля обязательны для заполнения");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/banks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newBank.name.trim(),
          inn: newBank.inn.trim(),
          ogrn: newBank.ogrn.trim(),
          bik: newBank.bik.trim(),
          license_expiry_date: newBank.license_expiry_date
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Ошибка добавления банка");
        return;
      }

      setNewBank({ name: "", inn: "", ogrn: "", bik: "", license_expiry_date: "" });
      fetchBanks();
      alert("Банк успешно добавлен!");
    } catch (error) {
      console.error("Ошибка добавления банка:", error);
      alert("Ошибка соединения с сервером");
    }
  };

  const handleApplyChanges = async (id) => {
    const bank = banks.find((b) => b.id === id);
    if (!bank) return;

    setSavingId(id);

    try {
      const body = {};

      if (bank.edited_name !== bank.name) body.name = bank.edited_name.trim();
      if (bank.edited_inn !== bank.inn) body.inn = bank.edited_inn.trim();
      if (bank.edited_ogrn !== bank.ogrn) body.ogrn = bank.edited_ogrn.trim();
      if (bank.edited_bik !== bank.bik) body.bik = bank.edited_bik.trim();
      if (bank.edited_license_expiry_date !== bank.license_expiry_date) body.license_expiry_date = bank.edited_license_expiry_date;

      if (Object.keys(body).length === 0) {
        setSavingId(null);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/banks/${id}`, {
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
        return;
      }

      fetchBanks();
    } catch {
      alert("Ошибка сохранения изменений");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить банк? Это действие невозможно отменить.")) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`${API_BASE_URL}/api/banks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Ошибка при удалении банка");
        return;
      }

      fetchBanks();
      alert("Банк успешно удалён");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Ошибка соединения с сервером");
    } finally {
      setDeletingId(null);
    }
  };

  const hasChanges = (bank) => {
    return (
      bank.edited_name !== bank.name ||
      bank.edited_inn !== bank.inn ||
      bank.edited_ogrn !== bank.ogrn ||
      bank.edited_bik !== bank.bik ||
      bank.edited_license_expiry_date !== bank.license_expiry_date
    );
  };

  return (
    <div className="admin-page">
      <AdminHeader />

      <div className="admin-content">
        <h1>Редактирование банков</h1>

        {loading && <div className="loading">Загрузка...</div>}
        {error && <div className="error-text">{error}</div>}

        {/* Добавление банка */}
        <div className="bank-add-card">
          <input
            placeholder="Наименование"
            value={newBank.name}
            onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="ИНН (10 цифр)"
            value={newBank.inn}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 10) {
                setNewBank({ ...newBank, inn: value });
              }
            }}
            maxLength={10}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="ОГРН (13 или 15 цифр)"
            value={newBank.ogrn}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 15) {
                setNewBank({ ...newBank, ogrn: value });
              }
            }}
            maxLength={15}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="БИК (9 цифр)"
            value={newBank.bik}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 9) {
                setNewBank({ ...newBank, bik: value });
              }
            }}
            maxLength={9}
          />
          <input
            type="date"
            placeholder="Срок действия лицензии"
            value={newBank.license_expiry_date}
            onChange={(e) => setNewBank({ ...newBank, license_expiry_date: e.target.value })}
          />
          <button onClick={handleAddBank}>Добавить</button>
        </div>

        {/* Список банков */}
        <table className="bank-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Наименование</th>
              <th>ИНН</th>
              <th>ОГРН</th>
              <th>БИК</th>
              <th>Срок лицензии</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {banks.length === 0 && !loading && (
              <tr>
                <td colSpan="7" className="no-data">
                  Нет банков в списке
                </td>
              </tr>
            )}
            {banks.map((bank) => (
              <tr key={bank.id}>
                <td>{bank.id}</td>
                <td>
                  <input
                    value={bank.edited_name ?? bank.name}
                    onChange={(e) =>
                      setBanks((prev) =>
                        prev.map((b) =>
                          b.id === bank.id ? { ...b, edited_name: e.target.value } : b
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bank.edited_inn ?? bank.inn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 10) {
                        setBanks((prev) =>
                          prev.map((b) =>
                            b.id === bank.id ? { ...b, edited_inn: value } : b
                          )
                        );
                      }
                    }}
                    maxLength={10}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bank.edited_ogrn ?? bank.ogrn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 15) {
                        setBanks((prev) =>
                          prev.map((b) =>
                            b.id === bank.id ? { ...b, edited_ogrn: value } : b
                          )
                        );
                      }
                    }}
                    maxLength={15}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bank.edited_bik ?? bank.bik}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 9) {
                        setBanks((prev) =>
                          prev.map((b) =>
                            b.id === bank.id ? { ...b, edited_bik: value } : b
                          )
                        );
                      }
                    }}
                    maxLength={9}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={bank.edited_license_expiry_date ?? bank.license_expiry_date}
                    onChange={(e) =>
                      setBanks((prev) =>
                        prev.map((b) =>
                          b.id === bank.id ? { ...b, edited_license_expiry_date: e.target.value } : b
                        )
                      )
                    }
                  />
                </td>
                <td className="actions-cell">
                  {hasChanges(bank) && (
                    <button
                      onClick={() => handleApplyChanges(bank.id)}
                      className="apply-btn"
                      disabled={savingId === bank.id}
                    >
                      {savingId === bank.id ? "Сохранение..." : "Применить изменения"}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteBank(bank.id)}
                    className="delete-btn"
                    disabled={deletingId === bank.id}
                  >
                    {deletingId === bank.id ? "Удаление..." : "Удалить"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModifyBankPage;