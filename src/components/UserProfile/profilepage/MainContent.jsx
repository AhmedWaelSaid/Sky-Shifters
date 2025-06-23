import React from 'react';
import { Settings } from 'lucide-react';
import ProfileSection from './ProfileSection';
import styles from './MainContent.module.css';

const MainContent = () => {
  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <Settings className={styles.headerIcon} size={24} />
        <h1 className={styles.headerTitle}>Account settings</h1>
      </div>
      
      <div className={styles.content}>
        <ProfileSection />
      </div>
    </div>
  );
};

export default MainContent;

