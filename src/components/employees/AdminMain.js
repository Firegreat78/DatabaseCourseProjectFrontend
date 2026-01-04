import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Shield, Plus } from 'lucide-react';
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
    if (!user || user.type !== 'staff') return;

    const fetchStaff = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/staff`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки списка сотрудников');
        }

        const data = await response.json();

        // Сохраняем полный список без предварительной фильтрации
        setAdminItems(data);
      } catch (err) {
        console.error('Ошибка загрузки сотрудников:', err);
      }
    };

    fetchStaff();
  }, [user]);

  const filteredItems = adminItems.filter((item) => {
    // Поиск по ID, логину, договору
    const matchesSearch =
      String(item.id).includes(query) ||
      item.login.toLowerCase().includes(query.toLowerCase()) ||
      item.contract_number.toLowerCase().includes(query.toLowerCase());

    if (!matchesSearch) return false;

    // Логика видимости
    if (user.staff_id === 1) {
      // Мегаадмин видит всех, кроме системного аккаунта (id=2)
      return item.id !== 2;
    } else {
      // Обычный админ НЕ видит:
      // - мегаадмина (1), других админов (2), систему (5)
      // - самого себя
      return (
        ![1, 2, 5].includes(item.rights_level_id) &&
        item.id !== user.staff_id
      );
    }
  });

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

        {/* Кнопка добавления сотрудника */}
        <div
          className="admin-row add-row"
          onClick={() => navigate('/admin/employees/new')}
        >
          <Plus size={24} />
          <span>Добавить сотрудника</span>
        </div>

        {/* Список сотрудников */}
        <div className="admin-list">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
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
            ))
          ) : (
            <div className="admin-row no-results">
              <span>Нет сотрудников, соответствующих фильтру</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMainPage;