// src/components/SignIn.jsx
import './SignIn.css';
import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaEnvelope, FaLock } from 'react-icons/fa'; // استيراد الأيقونات

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
    throw new Error(errorData.message || 'Failed to send reset link');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

const SignIn = memo(function SignIn({ onToggle, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false); // state جديدة للتحكم في الـ form
  const navigate = useNavigate();

  // Mutation لتسجيل الدخول
  const { mutate: loginMutate, isPending: isLoginPending, error: loginError } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const userData = {
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || email.split('@')[0],
        email: data.user?.email || email,
        phoneNumber: data.user?.phoneNumber || '',
        country: data.user?.country || '',
        birthdate: data.user?.birthdate || '',
        token: data.token || '',
      };
      onLogin(userData);
      navigate('/');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      if (error.message.includes('verify your email')) {
        setResendMessage('Your email is not verified. Redirecting to verify...');
        setTimeout(() => {
          navigate('/verify-email', { state: { email } });
        }, 2000); // إعادة توجيه بعد 2 ثانية
      }
    },
  });

  // Mutation لطلب إعادة تعيين كلمة المرور
  const { mutate: resetMutate, isPending: isResetPending, error: resetError } = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setResendMessage('A password reset link has been sent to your email.');
      setTimeout(() => {
        setShowForgotPassword(false); // ارجع لنموذج الـ Sign In بعد 3 ثواني
        setEmail(''); // امسح الـ email
        setResendMessage('');
      }, 3000);
    },
  });

  // دالة تسجيل الدخول
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setResendMessage('');
    loginMutate({ email, password });
  };

  // دالة إعادة تعيين كلمة المرور
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setResendMessage('');
    resetMutate({ email });
  };

  // التحويل بين الـ Sign In وForgot Password
  const toggleForm = () => {
    setShowForgotPassword(!showForgotPassword);
    setEmail(''); // امسح الـ email لما تتحول بين النماذج
    setPassword(''); // امسح الـ password
    setResendMessage(''); // امسح أي رسائل
  };

  return (
    <div className="container__form container--signin">
      {!showForgotPassword ? (
        // نموذج تسجيل الدخول (Sign In)
        <form className="form" onSubmit={handleSignInSubmit}>
          <h2 className="form__title">Sign In</h2>
          {/* Email */}
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
          {/* Password */}
          <div className="input-container">
            <FaLock className="input-icon" />
            <input
              type="password"
              id="signinPassword"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && !resendMessage && <p className="error">{loginError.message}</p>}
          {resendMessage && <p className={resendMessage.includes('Error') ? 'error' : 'success'}>{resendMessage}</p>}
          <a href="#" className="link" onClick={(e) => { e.preventDefault(); toggleForm(); }}>
            Forgot your password?
          </a>
          <button type="submit" className="btn" disabled={isLoginPending}>
            {isLoginPending ? 'Loading...' : 'Sign In'}
          </button>
          <p className="auth-link">
            Don’t have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onToggle(); }}>
              Sign Up
            </a>
          </p>
        </form>
      ) : (
        // نموذج إعادة تعيين كلمة المرور (Forgot Password)
        <form className="form" onSubmit={handleForgotPasswordSubmit}>
          <h2 className="form__title">Forgot Password</h2>
          <p>Enter your email address to receive a password reset link.</p>
          {/* Email */}
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
          {resendMessage && <p className="success">{resendMessage}</p>}
          <button type="submit" className="btn" disabled={isResetPending}>
            {isResetPending ? 'Loading...' : 'Send Reset Link'}
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