import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminWithdrawMoney = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers');
      // Filter to show only active customers
      const activeCustomers = res.data.filter(c => c.status === 'active');
      setCustomers(activeCustomers);
      setError('');
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    const selectedCust = customers.find(c => c._id === selectedCustomer);
    if (selectedCust && selectedCust.balance < amt) {
      setError(`Insufficient balance. Customer has ₹${selectedCust.balance} only`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/withdraw', {
        customerId: selectedCustomer,
        amount: amt,
        description,
      });
      setSuccess(`Withdrawal of ₹${amt} from ${res.data.customer.name} successful!`);
      setSelectedCustomer('');
      setAmount('');
      setDescription('');
      // Refresh customer list
      setTimeout(() => fetchCustomers(), 1000);
    } catch (err) {
      const message = err.response?.data?.message || 'Withdrawal failed';
      setError(message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 style={{ color: '#003366' }}>💳 Withdraw Money from Customer Account</h1>
          <p className="text-muted">Admin feature: Withdraw funds from customer accounts</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Select Customer</label>
              <select
                className="form-control"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                required
              >
                <option value="">-- Choose a customer --</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.accountNumber}) - Balance: ₹{(customer.balance || 0).toLocaleString()}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <small className="text-muted">No active customers available</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Amount (INR)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description (optional)</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Monthly service fee, Penalty, etc."
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-warning" 
              disabled={submitting || customers.length === 0}
            >
              {submitting ? 'Processing...' : 'Withdraw Money'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary ms-2" 
              onClick={() => navigate('/admin/dashboard')}
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawMoney;
