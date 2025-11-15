import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PendingApprovalDashboard = () => {
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      navigate('/customer/login');
      return;
    }

    // Check approval status
    checkApprovalStatus();

    // Poll for approval status every 5 seconds
    const interval = setInterval(checkApprovalStatus, 5000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const checkApprovalStatus = async () => {
    try {
      const response = await api.get('/customer/approval-status');
      const { approved, status, accountNumber, message } = response.data;

      setApprovalStatus({
        approved,
        status,
        accountNumber,
        message,
      });

      setLoading(false);

      // If approved, show account details and offer redirect
      if (approved && accountNumber) {
        setAccountDetails({
          accountNumber,
          accountPassword: null, // Will be sent by admin during approval
        });
        setShowDetails(true);
      }
    } catch (err) {
      console.error('Error checking approval status:', err);
      setError('Unable to check approval status. Please refresh the page.');
      setLoading(false);
    }
  };

  const handleNavigateToDashboard = () => {
    navigate('/customer/dashboard');
  };

  const handleLogout = () => {
    navigate('/customer/login');
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg">
              <div className="card-body text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Checking approval status...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <h2 className="text-center mb-4" style={{ color: '#003366' }}>
                ⏳ Account Approval Status
              </h2>

              {error && <div className="alert alert-danger">{error}</div>}

              {/* Pending Status Card */}
              {!approvalStatus?.approved && (
                <div className="alert alert-info" role="alert">
                  <h5 className="alert-heading">Account Pending Approval</h5>
                  <hr />
                  <p>
                    Thank you for registering! Your account is currently under review by our admin team.
                  </p>
                  <p className="mb-0">
                    <strong>Status:</strong> {approvalStatus?.status || 'Pending'}
                  </p>
                  <p>
                    We will send you an email once your account is approved. Please check back or refresh this page regularly.
                  </p>
                </div>
              )}

              {/* Approved Status Card - Show Account Details */}
              {showDetails && approvalStatus?.approved && accountDetails && (
                <div className="alert alert-success" role="alert">
                  <h5 className="alert-heading">🎉 Account Approved!</h5>
                  <hr />
                  <p>
                    Congratulations! Your account has been approved by our admin team.
                  </p>

                  <div className="card bg-light mt-3 p-3">
                    <h6 className="card-title">Your Account Details:</h6>
                    <div className="mb-2">
                      <strong>Account Number:</strong>
                      <div className="bg-white p-2 rounded mt-1 text-break">
                        {accountDetails.accountNumber}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-muted small">
                    ℹ️ Save your account number for future reference. Use it along with your registered password to access all banking features.
                  </p>

                  <button
                    onClick={handleNavigateToDashboard}
                    className="btn btn-success w-100 mt-3"
                  >
                    Go to Dashboard →
                  </button>
                </div>
              )}

              {/* Status Summary */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="mb-3">Current Status:</h6>
                <div className="d-flex align-items-center mb-2">
                  <span
                    className="badge"
                    style={{
                      backgroundColor: approvalStatus?.approved ? '#28a745' : '#ffc107',
                      color: 'white',
                      padding: '8px 12px',
                    }}
                  >
                    {approvalStatus?.approved ? '✓ Approved' : '⏳ Pending'}
                  </span>
                  <span className="ms-2 text-muted">
                    {approvalStatus?.message || 'Waiting for admin approval'}
                  </span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-secondary"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title">Need Help?</h6>
              <p className="card-text small">
                If you don't see your account approved within 24 hours, please contact our support team at support@bank.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalDashboard;
