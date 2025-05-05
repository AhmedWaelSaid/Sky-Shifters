
import React from 'react';
import styles from './FlightSummary.module.css';

const CancellationPolicy = () => {
  return (
    <div className={styles.cancellationSection}>
      <div className={styles.cancelHeader}>
        <span>Cancel & date change</span>
        <button className={styles.detailsButton}>Details</button>
      </div>
      
      <div className={styles.cancelInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Non-refundable</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Changeable with fees</span>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;
