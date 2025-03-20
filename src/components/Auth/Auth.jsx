import './Auth.css';
import { useState, memo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const Auth = memo(function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth(); // Get the login function from AuthContext

  useEffect(() => {
    const panel = searchParams.get('panel');
    if (panel === 'signup') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setSearchParams({ panel: isSignUp ? '' : 'signup' });
  };

  return (
    <section className='sign-sec'>
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`}>
        <SignUp onToggle={handleToggle} onLogin={login} />
        <SignIn onToggle={handleToggle} onLogin={login} />
        <div className="container__overlay">
          <div className="overlay">
            <div className="overlay__panel overlay--left">
              <button className="btn" onClick={() => setIsSignUp(false)}>Sign In</button>
            </div>
            <div className="overlay__panel overlay--right">
              <button className="btn" onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Auth;