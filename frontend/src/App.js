import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages - Auth
import AdminLogin from './pages/AdminLogin';
import CustomerLogin from './pages/CustomerLogin';
import Registration from './pages/Registration';

// Pages - Admin
import AdminDashboard from './pages/AdminDashboard';
import ManageCustomers from './pages/ManageCustomers';
import ApproveAccounts from './pages/ApproveAccounts';
import ViewTransactions from './pages/ViewTransactions';
import AdminDepositMoney from './pages/AdminDepositMoney';
import AdminWithdrawMoney from './pages/AdminWithdrawMoney';

// Pages - Customer
import CustomerDashboard from './pages/CustomerDashboard';
import PendingApprovalDashboard from './pages/PendingApprovalDashboard';
import SendMoney from './pages/SendMoney';
import ViewStatement from './pages/ViewStatement';
import Profile from './pages/Profile';

// Home Page
const Home = () => (
  <div className="container mt-5 text-center">
    <h1 style={{ color: '#003366' }}>Welcome to Banking System</h1>
    <p className="lead mt-4">Manage your finances with ease</p>
    <div className="mt-5">
      <Link to="/register" className="btn btn-success btn-lg me-3">
        Register as Customer
      </Link>
      <Link to="/login" className="btn btn-info btn-lg me-3">
        Customer Login
      </Link>
      <Link to="/admin/login" className="btn btn-primary btn-lg">
        Admin Login
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pending"
            element={
              <ProtectedRoute requiredRole="admin">
                <ApproveAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute requiredRole="admin">
                <ViewTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/deposit"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDepositMoney />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/withdraw"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminWithdrawMoney />
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/pending-approval"
            element={
              <ProtectedRoute requiredRole="customer">
                <PendingApprovalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/send-money"
            element={
              <ProtectedRoute requiredRole="customer">
                <SendMoney />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/statement"
            element={
              <ProtectedRoute requiredRole="customer">
                <ViewStatement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute requiredRole="customer">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
