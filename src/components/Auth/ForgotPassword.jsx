// src/components/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import './VerifyEmail.css';
import signphoto from '../../assets/pexels-pixabay-237272.jpg';

const requestPasswordReset = async ({ email }) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/request-password-reset`, {
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
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setMessage('A password reset link has been sent to your email.');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/auth/reset-password', { state: { email } });
      }, 2000);
    },
    onError: (error) => {
      setMessage(error.message);
      setIsSuccess(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }
    setMessage('');
    mutate({ email });
  };

  return (
    <div className="verify-sec">
      <img src={signphoto} alt="" className="signphoto" />
      <div className="verify-container">
        <div className="verify-container__form">
          <form className="verify-form" onSubmit={handleSubmit}>
            <h2 className="verify-form__title">Forgot Password?</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <input
              type="email"
              placeholder="Email Address"
              className="verify-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
            {message && (
              <p className={isSuccess ? 'verify-success' : 'verify-error'}>{message}</p>
            )}
            <button type="submit" className="verify-btn" disabled={isPending}>
              {isPending ? 'Sending...' : 'Send Reset Link'}
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
}