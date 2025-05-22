import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./FareSelection.module.css";
import { useData } from "../context/DataContext";

// SVG icons (بدائل بسيطة)
const ChevronLeft = (props) => (
  <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevronRight = (props) => (
  <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const Check = (props) => (
  <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const economyOptions = [
  {
    id: 1,
    name: "Basic Fare (Included)",
    price: 0,
    cabinBaggage: "1 × Cabin Bag (7kg / 15lbs, 55×40×20cm)",
    checkedBaggage: "1 × Checked Bag (23kg / 50lbs)",
    extraLabel: "$0 (included)",
  },
  {
    id: 2,
    name: "Extra Bag Option",
    price: 60,
    cabinBaggage: "1 × Cabin Bag (7kg)",
    checkedBaggage: "2 × Checked Bags (23kg each)",
    extraLabel: "$60 per additional checked bag",
  },
  {
    id: 3,
    name: "Heavy Bag Option",
    price: 85,
    cabinBaggage: "1 × Cabin Bag (7kg)",
    checkedBaggage: "1 × Checked Bag (32kg / 70lbs - overweight allowance)",
    extraLabel: "$85 for overweight upgrade",
  },
];

// خيارات Premium/Business
const premiumOptions = [
  {
    id: 1,
    name: "Standard Premium (Included)",
    price: 0,
    cabinBaggage: "2 × Cabin Bags (10kg / 22lbs each)",
    checkedBaggage: "2 × Checked Bags (32kg / 70lbs each)",
    extraLabel: "$0 (included)",
  },
  {
    id: 2,
    name: "Extra Premium Bag",
    price: 100,
    cabinBaggage: "2 × Cabin Bags (10kg each)",
    checkedBaggage: "3 × Checked Bags (32kg each)",
    extraLabel: "$100 per additional checked bag",
  },
  {
    id: 3,
    name: "Luxury Allowance",
    price: 150,
    cabinBaggage: "2 × Cabin Bags (10kg each)",
    checkedBaggage: "2 × Checked Bags (32kg each) + 1 Oversized Bag (up to 158cm / 62in linear)",
    extraLabel: "$150 for oversized item",
  },
];


const FareSelection = ({ formData, onUpdateForm, setExtraBaggagePrice }) => {
  const {sharedData} = useData();
let fareOptions = [];
let classStr = (sharedData.passengerClass.class.value || "").toUpperCase();
if (classStr.includes("ECONOMY")) {
  fareOptions = economyOptions;
} else {
  fareOptions = premiumOptions;
}
  // خيارات Economy
  const [activeFareIndex, setActiveFareIndex] = useState(0);
  // تحديد الخيارات حسب cabinClass

  // إذا لم يوجد خيارات لهذا الكلاس
  if (fareOptions.length === 0) {
    return (
      <div className={styles.fareSelectionWrapper}>
        <div className={styles.fareSelectionHeader}>
          <h3>Select fare type</h3>
          <p>No baggage options available for this class.</p>
        </div>
      </div>
    );
  }

  // اجعل الاختيار متزامن مع central state


  const handleNextFare = () => {
    const nextIndex = activeFareIndex === fareOptions.length - 1 ? 0 : activeFareIndex + 1;
    handleFareSelect(nextIndex);
  };

  const handlePrevFare = () => {
    const prevIndex = activeFareIndex === 0 ? fareOptions.length - 1 : activeFareIndex - 1;
    handleFareSelect(prevIndex);
  };

  const handleFareSelect = (index) => {
    setActiveFareIndex(index);
    const option = fareOptions[index];
    if (onUpdateForm) {
      onUpdateForm("baggageSelection", {
        ...formData?.baggageSelection,
        selectedId: option.id,
        price: option.price,
        description: option.name,
      });
    }
    if (setExtraBaggagePrice) {
      setExtraBaggagePrice(option.price || 0);
    }
  };

  // تحديد العنوان حسب الكلاس
  let title = "Select baggage option";
  if (classStr === "ECONOMY" || classStr === "PREMIUM" || classStr === "BUSINESS" || classStr === "FIRST") {
    title = "Select fare type";
  }

  return (
    <div className={styles.fareSelectionWrapper}>
      <div className={styles.fareSelectionHeader}>
        <h3>{title}</h3>
        <p>Pick an option that suits you!</p>
        <div className={styles.fareNavigation}>
          <button 
            className={styles.fareNavButton} 
            onClick={handlePrevFare}
            aria-label="Previous fare"
          >
            <ChevronLeft size={20} />
          </button>
          <div className={styles.fareIndicators}>
            {fareOptions.map((_, idx) => (
              <button 
                key={idx} 
                className={`${styles.fareIndicator} ${idx === activeFareIndex ? styles.activeIndicator : ''}`}
                onClick={() => handleFareSelect(idx)}
              />
            ))}
          </div>
          <button 
            className={styles.fareNavButton} 
            onClick={handleNextFare}
            aria-label="Next fare"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.fareCardContainer}>
        {fareOptions.map((fare, idx) => (
          <div 
            key={fare.id}
            className={`${styles.integratedFareCard} ${idx === activeFareIndex ? styles.activeFareCard : styles.hiddenFareCard}`}
          >
            <div className={styles.fareTypeHeader}>
              <span className={styles.fareName}>{fare.name}</span>
              <div className={styles.farePriceContainer}>
                <span className={styles.farePrice}>${fare.price}</span>
                <span className={styles.totalLabel}>{fare.extraLabel}</span>
              </div>
            </div>

            <div className={styles.fareSection}>
              <h4>Baggage allowance</h4>
              <div className={styles.fareDetailItem}>
                <span className={styles.checkIcon}><Check size={12} /></span>
                <span>{fare.cabinBaggage}</span>
              </div>
              <div className={styles.fareDetailItem}>
                <span className={styles.checkIcon}><Check size={12} /></span>
                <span>{fare.checkedBaggage}</span>
              </div>
            </div>

            <button 
              className={idx === activeFareIndex ? styles.selectedFareButton : styles.selectFareButton}
              disabled={idx === activeFareIndex}
            >
              {idx === activeFareIndex ? 'Selected' : 'Select'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

FareSelection.propTypes = {
  formData: PropTypes.object,
  onUpdateForm: PropTypes.func,
  setExtraBaggagePrice: PropTypes.func,
  selectedClass: PropTypes.string,
  direction: PropTypes.string,
};

export default FareSelection; 