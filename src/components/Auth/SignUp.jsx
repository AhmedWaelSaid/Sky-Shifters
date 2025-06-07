// src/components/SignUp.jsx
import './SignUp.css';
import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaGlobe, FaCalendarAlt } from 'react-icons/fa'; // استيراد الأيقونات
import DatePicker from 'react-datepicker'; // استيراد DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // استيراد الـ CSS بتاع DatePicker

countries.registerLocale(en);
const countryOptions = Object.entries(countries.getNames('en', { select: 'official' })).map(([code, name]) => ({
  value: code.toLowerCase(),
  label: name,
}));

// دالة التسجيل باستخدام المتغير VITE_API_BASE_URL
const registerUser = async ({ firstName, lastName, email, password, phoneNumber, country, birthdate }) => {
  console.log('Sending request to:', `${import.meta.env.VITE_API_BASE_URL}/users/register`);
  console.log('Payload:', { firstName, lastName, email, password, phoneNumber, country, birthdate });

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/register`, {
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

const SignUp = memo(function SignUp({ onToggle }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState(null);
  const [birthdate, setBirthdate] = useState(null); // تغيير birthdate لتخزين Date object
  const [resendMessage, setResendMessage] = useState('');

  const navigate = useNavigate();

  const { mutate: registerMutate, isPending: isRegisterPending, error: registerError } = useMutation({
    mutationFn: registerUser,
    onSuccess: (_) => {
      setResendMessage('A verification code has been sent to your email. Redirecting to verify...');
      setTimeout(() => {
        navigate('/auth/verify-email', { state: { email } });
      }, 2000);
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
      birthdate: birthdate ? birthdate.toISOString().split('T')[0] : '', // تحويل التاريخ لـ string بصيغة YYYY-MM-DD
    });
  };

  return (
    <div className="container__form container--signup">
      <form className="form" onSubmit={handleSubmit}>
        {/* First Name */}
        <div className="input-container">
          <FaUser className="input-icon" />
          <input
            type="text"
            id="signupFirstName"
            placeholder="First Name"
            className="input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        {/* Last Name */}
        <div className="input-container">
          <FaUser className="input-icon" />
          <input
            type="text"
            id="signupLastName"
            placeholder="Last Name"
            className="input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="input-container">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            id="signupEmail"
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
            id="signupPassword"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="input-container">
          <FaPhone className="input-icon" />
          <input
            type="tel"
            id="signupPhoneNumber"
            placeholder="Phone Number"
            className="input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        {/* Country */}
        <div className="input-container selectcountry">
          <FaGlobe className="input-icon" />
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
        </div>

        {/* Birthdate */}
        <div className="input-container">
          <FaCalendarAlt className="input-icon" />
          <DatePicker
            id="signupBirthdate"
            selected={birthdate}
            onChange={(date) => setBirthdate(date)}
            placeholderText="Birth Date"
            className="input date-picker"
            dateFormat="yyyy-MM-dd"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            maxDate={new Date()} // ما ينفعش يختار تاريخ مستقبلي
            required
          />
        </div>

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
};

export default SignUp;