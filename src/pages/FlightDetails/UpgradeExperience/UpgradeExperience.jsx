import React, { useState, useEffect } from 'react';
import styles from './UpgradeExperience.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import { ChevronRight, ChevronLeft, CreditCard } from 'lucide-react';
import InsuranceOption from '../InsuranceOption/InsuranceOption';
import StayDiscount from '../StayDiscount/StayDiscount';
import ChildServices from '../ChildServices/ChildServices';

const UpgradeExperience = ({ passengers, formData, onUpdateForm, onContinue, onBack }) => {
  const [selectedSeats, setSelectedSeats] = useState({});
  const [selectedMeals, setSelectedMeals] = useState({});
  const [priorityBoarding, setPriorityBoarding] = useState(false);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [stayDiscountSelected, setStayDiscountSelected] = useState(false);
  
  // Check if there are any child passengers
  const hasChildPassengers = passengers.some(passenger => passenger.type === 'child');

  // Initialize priority boarding from formData if available
  useEffect(() => {
    if (formData.priorityBoarding !== undefined) {
      setPriorityBoarding(formData.priorityBoarding);
    }
    
    // Initialize insurance and stay discount selection from formData if available
    if (formData.addOns && formData.addOns.insurance !== undefined) {
      setInsuranceSelected(formData.addOns.insurance);
    }
    
    if (formData.addOns && formData.addOns.stayDiscount !== undefined) {
      setStayDiscountSelected(formData.addOns.stayDiscount);
    }
  }, [formData]);

  const handleSeatSelection = (passengerId, seatNumber) => {
    setSelectedSeats({
      ...selectedSeats,
      [passengerId]: seatNumber
    });
    
    onUpdateForm('seating', { 
      ...formData.seating,
      [passengerId]: seatNumber 
    });
  };

  const handleMealSelection = (passengerId, mealType) => {
    setSelectedMeals({
      ...selectedMeals,
      [passengerId]: mealType
    });
    
    onUpdateForm('meals', { 
      ...formData.meals,
      [passengerId]: mealType 
    });
  };

  const handlePriorityBoardingToggle = () => {
    const newValue = !priorityBoarding;
    setPriorityBoarding(newValue);
    onUpdateForm('priorityBoarding', newValue);
  };

  const handleBaggageSelection = (baggageSelection) => {
    onUpdateForm('baggageSelection', baggageSelection);
  };
  
  const handleInsuranceToggle = () => {
    const newValue = !insuranceSelected;
    setInsuranceSelected(newValue);
    onUpdateForm('addOns', { 
      ...formData.addOns,
      insurance: newValue 
    });
  };
  
  const handleStayDiscountToggle = () => {
    const newValue = !stayDiscountSelected;
    setStayDiscountSelected(newValue);
    onUpdateForm('addOns', { 
      ...formData.addOns,
      stayDiscount: newValue 
    });
  };

  return (
    <div className={styles.upgradeExperience}>
      <div className={styles.mainContent}>
        <div className={styles.upgradeSection}>
          <h3 className={styles.sectionTitle}>Priority Boarding</h3>
          <div className={styles.priorityBoardingCard}>
            <div className={styles.priorityBoardingIcon}>
              <CreditCard size={20} />
            </div>
            <div className={styles.priorityBoardingDetails}>
              <h4>Skip the lines and board first</h4>
              <p>Get priority boarding and be among the first to board the aircraft</p>
            </div>
          </div>
          <div className={styles.toggleOption}>
            <div className={styles.priceTag}>$6.99 per passenger</div>
            <label className={styles.toggleSwitch}>
              <input 
                type="checkbox"
                checked={priorityBoarding}
                onChange={handlePriorityBoardingToggle}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>

        {/* Show child services only if there are child passengers */}
        {hasChildPassengers && (
          <ChildServices formData={formData} onUpdateForm={onUpdateForm} />
        )}
        
        <div className={styles.upgradeSection}>
          <h3 className={styles.sectionTitle}>Insurance & Stay Options</h3>
          <div className={styles.addOnOptions}>
            <div className={styles.insuranceOptionWrapper}>
              <InsuranceOption 
                selected={insuranceSelected} 
                onToggle={handleInsuranceToggle} 
                price="$27.00"
              />
            </div>
            
            <div className={styles.stayDiscountWrapper}>
              <StayDiscount 
                selected={stayDiscountSelected} 
                onToggle={handleStayDiscountToggle} 
              />
            </div>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <button className={styles.backButton} onClick={onBack}>
            <ChevronLeft size={16} /> Back
          </button>
          <button className={styles.continueButton} onClick={onContinue}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className={styles.sidebar}>
        <FlightSummary 
          passengers={passengers} 
          formData={formData}
          onContinue={onContinue}
          onBack={onBack}
          showBackButton={false}
          showContinueButton={true}
          onUpdateForm={onUpdateForm}
        />
      </div>
    </div>
  );
};

export default UpgradeExperience;
