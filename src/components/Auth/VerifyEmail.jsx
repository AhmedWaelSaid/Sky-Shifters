// VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

// دالة لإرسال طلب التحقق من الإيميل
const verifyEmail = async (token) => {
  const response = await fetch('http://13.81.120.153/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Email verification failed');
  }

  return response.json();
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // استخراج الـ Token من الرابط
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');

  const { mutate, error } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      setMessage(data.message || 'Email verified successfully! You can now sign in.');
      setTimeout(() => navigate('/signin'), 3000); // إعادة توجيه لصفحة تسجيل الدخول بعد 3 ثواني
    },
    onError: (error) => {
      setMessage(`Failed to verify email: ${error.message}`);
    },
  });

  useEffect(() => {
    if (token) {
      mutate(token); // إرسال الطلب للتحقق من الإيميل
    } else {
      setMessage('No verification token provided.');
    }
  }, [token, mutate]);

  return (
    <div className="container__form container--verify">
      <div className="form">
        <h2 className="form__title">Email Verification</h2>
        <p>{message}</p>
        {error && <p className="error">{error.message}</p>}
        <p>
          <a href="/signin">Go to Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;