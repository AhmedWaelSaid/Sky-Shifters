
import React from 'react';
import styles from './FlightSummary.module.css';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const FareBreakdown = ({ 
  passengers = [], 
  formData = {}, 
  onContinue, 
  onBack, 
  showBackButton = false,
  showContinueButton = true 
}) => {
  const calculateTotal = () => {
    // Base fare calculations for different age groups in USD
    let baseFare = 0;
    
    // Calculate fare based on passenger type and age group
    passengers.forEach(passenger => {
      const ageGroup = passenger.details?.ageGroup || '';
      
      if (passenger.type === 'adult') {
        baseFare += 142.50; // Adult full price
      } else if (passenger.type === 'child') {
        if (ageGroup === 'infant') {
          // Infant (under 2): 15% of adult fare
          baseFare += 142.50 * 0.15;
        } else if (ageGroup === 'child') {
          // Child (2-11): 75% of adult fare
          baseFare += 142.50 * 0.75;
        } else if (ageGroup === 'adolescent') {
          // Adolescent (12+): Full adult fare
          baseFare += 142.50;
        } else {
          // Default child fare if age group not specified (75% of adult fare)
          baseFare += 142.50 * 0.75;
        }
      }
    });
    
    // Service fee
    const serviceFee = 9.95;
    
    // Add-ons calculation based on selections
    let addOns = 0;
    
    // Calculate insurance cost if selected
    if (formData.addOns?.insurance) {
      addOns += 4.99 * passengers.length;
    }
    
    // Calculate priority boarding cost if selected
    if (formData.priorityBoarding) {
      addOns += 6.99 * passengers.length;
    }
    
    // Special services calculation
    const specialServices = 
      (formData.specialServices?.childSeat ? 15.99 : 0) +
      (formData.specialServices?.childMeal ? 8.99 * passengers.filter(p => p.type === 'child').length : 0) +
      (formData.specialServices?.stroller ? 0 : 0); // Strollers are typically free
    
    // Baggage calculation - based on the selected baggage options
    let baggageCost = 0;
    
    // Check for baggage selection from BaggageOptions component
    if (formData.baggageSelection) {
      baggageCost += (formData.baggageSelection.outbound?.price || 0);
      baggageCost += (formData.baggageSelection.inbound?.price || 0);
    }
    
    return {
      baseFare,
      serviceFee,
      addOns,
      specialServices,
      baggageUpgrade: baggageCost,
      total: baseFare + serviceFee + addOns + specialServices + baggageCost
    };
  };
  
  const priceDetails = calculateTotal();
  
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  // Group passengers by type and age group for display
  const adultPassengers = passengers.filter(p => p.type === 'adult');
  const infantPassengers = passengers.filter(p => p.type === 'child' && p.details?.ageGroup === 'infant');
  const childPassengers = passengers.filter(p => p.type === 'child' && (p.details?.ageGroup === 'child' || !p.details?.ageGroup));
  const adolescentPassengers = passengers.filter(p => p.type === 'child' && p.details?.ageGroup === 'adolescent');
  
  return (
    <div className={styles.fareBreakdown}>
      <h3>Flight fare breakdown</h3>
      
      {adultPassengers.length > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>
            {adultPassengers.length === 1 
              ? 'Adult 1' 
              : `Adults ${adultPassengers.length}`}
          </div>
          <div className={styles.farePrice}>
            {formatPrice(142.50 * adultPassengers.length)}
          </div>
        </div>
      )}
      
      {infantPassengers.length > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>
            {infantPassengers.length === 1 
              ? 'Infant 1 (under 2 years)' 
              : `Infants ${infantPassengers.length} (under 2 years)`}
          </div>
          <div className={styles.farePrice}>
            {formatPrice(142.50 * 0.15 * infantPassengers.length)}
          </div>
        </div>
      )}
      
      {childPassengers.length > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>
            {childPassengers.length === 1 
              ? 'Child 1 (2-11 years)' 
              : `Children ${childPassengers.length} (2-11 years)`}
          </div>
          <div className={styles.farePrice}>
            {formatPrice(142.50 * 0.75 * childPassengers.length)}
          </div>
        </div>
      )}
      
      {adolescentPassengers.length > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>
            {adolescentPassengers.length === 1 
              ? 'Adolescent 1 (12+ years)' 
              : `Adolescents ${adolescentPassengers.length} (12+ years)`}
          </div>
          <div className={styles.farePrice}>
            {formatPrice(142.50 * adolescentPassengers.length)}
          </div>
        </div>
      )}
      
      {priceDetails.serviceFee > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>Service fee</div>
          <div className={styles.farePrice}>{formatPrice(priceDetails.serviceFee)}</div>
        </div>
      )}
      
      {priceDetails.addOns > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>Add-ons</div>
          <div className={styles.farePrice}>{formatPrice(priceDetails.addOns)}</div>
        </div>
      )}
      
      {priceDetails.specialServices > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>Special services</div>
          <div className={styles.farePrice}>{formatPrice(priceDetails.specialServices)}</div>
        </div>
      )}
      
      {priceDetails.baggageUpgrade > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>Extra baggage</div>
          <div className={styles.farePrice}>{formatPrice(priceDetails.baggageUpgrade)}</div>
        </div>
      )}
      
      <div className={styles.fareTotal}>
        <div className={styles.totalLabel}>Total to be paid</div>
        <div className={styles.totalPrice}>{formatPrice(priceDetails.total)}</div>
      </div>
      
      {showBackButton && (
        <button className={styles.backButton} onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </button>
      )}
      
      {showContinueButton && (
        <button className={styles.continueButton} onClick={onContinue}>
          Continue <span className={styles.arrowIcon}><ChevronRight size={16} /></span>
        </button>
      )}
    </div>
  );
};

export default FareBreakdown;
