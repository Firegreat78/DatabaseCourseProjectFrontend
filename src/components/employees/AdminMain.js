import React, { useState } from 'react';
import { Search, ArrowRight, Shield, Plus } from 'lucide-react';
import EmployeeHeader from './EmployeeHeader';
import { useNavigate } from 'react-router-dom';
import './AdminMain.css';
import { useAuth } from '../../context/AuthContext';


const AdminMainPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const adminItems = [
  { id: 7879, name: 'Трамп Д.', action: 'Ведение сделок', role: 2 },
  { id: 7878, name: 'Трищечкин А.В.', action: 'Управление пользователями', role: 3 },
];

  

  const { user } = useAuth(); // role текущего пользователя

// фильтруем роли
const filteredItems = adminItems
  .filter(item => {
    // если текущий пользователь — не мегаадмин, скрываем мегаадминов и админов
    if (user?.role !== '1' && (item.role === 1 || item.role === 2)) {
      return false;
    }
    return (
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.action.toLowerCase().includes(query.toLowerCase()) ||
      String(item.id).includes(query)
    );
  });


  return (
    <div className="admin-page">
      <EmployeeHeader />

      <main className="admin-content">
        <div className="page-header">
          <h1>Администрирование</h1>
        </div>

        {/* Поиск */}
        <div className="admin-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по ID, имени или роли..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Вертикальный список */}
        <div className="admin-list">
          {filteredItems.map((item) => (
          <div
           key={item.id}
            className="admin-row clickable"
           onClick={() => navigate(`/admin/employees/${item.id}`)}
          >
            <div className="admin-left">
              <div className="admin-id">
                <Shield size={18} />
                <span>ID {item.id}</span>
              </div>

              <div className="admin-name">{item.name}</div>
             <div className="admin-action">{item.action}</div>
           </div>

            <ArrowRight size={20} className="arrow-icon" />
          </div>
        ))}


          {(user?.role === '1') && (
  <div
    className="admin-row add-row"
    onClick={() => navigate('/admin/employees/new')}
  >
    <Plus size={24} />
    <span>Добавить сотрудника</span>
  </div>
)}


        </div>
      </main>
    </div>
  );
};

export default AdminMainPage;
