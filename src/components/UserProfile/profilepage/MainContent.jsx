import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import ProfileSection from "./ProfileSection";
import ViewProfileSection from "./ViewProfileSection";
import Sidebar from "./Sidebar";
import styles from './MainContent.module.css';

const MainContent = () => {
  const [page, setPage] = useState('account');

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onSelectPage={setPage} currentPage={page} />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <Settings className={styles.headerIcon} size={24} />
          <h1 className={styles.headerTitle}>
            {page === 'account' ? 'Account settings' : 'View Profile'}
          </h1>
        </div>
        <div className={styles.content}>
          {page === 'account' ? <ProfileSection /> : <ViewProfileSection />}
        </div>
      </div>
    </div>
  );
};

export default MainContent;

