// src/components/SignIn.jsx
import './SignIn.css';
import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaEnvelope, FaLock } from 'react-icons/fa';

// دالة تسجيل الدخول
const loginUser = async ({ email, password }) => {
  console.log('Sending request to:', `${import.meta.env.VITE_API_BASE_URL}/users/login`);
  console.log('Payload:', { email, password });

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response from server:', errorData);
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

// دالة طلب إعادة تعيين كلمة المرور
const requestPasswordReset = async ({ email }) => {
  console.log('Sending request to:', `${import.meta.env.VITE_API_BASE_URL}/users/request-password-reset`);
  console.log('Payload:', { email });

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response from server:', errorData);
    throw new Error(errorData.message || 'Failed to send reset code');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

const SignIn = memo(function SignIn({ onToggle, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Mutation لتسجيل الدخول
  const { mutate: loginMutate, isPending: isLoginPending, error: loginError } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // --- ✨ هذا هو الجزء الوحيد الذي قمنا بتعديله ---
      const userData = {
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || email.split('@')[0],
        email: data.user?.email || email,
        phoneNumber: data.user?.phoneNumber || '',
        country: data.user?.country || '',
        birthdate: data.user?.birthdate || '',
        token: data.data.accessToken,
        refreshToken: data.data.refreshToken
      };
      // حفظ التوكن في localStorage
      if (data.data?.accessToken) {
        localStorage.setItem('access_token', data.data.accessToken);
      }
      if (data.data?.refreshToken) {
        localStorage.setItem('refresh_token', data.data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify({ ...data.data, refreshToken: data.data.refreshToken }));
      // ----------------------------------------------------
      onLogin(userData);
      navigate('/');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      if (error.message.includes('verify your email')) {
        setResendMessage('Your email is not verified. Redirecting to verify...');
        setTimeout(() => {
          navigate('/auth/verify-email', { state: { email } });
        }, 2000);
      }
    },
  });

  // Mutation لطلب إعادة تعيين كلمة المرور
  const { mutate: resetMutate, isPending: isResetPending, error: resetError } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setResendMessage('A password reset code has been sent to your email.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setEmail('');
        setResendMessage('');
      }, 3000);
    },
  });

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setResendMessage('');
    loginMutate({ email, password });
  };
  
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setResendMessage('');
    resetMutate({ email });
  };
  
  const toggleForm = () => {
    setShowForgotPassword(!showForgotPassword);
    setEmail('');
    setPassword('');
    setResendMessage('');
  };

  return (
    <div className="container__form container--signin">
      {!showForgotPassword ? (
        <form className="form" onSubmit={handleSignInSubmit}>
          <h2 className="form__title">Sign In</h2>
          <div className="input-container">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              id="signinEmail"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="signinPassword"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{paddingRight:'40px'}}
            />
            <span onClick={()=>setShowPassword(v=>!v)} style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', cursor:'pointer'}}>
              {showPassword ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#888" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="#888" strokeWidth="2"/><line x1="4" y1="20" x2="20" y2="4" stroke="#888" strokeWidth="2"/></svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#888" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="#888" strokeWidth="2"/></svg>
              )}
            </span>
          </div>
          {loginError && !resendMessage && <p className="error">{loginError.message}</p>}
          {resendMessage && resendMessage.toLowerCase().includes('error') && <p className="error">{resendMessage}</p>}
          {resendMessage && !resendMessage.toLowerCase().includes('error') && <p className="success">{resendMessage}</p>}
          <a href="#" className="link" onClick={(e) => { e.preventDefault(); navigate('/auth/forgot-password'); }}>
            Forgot your password?
          </a>
          <button type="submit" className="btn" disabled={isLoginPending}>
            {isLoginPending ? 'Loading...' : 'Sign In'}
          </button>
          <p className="auth-link">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onToggle(); }}>
              Sign Up
            </a>
          </p>
          <p className="auth-link">
            Haven't verified your email?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); if(email) navigate('/auth/verify-email', { state: { email } }); else alert('Please enter your email above first.'); }}>
              Verify Email
            </a>
          </p>
        </form>
      ) : (
        <form className="form" onSubmit={handleForgotPasswordSubmit}>
          <h2 className="form__title">Forgot Password</h2>
          <p>Enter your email address to receive a password reset code.</p>
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
          {resetError && <p className="error">{resetError.message}</p>}
          {resendMessage && !resetError && !resendMessage.toLowerCase().includes('error') && <p className="success">{resendMessage}</p>}
          <button type="submit" className="btn" disabled={isResetPending}>
            {isResetPending ? 'Loading...' : 'Send Reset Code'}
          </button>
          <p className="auth-link">
            <a href="#" className="link" onClick={(e) => { e.preventDefault(); toggleForm(); }}>
              Back to Sign In
            </a>
          </p>
        </form>
      )}
    </div>
  );
});

SignIn.propTypes = {
  onToggle: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

export default SignIn;