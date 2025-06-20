import React, { useState, useEffect } from 'react';
import styles from './StayDiscount.module.css';
import { Info, Hotel } from 'lucide-react';

const StayDiscount = ({ selected = false, onToggle = () => {} }) => {
  const [discountSelected, setDiscountSelected] = useState(selected);
  const [showBenefits, setShowBenefits] = useState(false);
  
  // Update local state when prop changes
  useEffect(() => {
    setDiscountSelected(selected);
  }, [selected]);
  
  const toggleDiscount = () => {
    const newValue = !discountSelected;
    setDiscountSelected(newValue);
    onToggle(newValue);
  };
  
  const toggleBenefits = (e) => {
    e.preventDefault();
    setShowBenefits(prev => !prev);
  };
  
  return (
    <div className={styles.stayDiscountOption}>
      <div className={styles.discountDetails}>
        <div className={styles.discountHeader}>
          <div className={styles.discountIcon}>
            <Hotel size={16} className={styles.hotelIcon} />
          </div>
          <div className={styles.discountText}>
            <span>Unlock an exclusive stay discount!</span>
          </div>
        </div>
        <a href="#" className={styles.viewBenefits} onClick={toggleBenefits}>
          View benefits
        </a>
        
        {showBenefits && (
          <div className={styles.benefitsPanel}>
            <div className={styles.benefitItem}>
              <Info size={16} className={styles.benefitIcon} />
              <span>10% off on partner hotels</span>
            </div>
            <div className={styles.benefitItem}>
              <Info size={16} className={styles.benefitIcon} />
              <span>Free breakfast at selected properties</span>
            </div>
            <div className={styles.benefitItem}>
              <Info size={16} className={styles.benefitIcon} />
              <span>Early check-in when available</span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.checkbox}>
        <input 
          type="checkbox" 
          id="stayDiscount" 
          checked={discountSelected} 
          onChange={toggleDiscount}
        />
        <label htmlFor="stayDiscount" style={{cursor: 'pointer'}}></label>
      </div>
    </div>
  );
};

export default StayDiscount;
