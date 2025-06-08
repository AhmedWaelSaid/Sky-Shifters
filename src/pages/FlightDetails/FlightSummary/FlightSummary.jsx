import { useState } from "react";
import styles from "./FlightSummary.module.css";
import FlightLeg from "./FlightLeg";
import CancellationPolicy from "./CancellationPolicy";
import DetailsOfTheFlight from '../DetailsOfTheFlight/DetailsOfTheFlight';
import { useOutletContext } from "react-router-dom";
import { format } from "date-fns";
import { formatDuration } from "../../SelectedFlights/someFun";
import { ChevronRight, ChevronLeft } from "lucide-react";
import PropTypes from "prop-types";

// Helper functions
function formatted(time) {
  let [hours, minutes] = time.split(":");
  if (hours > 12) hours -= 12;
  return `${hours}:${minutes}`;
}

function checkPeriod(time) {
  let [hours] = time.split(":");
  if (hours < 12) return "AM";
  else return "PM";
}
export function dealWithAirline(airline) {
  const arrOfWords = airline.split(" ");
  let newSentence = "";
  for (let i = 0; i < arrOfWords.length; i++) {
    const capitalizeWord =
      arrOfWords[i].toLowerCase().slice(0, 1).toUpperCase() +
      arrOfWords[i].toLowerCase().slice(1);
    newSentence += capitalizeWord + " ";
  }
  return newSentence;
}

const FareBreakdown = ({
  passengers = [],
  formData = {},
  onContinue,
  onBack,
  showBackButton = false,
  showContinueButton = true,
}) => {
  const { flight } = useOutletContext();

  const calculateTotal = () => {
    let baseFareTotal = 0;
    const baseFareBreakdown = { adults: [], children: [], infants: [] };

    if (flight?.departure?.data?.travelerPricings) {
      passengers.forEach((passenger, index) => {
        let price = 0;
        const pricingInfo = flight.departure.data.travelerPricings[index];
        if (pricingInfo?.price?.total) {
            price = Number(pricingInfo.price.total);
            if (flight.return?.data?.travelerPricings?.[index]?.price?.total) {
                price += Number(flight.return.data.travelerPricings[index].price.total);
            }
        }
        baseFareTotal += price;
        baseFareBreakdown[passenger.type + 's'].push(price);
      });
    }

    const serviceFee = 9.95;

    // --- ✨ هذا هو الجزء الوحيد الذي تم تعديله ✨ ---
    // حساب سعر الأمتعة الإضافي مباشرة من formData لضمان الدقة
    const departureBaggagePrice = formData?.baggageSelection?.departure?.price || 0;
    const returnBaggagePrice = formData?.baggageSelection?.return?.price || 0;
    const totalBaggageCost = departureBaggagePrice + returnBaggagePrice;
    
    const addOns = (formData.addOns?.insurance ? 4.99 * passengers.length : 0);
    const specialServices = (formData.specialServices?.childSeat ? 15.99 : 0);
    const total = baseFareTotal + serviceFee + addOns + specialServices + totalBaggageCost;

    return {
      baseFare: baseFareBreakdown,
      serviceFee,
      addOns,
      specialServices,
      baggageUpgrade: totalBaggageCost,
      total,
    };
  };

  const priceDetails = calculateTotal();
  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  return (
    <div className={styles.fareBreakdown}>
      <h3>Flight fare breakdown</h3>
      {priceDetails.baseFare.adults.map((price, index) => (
        <div key={`adult-${index}`} className={styles.fareItem}>
          <span>Adult {index + 1}</span>
          <span>{formatPrice(price)}</span>
        </div>
      ))}
      {priceDetails.baseFare.children.map((price, index) => (
        <div key={`child-${index}`} className={styles.fareItem}>
          <span>Child {index + 1}</span>
          <span>{formatPrice(price)}</span>
        </div>
      ))}
      {priceDetails.baseFare.infants.map((price, index) => (
        <div key={`infant-${index}`} className={styles.fareItem}>
          <span>Infant {index + 1}</span>
          <span>{formatPrice(price)}</span>
        </div>
      ))}
      {priceDetails.serviceFee > 0 && (
        <div className={styles.fareItem}>
          <span>Service fee</span>
          <span>{formatPrice(priceDetails.serviceFee)}</span>
        </div>
      )}
      {priceDetails.baggageUpgrade > 0 && (
        <div className={styles.fareItem}>
          <span>Extra baggage</span>
          <span className={styles.highlight}>{formatPrice(priceDetails.baggageUpgrade)}</span>
        </div>
      )}
      <div className={styles.fareTotal}>
        <span>Total to be paid</span>
        <span>{formatPrice(priceDetails.total)}</span>
      </div>
      {showBackButton && (
        <button className={styles.backButton} onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </button>
      )}
      {showContinueButton && (
        <button className={styles.continueButton} onClick={onContinue}>
          Continue <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

// ... PropTypes for FareBreakdown ...

const FlightSummary = ({
  passengers = [],
  formData = {},
  onContinue,
  onBack,
  showBackButton = false,
  showContinueButton = true,
  onUpdateForm,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { flight } = useOutletContext();
  
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };
  
  return (
    <div className={styles.flightSummary}>
      <div className={styles.summaryHeader}>
        <h3>Flight summary</h3>
        <button className={styles.detailsButton} onClick={toggleDetails}>Details</button>
      </div>

      <div className={`${styles.detailsPanel} ${isDetailsOpen ? styles.open : ''}`}>
        <div className={styles.detailsPanelContent}>
          {/* لم نعد نمرر setExtraBaggagePrice */}
          <DetailsOfTheFlight onClose={toggleDetails} onUpdateForm={onUpdateForm} formData={formData} />
        </div>
      </div>

      {isDetailsOpen && (
        <div className={styles.overlay} onClick={toggleDetails} />
      )}
      
      {/* --- هذا هو الجزء الذي تمت إعادته --- */}
      {flight.departure.data.itineraries[0].segments.length === 1 ? (
        <FlightLeg
          type="Departure"
          date={format(flight.departure.data.itineraries[0].segments[0].departure.at.split("T")[0], "EEE, d LLL yyyy")}
          airline={`${dealWithAirline(flight.departure.carrier)} ${flight.departure.data.itineraries[0].segments[0].carrierCode}-${flight.departure.data.itineraries[0].segments[0].number}`}
          departure={{ time: formatted(flight.departure.data.itineraries[0].segments[0].departure.at.split("T")[1]), period: checkPeriod(flight.departure.data.itineraries[0].segments[0].departure.at.split("T")[1]), code: flight.departure.data.itineraries[0].segments[0].departure.iataCode }}
          arrival={{ time: formatted(flight.departure.data.itineraries[0].segments[0].arrival.at.split("T")[1]), period: checkPeriod(flight.departure.data.itineraries[0].segments[0].arrival.at.split("T")[1]), code: flight.departure.data.itineraries[0].segments[0].arrival.iataCode }}
          duration={flight.departure.data.itineraries[0].segments.length === 1 ? "Direct" : "1 Stop"}
          flightTime={formatDuration(flight.departure.data.itineraries[0].duration)}
          currencySymbol="$"
        />
      ) : (
         <FlightLeg
          type="Departure"
          date={format(flight.departure.data.itineraries[0].segments[0].departure.at.split("T")[0], "EEE, d LLL yyyy")}
          airline={`${dealWithAirline(flight.departure.carrier)} ${flight.departure.data.itineraries[0].segments[0].carrierCode}-${flight.departure.data.itineraries[0].segments[0].number}, ${dealWithAirline(flight.departure.carrier)} ${flight.departure.data.itineraries[0].segments[1].carrierCode}-${flight.departure.data.itineraries[0].segments[1].number}`}
          departure={{ time: formatted(flight.departure.data.itineraries[0].segments[0].departure.at.split("T")[1]), period: checkPeriod(flight.departure.data.itineraries[0].segments[0].departure.at.split("T")[1]), code: flight.departure.data.itineraries[0].segments[0].departure.iataCode }}
          arrival={{ time: formatted(flight.departure.data.itineraries[0].segments[1].arrival.at.split("T")[1]), period: checkPeriod(flight.departure.data.itineraries[0].segments[1].arrival.at.split("T")[1]), code: flight.departure.data.itineraries[0].segments[1].arrival.iataCode }}
          duration={"1 Stop"}
          flightTime={formatDuration(flight.departure.data.itineraries[0].duration)}
          currencySymbol="$"
        />
      )}

      {flight.return && (
         <FlightLeg
          type="Return"
           date={format(flight.return.data.itineraries[0].segments[0].departure.at.split("T")[0], "EEE, d LLL yyyy")}
           airline={`${dealWithAirline(flight.return.carrier)} ${flight.return.data.itineraries[0].segments[0].carrierCode}-${flight.return.data.itineraries[0].segments[0].number}`}
          departure={{ time: formatted(flight.return.data.itineraries[0].segments[0].departure.at.split("T")[1]), period: checkPeriod(flight.return.data.itineraries[0].segments[0].departure.at.split("T")[1]), code: flight.return.data.itineraries[0].segments[0].departure.iataCode }}
          arrival={{ time: formatted(flight.return.data.itineraries[0].segments[0].arrival.at.split("T")[1]), period: checkPeriod(flight.return.data.itineraries[0].segments[0].arrival.at.split("T")[1]), code: flight.return.data.itineraries[0].segments[0].arrival.iataCode }}
          duration={flight.return.data.itineraries[0].segments.length === 1 ? "Direct" : "1 Stop"}
          flightTime={formatDuration(flight.return.data.itineraries[0].duration)}
          currencySymbol="$"
        />
      )}
      {/* ------------------------------------ */}

      <CancellationPolicy onDetailsClick={toggleDetails} />

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

// ... PropTypes for FlightSummary ...

export default FlightSummary;