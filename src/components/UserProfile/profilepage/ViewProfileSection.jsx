import React from 'react';
import styles from './ProfileSection.module.css';
import { Mail, Lock, User, Phone, Globe, Calendar } from 'lucide-react';

const user = {
  email: "user@example.com",
  password: "Password123!@",
  firstName: "Ahmed",
  lastName: "Mohamed",
  phoneNumber: "+201234567890",
  country: "Egypt",
  birthdate: "1990-01-01"
};

export default function ViewProfileSection() {
  return (
    <div className={styles.profileSection}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 24px', maxWidth: 900 }}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Mail size={16} style={{marginRight:8,verticalAlign:'middle'}} />Email:</label>
            <div className={styles.inputContainer}>
              <input type="email" value={user.email} className={styles.input} readOnly />
            </div>
          </div>
          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Lock size={16} style={{marginRight:8,verticalAlign:'middle'}} />Password:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={user.password} className={styles.input} readOnly />
            </div>
          </div>
          {/* First Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} style={{marginRight:8,verticalAlign:'middle'}} />First Name:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={user.firstName} className={styles.input} readOnly />
            </div>
          </div>
          {/* Last Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} style={{marginRight:8,verticalAlign:'middle'}} />Last Name:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={user.lastName} className={styles.input} readOnly />
            </div>
          </div>
          {/* Phone Number */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Phone size={16} style={{marginRight:8,verticalAlign:'middle'}} />Phone Number:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={user.phoneNumber} className={styles.input} readOnly />
            </div>
          </div>
          {/* Country */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Globe size={16} style={{marginRight:8,verticalAlign:'middle'}} />Country:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={user.country} className={styles.input} readOnly />
            </div>
          </div>
          {/* Birthdate */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Calendar size={16} style={{marginRight:8,verticalAlign:'middle'}} />Birthdate:</label>
            <div className={styles.inputContainer}>
              <input type="text" value={user.birthdate} className={styles.input} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 