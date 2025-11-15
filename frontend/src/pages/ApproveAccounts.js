import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ApproveAccounts = () => {
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

  const fetchPendingCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/pending');
      setPendingCustomers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load pending requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveAccount = async (id) => {
    try {
      const res = await api.post(`/admin/approve/${id}`);
      setSuccess(`Account approved! Account Number: ${res.data.accountNumber}`);
      fetchPendingCustomers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve account');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 style={{ color: '#003366' }}>⏳ Approve Pending Accounts</h1>
          <p className="text-muted">Review and approve customer account requests</p>
        </div>
      </div>

      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error}
        <button type="button" className="btn-close" onClick={() => setError('')}></button>
      </div>}

      {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
        {success}
        <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
      </div>}

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#003366', color: 'white' }}>
              <h5 className="mb-0">Pending Requests: {pendingCustomers.length}</h5>
            </div>
            <div className="card-body">
              {pendingCustomers.length > 0 ? (
                <div className="row g-4">
                  {pendingCustomers.map((customer) => (
                    <div className="col-md-6 col-lg-4" key={customer._id}>
                      <div className="card border-warning h-100">
                        <div className="card-header" style={{ backgroundColor: '#fff3e0' }}>
                          <h5 className="mb-0">{customer.name}</h5>
                        </div>
                        <div className="card-body">
                          <p className="card-text">
                            <strong>Email:</strong> <br />
                            <code>{customer.email}</code>
                          </p>
                          <p className="card-text">
                            <strong>Phone:</strong> <br />
                            {customer.phone}
                          </p>
                          <p className="card-text">
                            <strong>Status:</strong> <br />
                            <span className="badge bg-warning">PENDING</span>
                          </p>
                          <p className="card-text">
                            <strong>Applied On:</strong> <br />
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                          <hr />
                          <button
                            className="btn btn-success w-100"
                            onClick={() => approveAccount(customer._id)}
                          >
                            ✅ Approve Account
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info text-center py-5" role="alert">
                  <h5>🎉 No pending requests!</h5>
                  <p className="mb-0">All customer accounts have been approved.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveAccounts;
