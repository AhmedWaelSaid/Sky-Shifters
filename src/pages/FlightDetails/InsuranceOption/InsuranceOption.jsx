import React, { useState, useEffect } from 'react';
import styles from './InsuranceOption.module.css';
import { Info } from 'lucide-react';

const InsuranceOption = ({ selected = false, onToggle = () => {}, price = "$27.00" }) => {
  const [insuranceSelected, setInsuranceSelected] = useState(selected);
  const [showBenefits, setShowBenefits] = useState(false);
  
  // Update local state when prop changes
  React.useEffect(() => {
    setInsuranceSelected(selected);
  }, [selected]);
  
  const toggleInsurance = () => {
    const newValue = !insuranceSelected;
    setInsuranceSelected(newValue);
    onToggle(newValue);
  };
  
  const toggleBenefits = (e) => {
    e.preventDefault();
    setShowBenefits(prev => !prev);
  };
  
  return (
    <div className={styles.insuranceOption}>
      <div className={styles.insuranceDetails}>
        <div className={styles.insuranceHeader}>
          <div className={styles.insuranceIcon}>$</div>
          <div className={styles.insuranceText}>
            <span>Add insurance to safeguard your trip</span>
            <span className={styles.price}>{price}</span>
          </div>
        </div>
        <a href="#" className={styles.viewBenefits} onClick={toggleBenefits}>
          View benefits
        </a>
        
        {showBenefits && (
          <div className={styles.benefitsPanel}>
            <div className={styles.benefitItem}>
              <Info size={16} className={styles.benefitIcon} />
              <span>Trip cancellation protection up to $1,500</span>
            </div>
            <div className={styles.benefitItem}>
              <Info size={16} className={styles.benefitIcon} />
              <span>Medical emergency coverage up to $10,000</span>
            </div>
            <div className={styles.benefitItem}>
              <Info size={16} className={styles.benefitIcon} />
              <span>Baggage loss/delay compensation</span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.checkbox}>
        <input 
          type="checkbox" 
          id="insurance" 
          checked={insuranceSelected} 
          onChange={toggleInsurance}
        />
        <label htmlFor="insurance" style={{cursor: 'pointer'}}></label>
      </div>
    </div>
  );
};

export default InsuranceOption;
