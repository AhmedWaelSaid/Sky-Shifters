// src/components/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaEnvelope } from 'react-icons/fa'; // أيقونة للـ email
import './ForgotPassword.css'; // هتكون مشابهة لـ SignIn.css
import signphoto from '../../assets/pexels-pixabay-237272.jpg'

const requestPasswordReset = async ({ email }) => {
  console.log('Sending request to:', `${import.meta.env.VITE_API_URL}/users/request-password-reset`);
  console.log('Payload:', { email });

  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response from server:', errorData);
    throw new Error(errorData.message || 'Failed to send reset code');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

// منطق reset password
const resetPassword = async ({ code, newPassword }) => {
  console.log('Sending reset request to:', `${import.meta.env.VITE_API_URL}/users/reset-password`);
  console.log('Payload:', { code, newPassword });

  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response from server:', errorData);
    throw new Error(errorData.message || 'Failed to reset password');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const { mutate: requestMutate, isPending: isRequestPending } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      setShowReset(true);
      setSuccessMessage(data.data?.message || 'Reset code sent successfully!');
      setError('');
    },
    onError: (error) => {
      if (error.message.includes('Failed to fetch')) {
        setError('Failed to send reset code: Unable to connect to the server. Please check your internet connection or try again later.');
      } else {
        setError(`Failed to send reset code: ${error.message}`);
      }
      setSuccessMessage('');
    },
  });

  const { mutate: resetMutate, isPending: isResetPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      setSuccessMessage(data.data?.message || 'Password reset successfully! You can now sign in.');
      setTimeout(() => navigate('/auth'), 2000);
    },
    onError: (error) => {
      if (error.message.includes('Failed to fetch')) {
        setError('Failed to reset password: Unable to connect to the server. Please check your internet connection or try again later.');
      } else {
        setError(`Failed to reset password: ${error.message}`);
      }
      setSuccessMessage('');
    },
  });

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!email) {
      setError('Please provide your email address');
      return;
    }
    requestMutate({ email });
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!code) {
      setError('Please provide the reset code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    resetMutate({ code, newPassword });
  };

  return (
    <div className="forgot-sec">
      <img src={signphoto} alt="" className='signphoto' />
      <div className="forgot-container">
        <div className="forgot-container__form">
          <form className="forgot-form" onSubmit={showReset ? handleResetSubmit : handleRequestSubmit}>
            <h2 className="forgot-form__title">
              {showReset ? 'Reset Your Password' : 'Forgot Password'}
            </h2>
            <p>
              {showReset 
                ? 'Enter the code sent to your email and your new password to reset your account.'
                : 'Enter your email address to receive a password reset code.'
              }
            </p>
            
            {!showReset && (
              <input
                type="email"
                placeholder="Email"
                className="forgot-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
            
            {showReset && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  className="forgot-input"
                  value={email}
                  readOnly
                />
                <input
                  type="text"
                  placeholder="Reset Code"
                  className="forgot-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="forgot-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </>
            )}
            
            {error && <p className="forgot-error">{error}</p>}
            {successMessage && <p className="forgot-success">{successMessage}</p>}
            
            <button type="submit" className="forgot-btn" disabled={isRequestPending || isResetPending}>
              {isRequestPending ? 'Sending...' : isResetPending ? 'Resetting...' : (showReset ? 'Reset Password' : 'Send Reset Code')}
            </button>
            
            {showReset && (
              <button 
                type="button" 
                className="forgot-btn resend-btn" 
                onClick={() => {
                  setShowReset(false);
                  setCode('');
                  setNewPassword('');
                  setError('');
                  setSuccessMessage('');
                }}
              >
                Back to Email Input
              </button>
            )}
            
            <p className="forgot-auth-link">
              Remember your password?{' '}
              <a href="/authpanel-signin" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>
                Go to Sign In
              </a>
            </p>
          </form>
        </div>
        <div className="forgot-container__overlay">
          <div className="forgot-overlay">
            <div className="forgot-overlay__panel forgot-overlay--left"></div>
            <div className="forgot-overlay__panel forgot-overlay--right">
              <button
                className="forgot-btn"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;