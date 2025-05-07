import PropTypes from "prop-types";
import styles from "./styles/Passenger.module.css";
export default function PassengerClass({ passengerClass, setPassengerClass }) {
  function adultsPlusChildrenCon() {
    if (passengerClass.adults + passengerClass.children == 9) return false;
    else return true;
  }
  function infantsCon() {
    if (passengerClass.adults == passengerClass.infants) return false;
    else return true;
  }
  return (
    <div className={styles.container}>
      <div className={styles.passengerTitle}>Travelers</div>
      <div>
        <div>Adults (12+ years)</div>
        <div className={styles.btnContainers}>
        {styles.btnContainers}
          <button
            className={styles.minus}
            onClick={() => {
              if (passengerClass.adults > 1)
                setPassengerClass((prev) => ({
                  ...prev,
                  adults: prev.adults - 1,
                }));
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>minus-circle</title>
              <path d="M17,13H7V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </button>
          <div className={styles.passengerNum}>{passengerClass.adults}</div>
          <button
            className={styles.plus}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (adultsPlusChildrenCon())
                setPassengerClass((prev) => ({
                  ...prev,
                  adults: prev.adults + 1,
                }));
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>plus-circle</title>
              <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </button>
        </div>
      </div>
      <div>
        <div>Children (2-11 years)</div>
        <div className={styles.btnContainers}>
          <button
            className={styles.minus}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (passengerClass.children >= 1)
                setPassengerClass((prev) => ({
                  ...prev,
                  children: prev.children - 1,
                }));
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>minus-circle</title>
              <path d="M17,13H7V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </button>
          <div className={styles.passengerNum}>{passengerClass.children}</div>
          <button
            className={styles.plus}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (adultsPlusChildrenCon())
                setPassengerClass((prev) => ({
                  ...prev,
                  children: prev.children + 1,
                }));
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>plus-circle</title>
              <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </button>
        </div>
      </div>
      <div>
        <div>Infants (Under 2 years)</div>
        <div className={styles.btnContainers}>
          <button
            className={styles.minus}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (passengerClass.infants >= 1)
                setPassengerClass((prev) => ({
                  ...prev,
                  infants: prev.infants - 1,
                }));
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>minus-circle</title>
              <path d="M17,13H7V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </button>
          <div className={styles.passengerNum}>{passengerClass.infants}</div>
          <button
            className={styles.plus}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (infantsCon())
                setPassengerClass((prev) => ({
                  ...prev,
                  infants: prev.infants + 1,
                }));
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>plus-circle</title>
              <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.travelClassContainer}>
        <div className={styles.travelClassLabel}>Travel Class</div>
        <div className={styles.travelClassOptions}>
          {[
            { value: "ECONOMY", label: "Economy" },
            { value: "PREMIUM_ECONOMY", label: "Premium" },
            { value: "BUSINESS", label: "Business" },
            { value: "FIRST", label: "First Class" },
            { value: "ALL", label: "All" },
          ].map((option) => (
            <label key={option.value} className={styles.radioOption}>
              <input
                type="radio"
                name="travel-class"
                value={option.value}
                checked={passengerClass.class.value === option.value}
                onChange={() => {
                  setPassengerClass((prev) => ({
                    ...prev,
                    class: { value: option.value, text: option.label },
                  }));
                }}
                className={styles.radioInput}
              />
              <span className={styles.radioCustom}></span>
              {option.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
PassengerClass.propTypes = {
  passengerClass: PropTypes.object,
  setPassengerClass: PropTypes.func,
};
