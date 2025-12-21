import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Shield, Plus, TrendingUp } from 'lucide-react';
import AdminHeader from './AdminHeader';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminMain.css';

const API_BASE_URL = 'http://localhost:8000';

const AdminMainPage = () => {
  const [query, setQuery] = useState('');
  const [adminItems, setAdminItems] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchStaff = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/staff`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data = await response.json();

        let filtered = data;
        if (user.role !== '1') {
          filtered = data.filter(
            item =>
              item.rights_level !== '1' &&
              item.rights_level !== '2' &&
              item.rights_level !== '5'
          );
        }

        setAdminItems(filtered);
      } catch (err) {
        console.error('Ошибка загрузки сотрудников:', err);
      }
    };

    fetchStaff();
  }, [user]);

  const filteredItems = adminItems.filter(
    (item) =>
      item.login.toLowerCase().includes(query.toLowerCase()) ||
      item.contract_number.toLowerCase().includes(query.toLowerCase()) ||
      String(item.id).includes(query)
  );

  return (
    <div className="admin-page">
      <AdminHeader />

      <main className="admin-content">
        <div className="page-header">
          <h1>Администрирование</h1>
        </div>

        <div className="admin-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по ID, логину или договору..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* КНОПКИ ДЕЙСТВИЙ */}
        <div
          className="admin-row add-row"
          onClick={() => navigate('/admin/employees/new')}
        >
          <Plus size={24} />
          <span>Добавить сотрудника</span>
        </div>

        {/* СПИСОК СОТРУДНИКОВ */}
        <div className="admin-list">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="admin-row"
              onClick={() => navigate(`/admin/employees/${item.id}`)}
            >
              <div className="admin-left">
                <div className="admin-id">
                  <Shield size={18} />
                  <span>ID {item.id}</span>
                </div>

                <div className="admin-name">{item.login}</div>
                <div className="admin-action">{item.contract_number}</div>
              </div>

              <ArrowRight size={20} className="arrow-icon" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminMainPage;
