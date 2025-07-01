import { Link } from 'react-router-dom';
import { MdHome } from 'react-icons/md';
import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <div className={styles.navContainer}>
      <Link to="/" className={styles.navLink} aria-label="Go to Home Page">
        <span className={styles.navLink}>
          <MdHome className={styles.icon} />
          Home
        </span>
      </Link>
      <Link to="/about" className={styles.navLink} aria-label="Go to About Page">
        <span className={styles.navLink}>About</span>
      </Link>
    </div>
  );
}