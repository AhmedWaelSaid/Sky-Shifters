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

const registerUser = async ({ firstName, lastName, email, password, phoneNumber, country, birthdate }) => {
  const response = await fetch('https://13.81.120.153/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, phoneNumber, country, birthdate }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

// دالة لإعادة إرسال رابط التحقق
const resendVerificationEmail = async (email) => {
  const response = await fetch('http://13.81.120.153/users/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to resend verification email');
  }

  return response.json();
};

const SignUp = memo(function SignUp({ onToggle, onLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState(null);
  const [birthdate, setBirthdate] = useState('');
  const [isEmailVerificationRequired, setIsEmailVerificationRequired] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const navigate = useNavigate();

  const { mutate: registerMutate, isPending: isRegisterPending, error: registerError } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.message && data.message.includes('verify your email')) {
        setIsEmailVerificationRequired(true);
      } else {
        const userData = {
          name: data.user?.firstName || firstName,
          email: data.user?.email || email,
          avatar: data.user?.avatar || 'https://via.placeholder.com/40',
          suspended: data.user?.suspended || false,
          country: country ? country.label : '',
          birthdate,
        };
        onLogin(userData);
        navigate('/');
      }
    },
    onError: (error) => {
      console.error('Error:', error);
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

  const handleResendEmail = () => {
    setResendMessage('');
    resendMutate(email);
  };

  if (isEmailVerificationRequired) {
    return (
      <div className="container__form container--signup">
        <div className="form">
          <h2 className="form__title">Verify Your Email</h2>
          <p>
            We have sent a verification link to <strong>{email}</strong>. Please check your email (including the spam/junk folder) and click the link to activate your account.
          </p>
          <button onClick={handleResendEmail} className="btn" disabled={isResendPending}>
            {isResendPending ? 'Resending...' : 'Resend Verification Email'}
          </button>
          {resendMessage && <p className={resendMessage.includes('Error') ? 'error' : 'success'}>{resendMessage}</p>}
          <p>
            Already verified?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onToggle(); }}>Sign In</a>
          </p>
        </div>
      </div>
    );
  }

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