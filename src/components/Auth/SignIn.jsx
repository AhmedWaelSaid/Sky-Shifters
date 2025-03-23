import './SignIn.css';
import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

const loginUser = async ({ email, password }) => {
  console.log('Sending request to:', `${import.meta.env.VITE_API_URL}/users/login`);
  console.log('Payload:', { email, password });

  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
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

// دالة لإعادة إرسال رابط التحقق
const resendVerificationEmail = async (email) => {
  console.log('Sending resend verification request to:', `${import.meta.env.VITE_API_URL}/users/resend-verification`);
  console.log('Payload:', { email });

  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response from server:', errorData);
    throw new Error(errorData.message || 'Failed to resend verification email');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

const SignIn = memo(function SignIn({ onToggle, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

  const { mutate: loginMutate, isPending: isLoginPending, error: loginError } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const userData = {
        firstName: data.user?.firstName || '', // نستخدم firstName من الـ API
        lastName: data.user?.lastName || '',   // نستخدم lastName من الـ API
        name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || email.split('@')[0], // ندمج firstName و lastName في name
        email: data.user?.email || email,      // نستخدم email من الـ API
        phoneNumber: data.user?.phoneNumber || '', // نضيف phoneNumber
        country: data.user?.country || '',     // نضيف country
        birthdate: data.user?.birthdate || '', // نضيف birthdate
        token: data.token || '',               // نضيف token لو بتستخدمه للـ Authentication
      };
      onLogin(userData);
      navigate('/');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      if (error.message.includes('verify your email')) {
        setEmailNotVerified(true);
      }
    },
  });

  const { mutate: resendMutate, isPending: isResendPending } = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: (data) => {
      setResendMessage(data.message || 'Verification email resent successfully! Please check your inbox.');
    },
    onError: (error) => {
      setResendMessage(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailNotVerified(false);
    setResendMessage('');
    loginMutate({ email, password });
  };

  const handleResendEmail = () => {
    setResendMessage('');
    resendMutate(email);
  };

  if (emailNotVerified) {
    return (
      <div className="container__form container--signin">
        <div className="form">
          <h2 className="form__title">Verify Your Email</h2>
          <p>
            Your email <strong>{email}</strong> is not verified. Please check your email (including the spam/junk folder) for a verification link to activate your account.
          </p>
          <button onClick={handleResendEmail} className="btn" disabled={isResendPending}>
            {isResendPending ? 'Resending...' : 'Resend Verification Email'}
          </button>
          {resendMessage && <p className={resendMessage.includes('Error') ? 'error' : 'success'}>{resendMessage}</p>}
          <p>
            <a href="#" onClick={(e) => { e.preventDefault(); onToggle(); }}>Back to Sign Up</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container__form container--signin">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form__title">Sign In</h2>
        <input
          type="email"
          id="signinEmail"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          id="signinPassword"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {loginError && <p className="error">{loginError.message}</p>}
        <a href="/forgot-password" className="link">
          Forgot your password?
        </a>
        <button type="submit" className="btn" disabled={isLoginPending}>
          {isLoginPending ? 'Loading...' : 'Sign In'}
        </button>
        <p className="auth-link">
          Don’t have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onToggle(); }}>Sign Up</a>
        </p>
      </form>
    </div>
  );
});

SignIn.propTypes = {
  onToggle: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

export default SignIn;