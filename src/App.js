// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

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
import ModifyCurrencyPage from './components/employees/ModifyCurrencyPage';
import ModifyBankPage from './components/employees/ModifyBankPage';
const ProtectedClientRoute = ({ children }) => {
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

  if (!user || user.type !== 'client') {
    return <Navigate to="/login" replace />;
  }

  return children;
};
const ProtectedEmployeeRoute = ({ children }) => {
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

  if (!user || user.type !== 'staff') {
    return <Navigate to="/employee-login" replace />;
  }

  return children;
};
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (user) {
    if (user.type === 'client') {
      return <Navigate to="/accounts" replace />;
    }
    if (user.type === 'staff') {
      return <Navigate to="/admin/main" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicRoute><UserLogin /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><UserLogin /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><UserRegistration /></PublicRoute>} />
          <Route path="/employee-login" element={<EmployeeLogin />} />

          <Route path="/accounts" element={<ProtectedClientRoute><AccountsList /></ProtectedClientRoute>} />
          <Route path="/depositary_account" element={<ProtectedClientRoute><DepositaryAccount /></ProtectedClientRoute>} />
          <Route path="/portfolio" element={<ProtectedClientRoute><PortfolioPage /></ProtectedClientRoute>} />
          <Route path="/offers" element={<ProtectedClientRoute><OffersPage /></ProtectedClientRoute>} />
          <Route path="/exchange" element={<ProtectedClientRoute><ExchangePage /></ProtectedClientRoute>} />
          <Route path="/profile" element={<ProtectedClientRoute><ProfilePage /></ProtectedClientRoute>} />
          <Route path="/verification" element={<ProtectedClientRoute><VerificationPage /></ProtectedClientRoute>} />
          <Route path="/account/:id" element={<ProtectedClientRoute><BrokerAccountPage /></ProtectedClientRoute>} />

          <Route path="/verifier/main" element={<ProtectedEmployeeRoute><VerifierMainPage /></ProtectedEmployeeRoute>} />
          <Route path="/broker/main" element={<ProtectedEmployeeRoute><BrokerMainPage /></ProtectedEmployeeRoute>} />
          <Route path="/admin/main" element={<ProtectedEmployeeRoute><AdminMainPage /></ProtectedEmployeeRoute>} />
          <Route path="/employee/profile" element={<ProtectedEmployeeRoute><EmployeeProfilePage /></ProtectedEmployeeRoute>} />
          <Route path="/admin/employees/new" element={<ProtectedEmployeeRoute><AdminEmployeeCreate /></ProtectedEmployeeRoute>} />
          <Route path="/admin/employees/:id" element={<ProtectedEmployeeRoute><AdminEmployeeEdit /></ProtectedEmployeeRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedEmployeeRoute><AdminUsersEdit /></ProtectedEmployeeRoute>} />
          <Route path="/verifier/users/:id" element={<ProtectedEmployeeRoute><VerifierUserDetail /></ProtectedEmployeeRoute>} />
          <Route path="/broker/deals/:id" element={<ProtectedEmployeeRoute><BrokerDealDetail /></ProtectedEmployeeRoute>} />
          <Route path="/admin/exchange" element={<ProtectedEmployeeRoute><ExchangeAdminPage /></ProtectedEmployeeRoute>} />
          <Route path="/admin/users" element={<ProtectedEmployeeRoute><AdminUsersPage /></ProtectedEmployeeRoute>} />
          <Route path="/admin/modify_currency" element={<ProtectedEmployeeRoute><ModifyCurrencyPage /></ProtectedEmployeeRoute>} />
          <Route path="/admin/modify_banks" element={<ProtectedEmployeeRoute><ModifyBankPage /></ProtectedEmployeeRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;