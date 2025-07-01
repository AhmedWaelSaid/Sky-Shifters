import React, { useContext } from 'react';
import { ThemeContext } from '../../components/context/ThemeContext';
import logoLight from '../../assets/Asset 22@2x.png';
import logoDark from '../../assets/Asset 24@2x.png';
import './Help.css';

export default function Help() {
  const { theme } = useContext(ThemeContext);
  const logo = theme === 'dark' ? logoDark : logoLight;
  return (
    <div className="help-container">
      <div className="help-logo"><img src={logo} alt="taier logo" /></div>
      <h1 className="help-title">Help &amp; Support</h1>
      <h2 className="help-section-title">Frequently Asked Questions</h2>
      <ul className="help-faq">
        <li><b>How to Create a New Account:</b> You can create a new account through the registration page with email verification.</li>
      </ul>
      <h2 className="help-section-title">Profile Management</h2>
      <ul className="help-faq">
        <li><b>Edit Personal Information:</b> You can modify your first name, last name, phone number, and country.</li>
        <li><b>Change Password:</b> With strict security requirements including uppercase and lowercase letters, numbers, and symbols.</li>
      </ul>
      <h2 className="help-section-title">Using the System</h2>
      <ul className="help-faq">
        <li><b>Search for Flights:</b> Use the search form on the homepage.</li>
        <li><b>Currency Selection:</b> You can change the currency from the top menu.</li>
        <li><b>Live Support:</b> Use the live chat system for immediate assistance.</li>
      </ul>
      <h2 className="help-section-title">Quick Access</h2>
      <p className="help-desc">You can access all services from the sidebar menu which includes:</p>
      <ul className="help-faq">
        <li>My Bookings</li>
        <li>Settings</li>
        <li>Contact Us</li>
      </ul>
      <h2 className="help-section-title">Contact Us</h2>
      <ul className="help-faq">
        <li>Use the live chat system</li>
        <li>Contact us through social media platforms</li>
      </ul>
    </div>
  );
} 