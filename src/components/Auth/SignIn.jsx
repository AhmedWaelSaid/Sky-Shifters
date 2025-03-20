import './SignIn.css';
import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query'; // استيراد useMutation

// دالة لإرسال طلب تسجيل الدخول
const loginUser = async ({ email, password }) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

const SignIn = memo(function SignIn({ onToggle, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // استخدام useMutation لتسجيل الدخول
  const { mutate, isPending, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const userData = {
        name: data.user?.name || email.split('@')[0],
        email: data.user?.email || email,
        rank: data.user?.rank || 'Bronze Rank',
        avatar: data.user?.avatar || 'https://via.placeholder.com/40',
        suspended: data.user?.suspended || false,
      };
      onLogin(userData);
      navigate('/');
    },
    onError: (error) => {
      console.error('Error:', error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ email, password }); // استدعاء الـ mutation
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
        {error && <p className="error">{error.message}</p>}
        <a href="#" className="link" onClick={(e) => { e.preventDefault(); /* أضف منطق نسيت كلمة المرور */ }}>
          Forgot your password?
        </a>
        <button type="submit" className="btn" disabled={isPending}>
          {isPending ? 'Loading...' : 'Sign In'}
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