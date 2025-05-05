
import React, { useState } from 'react';
import styles from './ChildServices.module.css';
import { Baby, Info } from 'lucide-react';

const ChildServices = ({ formData, onUpdateForm }) => {
  const [showServices, setShowServices] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  
  const hasChildPassengers = true; // This should ideally check if there are child passengers
  
  const toggleService = (service) => {
    const currentValue = formData.specialServices?.[service] || false;
    onUpdateForm('specialServices', { [service]: !currentValue });
  };
  
  const toggleBenefits = (e) => {
    e.preventDefault();
    setShowBenefits(!showBenefits);
  };
  
  return (
    <div className={styles.childServices}>
      <div className={styles.serviceHeader} onClick={() => setShowServices(!showServices)}>
        <div className={styles.headerContent}>
          <div className={styles.serviceIcon}>
            <Baby size={20} />
          </div>
          <h3>Child Special Services</h3>
        </div>
        <button className={styles.toggleButton}>
          {showServices ? '−' : '+'}
        </button>
      </div>
      
      {showServices && (
        <div className={styles.serviceOptions}>
          <p className={styles.serviceDescription}>
            Add special services for children traveling with you
            <a href="#" className={styles.viewBenefits} onClick={toggleBenefits}>
              View details
            </a>
          </p>
          
          {showBenefits && (
            <div className={styles.benefitsPanel}>
              <div className={styles.benefitItem}>
                <Info size={16} className={styles.benefitIcon} />
                <span>Child seats (FAA-approved) can be installed on board</span>
              </div>
              <div className={styles.benefitItem}>
                <Info size={16} className={styles.benefitIcon} />
                <span>Special kids' meals available for long flights</span>
              </div>
              <div className={styles.benefitItem}>
                <Info size={16} className={styles.benefitIcon} />
                <span>Strollers can be checked for free up to the gate</span>
              </div>
            </div>
          )}
          
          <div className={styles.serviceItem}>
            <div className={styles.serviceInfo}>
              <h4>Child Seat</h4>
              <p>Add a child restraint seat for infants and young children</p>
            </div>
            <div className={styles.serviceActions}>
              <span className={styles.servicePrice}>$15.99</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox"
                  checked={formData.specialServices?.childSeat || false}
                  onChange={() => toggleService('childSeat')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
          
          <div className={styles.serviceItem}>
            <div className={styles.serviceInfo}>
              <h4>Kids' Meal</h4>
              <p>Special meal options for children</p>
            </div>
            <div className={styles.serviceActions}>
              <span className={styles.servicePrice}>$8.99</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox"
                  checked={formData.specialServices?.childMeal || false}
                  onChange={() => toggleService('childMeal')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
          
          <div className={styles.serviceItem}>
            <div className={styles.serviceInfo}>
              <h4>Stroller Service</h4>
              <p>Bring your stroller up to the gate (free service)</p>
            </div>
            <div className={styles.serviceActions}>
              <span className={styles.servicePrice}>Free</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox"
                  checked={formData.specialServices?.stroller || false}
                  onChange={() => toggleService('stroller')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildServices;
