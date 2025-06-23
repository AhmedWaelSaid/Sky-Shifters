import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import styles from './ProfileSection.module.css';

const ProfileSection = () => {
  return (
    <div className={styles.profileSection}>
      {/* Profile Information */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <div className={styles.inputContainer}>
            <input 
              type="email" 
              value="graceworld876@gmail.com" 
              className={styles.input}
              readOnly
            />
            <button className={styles.editButton}>EDIT</button>
          </div>
          <p className={styles.helpText}>
            This email is linked to your account. It is not visible to other users.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Username:</label>
          <div className={styles.inputContainer}>
            <input 
              type="text" 
              value="GraceHermit151" 
              className={styles.input}
              readOnly
            />
            <button className={styles.editButton}>EDIT</button>
          </div>
          <p className={styles.helpText}>
            Name that is visible to other Eldorado users. You can change your username once every 90 days.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password:</label>
          <div className={styles.inputContainer}>
            <Button className={styles.changePasswordButton}>
              Change password
            </Button>
          </div>
          <p className={styles.helpText}>
            Password can only be changed if you are using the email/password login flow
          </p>
        </div>
      </div>

      {/* Payments Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Payments</h2>
      </div>

      {/* Profile Picture Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile picture</h2>
        
        <div className={styles.profilePictureContainer}>
          <div className={styles.avatarLarge}>
            <div className={styles.avatarPlaceholder}>
              <span className={styles.avatarIcon}>👤</span>
            </div>
          </div>
          <div className={styles.uploadSection}>
            <Button className={styles.uploadButton}>
              Upload image
            </Button>
            <p className={styles.uploadText}>
              Must be JPEG, PNG or HEIC and cannot exceed 10MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;

