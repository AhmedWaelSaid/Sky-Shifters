// src/components/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import './ForgotPassword.css';

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

  const { mutate, isPending, error } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      setMessage('A password reset link has been sent to your email.');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 5000);
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

  const handleBackToSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="container__form container--forgot-password">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-header">
          <button 
            type="button" 
            className="back-button" 
            onClick={handleBackToSignIn}
          >
            <FaArrowLeft />
          </button>
          <h2 className="form__title">Forgot Password?</h2>
        </div>
        
        <p className="form-description">
          Enter your email address and we'll send you a link to reset your password
        </p>
        
        <div className="input-container">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            id="forgotPasswordEmail"
            placeholder="Email Address"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
          />
        </div>
        
        {message && (
          <p className={isSuccess ? 'success' : 'error'}>
            {message}
          </p>
        )}
        
        <button 
          type="submit" 
          className="btn" 
          disabled={isPending}
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </button>
        
        <p className="auth-link">
          <a href="/auth" className="link">
            Back to Sign In
          </a>
        </p>
      </form>
    </div>
  );
}