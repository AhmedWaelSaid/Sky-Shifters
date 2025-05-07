import styles from './Footer.module.css';
import logo from '../assets/logo.png';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerLogo}>
          <img src={logo} alt="Sky Shifters Logo" className={styles.footerLogoImg} />
          <div className={styles.subscribeForm}>
            <input type="email" placeholder="Input your Email" className={styles.emailInputFooter} />
            <button className={styles.subscribeBtn}>Subscribe</button>
          </div>
        </div>
        <div className={styles.footerLinks}>
          <div className={styles.footerColumn}>
            <h3>About us</h3>
            <ul>
              <li>How to book</li>
              <li>Help center</li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Flight</h3>
            <ul>
              <li>Booking easily</li>
              <li>Promotions</li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Contact us</h3>
            <div className={styles.socialIcons}>
              <FaFacebookF className={styles.socialIcon} />
              <FaTwitter className={styles.socialIcon} />
              <FaInstagram className={styles.socialIcon} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2025 Company, Inc. · Privacy · Terms</p>
      </div>
    </footer>
  );
}