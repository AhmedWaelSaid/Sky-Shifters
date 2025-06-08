import PropTypes from "prop-types";
import styles from "./FareSelection.module.css";

// SVG icons
const ChevronLeft = (props) => (
  <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevronRight = (props) => (
  <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const Check = (props) => (
  <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

// خيارات الأمتعة تبقى كما هي
const economyOptions = [
    { id: 1, name: "Basic Fare (Included)", price: 0, cabinBaggage: "1 × Cabin Bag (7kg)", checkedBaggage: "1 × Checked Bag (23kg)", extraLabel: "$0 (included)", type: "checked", weight: "23kg" },
    { id: 2, name: "Extra Bag Option", price: 60, cabinBaggage: "1 × Cabin Bag (7kg)", checkedBaggage: "2 × Checked Bags (23kg each)", extraLabel: "$60 per additional bag", type: "extra", weight: "23kg" },
    { id: 3, name: "Heavy Bag Option", price: 85, cabinBaggage: "1 × Cabin Bag (7kg)", checkedBaggage: "1 × Checked Bag (32kg)", extraLabel: "$85 for overweight", type: "overweight", weight: "32kg" },
  ];
  
const premiumOptions = [
    { id: 1, name: "Standard Premium (Included)", price: 0, cabinBaggage: "2 × Cabin Bags (10kg each)", checkedBaggage: "2 × Checked Bags (32kg each)", extraLabel: "$0 (included)", type: "premium_checked", weight: "32kg" },
    { id: 2, name: "Extra Premium Bag", price: 100, cabinBaggage: "2 × Cabin Bags (10kg each)", checkedBaggage: "3 × Checked Bags (32kg each)", extraLabel: "$100 per additional bag", type: "premium_extra", weight: "32kg" },
    { id: 3, name: "Luxury Allowance", price: 150, cabinBaggage: "2 × Cabin Bags (10kg each)", checkedBaggage: "2 × Checked Bags (32kg) + 1 Oversized", extraLabel: "$150 for oversized", type: "premium_oversized", weight: "32kg" },
  ];

// --- ✨ تم تعديل المكون ليستقبل selectedClass كـ prop ✨ ---
const FareSelection = ({ formData, onUpdateForm, selectedClass, direction }) => {
  
  // 1. تحديد خيارات الأمتعة بناءً على الـ prop القادمة
  const classStr = (selectedClass || "").toUpperCase();
  const fareOptions = classStr.includes("ECONOMY") ? economyOptions : premiumOptions;
  
  // 2. تحديد الخيار النشط بناءً على الحالة العامة (formData)
  const baggageSelectionForDirection = formData?.baggageSelection?.[direction] || {};
  const activeFareId = baggageSelectionForDirection.selectedId || 1; 
  const activeFareIndex = Math.max(0, fareOptions.findIndex(opt => opt.id === activeFareId));

  const handleFareSelect = (index) => {
    const selectedOption = fareOptions[index];
    if (onUpdateForm && selectedOption) {
      onUpdateForm("baggageSelection", {
        ...formData?.baggageSelection,
        [direction]: {
          selectedId: selectedOption.id,
          price: selectedOption.price,
          description: selectedOption.name,
          type: selectedOption.type,
          weight: selectedOption.weight
        }
      });
    }
  };

  const handleNextFare = () => {
    const nextIndex = activeFareIndex === fareOptions.length - 1 ? 0 : activeFareIndex + 1;
    handleFareSelect(nextIndex);
  };

  const handlePrevFare = () => {
    const prevIndex = activeFareIndex === 0 ? fareOptions.length - 1 : activeFareIndex - 1;
    handleFareSelect(prevIndex);
  };
  
  const title = `Select baggage for ${direction} flight`;
  
  if (fareOptions.length === 0) return null;

  return (
    // ... باقي الـ JSX كما هو بدون تغيير ...
    <div className={styles.fareSelectionWrapper}>
       <div className={styles.fareSelectionHeader}>
        <h3>{title}</h3>
        <div className={styles.fareNavigation}>
          <button className={styles.fareNavButton} onClick={handlePrevFare} aria-label="Previous fare"><ChevronLeft size={20} /></button>
          <div className={styles.fareIndicators}>
            {fareOptions.map((_, idx) => (
              <button 
                key={idx} 
                className={`${styles.fareIndicator} ${idx === activeFareIndex ? styles.activeIndicator : ''}`}
                onClick={() => handleFareSelect(idx)}
              />
            ))}
          </div>
          <button className={styles.fareNavButton} onClick={handleNextFare} aria-label="Next fare"><ChevronRight size={20} /></button>
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
                <span className={styles.farePrice}>+${fare.price}</span>
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
              onClick={() => handleFareSelect(idx)}
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
  selectedClass: PropTypes.string, // Prop جديد لتحديد درجة السفر
  direction: PropTypes.string.isRequired,
};

export default FareSelection;