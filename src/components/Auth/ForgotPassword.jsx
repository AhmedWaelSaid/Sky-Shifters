// ForgotPassword.jsx
import './ForgotPassword.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

const requestResetPassword = async (email) => {
  const response = await fetch('http://13.81.120.153/users/request-reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to request password reset');
  }

  return response.json();
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: requestResetPassword,
    onSuccess: (data) => {
      setMessage('A password reset link has been sent to your email. Please check your inbox (and spam/junk folder).');
      setTimeout(() => navigate('/signin'), 5000); // إعادة توجيه بعد 5 ثواني
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    mutate(email);
  };

  return (
    <div className="container__form container--forgot-password">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form__title">Forgot Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        <input
          type="email"
          id="forgotPasswordEmail"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {message && <p className={error ? 'error' : 'success'}>{message}</p>}
        <button type="submit" className="btn" disabled={isPending}>
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </button>
        <p className="auth-link">
          <a href="/signin">Back to Sign In</a>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;