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
    throw new Error(errorData.message || 'Failed to send reset link');
  }

  return await response.json();
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setMessage('A password reset link has been sent to your email.');
      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    mutate({ email });
  };

  return (
    <div className="container__form container--forgot-password">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form__title">Forgot Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        <div className="input-container">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            id="forgotPasswordEmail"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error.message}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit" className="btn" disabled={isPending}>
          {isPending ? 'Loading...' : 'Send Reset Link'}
        </button>
        <p className="auth-link">
          <a href="/sign-in" className="link">
            Back to Sign In
          </a>
        </p>
      </form>
    </div>
  );
}