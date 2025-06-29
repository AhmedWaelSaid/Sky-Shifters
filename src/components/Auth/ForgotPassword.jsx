// src/components/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import signphoto from '../../assets/pexels-pixabay-237272.jpg';
import './ForgotPassword.css';

const requestPasswordReset = async ({ email }) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send reset code');
  }
  return response.json();
};

const resetPassword = async ({ code, newPassword }) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/reset-password`, {
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      setShowReset(true);
      setMsg(data.data?.message || 'Reset code sent successfully! Check your email.');
    },
    onError: (err) => setMsg(err.message),
  });

  const { mutate: resetMutate, isPending: isResetting, error: resetError } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      setMsg(data.data?.message || 'Password reset successfully! Redirecting to sign in...');
      setTimeout(() => navigate('/auth'), 2000);
    },
    onError: (err) => setMsg(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg('');
    if (!email.trim()) {
      setMsg('Please enter your email address.');
      return;
    }
    mutate({ email });
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setMsg('');
    if (!code.trim()) {
      setMsg('Please enter the reset code.');
      return;
    }
    if (!newPassword.trim()) {
      setMsg('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setMsg('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg('Passwords do not match.');
      return;
    }
    resetMutate({ code, newPassword });
  };

  const handleBackToSignIn = () => {
    setShowReset(false);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setMsg('');
  };

  return (
    <div className="verify-sec">
      <img src={signphoto} alt="background" className="signphoto" />
      <div className="verify-container">
        <div className="verify-container__form">
          {!showReset ? (
            <form className="verify-form" onSubmit={handleSubmit}>
              <h2 className="verify-form__title">Forgot Password?</h2>
              <p>Enter your email address to receive a password reset code.</p>
              <input
                type="email"
                placeholder="Enter your email address"
                className="verify-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="verify-error">{error.message}</p>}
              {msg && <p className={error ? 'verify-error' : 'verify-success'}>{msg}</p>}
              <button type="submit" className="verify-btn" disabled={isPending}>
                {isPending ? 'Sending...' : 'Send Reset Code'}
              </button>
              <p className="verify-auth-link">
                <a href="/auth" onClick={e => { e.preventDefault(); handleBackToSignIn(); navigate('/auth'); }}>
                  Back to Sign In
                </a>
              </p>
            </form>
          ) : (
            <form className="verify-form" onSubmit={handleResetSubmit}>
              <h2 className="verify-form__title">Reset Your Password</h2>
              <p>Enter the 5-digit code we sent to your email and create a new password.</p>
              <input
                type="text"
                placeholder="Enter reset code (e.g., ABC12)"
                className="verify-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={5}
                required
              />
              <input
                type="password"
                placeholder="Enter new password"
                className="verify-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="verify-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
              {resetError && <p className="verify-error">{resetError.message}</p>}
              {msg && <p className={resetError ? 'verify-error' : 'verify-success'}>{msg}</p>}
              <button type="submit" className="verify-btn" disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </button>
              <p className="verify-auth-link">
                <a href="/auth" onClick={e => { e.preventDefault(); handleBackToSignIn(); navigate('/auth'); }}>
                  Back to Sign In
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}