// src/components/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaEnvelope } from 'react-icons/fa'; // أيقونة للـ email
import './ForgotPassword.css'; // هتكون مشابهة لـ SignIn.css

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

// منطق reset password
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setShowReset(true);
      setMsg('');
    },
    onError: (err) => setMsg(err.message),
  });

  const { mutate: resetMutate, isPending: isResetting, error: resetError } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setMsg('Password reset successfully! You can now sign in.');
      setTimeout(() => navigate('/auth'), 2000);
    },
    onError: (err) => setMsg(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg('');
    mutate({ email });
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setMsg('');
    if (!code) {
      setMsg('No reset code provided.');
      return;
    }
    resetMutate({ code, newPassword });
  };

  return (
    <div className="container__form container--forgot-password">
      {!showReset ? (
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="form__title">Forgot Password</h2>
          <p>Enter your email address to receive a password reset code.</p>
          <div className="input-container">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error.message}</p>}
          {msg && <p className={error ? 'error' : 'success'}>{msg}</p>}
          <button type="submit" className="btn" disabled={isPending}>
            {isPending ? 'Loading...' : 'Send Reset Code'}
          </button>
          <p className="auth-link">
            <a href="/sign-in" className="link">Back to Sign In</a>
          </p>
        </form>
      ) : (
        <form className="form" onSubmit={handleResetSubmit}>
          <h2 className="form__title">Reset Password</h2>
          <p>Enter the code sent to your email and your new password below.</p>
          <input
            type="text"
            placeholder="Reset Code"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {resetError && <p className="error">{resetError.message}</p>}
          {msg && <p className={resetError ? 'error' : 'success'}>{msg}</p>}
          <button type="submit" className="btn" disabled={isResetting}>
            {isResetting ? 'Resetting...' : 'Reset Password'}
          </button>
          <p className="auth-link">
            <a href="/auth">Back to Sign In</a>
          </p>
        </form>
      )}
    </div>
  );
}