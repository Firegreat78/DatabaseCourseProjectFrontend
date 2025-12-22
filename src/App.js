// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Контекст авторизации
import { AuthProvider, useAuth } from './context/AuthContext';

// Компоненты
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import EmployeeLogin from './components/employees/EmployeeLogin';
import AccountsList from './components/AccountsList';
import PortfolioPage from './components/PortfolioPage';
import OffersPage from './components/OffersPage';
import ExchangePage from './components/ExchangePage';
import VerifierMainPage from './components/employees/VerifierMain';
import BrokerMainPage from './components/employees/BrokerMain';
import AdminMainPage from './components/employees/AdminMain';
import ProfilePage from './components/ProfilePage';
import VerificationPage from './components/VerificationPage';
import DepositaryAccount from './components/DepositaryAccount';
import BrokerAccountPage from './components/BrokerAccountPage';
import EmployeeProfilePage from './components/employees/EmployeeProfilePage';
import AdminEmployeeEdit from './components/employees/AdminEmployeeEdit';
import AdminEmployeeCreate from './components/employees/AdminEmployeeCreate';
import VerifierUserDetail from './components/employees/VerifierUserEdit';
import BrokerDealDetail from './components/employees/BrokerDealDetail';
import ExchangeAdminPage from './components/employees/ExchangeAdminPage';
import AdminUsersPage from './components/employees/AdminUsers';
import AdminUsersEdit from './components/employees/AdminUserDetail';

// Компонент для защиты роутов
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Загрузка...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Компонент для публичных роутов (чтобы после логина не показывать логин снова)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;

  // Если уже залогинен — сразу отправляем на счета
  
  return user ? <Navigate to="/accounts" replace /> : children;
  //return user
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Публичные страницы */}
          <Route path="/" element={<PublicRoute><UserLogin /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><UserLogin /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><UserRegistration /></PublicRoute>} />
          <Route path="/employee-login" element={<EmployeeLogin />} /> {/* Можно тоже защитить отдельно */}
          
          {/* Пока не защищенные страницы */}
          <Route path="/verifier/main" element={<VerifierMainPage />} />
          <Route path="/broker/main" element={<BrokerMainPage />} />
          <Route path="/admin/main" element={<AdminMainPage />} />
          <Route path="/employee/profile" element={<EmployeeProfilePage />} />
          <Route path="/admin/employees/new" element={<AdminEmployeeCreate />} />
          <Route path="/admin/employees/:id" element={<AdminEmployeeEdit />} />
          <Route path="/admin/users/:id" element={<AdminUsersEdit />} />
          <Route path="/verifier/users/:id" element={<VerifierUserDetail />} />
          <Route path="/broker/deals/:id" element={<BrokerDealDetail />} />
          <Route path="/admin/exchange" element={<ExchangeAdminPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          {/* Защищённые страницы — доступ только после логина */}
          <Route
            path="/accounts"
            element={<ProtectedRoute><AccountsList /></ProtectedRoute>}
          />
          <Route
            path="/depositary_account"
            element={
    <ProtectedRoute>
      <DepositaryAccount />
    </ProtectedRoute>
  }
/>
          <Route
            path="/portfolio"
            element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>}
          />
          <Route
            path="/offers"
            element={<ProtectedRoute><OffersPage /></ProtectedRoute>}
          />
          <Route
            path="/exchange"
            element={<ProtectedRoute><ExchangePage /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/verification"
            element={<ProtectedRoute><VerificationPage /></ProtectedRoute>}
          />

          {/* Детали брокерского счёта */}
          <Route
            path="/account/:id"
            element={<ProtectedRoute><BrokerAccountPage /></ProtectedRoute>}
          />
          
          {/* Редирект на главную для неизвестных путей */<Route path="*" element={<Navigate to="/login" replace />} />}
          
        </Routes>
      </AuthProvider>

    </Router>
  );
}

export default App;