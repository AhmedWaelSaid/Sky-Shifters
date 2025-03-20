import './Header.css';
import Logo from "./logo";
import Navigation from './Find-Flight/Navigation';
import { Link } from 'react-router-dom';
import UserProfile from './UserProfile/UserProfile';
import { useAuth } from './context/AuthContext';
import SidebarMenu from './UserProfile/SidebarMenu';

export default function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" className="logo-link" aria-label="Go to Home Page">
          <Logo />
        </Link>
      </div>
      <div className="finds">
        <Navigation />
      </div>
      <div className="signs">
        {isAuthenticated ? (
          <>
            <UserProfile />
            <SidebarMenu />
          </>
        ) : (
          <>
            <Link to="/auth" className="login" aria-label="Go to Login Page">
              Login
            </Link>
            <Link to="/auth?panel=signup" className="sign-up" aria-label="Go to Sign Up Page">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}