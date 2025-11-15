import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const DepositMoney = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      await api.post('/customer/deposit', { amount: amt, description });
      setSuccess('Deposit successful');
      setAmount('');
      setDescription('');
      // After deposit, navigate to statement
      setTimeout(() => navigate('/customer/statement'), 1000);
    } catch (err) {
      const message = err.response?.data?.message || 'Deposit failed';
      if (err.response?.status === 403) {
        setError(message);
        // Redirect to pending approval if account not active
        if (err.response?.data?.status === 'pending') {
          setTimeout(() => navigate('/customer/pending-approval'), 2000);
        }
      } else {
        setError(message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 style={{ color: '#003366' }}>💸 Deposit Money</h1>
          <p className="text-muted">Add funds to your account</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
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
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ backgroundColor: '#003366', borderColor: '#003366' }}>
              {loading ? 'Processing...' : 'Deposit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepositMoney;
