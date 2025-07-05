import { useState } from "react";
import styles from "./FlightSummary.module.css";
import FlightLeg from "./FlightLeg";
import CancellationPolicy from "./CancellationPolicy";
import DetailsOfTheFlight from "../DetailsOfTheFlight/DetailsOfTheFlight";
import { useData } from "../../../components/context/DataContext";
import { format } from "date-fns";
import { formatDuration } from "../../SelectedFlights/someFun";
import PropTypes from "prop-types";
import FareBreakdown from "./FareBreakdown";
import { dayDifference } from "../../SelectedFlights/someFun";
// Helper functions
function formatted(time) {
  if (!time) return "";
  let [hours, minutes] = time.split(":");
  //let amOrPm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
  hours = parseInt(hours, 10) % 12 || 12;
  return `${hours}:${minutes}`;
}

function checkPeriod(time) {
  if (!time) return "";
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

const FlightSummary = ({
  passengers = [],
  formData = {},
  onContinue,
  onBack,
  showBackButton = false,
  showContinueButton = true,
  onUpdateForm,
  fareSelectionIndex,
  setFareSelectionIndex,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { flight } = useData();

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  if (!flight || !flight.departure) {
    return <div className={styles.flightSummary}>Loading Summary...</div>;
  }

  let airlineForDeparture = `${dealWithAirline(flight.carriers[flight.departure.data.itineraries[0].segments[0].carrierCode])} ${flight.departure.data.itineraries[0].segments[0].carrierCode}-${flight.departure.data.itineraries[0].segments[0].number}`;
  if (flight.departure.data.itineraries[0].segments.length >= 2)
    airlineForDeparture += `, ${dealWithAirline(flight.carriers[flight.departure.data.itineraries[0].segments[1].carrierCode])} ${flight.departure.data.itineraries[0].segments[1].carrierCode}-${flight.departure.data.itineraries[0].segments[1].number}`;
  if (flight.departure.data.itineraries[0].segments.length >= 3)
    airlineForDeparture += `, ${dealWithAirline(flight.carriers[flight.departure.data.itineraries[0].segments[2].carrierCode])} ${flight.departure.data.itineraries[0].segments[2].carrierCode}-${flight.departure.data.itineraries[0].segments[2].number}`;
  let airlineForReturn = "";
  if (flight.return) {
    airlineForReturn = `${dealWithAirline(flight.carriers[flight.return.data.itineraries[0].segments[0].carrierCode])} ${flight.return.data.itineraries[0].segments[0].carrierCode}-${flight.return.data.itineraries[0].segments[0].number}`;
    if (flight.return.data.itineraries[0].segments.length >= 2)
      airlineForReturn += `, ${dealWithAirline(flight.carriers[flight.return.data.itineraries[0].segments[1].carrierCode])} ${flight.return.data.itineraries[0].segments[1].carrierCode}-${flight.return.data.itineraries[0].segments[1].number}`;
    if (flight.return.data.itineraries[0].segments.length >= 3)
      airlineForReturn += `, ${dealWithAirline(flight.carriers[flight.return.data.itineraries[0].segments[2].carrierCode])} ${flight.return.data.itineraries[0].segments[2].carrierCode}-${flight.return.data.itineraries[0].segments[2].number}`;
  }
  return (
    <div className={styles.flightSummary}>
      <div className={styles.summaryHeader}>
        <h3>Flight summary</h3>
        <button className={styles.detailsButton} onClick={toggleDetails}>
          Details
        </button>
      </div>
      <div
        className={`${styles.detailsPanel} ${isDetailsOpen ? styles.open : ""}`}
      >
        <div className={styles.detailsPanelContent}>
          <DetailsOfTheFlight
            onClose={toggleDetails}
            onUpdateForm={onUpdateForm}
            formData={formData}
            flight={flight}
            fareSelectionIndex={fareSelectionIndex}
            setFareSelectionIndex={setFareSelectionIndex}
          />
        </div>
      </div>
      {isDetailsOpen && (
        <div className={styles.overlay} onClick={toggleDetails} />
      )}

      <FlightLeg
        type="Departure"
        date={format(
          new Date(
            flight.departure.data.itineraries[0].segments[0].departure.at
          ),
          "EEE, d LLL uuuu"
        )}
        airline={airlineForDeparture}
        departure={{
          time: formatted(
            flight.departure.data.itineraries[0].segments[0].departure.at.split(
              "T"
            )[1]
          ),
          period: checkPeriod(
            flight.departure.data.itineraries[0].segments[0].departure.at.split(
              "T"
            )[1]
          ),
          code: flight.departure.data.itineraries[0].segments[0].departure
            .iataCode,
        }}
        arrival={{
          time: formatted(
            flight.departure.data.itineraries[0].segments
              .slice(-1)[0]
              .arrival.at.split("T")[1]
          ),
          period: checkPeriod(
            flight.departure.data.itineraries[0].segments
              .slice(-1)[0]
              .arrival.at.split("T")[1]
          ),
          code: flight.departure.data.itineraries[0].segments.slice(-1)[0]
            .arrival.iataCode,
        }}
        duration={
          flight.departure.data.itineraries[0].segments.length === 1
            ? "Direct"
            : `${flight.departure.data.itineraries[0].segments.length - 1} Stop`
        }
        flightTime={formatDuration(
          flight.departure.data.itineraries[0].duration
        )}
        dayDiff={dayDifference(flight.departure.data)}
        flight={flight.departure.data}
      />

      {flight.return && (
        <FlightLeg
          type="Return"
          date={format(
            new Date(
              flight.return.data.itineraries[0].segments[0].departure.at
            ),
            "EEE, d LLL uuuu"
          )}
          airline={airlineForReturn}
          departure={{
            time: formatted(
              flight.return.data.itineraries[0].segments[0].departure.at.split(
                "T"
              )[1]
            ),
            period: checkPeriod(
              flight.return.data.itineraries[0].segments[0].departure.at.split(
                "T"
              )[1]
            ),
            code: flight.return.data.itineraries[0].segments[0].departure
              .iataCode,
          }}
          arrival={{
            time: formatted(
              flight.return.data.itineraries[0].segments
                .slice(-1)[0]
                .arrival.at.split("T")[1]
            ),
            period: checkPeriod(
              flight.return.data.itineraries[0].segments
                .slice(-1)[0]
                .arrival.at.split("T")[1]
            ),
            code: flight.return.data.itineraries[0].segments.slice(-1)[0]
              .arrival.iataCode,
          }}
          duration={
            flight.return.data.itineraries[0].segments.length === 1
              ? "Direct"
              : `${flight.return.data.itineraries[0].segments.length - 1} Stop`
          }
          flightTime={formatDuration(
            flight.return.data.itineraries[0].duration
          )}
          dayDiff={dayDifference(flight.return.data)}
          flight={flight.return.data}
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
  fareSelectionIndex: PropTypes.object,
  setFareSelectionIndex: PropTypes.func,
};

export default FlightSummary;
