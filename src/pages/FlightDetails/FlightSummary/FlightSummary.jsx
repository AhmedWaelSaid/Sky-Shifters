import { useState } from "react";
import styles from "./FlightSummary.module.css";
import FlightLeg from "./FlightLeg";
import CancellationPolicy from "./CancellationPolicy";
import DetailsOfTheFlight from '../DetailsOfTheFlight/DetailsOfTheFlight';
import { useData } from "../../../components/context/DataContext";
import { format } from "date-fns";
import { formatDuration } from "../../SelectedFlights/someFun";
import { ChevronRight, ChevronLeft } from "lucide-react";
import PropTypes from "prop-types";

// Helper functions
function formatted(time) {
  if (!time) return '';
  let [hours, minutes] = time.split(":");
  let amOrPm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
  hours = parseInt(hours, 10) % 12 || 12;
  return `${hours}:${minutes} ${amOrPm}`;
}

function checkPeriod(time) {
  if (!time) return '';
  let [hours] = time.split(":");
  return parseInt(hours, 10) < 12 ? "AM" : "PM";
}

export function dealWithAirline(airline) {
  if (!airline) return "";
  const arrOfWords = airline.split(" ");
  let newSentence = "";
  for (let i = 0; i < arrOfWords.length; i++) {
    const capitalizeWord =
      arrOfWords[i].toLowerCase().slice(0, 1).toUpperCase() +
      arrOfWords[i].toLowerCase().slice(1);
    newSentence += capitalizeWord + " ";
  }
  return newSentence.trim();
}

const FareBreakdown = ({
  passengers = [],
  formData = {},
  onContinue,
  onBack,
  showBackButton = false,
  showContinueButton = true,
}) => {
  const { flight } = useData();

  const calculateTotal = () => {
    let baseFareTotal = 0;
    const baseFareBreakdown = { adults: [], children: [], infants: [] };

    // Helper function to safely get price from pricing info
    const getPriceFromPricingInfo = (pricingInfo) => {
      if (!pricingInfo?.price?.total) return 0;
      return Number(pricingInfo.price.total);
    };

    if (flight?.departure?.data?.travelerPricings) {
      passengers.forEach((passenger, index) => {
        // Get departure flight price
        const departurePricingInfo = flight.departure.data.travelerPricings[index];
        let price = getPriceFromPricingInfo(departurePricingInfo);

        // Get return flight price if it exists
        if (flight.return?.data?.travelerPricings?.[index]) {
          const returnPricingInfo = flight.return.data.travelerPricings[index];
          price += getPriceFromPricingInfo(returnPricingInfo);
        }

        baseFareTotal += price;
        
        // Handle pluralization correctly
        const pluralType = passenger.type === 'child' ? 'children' : passenger.type + 's';
        baseFareBreakdown[pluralType].push(price);
      });
    }

    // Calculate additional costs
    const departureBaggagePrice = formData?.baggageSelection?.departure?.price || 0;
    const returnBaggagePrice = formData?.baggageSelection?.return?.price || 0;
    const totalBaggageCost = departureBaggagePrice + returnBaggagePrice;
    
    const addOns = (formData.addOns?.insurance ? 4.99 * passengers.length : 0);
    const specialServices = (formData.specialServices?.childSeat ? 15.99 : 0);
    const total = baseFareTotal + addOns + specialServices + totalBaggageCost;

    return {
      baseFare: baseFareBreakdown,
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
      {priceDetails.addOns > 0 && (
        <div className={styles.fareItem}>
          <span>Add-ons</span>
          <span>{formatPrice(priceDetails.addOns)}</span>
        </div>
      )}
      {priceDetails.specialServices > 0 && (
        <div className={styles.fareItem}>
          <span>Special services</span>
          <span>{formatPrice(priceDetails.specialServices)}</span>
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
        <button className={styles.backButton} onClick={onBack}><ChevronLeft size={16} /> Back</button>
      )}
      {showContinueButton && (
        <button className={styles.continueButton} onClick={onContinue}>Continue <ChevronRight size={16} /></button>
      )}
    </div>
  );
};

FareBreakdown.propTypes = {
  passengers: PropTypes.array,
  formData: PropTypes.object,
  onContinue: PropTypes.func,
  onBack: PropTypes.func,
  showBackButton: PropTypes.bool,
  showContinueButton: PropTypes.bool,
};

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
  const { flight } = useData();
  
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };
  
  if (!flight || !flight.departure) {
    return <div className={styles.flightSummary}>Loading Summary...</div>;
  }

  return (
    <div className={styles.flightSummary}>
      <div className={styles.summaryHeader}>
        <h3>Flight summary</h3>
        <button className={styles.detailsButton} onClick={toggleDetails}>Details</button>
      </div>
      <div className={`${styles.detailsPanel} ${isDetailsOpen ? styles.open : ''}`}>
        <div className={styles.detailsPanelContent}>
          <DetailsOfTheFlight onClose={toggleDetails} onUpdateForm={onUpdateForm} formData={formData} flight={flight}/>
        </div>
      </div>
      {isDetailsOpen && (
        <div className={styles.overlay} onClick={toggleDetails} />
      )}
      
      <FlightLeg
        type="Departure"
        date={format(new Date(flight.departure.data.itineraries[0].segments[0].departure.at), "EEE, d LLL uuuu")}
        airline={`${dealWithAirline(flight.departure.carrier)} ${flight.departure.data.itineraries[0].segments[0].carrierCode}-${flight.departure.data.itineraries[0].segments[0].number}`}
        departure={{ time: formatted(flight.departure.data.itineraries[0].segments[0].departure.at.split("T")[1]), period: checkPeriod(flight.departure.data.itineraries[0].segments[0].departure.at.split("T")[1]), code: flight.departure.data.itineraries[0].segments[0].departure.iataCode }}
        arrival={{ time: formatted(flight.departure.data.itineraries[0].segments.slice(-1)[0].arrival.at.split("T")[1]), period: checkPeriod(flight.departure.data.itineraries[0].segments.slice(-1)[0].arrival.at.split("T")[1]), code: flight.departure.data.itineraries[0].segments.slice(-1)[0].arrival.iataCode }}
        duration={flight.departure.data.itineraries[0].segments.length === 1 ? "Direct" : `${flight.departure.data.itineraries[0].segments.length - 1} Stop`}
        flightTime={formatDuration(flight.departure.data.itineraries[0].duration)}
      />

      {flight.return && (
        <FlightLeg
          type="Return"
          date={format(new Date(flight.return.data.itineraries[0].segments[0].departure.at), "EEE, d LLL uuuu")}
          airline={`${dealWithAirline(flight.return.carrier)} ${flight.return.data.itineraries[0].segments[0].carrierCode}-${flight.return.data.itineraries[0].segments[0].number}`}
          departure={{ time: formatted(flight.return.data.itineraries[0].segments[0].departure.at.split("T")[1]), period: checkPeriod(flight.return.data.itineraries[0].segments[0].departure.at.split("T")[1]), code: flight.return.data.itineraries[0].segments[0].departure.iataCode }}
          arrival={{ time: formatted(flight.return.data.itineraries[0].segments.slice(-1)[0].arrival.at.split("T")[1]), period: checkPeriod(flight.return.data.itineraries[0].segments.slice(-1)[0].arrival.at.split("T")[1]), code: flight.return.data.itineraries[0].segments.slice(-1)[0].arrival.iataCode }}
          duration={flight.return.data.itineraries[0].segments.length === 1 ? "Direct" : `${flight.return.data.itineraries[0].segments.length - 1} Stop`}
          flightTime={formatDuration(flight.return.data.itineraries[0].duration)}
        />
      )}
      
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

FlightSummary.propTypes = {
  passengers: PropTypes.array,
  formData: PropTypes.object,
  onContinue: PropTypes.func,
  onBack: PropTypes.func,
  showBackButton: PropTypes.bool,
  showContinueButton: PropTypes.bool,
  onUpdateForm: PropTypes.func,
};

export default FlightSummary;