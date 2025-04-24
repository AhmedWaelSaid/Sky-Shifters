// src/components/SidebarMenu.jsx
import styles from './SidebarMenu.module.css';
import { useState } from 'react';
import { FaHeart, FaCreditCard, FaLock, FaCog, FaQuestionCircle, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HamburgerMenu from './HamburgerMenu';
import planeIcon from '../../assets/Default_master_piece_anime_style_best_quality_2.jpg';

export default function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.sidebarContainer}>
      <HamburgerMenu onToggle={handleToggle} />
      <nav className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* الجزء العلوي: صورة المستخدم، الاسم، الرصيد */}
        <div className={styles.userProfile}>
          <img src= {planeIcon}  alt="" className={styles.avatar} />
          <div className={styles.userInfo}>
            <h3 className={styles.userName}>{user?.name || 'User'}</h3>
            <p className={styles.userBalance}>${user?.balance || '0.00'}</p>
          </div>
        </div>

        {/* قايمة العناصر */}
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <FaHeart className={styles.icon} />
            <Link to="/favorites" className={styles.link}>Favorites</Link>
            <span className={styles.arrow}>›</span>
          </li>
          <li className={styles.menuItem}>
            <FaCreditCard className={styles.icon} />
            <Link to="/payment-methods" className={styles.link}>Payment Methods</Link>
            <span className={styles.arrow}>›</span>
          </li>
          <li className={styles.menuItem}>
            <FaLock className={styles.icon} />
            <Link to="/security" className={styles.link}>Security</Link>
            <span className={styles.arrow}>›</span>
          </li>
          <li className={styles.menuItem}>
            <FaCog className={styles.icon} />
            <Link to="/settings" className={styles.link}>Settings</Link>
            <span className={styles.arrow}>›</span>
          </li>
          <li className={styles.menuItem}>
            <FaQuestionCircle className={styles.icon} />
            <Link to="/help" className={styles.link}>Help</Link>
            <span className={styles.arrow}>›</span>
          </li>
          <li className={styles.menuItem}>
            <FaInfoCircle className={styles.icon} />
            <Link to="/about" className={styles.link}>About</Link>
            <span className={styles.arrow}>›</span>
          </li>
          <li className={styles.menuItem}>
            <FaSignOutAlt className={styles.icon} />
            <button className={styles.link} onClick={logout}>Log Out</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}