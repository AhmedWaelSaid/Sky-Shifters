import './Auth.css';
import { useState, memo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import signphoto from '../../assets/pexels-pixabay-237272.jpg'
import ResetPassword from './ResetPassword';
import ForgotPassword from './ForgotPassword';

const Auth = memo(function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth(); // Get the login function from AuthContext

  useEffect(() => {
    const panel = searchParams.get('panel');
    const code = searchParams.get('code');
    if (code) {
      setResetCode(code);
      setShowResetPassword(true);
      setShowForgotPassword(false);
      setIsSignUp(false);
    } else if (panel === 'signup') {
      setIsSignUp(true);
      setShowForgotPassword(false);
      setShowResetPassword(false);
    } else {
      setIsSignUp(false);
      setShowForgotPassword(false);
      setShowResetPassword(false);
    }
  }, [searchParams]);

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setSearchParams({ panel: isSignUp ? '' : 'signup' });
  };

  const handleShowForgot = () => {
    setShowForgotPassword(true);
    setShowResetPassword(false);
    setIsSignUp(false);
    setSearchParams({});
  };

  const handleShowReset = (code) => {
    setResetCode(code);
    setShowResetPassword(true);
    setShowForgotPassword(false);
    setIsSignUp(false);
    setSearchParams({ code });
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setIsSignUp(false);
    setSearchParams({});
  };

  return (
    <section className='sign-sec'>
      <img src={signphoto} alt="" className='signphoto' />
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`}>
        {showResetPassword ? (
          <ResetPassword code={resetCode} onBack={handleBackToSignIn} />
        ) : showForgotPassword ? (
          <ForgotPassword onBack={handleBackToSignIn} />
        ) : (
          <>
            <SignUp onToggle={handleToggle} onLogin={login} />
            <SignIn onToggle={handleToggle} onLogin={login} onForgot={handleShowForgot} />
          </>
        )}
        <div className="container__overlay">
          <div className="overlay">
            <div className="overlay__panel overlay--left">
              <button className="btn" onClick={() => { setIsSignUp(false); setShowForgotPassword(false); setShowResetPassword(false); setSearchParams({}); }}>Sign In</button>
            </div>
            <div className="overlay__panel overlay--right">
              <button className="btn" onClick={() => { setIsSignUp(true); setShowForgotPassword(false); setShowResetPassword(false); setSearchParams({ panel: 'signup' }); }}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Auth;