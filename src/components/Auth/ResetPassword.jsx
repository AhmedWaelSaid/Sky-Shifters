// ResetPassword.jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FaKey, FaLock } from 'react-icons/fa';
import './ForgotPassword.css';

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

export default function ResetPassword({ code: codeProp = '', onBack }) {
  const [code, setCode] = useState(codeProp);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setMessage('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => {
        setMessage('');
        if (onBack) onBack();
      }, 3000);
    },
    onError: (error) => {
      setMessage(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (!code) {
      setMessage('No reset code provided.');
      return;
    }
    mutate({ code, newPassword });
  };

  return (
    <div className="container__form container--forgot-password">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form__title">Reset Password</h2>
        <p>Enter the code sent to your email and your new password below.</p>
        <div className="input-container">
          <FaKey className="input-icon" />
          <input
            type="text"
            id="resetCode"
            placeholder="Reset Code"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div className="input-container">
          <FaLock className="input-icon" />
          <input
            type="password"
            id="resetPassword"
            placeholder="New Password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error.message}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit" className="btn" disabled={isPending}>
          {isPending ? 'Resetting...' : 'Reset Password'}
        </button>
        <p className="auth-link">
          <a href="#" className="link" onClick={e => { e.preventDefault(); if(onBack) onBack(); }}>
            Back to Sign In
          </a>
        </p>
      </form>
    </div>
  );
}