import './SignUp.css';
import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

countries.registerLocale(en);
const countryOptions = Object.entries(countries.getNames('en', { select: 'official' })).map(([code, name]) => ({
  value: code.toLowerCase(),
  label: name,
}));

// دالة التسجيل باستخدام المتغير VITE_API_URL
const registerUser = async ({ firstName, lastName, email, password, phoneNumber, country, birthdate }) => {
  console.log('Sending request to:', `${import.meta.env.VITE_API_URL}/users/register`);
  console.log('Payload:', { firstName, lastName, email, password, phoneNumber, country, birthdate });

  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, phoneNumber, country, birthdate }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response from server:', errorData);
    throw new Error(errorData.message || 'Registration failed');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

const SignUp = memo(function SignUp({ onToggle, onLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState(null);
  const [birthdate, setBirthdate] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  const navigate = useNavigate();

  const { mutate: registerMutate, isPending: isRegisterPending, error: registerError } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.message && data.message.includes('verify your email')) {
        setResendMessage('A verification code has been sent to your email. Redirecting to verify...');
        setTimeout(() => {
          navigate('/verify-email', { state: { email } });
        }, 2000); // إعادة توجيه بعد 2 ثانية
      } else {
        const userData = {
          firstName: data.user?.firstName || firstName,
          lastName: data.user?.lastName || lastName,
          name: `${data.user?.firstName || firstName} ${data.user?.lastName || lastName}`.trim(),
          email: data.user?.email || email,
          phoneNumber: data.user?.phoneNumber || phoneNumber,
          country: data.user?.country || (country ? country.label : ''),
          birthdate: data.user?.birthdate || birthdate,
          token: data.token || '',
        };
        onLogin(userData);
        navigate('/');
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setResendMessage('');
    registerMutate({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      country: country ? country.label : '',
      birthdate,
    });
  };

  return (
    <div className="container__form container--signup">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form__title">Sign Up</h2>
        <input
          type="text"
          id="signupFirstName"
          placeholder="First Name"
          className="input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          id="signupLastName"
          placeholder="Last Name"
          className="input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
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
        <input
          type="tel"
          id="signupPhoneNumber"
          placeholder="Phone Number"
          className="input"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
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
          id="signupBirthdate"
          placeholder="Birth Date"
          className="input"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          required
        />
        {registerError && <p className="error">{registerError.message}</p>}
        {resendMessage && <p className={resendMessage.includes('Error') ? 'error' : 'success'}>{resendMessage}</p>}
        <button type="submit" className="btn" disabled={isRegisterPending}>
          {isRegisterPending ? 'Loading...' : 'Sign Up'}
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