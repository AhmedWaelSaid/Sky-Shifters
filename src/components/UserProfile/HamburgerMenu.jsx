// src/components/HamburgerMenu.jsx
import styles from './HamburgerMenu.module.css';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import planeIcon from '../../assets/Default_master_piece_anime_style_best_quality_2.jpg'; // استيراد الصورة الافتراضية

export default function HamburgerMenu({ onToggle }) {
  const [isChecked, setIsChecked] = useState(false);
  const { user } = useAuth();

  const handleToggle = () => {
    setIsChecked(!isChecked);
    if (onToggle) onToggle();
  };

  return (
    <div className={styles.userTrigger} onClick={handleToggle}>
      <img src={user?.avatar || planeIcon} alt="User Avatar" className={styles.avatar} />
    </div>
  );
}

// تعريف PropTypes
HamburgerMenu.propTypes = {
  onToggle: PropTypes.func,
};