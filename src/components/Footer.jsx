
import './Footer.css';
import logo from '../assets/logo.png';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa'; // استيراد أيقونات

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo">
          <img src={logo} alt="Sky Shifters Logo" className="footer-logo-img" />
         
          <div className="subscribe-form">
            <input type="email" placeholder="Input your Email" className="email-input-footer" />
            <button className="subscribe-btn">Subscribe</button>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h3>About us</h3>
            <ul>
              <li>How to book</li>
              <li>Help center</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Flight</h3>
            <ul>
              <li>Booking easily</li>
              <li>Promotions</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact us</h3>
            <div className="social-icons">
              <FaFacebookF className="social-icon" />
              <FaTwitter className="social-icon" />
              <FaInstagram className="social-icon" />
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Company, Inc. · Privacy · Terms</p>
      </div>
    </footer>
  );
}