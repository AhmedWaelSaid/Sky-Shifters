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

const SignIn = memo(function SignIn({ onToggle, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setResendMessage('');
    loginMutate({ email, password });
  };

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
        {loginError && !resendMessage && <p className="error">{loginError.message}</p>}
        {resendMessage && <p className={resendMessage.includes('Error') ? 'error' : 'success'}>{resendMessage}</p>}
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