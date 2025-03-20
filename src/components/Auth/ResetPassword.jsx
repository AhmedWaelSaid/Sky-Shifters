// ResetPassword.jsx
import './ForgotPassword.css'
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

const resetPassword = async ({ token, newPassword }) => {
  const response = await fetch('http://13.81.120.153/users/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to reset password');
  }

  return response.json();
};

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // استخراج الـ Token من الرابط
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      setMessage('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => navigate('/signin'), 3000); // إعادة توجيه بعد 3 ثواني
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (!token) {
      setMessage('No reset token provided.');
      return;
    }
    mutate({ token, newPassword });
  };

  useEffect(() => {
    if (!token) {
      setMessage('No reset token provided.');
    }
  }, [token]);

  return (
    <div className="container__form container--reset-password">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form__title">Reset Password</h2>
        <p>Enter your new password below.</p>
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
          <a href="/signin">Back to Sign In</a>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;