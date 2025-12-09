// src/components/AppHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './AppHeader.css';

const AppHeader = () => {
  return (
    <header className="app-header">
      {/* 🔗 Вся левая секция — кликабельна */}
      <Link to="/accounts" className="logo-link">
        <div className="logo-section">
          <div className="dollar-circle">$</div>
          <h1>МИД</h1>
        </div>
      </Link>

      <nav className="nav-links">
        <Link to="/portfolio" className="nav-link">портфель</Link>
        <Link to="/offers" className="nav-link">предложения</Link>
        <Link to="/exchange" className="nav-link">биржа</Link>
      </nav>

      <div className="user-icon">👤</div>
    </header>
  );
};

export default AppHeader;