
import React from 'react';
import styles from './FlightSummary.module.css';
import FlightLeg from './FlightLeg';
import CancellationPolicy from './CancellationPolicy';
import FareBreakdown from './FareBreakdown';

const FlightSummary = ({ 
  passengers = [], 
  formData = {}, 
  onContinue, 
  onBack, 
  showBackButton = false,
  showContinueButton = true 
}) => {
  return (
    <div className={styles.flightSummary}>
      <div className={styles.summaryHeader}>
        <h3>Flight summary</h3>
        <button className={styles.detailsButton}>Details</button>
      </div>
      
      <FlightLeg
        type="Departure"
        date="Sun, 27 Apr 2025"
        airline="Flyedeal D-90"
        departure={{
          time: "12:15",
          period: "AM",
          code: "RUH"
        }}
        arrival={{
          time: "01:55",
          period: "AM",
          code: "JED"
        }}
        duration="Direct"
        flightTime="5h 45m"
        currencySymbol="$"
      />
      
      <FlightLeg
        type="Return"
        date="Mon, 29 Apr 2025"
        airline="Flyedeal D-90"
        departure={{
          time: "02:15",
          period: "AM",
          code: "JED"
        }}
        arrival={{
          time: "04:00",
          period: "AM",
          code: "RUH"
        }}
        duration="Direct"
        flightTime="5h 45m"
        currencySymbol="$"
      />
      
      <CancellationPolicy />
      
      <FareBreakdown 
        passengers={passengers}
        formData={formData}
        onContinue={onContinue}
        onBack={onBack}
        showBackButton={showBackButton}
        showContinueButton={showContinueButton}
      />
    </div>
  );
};

export default FlightSummary;
