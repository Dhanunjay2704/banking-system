import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, transRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/recent-transactions'),
      ]);

      setStats(statsRes.data);
      setRecentTransactions(transRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Dashboard Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 style={{ color: '#003366' }}>📊 Admin Dashboard</h1>
          <p className="text-muted">Welcome back! Here's your banking system overview.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row g-4 mb-5">
          {/* Total Customers */}
          <div className="col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
                👥
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.totalCustomers}</h3>
                <p className="stat-label">Total Customers</p>
              </div>
            </div>
          </div>

          {/* Active Accounts */}
          <div className="col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
                ✅
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.activeAccounts}</h3>
                <p className="stat-label">Active Accounts</p>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
                ⏳
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.pendingApprovals}</h3>
                <p className="stat-label">Pending Approvals</p>
              </div>
            </div>
          </div>

          {/* Total Deposits */}
          <div className="col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
                💰
              </div>
              <div className="stat-content">
                <h3 className="stat-value">₹{stats.totalDeposits?.toLocaleString()}</h3>
                <p className="stat-label">Total Deposits</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <a href="/admin/customers" className="action-button">
            <div className="action-icon">👥</div>
            <div className="action-text">
              <p className="action-title">Manage Customers</p>
              <small>View & Delete</small>
            </div>
          </a>
        </div>

        <div className="col-md-6 col-lg-3">
          <a href="/admin/pending" className="action-button">
            <div className="action-icon">⏳</div>
            <div className="action-text">
              <p className="action-title">Approve Accounts</p>
              <small>Pending Requests</small>
            </div>
          </a>
        </div>

        <div className="col-md-6 col-lg-3">
          <a href="/admin/transactions" className="action-button">
            <div className="action-icon">📋</div>
            <div className="action-text">
              <p className="action-title">View Transactions</p>
              <small>All Transactions</small>
            </div>
          </a>
        </div>

        <div className="col-md-6 col-lg-3">
          <a href="/admin/deposit" className="action-button">
            <div className="action-icon">💸</div>
            <div className="action-text">
              <p className="action-title">Deposit Money</p>
              <small>Add Funds</small>
            </div>
          </a>
        </div>

        <div className="col-md-6 col-lg-3">
          <a href="/admin/withdraw" className="action-button">
            <div className="action-icon">💸</div>
            <div className="action-text">
              <p className="action-title">Withdraw Money</p>
              <small>Remove Funds</small>
            </div>
          </a>
        </div>

        <div className="col-md-6 col-lg-3">
          <button className="action-button" onClick={fetchDashboardData}>
            <div className="action-icon">🔄</div>
            <div className="action-text">
              <p className="action-title">Refresh Data</p>
              <small>Update Dashboard</small>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#003366', color: 'white' }}>
              <h5 className="mb-0">📊 Recent Transactions</h5>
            </div>
            <div className="card-body">
              {recentTransactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                      <tr>
                        <th>Account Number</th>
                        <th>Customer Name</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Balance</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((trans) => (
                        <tr key={trans._id}>
                          <td>
                            <strong>{trans.accountNumber}</strong>
                          </td>
                          <td>{trans.userId?.name || 'N/A'}</td>
                          <td>
                            <span
                              className={`badge ${
                                trans.type === 'deposit' ? 'bg-success' : trans.type === 'transfer' ? 'bg-info' : 'bg-danger'
                              }`}
                            >
                              {trans.type?.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <strong
                              style={{
                                color: trans.type === 'deposit' || (trans.type === 'transfer' && trans.description?.includes('Received')) ? '#28a745' : '#dc3545',
                              }}
                            >
                              {trans.type === 'deposit' || (trans.type === 'transfer' && trans.description?.includes('Received')) ? '+' : '-'}₹{trans.amount?.toLocaleString()}
                            </strong>
                          </td>
                          <td>₹{trans.balanceAfter?.toLocaleString()}</td>
                          <td>{new Date(trans.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
