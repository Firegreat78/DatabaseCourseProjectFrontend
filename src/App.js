// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import EmployeeLogin from './components/EmployeeLogin';
import AccountsList from './components/AccountsList';
import PortfolioPage from './components/PortfolioPage';
import OffersPage from './components/OffersPage';
import ExchangePage from './components/ExchangePage';
import VerifierMainPage from './components/VerifierMain';
import BrokerMainPage from './components/BrokerMain';
import AdminMainPage from './components/AdminMain';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/verifier/main" element={<VerifierMainPage />} />
        <Route path="/broker/main" element={<BrokerMainPage />} />
        <Route path="/admin/main" element={<AdminMainPage />} />
		<Route path="/accounts" element={<AccountsList />} />
		<Route path="/portfolio" element={<PortfolioPage />} />
		<Route path="/offers" element={<OffersPage />} /> 
		<Route path="/exchange" element={<ExchangePage />} />
      </Routes>
    </Router>
  );
}

export default App;