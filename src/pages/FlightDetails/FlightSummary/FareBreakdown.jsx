import { useData } from "../../../components/context/DataContext";
import styles from "./FlightSummary.module.css";
import { ChevronRight, ChevronLeft } from "lucide-react";
import PropTypes from "prop-types";

const FareBreakdown = ({
  passengers = [],
  formData = {},
  onContinue,
  onBack,
  showBackButton = false,
  showContinueButton = true,
}) => {
  let { flight } = useData();
  // حساب سعر الحقيبة من formData فقط
  const extraBaggagePrice = formData?.baggageSelection?.price || 0;

  const calculateTotal = () => {
    // Base fare calculations for different age groups in USD
    let baseFare = { adults: [], children: [], infants: [] };

    // Calculate fare based on passenger type and age group
    passengers.forEach((passenger, index) => {
      let price = "";
      if (passenger.type === "adult") {
        if (!flight.return) // for departure only 
          price = flight.departure.data.travelerPricings[index].price.total; // Adult full price
        else // for departure and return
          price =
            Number(flight.departure.data.travelerPricings[index].price.total) +
            Number(flight.return.data.travelerPricings[index].price.total);
        baseFare.adults.push(price);
      } else if (passenger.type === "child") {
        if (!flight.return)
          price = flight.departure.data.travelerPricings[index].price.total; // Adult full price
        else
          price =
            Number(flight.departure.data.travelerPricings[index].price.total) +
            Number(flight.return.data.travelerPricings[index].price.total);
        baseFare.children.push(price);
      } else {
        if (!flight.return)
          price = flight.departure.data.travelerPricings[index].price.total; // Adult full price
        else
          price =
            Number(flight.departure.data.travelerPricings[index].price.total) +
            Number(flight.return.data.travelerPricings[index].price.total);
        baseFare.infants.push(price);
      }
    });
    baseFare.total = function () {
      const adultsTotal = this.adults.reduce(
        (acc, cur) => (acc += Number(cur)),
        0
      );
      const childrenTotal = this.children.reduce(
        (acc, cur) => (acc += Number(cur)),
        0
      );
      const infantsTotal = this.infants.reduce(
        (acc, cur) => (acc += Number(cur)),
        0
      );
      const total = adultsTotal + childrenTotal + infantsTotal;
      return total;
    };

    // Service fee
    const serviceFee = 9.95;

    // Add-ons calculation based on selections
    let addOns = 0;

    // Calculate insurance cost if selected
    if (formData.addOns?.insurance) {
      addOns += 27 * passengers.filter(p => p.type !== 'infant').length;
    }

    // Calculate priority boarding cost if selected
    if (formData.priorityBoarding) {
      addOns += 6.99 * passengers.length;
    }

    // Calculate stay discount cost if selected
    if (formData.addOns?.stayDiscount) {
      addOns += 5 * passengers.length;
    }

    // Special services calculation
    const specialServices =
      (formData.specialServices?.childSeat ? 15.99 : 0) +
      (formData.specialServices?.childMeal
        ? 8.99 * passengers.filter((p) => p.type === "child").length
        : 0) +
      (formData.specialServices?.stroller ? 0 : 0); // Strollers are typically free

    // Baggage calculation - based on the selected baggage options
    let baggageCost = 0;

    // Check for baggage selection from BaggageOptions component
    if (formData.baggageSelection) {
      if (formData.baggageSelection.departure || formData.baggageSelection.return) {
        baggageCost += formData.baggageSelection.departure?.price || 0;
        baggageCost += formData.baggageSelection.return?.price || 0;
      } else if (formData.baggageSelection.outbound || formData.baggageSelection.inbound) {
        baggageCost += formData.baggageSelection.outbound?.price || 0;
        baggageCost += formData.baggageSelection.inbound?.price || 0;
      } else {
        baggageCost = formData.baggageSelection.price || 0;
      }
    }

    return {
      baseFare: baseFare,
      serviceFee,
      addOns,
      specialServices,
      baggageUpgrade: baggageCost,
      total:
        Number(baseFare.total()) +
        serviceFee +
        addOns +
        specialServices +
        baggageCost,
    };
  };

  const priceDetails = calculateTotal();

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  // Group passengers by type and age group for display
  const adultPassengers = passengers.filter((p) => p.type === "adult");
  const infantPassengers = passengers.filter((p) => p.type === "infant");
  const childPassengers = passengers.filter((p) => p.type === "child");
  return (
    <div className={styles.fareBreakdown}>
      <h3>Flight fare breakdown</h3>

      {adultPassengers.length > 0 &&
        adultPassengers.map((adult, index) => (
          <div key={adult.id} className={styles.fareItem}>
            <div className={styles.fareName}>{"Adult " + (index + 1)}</div>
            <div className={styles.farePrice}>
              {formatPrice(Number(priceDetails.baseFare.adults[index]))}
            </div>
          </div>
        ))}

      {childPassengers.length > 0 &&
        childPassengers.map((child, index) => (
          <div key={child.id} className={styles.fareItem}>
            <div className={styles.fareName}>{"Child " + (index + 1)}</div>
            <div className={styles.farePrice}>
              {formatPrice(Number(priceDetails.baseFare.children[index]))}
            </div>
          </div>
        ))}

      {infantPassengers.length > 0 &&
        infantPassengers.map((infant, index) => (
          <div key={infant.id} className={styles.fareItem}>
            <div className={styles.fareName}>{"Infant " + (index + 1)}</div>
            <div className={styles.farePrice}>
              {formatPrice(Number(priceDetails.baseFare.infants[index]))}
            </div>
          </div>
        ))}

      {priceDetails.serviceFee > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>Service fee</div>
          <div className={styles.farePrice}>
            {formatPrice(priceDetails.serviceFee)}
          </div>
        </div>
      )}

      {priceDetails.addOns > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>Add-ons</div>
          <div className={styles.farePrice}>
            {formatPrice(priceDetails.addOns)}
          </div>
        </div>
      )}

      {priceDetails.specialServices > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>Special services</div>
          <div className={styles.farePrice}>
            {formatPrice(priceDetails.specialServices)}
          </div>
        </div>
      )}

      {priceDetails.baggageUpgrade > 0 && (
        <div className={styles.fareItem}>
          <div className={styles.fareName}>Extra baggage</div>
          <div className={styles.farePrice}>
            {formatPrice(priceDetails.baggageUpgrade)}
          </div>
        </div>
      )}

      <div className={styles.fareTotal}>
        <div className={styles.totalLabel}>Total to be paid</div>
        <div className={styles.totalPrice}>
          {formatPrice(priceDetails.total)}
        </div>
      </div>

      {showBackButton && (
        <button className={styles.backButton} onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </button>
      )}

      {showContinueButton && (
        <button className={styles.continueButton} onClick={onContinue}>
          Continue{" "}
          <span className={styles.arrowIcon}>
            <ChevronRight size={16} />
          </span>
        </button>
      )}
    </div>
  );
};

FareBreakdown.propTypes= {
  passengers: PropTypes.array,
  formData: PropTypes.object,
  onContinue: PropTypes.func,
  onBack: PropTypes.func,
  showBackButton: PropTypes.bool,
  showContinueButton: PropTypes.bool,
}
export default FareBreakdown;
