import styles from './FlightSummary.module.css';

const CancellationPolicy = ({ onDetailsClick }) => {
  return (
    <div className={styles.cancellationSection}>
      <div className={styles.cancelHeader}>
        <span>Cancel & date change</span>
        <button className={styles.detailsButton} onClick={onDetailsClick}>Details</button>
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
