import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ViewTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/transactions');
      setTransactions(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((trans) => {
    const matchesType = filterType === 'all' || trans.type === filterType;
    const matchesSearch =
      trans.accountNumber?.includes(searchTerm) ||
      trans.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trans.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalTransfers = transactions
    .filter((t) => t.type === 'transfer')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 style={{ color: '#003366' }}>📋 View Transactions</h1>
          <p className="text-muted">Monitor all banking transactions</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Transactions</h6>
              <h3 style={{ color: '#003366' }}>{transactions.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Deposits</h6>
              <h3 style={{ color: '#28a745' }}>₹{totalDeposits.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Withdrawals</h6>
              <h3 style={{ color: '#dc3545' }}>₹{totalWithdrawals.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h6 className="card-title text-muted">Net Flow</h6>
              <h3 style={{ color: totalDeposits - totalWithdrawals > 0 ? '#28a745' : '#dc3545' }}>
                ₹{(totalDeposits - totalWithdrawals).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text" style={{ backgroundColor: '#f5f5f5' }}>
              🔍
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by account, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-6">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="deposit">Deposits Only</option>
            <option value="withdrawal">Withdrawals Only</option>
            <option value="transfer">Transfers Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#003366', color: 'white' }}>
              <h5 className="mb-0">Transactions: {filteredTransactions.length}</h5>
            </div>
            <div className="card-body">
              {filteredTransactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                      <tr>
                        <th>Date</th>
                        <th>Account Number</th>
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Balance After</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((trans) => (
                        <tr key={trans._id}>
                          <td>{new Date(trans.createdAt).toLocaleDateString()}</td>
                          <td>
                            <code>{trans.accountNumber}</code>
                          </td>
                          <td>
                            <strong>{trans.userId?.name}</strong>
                            <br />
                            <small className="text-muted">{trans.userId?.email}</small>
                          </td>
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
                          <td>{trans.description || '-'}</td>
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
      </div>
    </div>
  );
};

export default ViewTransactions;
