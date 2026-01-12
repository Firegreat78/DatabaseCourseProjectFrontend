// src/components/DepositaryAccount.js
import React, { useEffect, useState } from 'react';
import AppHeader from './AppHeader';
import DepositaryBalanceChart from './DepositaryBalanceChart';
import './DepositaryAccount.css';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Clock,
  AlertTriangle,
  Lock,
  LogOut,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const DepositaryAccount = () => {
  const { user, logout } = useAuth();
  const [depositaryData, setDepositaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banCheckLoading, setBanCheckLoading] = useState(true);
  const [verificationStatusId, setVerificationStatusId] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const checkBanStatus = async () => {
    if (!user?.id || !user?.token) {
      setBanCheckLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/user_ban_status/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.ok) {
        throw new Error('Не удалось проверить статус аккаунта');
      }

      const data = await response.json();
      setIsBanned(data.is_banned);
    } catch (err) {
      console.error('Ошибка проверки блокировки:', err);
      setError('Не удалось проверить статус аккаунта');
    } finally {
      setBanCheckLoading(false);
    }
  };
  const fetchClient = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка загрузки профиля');
      }

      setVerificationStatusId(data.verification_status_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerificationLoading(false);
    }
  };
  const fetchDepositaryAccount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/depositary_account`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setDepositaryData(null);
          return;
        }
        throw new Error('Не удалось загрузить депозитарный счёт');
      }

      const result = await response.json();

      if (!result.account || !Array.isArray(result.balance) || !Array.isArray(result.operations)) {
        throw new Error('Некорректные данные депозитарного счёта от сервера');
      }

      setDepositaryData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.id) {
      checkBanStatus();
      fetchClient();
      fetchDepositaryAccount();
    } else {
      setLoading(false);
      setVerificationLoading(false);
      setBanCheckLoading(false);
    }
  }, [user?.id]);
  const isVerified = verificationStatusId === 2;
  const isPendingVerification = verificationStatusId === 3;
  const isNotVerified = verificationStatusId === 1 || verificationStatusId === undefined;
  if (banCheckLoading || verificationLoading || loading) {
    return (
      <div className="depositary-account-page">
        <AppHeader />
        <main className="depositary-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          Загрузка...
        </main>
      </div>
    );
  }
  if (isBanned) {
    return (
      <div className="depositary-account-page">
        <AppHeader />
        <main className="depositary-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Lock size={64} color="#ef4444" />
          <h2 style={{ margin: '20px 0', color: '#dc2626' }}>Ваш аккаунт заблокирован</h2>
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            Доступ к личному кабинету ограничен. Обратитесь в поддержку.
          </p>
        </main>
      </div>
    );
  }
  if (isNotVerified || isPendingVerification) {
    return (
      <div className="depositary-account-page">
        <AppHeader />
        <main className="depositary-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ShieldAlert size={48} color="#f59e0b" />
          <h2 style={{ margin: '20px 0', color: '#f59e0b' }}>Депозитарный счёт недоступен</h2>
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            {isNotVerified
              ? 'Чтобы получить доступ к депозитарному счёту, верифицируйте аккаунт.'
              : 'Ваша верификация в процессе. Депозитарный счёт станет доступен после подтверждения.'}
          </p>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="depositary-account-page">
        <AppHeader />
        <main className="depositary-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertTriangle size={48} color="#dc2626" />
          <p style={{ marginTop: '20px', color: '#dc2626' }}>{error}</p>
        </main>
      </div>
    );
  }
  if (!depositaryData) {
    return (
      <div className="depositary-account-page">
        <AppHeader />
        <main className="depositary-content">
          <div className="depositary-card">
            <div className="depositary-header">
              <Package size={48} />
              <div>
                <h1>Депозитарный счёт</h1>
                <p>ID: {user?.id}</p>
              </div>
            </div>
            <p style={{ textAlign: 'center', padding: '20px' }}>
              У вас пока нет депозитарного счёта.
            </p>
          </div>
        </main>
      </div>
    );
  }
  const { account, balance, operations } = depositaryData;
  return (
    <div className="depositary-account-page">
      <AppHeader />

      <main className="depositary-content">
        <div className="depositary-card">
          <div className="depositary-header">
            <Package size={48} />
            <div>
              <h1>Депозитарный счёт</h1>
              <p>№ договора: {account.contract_number}</p>
            </div>
          </div>

          <div className="depositary-grid">
            <div className="info-item">
              <Clock size={20} />
              <div>
                <span className="label">Дата открытия</span>
                <span className="value">{new Date(account.opening_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Отображение баланса */}
          <h2 style={{ marginTop: '30px' }}>Баланс</h2>
          {balance.length > 0 ? (
            <ul className="balance-list">
              {balance.map((b, idx) => (
                <li key={idx}>
                  {b.security_name}: {b.amount}
                </li>
              ))}
            </ul>
          ) : (
            <p>Баланс пуст</p>
          )}
{balance.length > 0 && (
  <div style={{ marginTop: '40px' }}>
    <DepositaryBalanceChart />
  </div>
)}

          <h2 style={{ marginTop: '30px' }}>История операций</h2>
          {operations.length > 0 ? (
            <table className="operations-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Тип операции</th>
                  <th>Ценная бумага</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id}>
                    <td>{new Date(op.time).toLocaleString()}</td>
                    <td>{op.operation_type}</td>
                    <td>{op.security_name}</td>
                    <td>{op.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Операций нет</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default DepositaryAccount;