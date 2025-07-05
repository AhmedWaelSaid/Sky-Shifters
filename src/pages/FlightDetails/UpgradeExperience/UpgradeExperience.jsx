import { useState, useEffect } from "react";
import styles from "./UpgradeExperience.module.css";
import FlightSummary from "../FlightSummary/FlightSummary";
import { ChevronRight, ChevronLeft, CreditCard } from "lucide-react";
import InsuranceOption from "../InsuranceOption/InsuranceOption";
import FareSelection from "../../../components/FareSelection/FareSelection";
import ChildServices from "../ChildServices/ChildServices";
import PropTypes from "prop-types";
import { useData } from "../../../components/context/DataContext";
import { BaggageDialog } from "../DetailsOfTheFlight/DetailsOfTheFlight";

const priorityBoardingPrices = {
  USD: 6.99,
  EGP: 100,
  SAR: 25,
  EUR: 6.5,
};

const UpgradeExperience = ({
  passengers,
  formData,
  onUpdateForm,
  onContinue,
  onBack,
  setFareSelectionIndex,
  fareSelectionIndex,
}) => {
  const [priorityBoarding, setPriorityBoarding] = useState(false);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const { sharedData, flight } = useData();
  const [baggageDialogOpen, setBaggageDialogOpen] = useState(false);
  const [baggageDialogOpen2, setBaggageDialogOpen2] = useState(false);

  const price = priorityBoardingPrices[sharedData.currency];
  // Check if there are any child passengers
  const hasChildPassengers = passengers.some(
    (passenger) => passenger.type === "child"
  );
  
  // Initialize priority boarding from formData if available
  useEffect(() => {
    if (formData.priorityBoarding !== undefined) {
      setPriorityBoarding(formData.priorityBoarding);
    }

    // Initialize insurance and stay discount selection from formData if available
    if (formData.addOns && formData.addOns.insurance !== undefined) {
      setInsuranceSelected(formData.addOns.insurance);
    }
  }, []);
  console.log(formData.priorityBoarding);
  const handlePriorityBoardingToggle = () => {
    const newValue = !priorityBoarding;
    setPriorityBoarding(newValue);
    onUpdateForm("priorityBoarding", newValue);
  };

  console.log(fareSelectionIndex);
  const handleInsuranceToggle = () => {
    const newValue = !insuranceSelected;
    setInsuranceSelected(newValue);
    onUpdateForm("addOns", {
      ...formData.addOns,
      insurance: newValue,
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
              <p>
                Get priority boarding and be among the first to board the
                aircraft
              </p>
            </div>
          </div>
          <div className={styles.toggleOption}>
            <div className={styles.priceTag}>{price} {sharedData.currency} per passenger</div>
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
          <h3 className={styles.sectionTitle}>Insurance</h3>
          <div className={styles.addOnOptions}>
            <div className={styles.insuranceOptionWrapper}>
              <InsuranceOption
                selected={insuranceSelected}
                onToggle={handleInsuranceToggle}
                price="$27.00"
              />
            </div>
          </div>
        </div>

        <div className={styles.upgradeSection}>
          <h3 className={styles.sectionTitle}>Baggage selection(departure)</h3>
          <FareSelection
            formData={formData}
            onUpdateForm={onUpdateForm}
            selectedClass={sharedData.passengerClass.class.text}
            direction="departure"
            openBaggageDialog={() => setBaggageDialogOpen(true)}
            setIndex={setFareSelectionIndex}
          />
          {flight.return && (
            <>
              <h3 className={styles.sectionTitle}>Baggage selection(return)</h3>
              <FareSelection
                formData={formData}
                onUpdateForm={onUpdateForm}
                selectedClass={sharedData.passengerClass.class.text}
                direction="return"
                openBaggageDialog={() => setBaggageDialogOpen(true)}
                setIndex={setFareSelectionIndex}
              />
            </>
          )}
        </div>
        {baggageDialogOpen && (
          <BaggageDialog
            setBaggageDialogOpen={setBaggageDialogOpen}
            direction="departure"
            index={fareSelectionIndex}
          />
        )}
        {baggageDialogOpen2 && (
          <BaggageDialog
            setBaggageDialogOpen={setBaggageDialogOpen2}
            direction="return"
            index={fareSelectionIndex}
          />
        )}
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
          fareSelectionIndex={fareSelectionIndex}
          setFareSelectionIndex={setFareSelectionIndex}
        />
      </div>
    </div>
  );
};
UpgradeExperience.propTypes = {
  passengers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["adult", "child", "infant"]).isRequired,
    })
  ).isRequired,
  formData: PropTypes.shape({
    priorityBoarding: PropTypes.bool,
    addOns: PropTypes.shape({
      insurance: PropTypes.bool,
      stayDiscount: PropTypes.bool,
    }),
    seating: PropTypes.object,
    meals: PropTypes.object,
    baggageSelection: PropTypes.object,
  }).isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  fareSelectionIndex: PropTypes.object,
  setFareSelectionIndex: PropTypes.func,
};
export default UpgradeExperience;
