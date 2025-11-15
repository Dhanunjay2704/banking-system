import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ViewStatement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStatement();
  }, []);

  const fetchStatement = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/statement');
      // API may return either an array or an object containing transactions.
      // Normalize to an array to avoid runtime errors when calling array methods.
      const txs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.transactions)
        ? res.data.transactions
        : [];
      if (!Array.isArray(res.data) && res.data && !Array.isArray(res.data.transactions)) {
        // Log unexpected shapes for debugging
        console.warn('Unexpected statement response shape:', res.data);
      }
      setTransactions(txs);
      setError('');
    } catch (err) {
      setError('Failed to load statement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ensure we always work with an array when filtering
  const txList = Array.isArray(transactions) ? transactions : [];
  const filtered = txList.filter((t) => {
    return (
      t.accountNumber?.includes(search) ||
      t.type?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading statement...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 style={{ color: '#003366' }}>📄 Account Statement</h1>
          <p className="text-muted">All transactions for your account</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">🔍</span>
            <input className="form-control" placeholder="Search by type, account, or description" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {filtered.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ backgroundColor: '#f5f5f5' }}>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id}>
                      <td>{new Date(t.createdAt).toLocaleString()}</td>
                      <td>{t.type?.toUpperCase()}</td>
                      <td style={{ color: t.type === 'deposit' ? '#28a745' : '#dc3545' }}>{t.type === 'deposit' ? '+' : '-'}₹{t.amount}</td>
                      <td>₹{t.balanceAfter}</td>
                      <td>{t.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStatement;
