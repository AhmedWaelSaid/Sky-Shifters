import React, { useContext } from 'react';
import { ThemeContext } from '../../components/context/ThemeContext';
import logoLight from '../../assets/Asset 22@2x.png';
import logoDark from '../../assets/Asset 24@2x.png';
import './About.css';

export default function About() {
  const { theme } = useContext(ThemeContext);
  const logo = theme === 'dark' ? logoDark : logoLight;
  return (
    <div className="about-container">
      <div className="about-logo"><img src={logo} alt="taier logo" /></div>
      <h1 className="about-title">About taier</h1>
      <p className="about-desc">
        taier is an advanced flight booking platform designed to simplify the process of searching for and booking flights.
      </p>
      <h2 className="about-section-title">Key Features</h2>
      <ul className="about-features">
        <li><b>Advanced User Management System:</b> Includes profile management with the ability to edit personal information and change passwords.</li>
        <li><b>Responsive User Interface:</b> Supports light and dark modes with an advanced color system.</li>
        <li><b>Secure Payment System:</b> Supports credit cards with advanced encryption.</li>
        <li><b>Booking Management:</b> View and manage past and current bookings.</li>
      </ul>
      <h2 className="about-section-title">Our Vision</h2>
      <p className="about-vision">
        We strive to make travel easier and more comfortable by providing a reliable and user-friendly platform for flight booking.
      </p>
    </div>
  );
} 