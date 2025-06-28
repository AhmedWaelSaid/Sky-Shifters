// ResetPassword.jsx
import './ForgotPassword.css'
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaKey, FaLock, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

const resetPassword = async ({ code, newPassword }) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to reset password');
  }

  return response.json();
};

const ResetPassword = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const navigate = useNavigate();

  useEffect(() => {
    if (codeFromUrl) setCode(codeFromUrl);
  }, [codeFromUrl]);

  const { mutate, isPending, error } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      setMessage('Password reset successfully! You can now sign in with your new password.');
      setIsSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    },
    onError: (error) => {
      setMessage(error.message);
      setIsSuccess(false);
    },
  });

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: {
        length: password.length < minLength,
        uppercase: !hasUpperCase,
        lowercase: !hasLowerCase,
        numbers: !hasNumbers,
        special: !hasSpecialChar
      }
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!code.trim()) {
      setMessage('Please enter the reset code');
      setIsSuccess(false);
      return;
    }

    if (!newPassword.trim()) {
      setMessage('Please enter a new password');
      setIsSuccess(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsSuccess(false);
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setMessage('Password must contain at least 8 characters, uppercase, lowercase, number, and special character');
      setIsSuccess(false);
      return;
    }

    mutate({ code, newPassword });
  };

  const handleBackToSignIn = () => {
    navigate('/auth');
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <div className="container__form container--reset-password">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-header">
          <button 
            type="button" 
            className="back-button" 
            onClick={handleBackToSignIn}
          >
            <FaArrowLeft />
          </button>
          <h2 className="form__title">Reset Password</h2>
        </div>
        
        <p className="form-description">
          Enter the reset code sent to your email and your new password below
        </p>
        
        <div className="input-container">
          <FaKey className="input-icon" />
          <input
            type="text"
            id="resetCode"
            placeholder="Reset Code"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={isPending}
          />
        </div>

        <div className="input-container">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            id="resetPassword"
            placeholder="New Password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isPending}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="input-container">
          <FaLock className="input-icon" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            placeholder="Confirm Password"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isPending}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Password validation indicators */}
        {newPassword && (
          <div className="password-validation">
            <p className="validation-title">Password Requirements:</p>
            <div className="validation-item">
              <span className={passwordValidation.isValid ? 'valid' : 'invalid'}>
                {passwordValidation.isValid ? '✓' : '✗'}
              </span>
              <span>At least 8 characters</span>
            </div>
            <div className="validation-item">
              <span className={/[A-Z]/.test(newPassword) ? 'valid' : 'invalid'}>
                {/[A-Z]/.test(newPassword) ? '✓' : '✗'}
              </span>
              <span>Uppercase letter</span>
            </div>
            <div className="validation-item">
              <span className={/[a-z]/.test(newPassword) ? 'valid' : 'invalid'}>
                {/[a-z]/.test(newPassword) ? '✓' : '✗'}
              </span>
              <span>Lowercase letter</span>
            </div>
            <div className="validation-item">
              <span className={/\d/.test(newPassword) ? 'valid' : 'invalid'}>
                {/\d/.test(newPassword) ? '✓' : '✗'}
              </span>
              <span>Number</span>
            </div>
            <div className="validation-item">
              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'valid' : 'invalid'}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '✓' : '✗'}
              </span>
              <span>Special character</span>
            </div>
          </div>
        )}
        
        {message && (
          <p className={isSuccess ? 'success' : 'error'}>
            {message}
          </p>
        )}
        
        <button 
          type="submit" 
          className="btn" 
          disabled={isPending}
        >
          {isPending ? 'Resetting...' : 'Reset Password'}
        </button>
        
        <p className="auth-link">
          <a href="/auth" className="link">
            Back to Sign In
          </a>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;