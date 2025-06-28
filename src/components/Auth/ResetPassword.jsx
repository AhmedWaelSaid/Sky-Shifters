// ResetPassword.jsx
import './VerifyEmail.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import signphoto from '../../assets/pexels-pixabay-237272.jpg';

const resetPassword = async ({ code, newPassword }) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to reset password');
  }

  return response.json();
};

const ResetPassword = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const { mutate, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setMessage('Password reset successfully! You can now sign in with your new password.');
      setIsSuccess(true);
      setTimeout(() => navigate('/auth'), 2000);
    },
    onError: (error) => {
      setMessage(error.message);
      setIsSuccess(false);
    },
  });

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (!code.trim()) {
      setMessage('Please enter the reset code');
      setIsSuccess(false);
      return;
    }
    if (!newPassword.trim()) {
      setMessage('Please enter a new password');
      setIsSuccess(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsSuccess(false);
      return;
    }
    if (!validatePassword(newPassword)) {
      setMessage('Password must contain at least 8 characters, uppercase, lowercase, number, and special character');
      setIsSuccess(false);
      return;
    }
    mutate({ code, newPassword });
  };

  return (
    <div className="verify-sec">
      <img src={signphoto} alt="" className="signphoto" />
      <div className="verify-container">
        <div className="verify-container__form">
          <form className="verify-form" onSubmit={handleSubmit}>
            <h2 className="verify-form__title">Reset Password</h2>
            <p>Enter the reset code sent to your email and your new password below.</p>
            {email && (
              <input
                type="email"
                placeholder="Email"
                className="verify-input"
                value={email}
                readOnly
              />
            )}
            <input
              type="text"
              placeholder="Reset Code"
              className="verify-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              disabled={isPending}
            />
            <input
              type="password"
              placeholder="New Password"
              className="verify-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isPending}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="verify-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isPending}
            />
            {message && (
              <p className={isSuccess ? 'verify-success' : 'verify-error'}>{message}</p>
            )}
            <button type="submit" className="verify-btn" disabled={isPending}>
              {isPending ? 'Resetting...' : 'Reset Password'}
            </button>
            <p className="verify-auth-link">
              <a href="/auth" onClick={e => { e.preventDefault(); navigate('/auth'); }}>
                Back to Sign In
              </a>
            </p>
          </form>
        </div>
        <div className="verify-container__overlay">
          <div className="verify-overlay">
            <div className="verify-overlay__panel verify-overlay--left"></div>
            <div className="verify-overlay__panel verify-overlay--right">
              <button className="verify-btn" onClick={() => navigate('/auth')}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;