import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import ProfileSection from "./ProfileSection";
import ViewProfileSection from "./ViewProfileSection";
import Sidebar from "./Sidebar";
import styles from './MainContent.module.css';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../../services/userProfileService';
import Notifications from "./Notifications";
import { useLocation, useNavigate } from 'react-router-dom';

const MainContent = () => {
  const [page, setPage] = useState('account');
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== page) {
      setPage(tab);
    }
  }, [location.search]);

  const handleSelectPage = (newPage) => {
    setPage(newPage);
    const params = new URLSearchParams(location.search);
    params.set('tab', newPage);
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div style={{ display: 'flex' }} className={styles.fadeIn}>
      <Sidebar 
        onSelectPage={handleSelectPage} 
        currentPage={page} 
        firstName={profile?.firstName} 
        lastName={profile?.lastName} 
        birthdate={profile?.birthdate}
      />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <Settings className={styles.headerIcon} size={24} />
          <h1 className={styles.headerTitle}>
            {page === 'account' ? 'Account settings' : page === 'profile' ? 'View Profile' : page === 'notifications' ? 'Notifications' : ''}
          </h1>
        </div>
        <div className={styles.content}>
          {page === 'account' ? <ProfileSection /> : page === 'profile' ? <ViewProfileSection /> : page === 'notifications' ? <Notifications /> : null}
        </div>
      </div>
    </div>
  );
};

export default MainContent;

