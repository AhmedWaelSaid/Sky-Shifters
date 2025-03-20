import './SignUp.css';
import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query'; // استيراد useMutation

countries.registerLocale(en);
const countryOptions = Object.entries(countries.getNames('en', { select: 'official' })).map(([code, name]) => ({
  value: code.toLowerCase(),
  label: name,
}));

// دالة لإرسال طلب إنشاء الحساب
const registerUser = async ({ username, email, password, country, birthDate }) => {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, country, birthDate }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

const SignUp = memo(function SignUp({ onToggle, onLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const navigate = useNavigate();

  // استخدام useMutation لإنشاء الحساب
  const { mutate, isPending, error } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      const userData = {
        name: data.user?.username || username,
        email: data.user?.email || email,
        avatar: data.user?.avatar || 'https://via.placeholder.com/40',
        suspended: data.user?.suspended || false,
        country: country ? country.label : '',
        birthDate,
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
    mutate({
      username,
      email,
      password,
      country: country ? country.value : '',
      birthDate,
    }); // استدعاء الـ mutation
  };

  return (
    <div className="container__form container--signup">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form__title">Sign Up</h2>
        <input
          type="text"
          id="signupUsername"
          placeholder="User"
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          id="signupEmail"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          id="signupPassword"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Select
          id="signupCountry"
          options={countryOptions}
          value={country}
          onChange={(selectedOption) => setCountry(selectedOption)}
          placeholder="Select Country"
          className="input react-select-container"
          classNamePrefix="react-select"
          isSearchable={true}
        />
        <input
          type="date"
          id="signupBirthDate"
          placeholder="Birth Date"
          className="input"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        {error && <p className="error">{error.message}</p>}
        <button type="submit" className="btn" disabled={isPending}>
          {isPending ? 'Loading...' : 'Sign Up'}
        </button>
        <p className="auth-link">
          Already have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onToggle(); }}>Sign In</a>
        </p>
      </form>
    </div>
  );
});

SignUp.propTypes = {
  onToggle: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

export default SignUp;