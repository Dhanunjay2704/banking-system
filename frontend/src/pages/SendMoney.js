import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const SendMoney = () => {
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
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

    if (!recipientAccountNumber.trim()) {
      setError('Please enter recipient account number');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      await api.post('/customer/send-money', { 
        recipientAccountNumber, 
        amount: amt, 
        description 
      });
      setSuccess('Transfer successful!');
      setRecipientAccountNumber('');
      setAmount('');
      setDescription('');
      // After transfer, navigate to statement
      setTimeout(() => navigate('/customer/statement'), 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Transfer failed';
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
          <h1 style={{ color: '#003366' }}>💳 Send Money</h1>
          <p className="text-muted">Transfer funds to another customer account</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Recipient Account Number</label>
              <input
                type="text"
                className="form-control"
                value={recipientAccountNumber}
                onChange={(e) => setRecipientAccountNumber(e.target.value)}
                placeholder="e.g., ACC1234567890"
                required
              />
              <small className="text-muted">Enter the recipient's account number</small>
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
                placeholder="e.g., Payment for services"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading} 
              style={{ backgroundColor: '#003366', borderColor: '#003366' }}
            >
              {loading ? 'Processing...' : 'Send Money'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary ms-2" 
              onClick={() => navigate('/customer/dashboard')}
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
