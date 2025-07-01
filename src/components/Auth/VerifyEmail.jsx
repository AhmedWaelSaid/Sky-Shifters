import React, { useContext } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import './VerifyEmail.css';
import signphoto from '../../assets/pexels-pixabay-237272.jpg'
import { ThemeContext } from '../../components/context/ThemeContext';
import logoLight from '../../assets/Asset 22@2x.png';
import logoDark from '../../assets/Asset 24@2x.png';

const verifyEmail = async ({ email, code }) => {
  console.log('Sending request to:', `${import.meta.env.VITE_API_BASE_URL}/users/verify-email`);
  console.log('Payload:', { email, code });

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response from server:', errorData);
    throw new Error(errorData.message || 'Failed to verify email');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

const resendVerification = async ({ email }) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to resend verification email');
  }
  return await response.json();
};

const VerifyEmail = () => {
  const { theme } = useContext(ThemeContext);
  const logo = theme === 'dark' ? logoDark : logoLight;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const { mutate: verifyMutate, isPending } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      navigate('/auth');
    },
    onError: (error) => {
      if (error.message.includes('Failed to fetch')) {
        setError('Failed to verify email: Unable to connect to the server. Please check your internet connection or try again later.');
      } else {
        setError(`Failed to verify email: ${error.message}`);
      }
    },
  });

  const { mutate: resendMutate, isPending: isResendPending } = useMutation({
    mutationFn: resendVerification,
    onSuccess: (data) => {
      setResendMessage(data.data?.message || 'Verification email sent successfully');
    },
    onError: (error) => {
      setResendMessage(error.message || 'Failed to resend verification email');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !code) {
      setError('Please provide both email and code');
      return;
    }
    verifyMutate({ email, code });
  };

  return (
    <div className="auth-container">
      <div className="auth-logo"><img src={logo} alt="taier logo" /></div>
      <div className="verify-sec">
        <img src={signphoto} alt="" className='signphoto' />
        <div className="verify-container">
          <div className="verify-container__form">
            <form className="verify-form" onSubmit={handleSubmit}>
              <h2 className="verify-form__title">Verify Your Email</h2>
              <p>
                A verification code has been sent to your email. Please enter your email and the code to verify your account.
              </p>
              <input
                type="email"
                placeholder="Email"
                className="verify-input"
                value={email}
                readOnly
              />
              <input
                type="text"
                placeholder="Verification Code"
                className="verify-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
              {error && <p className="error">{error}</p>}
              {resendMessage && resendMessage.toLowerCase().includes('error') && <p className="error">{resendMessage}</p>}
              {resendMessage && !resendMessage.toLowerCase().includes('error') && <p className="success">{resendMessage}</p>}
              <button type="submit" className="verify-btn" disabled={isPending}>
                {isPending ? 'Verifying...' : 'Verify Email'}
              </button>
              <button type="button" className="verify-btn resend-btn" onClick={() => resendMutate({ email })} disabled={isResendPending}>
                {isResendPending ? 'Resending...' : 'Resend Verification Code'}
              </button>
              <p className="verify-auth-link">
                Already verified?{' '}
                <a href="/authpanel-signin" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>
                  Go to Sign In
                </a>
              </p>
            </form>
          </div>
          <div className="verify-container__overlay">
            <div className="verify-overlay">
              <div className="verify-overlay__panel verify-overlay--left"></div>
              <div className="verify-overlay__panel verify-overlay--right">
                <button
                  className="verify-btn"
                  onClick={() => navigate('/auth')}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;