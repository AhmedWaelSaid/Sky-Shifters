import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import ProfileSection from "./ProfileSection";
import ViewProfileSection from "./ViewProfileSection";
import Sidebar from "./Sidebar";
import styles from './MainContent.module.css';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../../services/userProfileService';

const MainContent = () => {
  const [page, setPage] = useState('account');
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = user?.token || user?.accessToken;
        if (!token) return;
        const res = await getUserProfile(token);
        setProfile(res.data.user);
      } catch (err) {
        setProfile(null);
      }
    }
    if (user) fetchProfile();
  }, [user]);

  return (
    <div style={{ display: 'flex' }} className={styles.fadeIn}>
      <Sidebar 
        onSelectPage={setPage} 
        currentPage={page} 
        firstName={profile?.firstName} 
        lastName={profile?.lastName} 
        birthdate={profile?.birthdate}
      />
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

