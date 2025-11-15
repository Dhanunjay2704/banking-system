import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers');
      setCustomers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/admin/customer/${id}`);
        setSuccess('Customer deleted successfully');
        fetchCustomers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.accountNumber?.includes(searchTerm)
  );

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
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 style={{ color: '#003366' }}>👥 Manage Customers</h1>
          <p className="text-muted">View and manage all customer accounts</p>
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

      <div className="row mb-4">
        <div className="col-12">
          <div className="input-group">
            <span className="input-group-text" style={{ backgroundColor: '#f5f5f5' }}>
              🔍
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#003366', color: 'white' }}>
              <h5 className="mb-0">Total Customers: {filteredCustomers.length}</h5>
            </div>
            <div className="card-body">
              {filteredCustomers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Account Number</th>
                        <th>Status</th>
                        <th>Balance</th>
                        <th>Joined</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer._id}>
                          <td>
                            <strong>{customer.name}</strong>
                          </td>
                          <td>{customer.email}</td>
                          <td>{customer.phone}</td>
                          <td>
                            <code>{customer.accountNumber || 'N/A'}</code>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                customer.status === 'active'
                                  ? 'bg-success'
                                  : customer.status === 'pending'
                                  ? 'bg-warning'
                                  : 'bg-danger'
                              }`}
                            >
                              {customer.status?.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <strong>₹{customer.balance?.toLocaleString()}</strong>
                          </td>
                          <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteCustomer(customer._id)}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">
                  {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCustomers;
