// src/components/HamburgerMenu.jsx
import styles from './HamburgerMenu.module.css';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import avatarLogo from '../../assets/Asset 18@2x.png';

export default function HamburgerMenu({ onToggle }) {
  const [isChecked, setIsChecked] = useState(false);
  const { user } = useAuth();

  const handleToggle = () => {
    setIsChecked(!isChecked);
    if (onToggle) onToggle();
  };

  return (
    <div className={styles.userTrigger} onClick={handleToggle}>
      <div className={styles.avatar}>
        <img src={avatarLogo} alt="User Avatar" />
      </div>
    </div>
  );
}

// تعريف PropTypes
HamburgerMenu.propTypes = {
  onToggle: PropTypes.func,
};