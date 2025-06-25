import React, { useEffect, useState } from 'react';
import styles from './ProfileSection.module.css';
import { Mail, Lock, User, Phone, Globe, Calendar } from 'lucide-react';
import { getUserProfile } from '../../../services/userProfileService';
import { useAuth } from '../../context/AuthContext';

export default function ViewProfileSection() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const token = user?.token || user?.accessToken;
        const res = await getUserProfile(token);
        setProfile(res.data.user);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchProfile();
  }, [user]);

  if (loading) return (
    <div className={styles.profileSection} style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:300}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        <div style={{width:48,height:48,border:'5px solid #e0e0e0',borderTop:'5px solid #1976d2',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
        <span style={{color:'#1976d2',fontWeight:500}}>Loading...</span>
      </div>
      <style>{`@keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }`}</style>
    </div>
  );
  if (error) return <div className={styles.profileSection} style={{color:'red'}}>{error}</div>;
  if (!profile) return null;

  return (
    <div className={styles.profileSection}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 24px', maxWidth: 900 }}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Mail size={16} style={{marginRight:8,verticalAlign:'middle'}} />Email:</label>
            <div className={styles.inputContainer}>
              <input type="email" value={profile.email || ''} className={styles.input} readOnly />
            </div>
          </div>
          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Lock size={16} style={{marginRight:8,verticalAlign:'middle'}} />Password:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={profile.password ? profile.password : '********'} className={styles.input} readOnly />
            </div>
          </div>
          {/* First Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} style={{marginRight:8,verticalAlign:'middle'}} />First Name:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={profile.firstName || ''} className={styles.input} readOnly />
            </div>
          </div>
          {/* Last Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} style={{marginRight:8,verticalAlign:'middle'}} />Last Name:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={profile.lastName || ''} className={styles.input} readOnly />
            </div>
          </div>
          {/* Phone Number */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Phone size={16} style={{marginRight:8,verticalAlign:'middle'}} />Phone Number:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={profile.phoneNumber || ''} className={styles.input} readOnly />
            </div>
          </div>
          {/* Country */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Globe size={16} style={{marginRight:8,verticalAlign:'middle'}} />Country:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={profile.country || ''} className={styles.input} readOnly />
            </div>
          </div>
          {/* Birthdate */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Calendar size={16} style={{marginRight:8,verticalAlign:'middle'}} />Birthdate:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={profile.birthdate || ''} className={styles.input} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 