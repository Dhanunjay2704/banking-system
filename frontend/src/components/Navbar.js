import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, isCustomer, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (isAuthenticated()) {
      if (isAdmin()) {
        navigate('/admin/dashboard');
      } else if (isCustomer()) {
        navigate('/customer/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#003366' }}>
      <div className="container-fluid">
        <button 
          className="navbar-brand" 
          style={{ border: 'none', background: 'none', cursor: 'pointer' }}
          onClick={handleLogoClick}
        >
          🏦 Banking System
        </button>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!isAuthenticated() ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Customer Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/login">
                    Admin Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                {isAdmin() && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/customers">
                        Customers
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/pending">
                        Pending Approvals
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/transactions">
                        Transactions
                      </Link>
                    </li>
                  </>
                )}

                {isCustomer() && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer/dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer/send-money">
                        Send Money
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer/statement">
                        Statement
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer/profile">
                        Profile
                      </Link>
                    </li>
                  </>
                )}

                <li className="nav-item">
                  <span className="nav-link">{user?.name || user?.email}</span>
                </li>

                <li className="nav-item">
                  <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
