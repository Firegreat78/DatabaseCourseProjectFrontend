// src/components/admin/AdminDictionariesPage.js
import React, { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import { 
  Book, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Database,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import './AdminDictionariesPage.css';

const API_BASE_URL = 'http://localhost:8000';

// Список доступных словарей
const DICTIONARIES = [
  { id: 'employment_status', name: 'Статусы трудоустройства', keyField: 'id', displayField: 'status' },
  { id: 'verification_status', name: 'Статусы верификации', keyField: 'id', displayField: 'status' },
  { id: 'user_restriction_status', name: 'Статусы блокировки', keyField: 'id', displayField: 'status' },
  { id: 'proposal_status', name: 'Статусы предложений', keyField: 'id', displayField: 'status' },
  { id: 'proposal_type', name: 'Типы предложений', keyField: 'id', displayField: 'type' },
  { id: 'depository_account_operation_type', name: 'Типы операций депозитарного счета', keyField: 'id', displayField: 'type' },
  { id: 'brokerage_account_operation_type', name: 'Типы операций брокерского счета', keyField: 'id', displayField: 'type_name' },
  { id: 'currency', name: 'Валюты', keyField: 'id', displayField: 'code' },
  { id: 'bank', name: 'Банки', keyField: 'id', displayField: 'name' },
];

const AdminDictionariesPage = () => {
  const [selectedDictionary, setSelectedDictionary] = useState('');
  const [dictionaryData, setDictionaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Состояния для добавления/редактирования
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // Получаем токен авторизации
  const token = localStorage.getItem('authToken');

  // Проверка аутентификации
  useEffect(() => {
    if (!token) {
      setError('Требуется авторизация. Пожалуйста, войдите снова.');
    }
  }, [token]);

  // Загрузить данные выбранного словаря
  useEffect(() => {
    if (!selectedDictionary) {
      setDictionaryData([]);
      return;
    }

    const fetchDictionary = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/${selectedDictionary}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Ошибка ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDictionaryData(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchDictionary();
  }, [selectedDictionary, token]);

  // Обработчик выбора словаря
  const handleSelectDictionary = (e) => {
    setSelectedDictionary(e.target.value);
    setShowAddForm(false);
    setEditingId(null);
    setNewItem({});
    setEditForm({});
  };

  // Проверка, является ли поле датой
  const isDateField = (fieldName) => {
    const lowerField = fieldName.toLowerCase();
    return lowerField.includes('date') || 
           lowerField.includes('expiry') || 
           lowerField.includes('time') ||
           lowerField.includes('дата') ||
           lowerField.includes('срок');
  };

  // Форматирование даты для отображения
  const formatDateForDisplay = (dateValue) => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      return date.toLocaleDateString('ru-RU');
    } catch (e) {
      return dateValue;
    }
  };

  // Форматирование даты для input type="date"
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateValue;
    }
  };

  // Обработчик изменения полей новой записи
  const handleNewItemChange = (field, value) => {
    setNewItem({ ...newItem, [field]: value });
  };

  // Обработчик изменения полей при редактировании
  const handleEditChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  // Добавление новой записи
  const handleAddItem = async () => {
    if (!selectedDictionary || !token) return;
    
    try {
      const currentDict = DICTIONARIES.find(d => d.id === selectedDictionary);
      if (!currentDict) {
        setError('Неизвестный словарь');
        return;
      }
      
      // Для словарей, где есть displayField, проверяем его заполнение
      if (currentDict.displayField && !newItem[currentDict.displayField]?.toString().trim()) {
        setError(`Поле "${currentDict.displayField}" обязательно для заполнения`);
        return;
      }
      
      // Особые проверки для банка
      if (selectedDictionary === 'bank') {
        if (!newItem.license_expiry) {
          setError('Дата окончания лицензии обязательна');
          return;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/${selectedDictionary}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorText = data.detail || data.message || JSON.stringify(data) || 'Ошибка добавления записи';
        throw new Error(errorText);
      }
      
      // Обновляем список
      setDictionaryData([...dictionaryData, data]);
      setNewItem({});
      setShowAddForm(false);
      setSuccess('Запись успешно добавлена');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding item:', err);
      setError(`Ошибка: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Начало редактирования записи
  const startEdit = (item) => {
    setEditingId(item.id);
    // Преобразуем даты для полей ввода
    const formattedItem = { ...item };
    Object.keys(formattedItem).forEach(key => {
      if (isDateField(key) && formattedItem[key]) {
        formattedItem[key] = formatDateForInput(formattedItem[key]);
      }
    });
    setEditForm(formattedItem);
  };

  // Сохранение изменений записи
  const saveEdit = async () => {
    if (!selectedDictionary || !editingId || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/${selectedDictionary}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorText = data.detail || data.message || JSON.stringify(data) || 'Ошибка обновления записи';
        throw new Error(errorText);
      }
      
      // Обновляем данные в состоянии
      setDictionaryData(dictionaryData.map(item => 
        item.id === editingId ? { ...item, ...editForm } : item
      ));
      setEditingId(null);
      setEditForm({});
      setSuccess('Запись успешно обновлена');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating item:', err);
      setError(`Ошибка: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Удаление записи
  const deleteItem = async (id) => {
    if (!selectedDictionary || !token) return;
    
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/${selectedDictionary}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ошибка удаления записи');
      }
      
      // Убираем удаленный элемент из состояния
      setDictionaryData(dictionaryData.filter(item => item.id !== id));
      setSuccess('Запись успешно удалена');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(`Ошибка: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Получить поля (ключи) из первого элемента, если есть данные
  const fields = dictionaryData.length > 0 ? Object.keys(dictionaryData[0]) : [];
  // Исключаем поля id из формы добавления (оно обычно автоинкрементное)
  const addFields = fields.filter(field => field !== 'id');
  
  // Найти текущий словарь для получения информации о полях
  const currentDict = DICTIONARIES.find(d => d.id === selectedDictionary);

  // Обновить данные
  const refreshData = async () => {
    if (!selectedDictionary || !token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/${selectedDictionary}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDictionaryData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Ошибка обновления данных');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminHeader />
      <main className="admin-content">
        <div className="page-header">
          <h1><Book size={24} /> Управление словарями базы данных</h1>
        </div>

        <div className="dictionaries-container">
          {/* Выбор словаря */}
          <div className="dictionary-selector">
            <label>Выберите словарь:</label>
            <select 
              value={selectedDictionary} 
              onChange={handleSelectDictionary}
              className="dict-select"
            >
              <option value="">-- Выберите словарь --</option>
              {DICTIONARIES.map(dict => (
                <option key={dict.id} value={dict.id}>
                  {dict.name}
                </option>
              ))}
            </select>
            
            {selectedDictionary && (
              <button 
                onClick={refreshData} 
                className="refresh-btn"
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? 'spin' : ''} />
                Обновить
              </button>
            )}
          </div>

          {/* Сообщения об ошибках и успехе */}
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <span>{success}</span>
            </div>
          )}

          {loading && <div className="loading">Загрузка данных...</div>}

          {/* Если словарь выбран, отображаем его данные */}
          {selectedDictionary && !loading && (
            <>
              <div className="dictionary-header">
                <div className="dict-info">
                  <Database size={20} />
                  <h2>
                    {currentDict?.name || selectedDictionary}
                    <span className="record-count"> ({dictionaryData.length} записей)</span>
                  </h2>
                </div>
                
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="add-btn"
                >
                  <Plus size={18} />
                  {showAddForm ? 'Скрыть форму' : 'Добавить запись'}
                </button>
              </div>

              {/* Форма добавления новой записи */}
              {showAddForm && (
                <div className="add-item-form">
                  <h3>Новая запись</h3>
                  <div className="form-fields">
                    {addFields.map(field => {
                      const isDate = isDateField(field);
                      return (
                        <div key={field} className="form-field">
                          <label>{field}:</label>
                          {isDate ? (
                            <input
                              type="date"
                              value={newItem[field] || ''}
                              onChange={(e) => handleNewItemChange(field, e.target.value)}
                              placeholder={`Введите ${field}`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={newItem[field] || ''}
                              onChange={(e) => handleNewItemChange(field, e.target.value)}
                              placeholder={`Введите ${field}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="form-actions">
                    <button 
                      onClick={handleAddItem} 
                      className="btn-save"
                      disabled={
                        !token || 
                        (currentDict?.displayField && !newItem[currentDict.displayField]?.toString().trim())
                      }
                    >
                      <Save size={16} /> Добавить
                    </button>
                    <button 
                      onClick={() => {
                        setShowAddForm(false);
                        setNewItem({});
                      }} 
                      className="btn-cancel"
                    >
                      <X size={16} /> Отмена
                    </button>
                  </div>
                </div>
              )}

              {/* Таблица данных */}
              <div className="dictionary-data">
                {dictionaryData.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="dictionary-table">
                      <thead>
                        <tr>
                          {fields.map(field => (
                            <th key={field}>
                              {field === 'id' ? 'ID' : field}
                            </th>
                          ))}
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dictionaryData.map(item => (
                          <tr key={item.id}>
                            {fields.map(field => {
                              const isDate = isDateField(field);
                              return (
                                <td key={field}>
                                  {editingId === item.id ? (
                                    isDate ? (
                                      <input
                                        type="date"
                                        value={editForm[field] || ''}
                                        onChange={(e) => handleEditChange(field, e.target.value)}
                                        className="edit-input"
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        value={editForm[field] || ''}
                                        onChange={(e) => handleEditChange(field, e.target.value)}
                                        className="edit-input"
                                      />
                                    )
                                  ) : (
                                    <span>
                                      {isDate ? formatDateForDisplay(item[field]) : item[field]}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="actions">
                              {editingId === item.id ? (
                                <>
                                  <button 
                                    onClick={saveEdit} 
                                    className="btn-action btn-save"
                                    disabled={!token}
                                  >
                                    <Save size={14} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditForm({});
                                    }} 
                                    className="btn-action btn-cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => startEdit(item)} 
                                    className="btn-action btn-edit"
                                    disabled={!token}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    onClick={() => deleteItem(item.id)} 
                                    className="btn-action btn-delete"
                                    disabled={!token}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>В этом словаре пока нет записей.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDictionariesPage;