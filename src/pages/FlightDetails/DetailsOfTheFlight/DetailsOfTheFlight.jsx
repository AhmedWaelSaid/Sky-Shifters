import { useState, useEffect, useMemo } from "react";
import styles from "./DetailsOfTheFlight.module.css";
import baggageCabin from "../../../assets/baggage-cabin.png";
import baggageChecked from "../../../assets/baggage-checked.png";
import PropTypes from "prop-types";
import { useData } from "../../../components/context/DataContext";
import { formatDuration } from "../../SelectedFlights/someFun";
import { format } from "date-fns";
import FareSelection from "../../../components/FareSelection/FareSelection";
import { useAirports } from "../../../helperFun";
import { dealWithAirline } from "../FlightSummary/FlightSummary";

function Cancellation({ openCancellationDialog, amenities, route }) {
  const isRefundable = amenities.find(
    (item) => item.description.toLowerCase() === "refundable ticket"
  );
  const isChangeable = amenities.find(
    (item) => item.description.toLowerCase() === "changeable ticket"
  );
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoCardHeader}>
        <div>
          <h3>Cancel & date change</h3>
          <div className={styles.route}>{route}</div>
        </div>
        <button
          className={styles.detailsButton}
          onClick={() => openCancellationDialog(route)}
        >
          Details
        </button>
      </div>
      <div className={styles.infoCardBody}>
        <div className={styles.infoItem}>
          <span className={ isRefundable ? styles.checkIcon : styles.crossIcon }>
            { isRefundable? <CheckIcon /> :<XIcon/> }
          </span>
          {isRefundable ? <div>{isRefundable.isChargeable ? "Refundable but with fees": "Fully refundable"}</div> : <div>Non-refundable</div>}
        </div>
        <div className={styles.infoItem}>
          <span className={ isChangeable ? styles.checkIcon : styles.crossIcon}>
            { isChangeable ? <CheckIcon /> :<XIcon/> }
          </span>
          {isChangeable ? <div>{isChangeable.isChargeable ? "Changeable but with fees": "Changeable no fees"}</div> : <div>Non-changeable</div>}
        </div>
      </div>
    </div>
  );
}
function BaggageDialog({ setBaggageDialogOpen, index, direction }) {
  let checkedBaggageText;
  let maxCheckedBaggage;
  if (index.class == "economy"){
  if (direction == "departure") {
    checkedBaggageText =
      index.depIndex == 0
        ? "23 kg checked baggage, 1 piece"
        : index.depIndex == 1
          ? "23 kg checked baggage, 2 piece"
          : "32 kg checked baggage, 1 piece";
          maxCheckedBaggage = index.depIndex > 1 ? "32kg" : "23kg";
      
  } else {
    checkedBaggageText =
      index.retIndex == 0
        ? "23 kg checked baggage, 1 piece"
        : index.retIndex == 1
          ? "23 kg checked baggage, 2 piece"
          : "32 kg checked baggage, 1 piece";
          maxCheckedBaggage = index.retIndex > 1 ? "32kg" : "23kg";
  }
} else {
  if (direction == "departure") {
    checkedBaggageText =
      index.depIndex == 0
        ? "32 kg checked baggage, 2 piece"
        : index.depIndex == 1
          ? "32 kg checked baggage, 3 piece"
          : "32 kg checked baggage, 2 piece + 1 oversized";
          maxCheckedBaggage = "32kg";
      
  } else {
    checkedBaggageText =
      index.retIndex == 0
        ? "32 kg checked baggage, 2 piece"
        : index.retIndex == 1
          ? "32 kg checked baggage, 3 piece"
          : "32 kg checked baggage, 2 piece + 1 oversized";
          maxCheckedBaggage = "32kg";
  }
}
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.detailsDialog}>
        <div className={styles.dialogHeader}>
          <div className={styles.dialogTitle}>
            Baggage Allowance Details
            <button
              className={styles.dialogClose}
              onClick={() => setBaggageDialogOpen(false)}
            >
              <XIcon />
            </button>
          </div>
        </div>
        <div className={styles.dialogContent}>
          <div className={styles.baggageSection}>
            <div className={styles.baggageItem}>
              <span className={styles.checkIconLarge}>
                <CheckIcon />
              </span>
              <div>
                <div className={styles.baggageTitle}>Cabin baggage</div>
                <div className={styles.baggageDetail}>
                  7 kg cabin baggage, 1 piece
                </div>
              </div>
            </div>
            <div className={styles.baggageItem}>
              <span className={styles.checkIconLarge}>
                <CheckIcon />
              </span>
              <div>
                <div className={styles.baggageTitle}>Checked baggage</div>
                <div className={styles.baggageDetail}>{checkedBaggageText}</div>
              </div>
            </div>
          </div>
          <div className={styles.baggageNote}>
            <span className={styles.noteIcon}>
              <InfoIcon />
            </span>
            <p>
              Please check with the airline for the most up-to-date baggage
              policies.
            </p>
          </div>
          <div className={styles.dimensionsSection}>
            <h4>Baggage dimensions</h4>
            <div className={styles.dimensionsContainer}>
              <div className={styles.dimensionItem}>
                <div className={styles.dimensionImageContainer}>
                  <img
                    src={baggageCabin}
                    alt="Cabin Bag"
                    className={styles.baggageIcon}
                  />
                </div>
                <h5>Cabin bag</h5>
                <div className={styles.dimensionMeasurements}>
                  <span>Max 55×40×20cm</span>
                  <span>Max 7kg</span>
                </div>
                <div className={styles.dimensionNote}>Fits in overhead bin</div>
              </div>
              <div className={styles.dimensionItem}>
                <div className={styles.dimensionImageContainer}>
                  <img
                    src={baggageChecked}
                    alt="Checked Bag"
                    className={styles.baggageIcon}
                  />
                </div>
                <h5>Checked bag</h5>
                <div className={styles.dimensionMeasurements}>
                  <span>Max 158cm (linear)</span>
                  <span>Max {maxCheckedBaggage}</span>
                </div>
                <div className={styles.dimensionNote}>Checked at counter</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Icons defined as SVG components to avoid dependencies
const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const DesktopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21 2H3C1.9 2 1 2.9 1 4V16C1 17.1 1.9 18 3 18H10V20H8V22H16V20H14V18H21C22.1 18 23 17.1 23 16V4C23 2.9 22.1 2 21 2ZM21 16H3V4H21V16Z" />
  </svg>
);

const UtensilsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3 2H5V14H3V2ZM7 2H9V14H7V2ZM11 2H13V14H11V2ZM15 11H17V14H15V11ZM15 2H17V7H15V2ZM19 2H21V14H19V2ZM3 18V16H21V18H3ZM3 22V20H21V22H3Z" />
  </svg>
);

const PlugIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16 7V3H14V7H10V3H8V7C8 8.66 9.34 10 11 10H13C14.66 10 16 8.66 16 7ZM20 13V11H4V13H20ZM14 21C14 22.1 13.1 23 12 23C10.9 23 10 22.1 10 21V15H14V21Z" />
  </svg>
);

const WifiIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 21L15.6 16.2C14.6 15.45 13.35 15 12 15C10.65 15 9.4 15.45 8.4 16.2L12 21ZM12 3C7.95 3 4.21 4.34 1.2 6.6L3 9C5.5 7.12 8.62 6 12 6C15.38 6 18.5 7.12 21 9L22.8 6.6C19.79 4.34 16.05 3 12 3ZM12 9C9.3 9 6.81 9.89 4.8 11.4L6.6 13.8C8.1 12.67 9.97 12 12 12C14.03 12 15.9 12.67 17.4 13.8L19.2 11.4C17.19 9.89 14.7 9 12 9Z" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
  </svg>
);

const RulerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21 6H3C2.45 6 2 6.45 2 7V17C2 17.55 2.45 18 3 18H21C21.55 18 22 17.55 22 17V7C22 6.45 21.55 6 21 6ZM20 16H4V8H6V12H8V8H10V12H12V8H14V12H16V8H18V12H20V16Z" />
  </svg>
);

const AirplaneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

function formatted(time) {
  let amOrPm = "";
  let [hours, minutes] = time.split(":");
  if (hours < 12) amOrPm = "AM";
  else amOrPm = "PM";
  if (hours > 12) hours -= 12;
  return `${hours}:${minutes} ${amOrPm}`;
}
function getTime(duration) {
  let hours=0;
  if (duration.includes("H")){
   hours = duration.split("T")[1].split("H")[0];
  }
  let mins = 0;
  if (duration.includes("M") && duration.includes("H")) {
    mins = duration.split("T")[1].split("H")[1].split("M")[0];
  }
  else if (duration.includes("M")){
    mins = duration.split("T")[1].split("M")[0];
  }
  return Number(hours) * 60 + Number(mins);
}
function getTimeOfWaiting(flight) {
  const totalDuration = flight.data.itineraries[0].duration;
  const firstFlightDuration = flight.data.itineraries[0].segments[0].duration;
  const secondFlightDuration = flight.data.itineraries[0].segments[1].duration;
  const totalTime = getTime(totalDuration);
  const firstFlightTime = getTime(firstFlightDuration);
  const secondFlightTime = getTime(secondFlightDuration);
  let waitingTime = totalTime - firstFlightTime - secondFlightTime;
  let [hours, mins] = [0, 0];
  while (waitingTime >= 60) {
    hours++;
    waitingTime -= 60;
  }
  mins = waitingTime;
  return hours + "h " + mins + "m";
}
const DetailsOfTheFlight = ({onClose, onUpdateForm, formData, flight}) => {
  const { airports } = useAirports();
  const [expandedStops, setExpandedStops] = useState(false);
  const [expandedReturnStops, setExpandedReturnStops] = useState(false);
  const [baggageDialogOpen, setBaggageDialogOpen] = useState(false);
  const [baggageDialogOpen2, setBaggageDialogOpen2] = useState(false);
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const {sharedData } = useData();
  const [fareSelectionIndex, setFareSelectionIndex] = useState({
    depIndex: 0,
    retIndex: 0,
    class:"economy",
  });
  if (!flight) return;
  const departureClass =
    sharedData?.passengerClass.class.text || "ECONOMY";
  const returnClass =
  sharedData?.passengerClass.class.text || departureClass;

  const toggleStopsDropdown = () => {
    setExpandedStops(!expandedStops);
  };

  const toggleReturnStopsDropdown = () => {
    setExpandedReturnStops(!expandedReturnStops);
  };

  const openBaggageDialog = () => {
    setBaggageDialogOpen(true);
  };
  const openBaggageDialog2 = () => {
    setBaggageDialogOpen2(true);
  };

  const openCancellationDialog = () => {
    setCancellationDialogOpen(true);
  };
  function getAirportByIATA(iata) {
    const airport = airports.find((airport) => airport.iata == iata);
    return airport;
  }
  let stopAirportDep = null;
  if (
    flight.departure &&
    flight.departure.data.itineraries[0].segments.length > 1
  ) {
    stopAirportDep = getAirportByIATA(
      flight.departure.data.itineraries[0].segments[0].arrival.iataCode
    );
  }

  return (
    <div className={styles.flightDetailsContainer}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.closeButton} onClick={onClose}>
          <XIcon />
        </button>
        <h1 className={styles.title}>Flight details</h1>
      </header>

      {/* Departure Flight */}
      <section className={styles.flightSegment}>
        <div className={styles.flightHeader}>
          <div className={styles.routeInfo}>
            <h2 className={styles.route}>
              {sharedData.departure.origin.airport.city} to{" "}
              {sharedData.departure.dest.airport.city}
            </h2>
            <span className={styles.duration}>
              Total duration{" "}
              {formatDuration(flight.departure.data.itineraries[0].duration)}
            </span>
          </div>
          <span className={styles.date}>
            {format(
              flight.departure.data.itineraries[0].segments[0].departure.at.split(
                "T"
              )[0],
              "EEE, d	LLL u"
            )}
          </span>
        </div>

        <div className={styles.flightCard}>
          {/* Departure */}
          <div className={styles.locationTimeInfo}>
            <div className={styles.timeInfo}>
              <div className={styles.time}>
                {formatted(
                  flight.departure.data.itineraries[0].segments[0].departure.at.split(
                    "T"
                  )[1]
                )}
              </div>
              <div className={styles.day}>
                {format(
                  flight.departure.data.itineraries[0].segments[0].departure.at.split(
                    "T"
                  )[0],
                  "d	LLL"
                )}
              </div>
            </div>
            <div className={styles.locationInfo}>
              <div className={styles.airport}>
                <span className={styles.dot}></span>
                {sharedData.departure.origin.airport.name} (
                {sharedData.departure.origin.airport.iata})
              </div>
              <div className={styles.terminal}>
                {flight.departure.data.itineraries[0].segments[0].departure
                  .terminal
                  ? "Terminal " +
                    flight.departure.data.itineraries[0].segments[0].departure
                      .terminal
                  : ""}
              </div>
              <div className={styles.city}>
                {sharedData.departure.origin.airport.city},{" "}
                {sharedData.departure.origin.airport.country}
              </div>
            </div>
          </div>

          {/* Flight */}
          {flight.departure.data.itineraries[0].segments.length > 1 && (
            <div className={styles.flightInfo}>
              <div className={styles.stopContainer}>
                <div className={styles.flightDuration}>
                  <div className={styles.fixedTime}>
                    {formatDuration(
                      flight.departure.data.itineraries[0].segments[0].duration
                    )}
                  </div>
                  {!expandedStops && (
                    <div className={styles.stops}>
                      <span className={styles.stopsBadge}>1 Stop</span>
                    </div>
                  )}
                </div>

                <div className={styles.airlineDetails}>
                  <button
                    className={styles.stopsDropdownButton}
                    onClick={toggleStopsDropdown}
                  >
                    {expandedStops ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </button>
                  <div className={styles.airlineLogoContainer}>
                    <div className={styles.airlineLogo}>
                      <img
                        src="https://i.pinimg.com/originals/db/63/b5/db63b5aa67202c6a027b477a1f93c0f3.png"
                        alt="Airline Logo"
                      />
                    </div>
                  </div>
                  <div className={styles.airlineInfo}>
                    <div className={styles.airlineName}>
                      {dealWithAirline(flight.departure.carrier) +
                        " | " +
                        flight.departure.data.itineraries[0].segments[0]
                          .carrierCode +
                        "-" +
                        flight.departure.data.itineraries[0].segments[0].number}
                    </div>
                    <div className={styles.cabinClass}>
                      {sharedData.passengerClass.class.text}
                    </div>
                  </div>
                </div>
              </div>
              {expandedStops && (
                <div className={styles.stopDetailsContainer}>
                  <div
                    className={`${styles.stopsDropdownContent} ${expandedStops ? styles.expanded : ""}`}
                  >
                    <div className={styles.timeOfStop}>
                      <div className={styles.time}>
                        {formatted(
                          flight.departure.data.itineraries[0].segments[0].arrival.at.split(
                            "T"
                          )[1]
                        )}
                      </div>
                      <div className={styles.day}>
                        {format(
                          flight.departure.data.itineraries[0].segments[0].arrival.at.split(
                            "T"
                          )[0],
                          "d	LLL"
                        )}
                      </div>
                    </div>
                    <div className={styles.stopDetail}>
                      <div className={styles.stopLocation}>
                        <span className={styles.stopDot}></span>
                        <div>
                          <div className={styles.stopAirport}>
                            {stopAirportDep && stopAirportDep.name}
                          </div>
                          <div className={styles.stopIATA}>
                            (
                            {
                              flight.departure.data.itineraries[0].segments[0]
                                .arrival.iataCode
                            }
                            )
                          </div>
                          <div className={styles.stopCity}>
                            {stopAirportDep &&
                              stopAirportDep.city +
                                ", " +
                                stopAirportDep.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.waitingContainer}>
                    <div className={styles.waitingStopTime}>
                      {getTimeOfWaiting(flight.departure)}
                    </div>
                    <div className={styles.stopDuration}>
                      <span className={styles.waitingLabel}>
                        Waiting time in{" "}
                        <strong>{stopAirportDep && stopAirportDep.city}</strong>
                      </span>
                    </div>
                  </div>
                  <div className={styles.stopDeparture}>
                    <div className={styles.timeOfStop}>
                      <div className={styles.time}>
                        {formatted(
                          flight.departure.data.itineraries[0].segments[1].departure.at.split(
                            "T"
                          )[1]
                        )}
                      </div>
                      <div className={styles.day}>
                        {format(
                          flight.departure.data.itineraries[0].segments[1].departure.at.split(
                            "T"
                          )[0],
                          "d	LLL"
                        )}
                      </div>
                    </div>
                    <div className={styles.stopDetail}>
                      <div className={styles.stopLocation}>
                        <span className={styles.dot1}></span>
                        <div>
                          <div className={styles.stopAirport}>
                            {stopAirportDep && stopAirportDep.name}
                          </div>
                          <div className={styles.stopIATA}>
                            (
                            {
                              flight.departure.data.itineraries[0].segments[0]
                                .arrival.iataCode
                            }
                            )
                          </div>
                          <div className={styles.stopCity}>
                            {stopAirportDep &&
                              stopAirportDep.city +
                                ", " +
                                stopAirportDep.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.stopFlight}>
                    <div className={styles.flightDuration}>
                      <div className={styles.fixedTime}>
                        {formatDuration(
                          flight.departure.data.itineraries[0].segments[1]
                            .duration
                        )}
                      </div>
                    </div>

                    <div className={styles.airlineDetails}>
                      <div className={styles.airlineLogoContainer}>
                        <div className={styles.airlineLogo}>
                          <img
                            src="https://i.pinimg.com/originals/db/63/b5/db63b5aa67202c6a027b477a1f93c0f3.png"
                            alt="Airline Logo"
                          />
                        </div>
                      </div>
                      <div className={styles.airlineInfo}>
                        <div className={styles.airlineName}>
                          {dealWithAirline(flight.departure.carrier) +
                            " | " +
                            flight.departure.data.itineraries[0].segments[1]
                              .carrierCode +
                            "-" +
                            flight.departure.data.itineraries[0].segments[1]
                              .number}
                        </div>
                        <div className={styles.cabinClass}>
                          {sharedData.passengerClass.class.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* <div className={styles.amenities}>
                <button
                  className={styles.servicesDropdownButton}
                  onClick={toggleServicesDropdown}
                >
                  <div className={styles.amenitiesIcons}>
                    <span className={styles.amenityIcon}>
                      <DesktopIcon />
                    </span>
                    <span className={styles.amenityIcon}>
                      <UtensilsIcon />
                    </span>
                    <span className={styles.amenityIcon}>
                      <PlugIcon />
                    </span>
                    <span className={styles.amenityIcon}>
                      <WifiIcon />
                    </span>
                  </div>
                  {expandedServices ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>
              </div>

              <div
                className={`${styles.servicesDropdownContent} ${expandedServices ? styles.expanded : ""}`}
              >
                <div className={styles.serviceItem}>
                  <DesktopIcon className={styles.serviceIcon} />
                  <span>Seatback screen & entertainment</span>
                </div>
                <div className={styles.serviceItem}>
                  <UtensilsIcon className={styles.serviceIcon} />
                  <span>Complimentary meal</span>
                </div>
                <div className={styles.serviceItem}>
                  <AirplaneIcon className={styles.serviceIcon} />
                  <span>Above average legroom</span>
                </div>
                <div className={styles.serviceItem}>
                  <RulerIcon className={styles.serviceIcon} />
                  <span>Average seatwidth</span>
                </div>
                <div className={styles.serviceItem}>
                  <UsersIcon className={styles.serviceIcon} />
                  <span>3-3 seat configuration</span>
                </div>
                <div className={styles.serviceItem}>
                  <span className={`${styles.serviceIcon} ${styles.redIcon}`}>
                    <WifiIcon />
                  </span>
                  <span>Wifi is not available</span>
                </div>
                <div className={styles.serviceItem}>
                  <span className={`${styles.serviceIcon} ${styles.redIcon}`}>
                    <PlugIcon />
                  </span>
                  <span>No in-seat power outlet</span>
                </div>
              </div>*/}
            </div>
          )}

          {/* Arrival */}
          <div className={styles.locationTimeInfo}>
            <div className={styles.timeInfo}>
              <div className={styles.time}>
                {flight.departure.data.itineraries[0].segments.length == 1
                  ? formatted(
                      flight.departure.data.itineraries[0].segments[0].arrival.at.split(
                        "T"
                      )[1]
                    )
                  : formatted(
                      flight.departure.data.itineraries[0].segments[1].arrival.at.split(
                        "T"
                      )[1]
                    )}
              </div>
              <div className={styles.day}>
                {flight.departure.data.itineraries[0].segments.length == 1
                  ? format(
                      flight.departure.data.itineraries[0].segments[0].arrival.at.split(
                        "T"
                      )[0],
                      "d	LLL"
                    )
                  : format(
                      flight.departure.data.itineraries[0].segments[1].arrival.at.split(
                        "T"
                      )[0],
                      "d	LLL"
                    )}
              </div>
            </div>
            <div className={styles.locationInfo}>
              <div className={styles.airport}>
                <span className={styles.dot}></span>
                {sharedData.departure.dest.airport.name} (
                {sharedData.departure.dest.airport.iata})
              </div>
              <div className={styles.terminal}>
                {flight.departure.data.itineraries[0].segments.length == 1
                  ? flight.departure.data.itineraries[0].segments[0].arrival
                      .terminal
                    ? "Terminal " +
                      flight.departure.data.itineraries[0].segments[0].arrival
                        .terminal
                    : ""
                  : flight.departure.data.itineraries[0].segments[1].arrival
                        .terminal
                    ? "Terminal " +
                      flight.departure.data.itineraries[0].segments[1].arrival
                        .terminal
                    : ""}
              </div>
              <div className={styles.city}>
                {sharedData.departure.dest.airport.city},{" "}
                {sharedData.departure.dest.airport.country}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className={styles.additionalInfo}>
          {/* Cancellation Policy */}
          {flight.departure.data.travelerPricings[0].fareDetailsBySegment[0]
            .amenities && (
            <Cancellation
              openCancellationDialog={openCancellationDialog}
              amenities={
                flight.departure.data.travelerPricings[0]
                  .fareDetailsBySegment[0].amenities
              }
              route={sharedData ? 
                (sharedData.departure.dest.airport.iata +
                " - " +
                sharedData.departure.origin.airport.iata) : ""
              }
            />
          )}
        </div>
        {/* Fare Selection for Departure */}
        <FareSelection
          formData={formData}
          onUpdateForm={onUpdateForm}
          selectedClass={departureClass}
          direction="departure"
          openBaggageDialog={openBaggageDialog}
          setIndex={setFareSelectionIndex}
        />
      </section>
      {/* Return Flight */}
      {sharedData.return &&flight.return && (
        <section className={styles.flightSegment}>
          <div className={styles.flightHeader}>
            <div className={styles.routeInfo}>
              <h2 className={styles.route}>
                {sharedData.return.origin.airport.city} to{" "}
                {sharedData.return.dest.airport.city}
              </h2>
              <span className={styles.duration}>
                Total duration{" "}
                {formatDuration(flight.return.data.itineraries[0].duration)}
              </span>
            </div>
            <span className={styles.date}>
              {format(
                flight.return.data.itineraries[0].segments[0].departure.at.split(
                  "T"
                )[0],
                "EEE, d	LLL u"
              )}
            </span>
          </div>

          <div className={styles.flightCard}>
            {/* Departure */}
            <div className={styles.locationTimeInfo}>
              <div className={styles.timeInfo}>
                <div className={styles.time}>
                  {formatted(
                    flight.return.data.itineraries[0].segments[0].departure.at.split(
                      "T"
                    )[1]
                  )}
                </div>
                <div className={styles.day}>
                  {format(
                    flight.return.data.itineraries[0].segments[0].departure.at.split(
                      "T"
                    )[0],
                    "d	LLL"
                  )}
                </div>
              </div>
              <div className={styles.locationInfo}>
                <div className={styles.airport}>
                  <span className={styles.dot}></span>
                  {sharedData.return.origin.airport.name} (
                  {sharedData.return.origin.airport.iata})
                </div>
                <div className={styles.terminal}>
                  {flight.return.data.itineraries[0].segments[0].departure
                    .terminal
                    ? "Terminal " +
                      flight.return.data.itineraries[0].segments[0].departure
                        .terminal
                    : ""}
                </div>
                <div className={styles.city}>
                  {sharedData.return.origin.airport.city},{" "}
                  {sharedData.return.origin.airport.country}
                </div>
              </div>
            </div>

            {/* Flight */}
            {flight.return.data.itineraries[0].segments.length > 1 && (
              <div className={styles.flightInfo}>
                <div className={styles.stopContainer}>
                  <div className={styles.flightDuration}>
                    <div className={styles.fixedTime}>
                      {formatDuration(
                        flight.return.data.itineraries[0].segments[0].duration
                      )}
                    </div>
                    {!expandedReturnStops && (
                      <div className={styles.stops}>
                        <span className={styles.stopsBadge}>1 Stop</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.airlineDetails}>
                    <button
                      className={styles.stopsDropdownButton}
                      onClick={toggleReturnStopsDropdown}
                    >
                      {expandedReturnStops ? (
                        <ChevronUpIcon />
                      ) : (
                        <ChevronDownIcon />
                      )}
                    </button>
                    <div className={styles.airlineLogoContainer}>
                      <div className={styles.airlineLogo}>
                        <img
                          src="https://i.pinimg.com/originals/db/63/b5/db63b5aa67202c6a027b477a1f93c0f3.png"
                          alt="Airline Logo"
                        />
                      </div>
                    </div>
                    <div className={styles.airlineInfo}>
                      <div className={styles.airlineName}>
                        {dealWithAirline(flight.return.carrier) +
                          " | " +
                          flight.return.data.itineraries[0].segments[0]
                            .carrierCode +
                          "-" +
                          flight.return.data.itineraries[0].segments[0].number}
                      </div>
                      <div className={styles.cabinClass}>
                        {sharedData.passengerClass.class.text}
                      </div>
                    </div>
                  </div>
                </div>
                {expandedReturnStops && (
                  <div className={styles.stopDetailsContainer}>
                    <div
                      className={`${styles.stopsDropdownContent} ${expandedReturnStops ? styles.expanded : ""}`}
                    >
                      <div className={styles.timeOfStop}>
                        <div className={styles.time}>
                          {formatted(
                            flight.return.data.itineraries[0].segments[0].arrival.at.split(
                              "T"
                            )[1]
                          )}
                        </div>
                        <div className={styles.day}>
                          {format(
                            flight.return.data.itineraries[0].segments[0].arrival.at.split(
                              "T"
                            )[0],
                            "d	LLL"
                          )}
                        </div>
                      </div>
                      <div className={styles.stopDetail}>
                        <div className={styles.stopLocation}>
                          <span className={styles.stopDot}></span>
                          <div>
                            <div className={styles.stopAirport}>
                              {stopAirportDep && stopAirportDep.name}
                            </div>
                            <div className={styles.stopIATA}>
                              (
                              {
                                flight.return.data.itineraries[0].segments[0]
                                  .arrival.iataCode
                              }
                              )
                            </div>
                            <div className={styles.stopCity}>
                              {stopAirportDep &&
                                stopAirportDep.city +
                                  ", " +
                                  stopAirportDep.country}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.waitingContainer}>
                      <div className={styles.waitingStopTime}>
                        {getTimeOfWaiting(flight.return)}
                      </div>
                      <div className={styles.stopDuration}>
                        <span className={styles.waitingLabel}>
                          Waiting time in{" "}
                          <strong>
                            {stopAirportDep && stopAirportDep.city}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <div className={styles.stopDeparture}>
                      <div className={styles.timeOfStop}>
                        <div className={styles.time}>
                          {formatted(
                            flight.return.data.itineraries[0].segments[1].departure.at.split(
                              "T"
                            )[1]
                          )}
                        </div>
                        <div className={styles.day}>
                          {format(
                            flight.return.data.itineraries[0].segments[1].departure.at.split(
                              "T"
                            )[0],
                            "d	LLL"
                          )}
                        </div>
                      </div>
                      <div className={styles.stopDetail}>
                        <div className={styles.stopLocation}>
                          <span className={styles.dot1}></span>
                          <div>
                            <div className={styles.stopAirport}>
                              {stopAirportDep && stopAirportDep.name}
                            </div>
                            <div className={styles.stopIATA}>
                              (
                              {
                                flight.return.data.itineraries[0].segments[0]
                                  .arrival.iataCode
                              }
                              )
                            </div>
                            <div className={styles.stopCity}>
                              {stopAirportDep &&
                                stopAirportDep.city +
                                  ", " +
                                  stopAirportDep.country}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.stopFlight}>
                      <div className={styles.flightDuration}>
                        <div className={styles.fixedTime}>
                          {formatDuration(
                            flight.return.data.itineraries[0].segments[1]
                              .duration
                          )}
                        </div>
                      </div>

                      <div className={styles.airlineDetails}>
                        <div className={styles.airlineLogoContainer}>
                          <div className={styles.airlineLogo}>
                            <img
                              src="https://i.pinimg.com/originals/db/63/b5/db63b5aa67202c6a027b477a1f93c0f3.png"
                              alt="Airline Logo"
                            />
                          </div>
                        </div>
                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineName}>
                            {dealWithAirline(flight.return.carrier) +
                              " | " +
                              flight.return.data.itineraries[0].segments[1]
                                .carrierCode +
                              "-" +
                              flight.return.data.itineraries[0].segments[1]
                                .number}
                          </div>
                          <div className={styles.cabinClass}>
                            {sharedData.passengerClass.class.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* <div className={styles.amenities}>
                <button
                  className={styles.servicesDropdownButton}
                  onClick={toggleServicesDropdown}
                >
                  <div className={styles.amenitiesIcons}>
                    <span className={styles.amenityIcon}>
                      <DesktopIcon />
                    </span>
                    <span className={styles.amenityIcon}>
                      <UtensilsIcon />
                    </span>
                    <span className={styles.amenityIcon}>
                      <PlugIcon />
                    </span>
                    <span className={styles.amenityIcon}>
                      <WifiIcon />
                    </span>
                  </div>
                  {expandedServices ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>
              </div>

              <div
                className={`${styles.servicesDropdownContent} ${expandedServices ? styles.expanded : ""}`}
              >
                <div className={styles.serviceItem}>
                  <DesktopIcon className={styles.serviceIcon} />
                  <span>Seatback screen & entertainment</span>
                </div>
                <div className={styles.serviceItem}>
                  <UtensilsIcon className={styles.serviceIcon} />
                  <span>Complimentary meal</span>
                </div>
                <div className={styles.serviceItem}>
                  <AirplaneIcon className={styles.serviceIcon} />
                  <span>Above average legroom</span>
                </div>
                <div className={styles.serviceItem}>
                  <RulerIcon className={styles.serviceIcon} />
                  <span>Average seatwidth</span>
                </div>
                <div className={styles.serviceItem}>
                  <UsersIcon className={styles.serviceIcon} />
                  <span>3-3 seat configuration</span>
                </div>
                <div className={styles.serviceItem}>
                  <span className={`${styles.serviceIcon} ${styles.redIcon}`}>
                    <WifiIcon />
                  </span>
                  <span>Wifi is not available</span>
                </div>
                <div className={styles.serviceItem}>
                  <span className={`${styles.serviceIcon} ${styles.redIcon}`}>
                    <PlugIcon />
                  </span>
                  <span>No in-seat power outlet</span>
                </div>
              </div>*/}
              </div>
            )}

            {/* Arrival */}
            <div className={styles.locationTimeInfo}>
              <div className={styles.timeInfo}>
                <div className={styles.time}>
                  {flight.return.data.itineraries[0].segments.length == 1
                    ? formatted(
                        flight.return.data.itineraries[0].segments[0].arrival.at.split(
                          "T"
                        )[1]
                      )
                    : formatted(
                        flight.return.data.itineraries[0].segments[1].arrival.at.split(
                          "T"
                        )[1]
                      )}
                </div>
                <div className={styles.day}>
                  {flight.return.data.itineraries[0].segments.length == 1
                    ? format(
                        flight.return.data.itineraries[0].segments[0].arrival.at.split(
                          "T"
                        )[0],
                        "d	LLL"
                      )
                    : format(
                        flight.return.data.itineraries[0].segments[1].arrival.at.split(
                          "T"
                        )[0],
                        "d	LLL"
                      )}
                </div>
              </div>
              <div className={styles.locationInfo}>
                <div className={styles.airport}>
                  <span className={styles.dot}></span>
                  {sharedData.return.dest.airport.name} (
                  {sharedData.return.dest.airport.iata})
                </div>
                <div className={styles.terminal}>
                  {flight.return.data.itineraries[0].segments.length == 1
                    ? flight.return.data.itineraries[0].segments[0].arrival
                        .terminal
                      ? "Terminal " +
                        flight.return.data.itineraries[0].segments[0].arrival
                          .terminal
                      : ""
                    : flight.return.data.itineraries[0].segments[1].arrival
                          .terminal
                      ? "Terminal " +
                        flight.return.data.itineraries[0].segments[1].arrival
                          .terminal
                      : ""}
                </div>
                <div className={styles.city}>
                  {sharedData.return.dest.airport.city},{" "}
                  {sharedData.return.dest.airport.country}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={styles.additionalInfo}>
            {/* Cancellation Policy */}
            {flight.return.data.travelerPricings[0].fareDetailsBySegment[0]
              .amenities && (
              <Cancellation
                openCancellationDialog={openCancellationDialog}
                amenities={
                  flight.return.data.travelerPricings[0].fareDetailsBySegment[0]
                    .amenities
                }
                route={sharedData ? (
                  sharedData.return.dest.airport.iata +
                  " - " +
                  sharedData.return.origin.airport.iata): ""
                }
              />
            )}
          </div>
        </section>
      )}

      {/* Fare Selection for Return (إذا كانت رحلة عودة) */}
      {sharedData.return && flight.return && (
        <FareSelection
          formData={formData}
          onUpdateForm={onUpdateForm}
          selectedClass={returnClass}
          direction="return"
          openBaggageDialog={openBaggageDialog2}
          setIndex={setFareSelectionIndex}
        />
      )}

      {/* Baggage Dialog */}
      {baggageDialogOpen && (
        <BaggageDialog
          setBaggageDialogOpen={setBaggageDialogOpen}
          index={fareSelectionIndex}
          direction= "departure"
        />
      )}
      {/* Baggage Dialog2 */}
      {baggageDialogOpen2 && (
        <BaggageDialog
          setBaggageDialogOpen={setBaggageDialogOpen2}
          index={fareSelectionIndex}
          direction="return"
        />
      )}

      {/* Cancellation Dialog */}
      {cancellationDialogOpen && (
        <div className={styles.dialogOverlay}>
          <div className={styles.detailsDialog}>
            <div className={styles.dialogHeader}>
              <div className={styles.dialogTitle}>
                Cancel & Change
                <button
                  className={styles.dialogClose}
                  onClick={() => setCancellationDialogOpen(false)}
                >
                  <XIcon />
                </button>
              </div>
            </div>
            <div className={styles.dialogContent}>
              {/* Cancel & change details */}
              <div className={styles.policySection}>
                <div className={styles.policyHeader}>
                  <span className={styles.policyIcon}>
                    <CalendarIcon />
                  </span>
                  <h4>Cancel & change details</h4>
                </div>
                <div className={styles.policyTable}>
                  <div className={styles.policyRow}>
                    <div className={styles.policyCellHeader}></div>
                    <div className={styles.policyCellHeader}>Adult</div>
                    {sharedData  && sharedData.passengerClass.children > 0 &&<div className={styles.policyCellHeader}>Child</div>}
                    {sharedData  && sharedData.passengerClass.infants > 0 &&<div className={styles.policyCellHeader}>Infant</div>}
                  </div>
                  <div className={styles.policyRow}>
                    <div className={styles.policyCell}>Cancellation fees</div>
                    <div className={styles.policyCellAmount}>
                      <span className={styles.checkIconSmall}>
                        <CheckIcon />
                      </span>{" "}
                      <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                        USD 94
                      </span>
                    </div>
                    {sharedData && sharedData.passengerClass.children > 0 &&<div className={styles.policyCellAmount}>
                      <span className={styles.checkIconSmall}>
                        <CheckIcon />
                      </span>{" "}
                      <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                        USD 58
                      </span>
                    </div>}
                    {sharedData && sharedData.passengerClass.infants > 0 &&<div className={styles.policyCellAmount}>
                      <span className={styles.checkIconSmall}>
                        <CheckIcon />
                      </span>{" "}
                      <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                        USD 15
                      </span>
                    </div>}
                  </div>
                </div>
              </div>
              {/* Date Change Fees */}
              <div className={styles.policySection}>
                <div className={styles.policyHeader}>
                  <span className={styles.policyIcon}>
                    <CalendarIcon />
                  </span>
                  <h4>Date Change Fees</h4>
                </div>
                <div className={styles.policyTable}>
                  <div className={styles.policyRow}>
                    <div className={styles.policyCellHeader}></div>
                    <div className={styles.policyCellHeader}>Adult</div>
                    {sharedData  && sharedData.passengerClass.children > 0 &&<div className={styles.policyCellHeader}>Child</div>}
                    {sharedData  && sharedData.passengerClass.infants > 0 &&<div className={styles.policyCellHeader}>Infant</div>}
                  </div>
                  <div className={styles.policyRow}>
                    <div className={styles.policyCell}>Date change fees</div>
                    <div className={styles.policyCellAmount}>
                      <span className={styles.checkIconSmall}>
                        <CheckIcon />
                      </span>{" "}
                      <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                        USD 54
                      </span>
                      <div className={styles.fareDifference}>
                        + Fare Difference
                      </div>
                    </div>
                    {sharedData && sharedData.passengerClass.children > 0 &&<div className={styles.policyCellAmount}>
                      <span className={styles.checkIconSmall}>
                        <CheckIcon />
                      </span>{" "}
                      <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                        USD 35
                      </span>
                      <div className={styles.fareDifference}>
                        + Fare Difference
                      </div>
                    </div>}
                    {sharedData&& sharedData.passengerClass.infants > 0 &&<div className={styles.policyCellAmount}>
                      <span className={styles.checkIconSmall}>
                        <CheckIcon />
                      </span>{" "}
                      <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                        Free
                      </span>
                    </div>}
                  </div>
                </div>
              </div>
              {/* Note */}
              <div
                className={styles.policyNote}
                style={{
                  background: "#fff9e6",
                  border: "1px solid #ffe7a0",
                  marginTop: 16,
                }}
              >
                <span className={styles.noteIcon}>
                  <InfoIcon />
                </span>
                <p>
                  All fees are applicable up to 48 hours before the outbound
                  flight departure time. Additional fees may apply after that.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DetailsOfTheFlight.propTypes = {
  onClose: PropTypes.func,
  onUpdateForm: PropTypes.func,
  formData: PropTypes.object,
  flight:PropTypes.object,
};
Cancellation.propTypes = {
  openCancellationDialog: PropTypes.func,
  amenities: PropTypes.array,
  route: PropTypes.string,
};
BaggageDialog.propTypes = {
  setBaggageDialogOpen: PropTypes.func,
  index: PropTypes.number,
  direction: PropTypes.string,
};
export default DetailsOfTheFlight;
