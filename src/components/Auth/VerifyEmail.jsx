import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

// دالة لإرسال طلب التحقق من الإيميل باستخدام الكود
const verifyEmail = async ({ email, code }) => {
  console.log('Sending request to:', `${import.meta.env.VITE_API_URL}/verify-email`);
  console.log('Payload:', { email, code });

  const response = await fetch(`${import.meta.env.VITE_API_URL}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response from server:', errorData);
    throw new Error(errorData.message || 'Email verification failed');
  }

  const data = await response.json();
  console.log('Success response from server:', data);
  return data;
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      setMessage(data.message || 'Email verified successfully! Redirecting to Sign In...');
      setTimeout(() => navigate('/authpanel-signin'), 3000);
    },
    onError: (error) => {
      setMessage(`Failed to verify email: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (!email || !code) {
      setMessage('Please enter both email and verification code.');
      return;
    }
    const formattedCode = code.toUpperCase(); // تحويل الكود للحروف الكبيرة
    mutate({ email, code: formattedCode });
  };

  return (
    <div className="container__form container--verify">
      <div className="form">
        <h2 className="form__title">Verify Your Email</h2>
        <p>
          A verification code has been sent to your email. Please enter your email and the code below to verify your account.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Verification Code"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())} // تحويل الكود للحروف الكبيرة أثناء الكتابة
            required
          />
          {message && <p className={message.includes('Failed') ? 'error' : 'success'}>{message}</p>}
          {error && <p className="error">{error.message}</p>}
          <button type="submit" className="btn" disabled={isPending}>
            {isPending ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        <p>
          Already verified? <a href="/authpanel-signin">Go to Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;