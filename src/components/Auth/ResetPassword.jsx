// ResetPassword.jsx
import './ForgotPassword.css'
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

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
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const navigate = useNavigate();

  useEffect(() => {
    if (codeFromUrl) setCode(codeFromUrl);
  }, [codeFromUrl]);

  const { mutate, isPending, error } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      setMessage('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => navigate('/auth'), 3000);
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
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
    <div className="container__form container--reset-password">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form__title">Reset Password</h2>
        <p>Enter the code sent to your email and your new password below.</p>
        <input
          type="text"
          id="resetCode"
          placeholder="Reset Code"
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          type="password"
          id="resetPassword"
          placeholder="New Password"
          className="input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {message && <p className={error ? 'error' : 'success'}>{message}</p>}
        <button type="submit" className="btn" disabled={isPending}>
          {isPending ? 'Resetting...' : 'Reset Password'}
        </button>
        <p className="auth-link">
          <a href="/auth">Back to Sign In</a>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;