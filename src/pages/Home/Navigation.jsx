import { Link } from 'react-router-dom';
import { MdAirplanemodeActive, MdHotel } from 'react-icons/md';
import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <div className={styles.navContainer}>
      <Link to="/" className={styles.navLink} aria-label="Go to Find-flight Page">
        <span className={styles.navLink}>
          <MdAirplanemodeActive className={styles.icon} />
          Find Flight
        </span>
      </Link>
      <a href="#" className={styles.navLink}>
        <MdHotel className={styles.icon} />
        Find Stays
      </a>
    </div>
  );
}