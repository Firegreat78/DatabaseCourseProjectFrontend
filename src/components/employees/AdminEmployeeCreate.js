// src/components/employees/AdminEmployeeCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminEmployeeEdit.css';

const API_BASE_URL = 'http://localhost:8000';

const AdminEmployeeCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    contract_number: '',
    rights_level: '3',
    employment_status_id: '1',
  });
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/employment_status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        const data = await response.json();
        setStatuses(data);
      } catch (err) {
        console.error('Ошибка загрузки статусов:', err);
      }
    };
    fetchStatuses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/staff/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });
      alert('Сотрудник создан');
      navigate('/admin/main');
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании сотрудника');
    }
  };

  return (
    <div className="admin-employee-edit">
      <h1>Создание нового сотрудника</h1>

      <div className="form-group">
        <label>Логин</label>
        <input name="login" value={formData.login} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Пароль</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Номер договора</label>
        <input
          name="contract_number"
          value={formData.contract_number}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Уровень прав</label>
        <select
          name="rights_level"
          value={formData.rights_level}
          onChange={handleChange}
        >
          {user.role === '1' && (
            <>
              <option value="1">Мегаадмин</option>
              <option value="2">Админ</option>
            </>
          )}
          <option value="3">Брокер</option>
          <option value="4">Верификатор</option>
        </select>
      </div>

      <div className="form-group">
        <label>Статус трудоустройства</label>
        <select
          name="employment_status_id"
          value={formData.employment_status_id}
          onChange={handleChange}
        >
          {statuses.map(s => (
            <option key={s.id} value={s.id}>{s.status}</option>
          ))}
        </select>
      </div>

      <button onClick={handleCreate}>Создать</button>
    </div>
  );
};

export default AdminEmployeeCreate;
