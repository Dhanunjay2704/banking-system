import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/dashboard');
      setData(res.data);
      setError('');
      
      // If customer is not active, redirect to pending approval page
      if (res.data.status === 'pending') {
        navigate('/customer/pending-approval');
      }
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your account...</p>
      </div>
    );
  }

  if (!data || data.status !== 'active') {
    return (
      <div className="container mt-5">
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">Account Not Active</h4>
          <p>Your account is still pending approval. Please wait for admin confirmation.</p>
          <button 
            onClick={() => navigate('/customer/pending-approval')}
            className="btn btn-primary"
          >
            Check Approval Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-4">
        <div className="col-12">
          <h1 style={{ color: '#003366' }}>🏦 Account Overview</h1>
          <p className="text-muted">Welcome back{user?.name ? `, ${user.name}` : ''}.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-muted">Account Number</h6>
            <h4>{data?.accountNumber || 'N/A'}</h4>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-muted">Current Balance</h6>
            <h3>₹{(data?.balance || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-muted">Last Transaction</h6>
            {data?.lastTransaction ? (
              <div>
                <div>
                  <strong>{data.lastTransaction.type?.toUpperCase()}</strong> ₹{data.lastTransaction.amount}
                </div>
                <small className="text-muted">{new Date(data.lastTransaction.createdAt).toLocaleString()}</small>
              </div>
            ) : (
              <p className="text-muted mb-0">No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" onClick={() => navigate('/customer/send-money')} style={{ backgroundColor: '#003366', borderColor: '#003366' }}>
            Send Money
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/customer/statement')}>
            View Statement
          </button>
          <button className="btn btn-outline-primary" onClick={() => navigate('/customer/profile')}>
            Edit Profile
          </button>
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
