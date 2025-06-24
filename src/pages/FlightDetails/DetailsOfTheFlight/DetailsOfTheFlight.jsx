import { useState } from "react";
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
          <span className={isRefundable ? styles.checkIcon : styles.crossIcon}>
            {isRefundable ? <CheckIcon /> : <XIcon />}
          </span>
          {isRefundable ? (
            <div>
              {isRefundable.isChargeable
                ? "Refundable but with fees"
                : "Fully refundable"}
            </div>
          ) : (
            <div>Non-refundable</div>
          )}
        </div>
        <div className={styles.infoItem}>
          <span className={isChangeable ? styles.checkIcon : styles.crossIcon}>
            {isChangeable ? <CheckIcon /> : <XIcon />}
          </span>
          {isChangeable ? (
            <div>
              {isChangeable.isChargeable
                ? "Changeable but with fees"
                : "Changeable no fees"}
            </div>
          ) : (
            <div>Non-changeable</div>
          )}
        </div>
      </div>
    </div>
  );
}
function BaggageDialog({ setBaggageDialogOpen, index, direction }) {
  let checkedBaggageText;
  let maxCheckedBaggage;
  if (index.class == "economy") {
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

function getTimeOfWaiting(arrival, departure) {
  const arrivalDate = new Date(arrival);
  const departureDate = new Date(departure);
  const time = departureDate - arrivalDate;
  const totalMinutes = time / (1000 * 60); //in minutes
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hours + "h " + mins + "m";
}
const DetailsOfTheFlight = ({ onClose, onUpdateForm, formData, flight }) => {
  const { airports } = useAirports();
  const [expandedStops, setExpandedStops] = useState(false);
  const [expandedReturnStops, setExpandedReturnStops] = useState(false);
  const [baggageDialogOpen, setBaggageDialogOpen] = useState(false);
  const [baggageDialogOpen2, setBaggageDialogOpen2] = useState(false);
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const { sharedData } = useData();
  const [fareSelectionIndex, setFareSelectionIndex] = useState({
    depIndex: 0,
    retIndex: 0,
    class: "economy",
  });
  if (!flight) return;
  const departureClass = sharedData?.passengerClass.class.text || "ECONOMY";
  const returnClass = sharedData?.passengerClass.class.text || departureClass;
  const segmentLength = flight.departure.data.itineraries[0].segments.length;
  const returnSegmentLength =
    flight?.return?.data?.itineraries[0].segments.length;
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
  let stopAirportDep2 = null;
  let stopAirportDep3 = null;
  if (flight.departure && segmentLength > 0) {
    stopAirportDep = getAirportByIATA(
      flight.departure.data.itineraries[0].segments[0].arrival.iataCode
    );
  }
  if (flight.departure && segmentLength > 1) {
    stopAirportDep2 = getAirportByIATA(
      flight.departure.data.itineraries[0].segments[1].arrival.iataCode
    );
  }
  if (flight.departure && segmentLength > 2) {
    stopAirportDep3 = getAirportByIATA(
      flight.departure.data.itineraries[0].segments[2].arrival.iataCode
    );
  }
  let stopAirportRet = null;
  let stopAirportRet2 = null;
  let stopAirportRet3 = null;
  if (flight.return && returnSegmentLength > 0) {
    stopAirportRet = getAirportByIATA(
      flight.return.data.itineraries[0].segments[0].arrival.iataCode
    );
  }
  if (flight.return && returnSegmentLength > 1) {
    stopAirportRet2 = getAirportByIATA(
      flight.return.data.itineraries[0].segments[1].arrival.iataCode
    );
  }
  if (flight.return && returnSegmentLength > 2) {
    stopAirportRet3 = getAirportByIATA(
      flight.return.data.itineraries[0].segments[2].arrival.iataCode
    );
  }
  let returnDestination = null;
  let destination = null;
  if (segmentLength === 1 && stopAirportDep) {
    destination = stopAirportDep;
  } else if (segmentLength === 2 && stopAirportDep2) {
    destination = stopAirportDep2;
  } else if (segmentLength === 3 && stopAirportDep3) {
    destination = stopAirportDep3;
  }
  if (returnSegmentLength === 1 && stopAirportRet) {
    returnDestination = stopAirportRet;
  } else if (returnSegmentLength === 2 && stopAirportRet2) {
    returnDestination = stopAirportRet2;
  } else if (returnSegmentLength === 3 && stopAirportRet3) {
    returnDestination = stopAirportRet3;
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
              new Date(
                flight.departure.data.itineraries[0].segments[0].departure.at
              ),
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
                  new Date(
                    flight.departure.data.itineraries[0].segments[0].departure.at
                  ),
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
          {segmentLength == 1 && (
            <div className={styles.flightInfo}>
              <div className={styles.stopFlight}>
                <div className={styles.flightDuration}>
                  <div className={styles.fixedTime}>
                    {formatDuration(
                      flight.departure.data.itineraries[0].segments[0].duration
                    )}
                  </div>
                </div>

                <div className={styles.airlineDetails}>
                  <div className={styles.airlineLogoContainer}>
                    <div className={styles.airlineLogo}>
                      <img
                        src={`https://pics.avs.io/40/40/${flight.departure.data.itineraries[0].segments[0].carrierCode}.png`}
                        alt="Airline Logo"
                      />
                    </div>
                  </div>
                  <div className={styles.airlineInfo}>
                    <div className={styles.airlineName}>
                      {dealWithAirline(
                        flight.carriers[
                          flight.departure.data.itineraries[0].segments[0]
                            .carrierCode
                        ]
                      ) +
                        " | " +
                        flight.departure.data.itineraries[0].segments[0]
                          .carrierCode +
                        "-" +
                        flight.departure.data.itineraries[0].segments[0].number}
                    </div>
                    <div className={styles.aircraftType}>
                      {
                        flight.aircraft[
                          flight.departure.data.itineraries[0].segments[0]
                            .aircraft.code
                        ]
                      }
                    </div>
                    <div className={styles.cabinClass}>
                      {sharedData.passengerClass.class.text}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {segmentLength > 1 && (
            <div className={styles.flightInfo}>
              <div className={styles.stopContainer}>
                <div className={styles.flightDuration}>
                  <div className={styles.fixedTime}>
                    {!expandedStops
                      ? formatDuration(
                          flight.departure.data.itineraries[0].duration
                        )
                      : formatDuration(
                          flight.departure.data.itineraries[0].segments[0]
                            .duration
                        )}
                  </div>
                  {!expandedStops && (
                    <div className={styles.stops}>
                      <span className={styles.stopsBadge}>
                        {segmentLength - 1} Stop
                      </span>
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
                        src={`https://pics.avs.io/40/40/${flight.departure.data.itineraries[0].segments[0].carrierCode}.png`}
                        alt="Airline Logo"
                      />
                    </div>
                  </div>
                  <div className={styles.airlineInfo}>
                    <div className={styles.airlineName}>
                      {dealWithAirline(
                        flight.carriers[
                          flight.departure.data.itineraries[0].segments[0]
                            .carrierCode
                        ]
                      ) +
                        " | " +
                        flight.departure.data.itineraries[0].segments[0]
                          .carrierCode +
                        "-" +
                        flight.departure.data.itineraries[0].segments[0].number}
                    </div>
                    <div className={styles.aircraftType}>
                      {
                        flight.aircraft[
                          flight.departure.data.itineraries[0].segments[0]
                            .aircraft.code
                        ]
                      }
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
                          new Date(
                            flight.departure.data.itineraries[0].segments[0].arrival.at
                          ),
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
                          <div className={styles.terminal2}>
                            {flight.departure.data.itineraries[0].segments[0]
                              .arrival.terminal
                              ? "Terminal " +
                                flight.departure.data.itineraries[0].segments[0]
                                  .arrival.terminal
                              : ""}
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
                      {getTimeOfWaiting(
                        flight.departure.data.itineraries[0].segments[0].arrival
                          .at,
                        flight.departure.data.itineraries[0].segments[1]
                          .departure.at
                      )}
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
                          new Date(
                            flight.departure.data.itineraries[0].segments[1].departure.at
                          ),
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
                          <div className={styles.terminal2}>
                            {flight.departure.data.itineraries[0].segments[1]
                              .departure.terminal
                              ? "Terminal " +
                                flight.departure.data.itineraries[0].segments[1]
                                  .departure.terminal
                              : ""}
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
                            src={`https://pics.avs.io/40/40/${flight.departure.data.itineraries[0].segments[1].carrierCode}.png`}
                            alt="Airline Logo"
                          />
                        </div>
                      </div>
                      <div className={styles.airlineInfo}>
                        <div className={styles.airlineName}>
                          {dealWithAirline(
                            flight.carriers[
                              flight.departure.data.itineraries[0].segments[1]
                                .carrierCode
                            ]
                          ) +
                            " | " +
                            flight.departure.data.itineraries[0].segments[1]
                              .carrierCode +
                            "-" +
                            flight.departure.data.itineraries[0].segments[1]
                              .number}
                        </div>
                        <div className={styles.aircraftType}>
                          {
                            flight.aircraft[
                              flight.departure.data.itineraries[0].segments[1]
                                .aircraft.code
                            ]
                          }
                        </div>
                        <div className={styles.cabinClass}>
                          {sharedData.passengerClass.class.text}
                        </div>
                      </div>
                    </div>
                  </div>
                  {segmentLength >= 3 && (
                    <div>
                      <div
                        className={`${styles.stopsDropdownContent} ${expandedStops ? styles.expanded : ""}`}
                      >
                        <div className={styles.timeOfStop}>
                          <div className={styles.time}>
                            {formatted(
                              flight.departure.data.itineraries[0].segments[1].arrival.at.split(
                                "T"
                              )[1]
                            )}
                          </div>
                          <div className={styles.day}>
                            {format(
                              new Date(
                                flight.departure.data.itineraries[0].segments[1].arrival.at
                              ),
                              "d	LLL"
                            )}
                          </div>
                        </div>
                        <div className={styles.stopDetail}>
                          <div className={styles.stopLocation}>
                            <span className={styles.stopDot}></span>
                            <div>
                              <div className={styles.stopAirport}>
                                {stopAirportDep2 && stopAirportDep2.name}
                              </div>
                              <div className={styles.stopIATA}>
                                (
                                {
                                  flight.departure.data.itineraries[0]
                                    .segments[1].arrival.iataCode
                                }
                                )
                              </div>
                              <div className={styles.terminal2}>
                                {flight.departure.data.itineraries[0]
                                  .segments[1].arrival.terminal
                                  ? "Terminal " +
                                    flight.departure.data.itineraries[0]
                                      .segments[1].arrival.terminal
                                  : ""}
                              </div>
                              <div className={styles.stopCity}>
                                {stopAirportDep2 &&
                                  stopAirportDep2.city +
                                    ", " +
                                    stopAirportDep2.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.waitingContainer}>
                        <div className={styles.waitingStopTime}>
                          {getTimeOfWaiting(
                            flight.departure.data.itineraries[0].segments[1]
                              .arrival.at,
                            flight.departure.data.itineraries[0].segments[2]
                              .departure.at
                          )}
                        </div>
                        <div className={styles.stopDuration}>
                          <span className={styles.waitingLabel}>
                            Waiting time in{" "}
                            <strong>
                              {stopAirportDep2 && stopAirportDep2.city}
                            </strong>
                          </span>
                        </div>
                      </div>
                      <div className={styles.stopDeparture}>
                        <div className={styles.timeOfStop}>
                          <div className={styles.time}>
                            {formatted(
                              flight.departure.data.itineraries[0].segments[2].departure.at.split(
                                "T"
                              )[1]
                            )}
                          </div>
                          <div className={styles.day}>
                            {format(
                              new Date(
                                flight.departure.data.itineraries[0].segments[2].departure.at
                              ),
                              "d	LLL"
                            )}
                          </div>
                        </div>
                        <div className={styles.stopDetail}>
                          <div className={styles.stopLocation}>
                            <span className={styles.dot1}></span>
                            <div>
                              <div className={styles.stopAirport}>
                                {stopAirportDep2 && stopAirportDep2.name}
                              </div>
                              <div className={styles.stopIATA}>
                                (
                                {
                                  flight.departure.data.itineraries[0]
                                    .segments[1].arrival.iataCode
                                }
                                )
                              </div>
                              <div className={styles.terminal2}>
                                {flight.departure.data.itineraries[0]
                                  .segments[2].departure.terminal
                                  ? "Terminal " +
                                    flight.departure.data.itineraries[0]
                                      .segments[2].departure.terminal
                                  : ""}
                              </div>
                              <div className={styles.stopCity}>
                                {stopAirportDep2 &&
                                  stopAirportDep2.city +
                                    ", " +
                                    stopAirportDep2.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.stopFlight}>
                        <div className={styles.flightDuration}>
                          <div className={styles.fixedTime}>
                            {formatDuration(
                              flight.departure.data.itineraries[0].segments[2]
                                .duration
                            )}
                          </div>
                        </div>

                        <div className={styles.airlineDetails}>
                          <div className={styles.airlineLogoContainer}>
                            <div className={styles.airlineLogo}>
                              <img
                                src={`https://pics.avs.io/40/40/${flight.departure.data.itineraries[0].segments[2].carrierCode}.png`}
                                alt="Airline Logo"
                              />
                            </div>
                          </div>
                          <div className={styles.airlineInfo}>
                            <div className={styles.airlineName}>
                              {dealWithAirline(
                                flight.carriers[
                                  flight.departure.data.itineraries[0]
                                    .segments[2].carrierCode
                                ]
                              ) +
                                " | " +
                                flight.departure.data.itineraries[0].segments[2]
                                  .carrierCode +
                                "-" +
                                flight.departure.data.itineraries[0].segments[2]
                                  .number}
                            </div>
                            <div className={styles.aircraftType}>
                              {
                                flight.aircraft[
                                  flight.departure.data.itineraries[0]
                                    .segments[2].aircraft.code
                                ]
                              }
                            </div>
                            <div className={styles.cabinClass}>
                              {sharedData.passengerClass.class.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Arrival */}
          <div className={styles.locationTimeInfo}>
            <div className={styles.timeInfo}>
              <div className={styles.time}>
                {segmentLength == 1
                  ? formatted(
                      flight.departure.data.itineraries[0].segments[0].arrival.at.split(
                        "T"
                      )[1]
                    )
                  : segmentLength == 2
                    ? formatted(
                        flight.departure.data.itineraries[0].segments[1].arrival.at.split(
                          "T"
                        )[1]
                      )
                    : formatted(
                        flight.departure.data.itineraries[0].segments[2].arrival.at.split(
                          "T"
                        )[1]
                      )}
              </div>
              <div className={styles.day}>
                {segmentLength == 1
                  ? format(
                      new Date(
                        flight.departure.data.itineraries[0].segments[0].arrival.at
                      ),
                      "d	LLL"
                    )
                  : segmentLength == 2
                    ? format(
                        new Date(
                          flight.departure.data.itineraries[0].segments[1].arrival.at
                        ),
                        "d	LLL"
                      )
                    : format(
                        new Date(
                          flight.departure.data.itineraries[0].segments[2].arrival.at
                        ),
                        "d	LLL"
                      )}
              </div>
            </div>
            <div className={styles.locationInfo}>
              {destination && (
                <div className={styles.airport}>
                  <span className={styles.dot}></span>
                  {destination.name} ({destination.iata})
                </div>
              )}
              <div className={styles.terminal}>
                {(segmentLength == 1 &&
                  (flight.departure.data.itineraries[0].segments[0].arrival
                    .terminal
                    ? "Terminal " +
                      flight.departure.data.itineraries[0].segments[0].arrival
                        .terminal
                    : "")) ||
                  (segmentLength == 2 &&
                    (flight.departure.data.itineraries[0].segments[1].arrival
                      .terminal
                      ? "Terminal " +
                        flight.departure.data.itineraries[0].segments[1].arrival
                          .terminal
                      : "")) ||
                  (segmentLength == 3 &&
                    (flight.departure.data.itineraries[0].segments[2].arrival
                      .terminal
                      ? "Terminal " +
                        flight.departure.data.itineraries[0].segments[2].arrival
                          .terminal
                      : ""))}
              </div>
              {destination && (
                <div className={styles.city}>
                  {destination.city}, {destination.country}
                </div>
              )}
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
              route={
                sharedData
                  ? sharedData.departure.dest.airport.iata +
                    " - " +
                    sharedData.departure.origin.airport.iata
                  : ""
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
      {sharedData.return && flight.return && (
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
                    new Date(
                      flight.return.data.itineraries[0].segments[0].departure.at
                    ),
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
                  {flight.return.data.itineraries[0].segments[0].departure
                    .terminal
                    ? "Terminal " +
                      flight.return.data.itineraries[0].segments[0].departure
                        .terminal
                    : ""}
                </div>
                <div className={styles.city}>
                  {sharedData.departure.dest.airport.city},{" "}
                  {sharedData.departure.dest.airport.country}
                </div>
              </div>
            </div>

            {/* Flight */}
            {returnSegmentLength == 1 && (
              <div className={styles.flightInfo}>
                <div className={styles.stopFlight}>
                  <div className={styles.flightDuration}>
                    <div className={styles.fixedTime}>
                      {formatDuration(
                        flight.return.data.itineraries[0].segments[0].duration
                      )}
                    </div>
                  </div>

                  <div className={styles.airlineDetails}>
                    <div className={styles.airlineLogoContainer}>
                      <div className={styles.airlineLogo}>
                        <img
                          src={`https://pics.avs.io/40/40/${flight.return.data.itineraries[0].segments[0].carrierCode}.png`}
                          alt="Airline Logo"
                        />
                      </div>
                    </div>
                    <div className={styles.airlineInfo}>
                      <div className={styles.airlineName}>
                        {dealWithAirline(
                          flight.carriers[
                            flight.return.data.itineraries[0].segments[0]
                              .carrierCode
                          ]
                        ) +
                          " | " +
                          flight.return.data.itineraries[0].segments[0]
                            .carrierCode +
                          "-" +
                          flight.return.data.itineraries[0].segments[0].number}
                      </div>
                      <div className={styles.aircraftType}>
                        {
                          flight.aircraft[
                            flight.return.data.itineraries[0].segments[0]
                              .aircraft.code
                          ]
                        }
                      </div>
                      <div className={styles.cabinClass}>
                        {sharedData.passengerClass.class.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {returnSegmentLength > 1 && (
              <div className={styles.flightInfo}>
                <div className={styles.stopContainer}>
                  <div className={styles.flightDuration}>
                    <div className={styles.fixedTime}>
                      {!expandedReturnStops
                        ? formatDuration(
                            flight.return.data.itineraries[0].duration
                          )
                        : formatDuration(
                            flight.return.data.itineraries[0].segments[0]
                              .duration
                          )}
                    </div>
                    {!expandedReturnStops && (
                      <div className={styles.stops}>
                        <span className={styles.stopsBadge}>
                          {returnSegmentLength - 1} Stop
                        </span>
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
                          src={`https://pics.avs.io/40/40/${flight.return.data.itineraries[0].segments[0].carrierCode}.png`}
                          alt="Airline Logo"
                        />
                      </div>
                    </div>
                    <div className={styles.airlineInfo}>
                      <div className={styles.airlineName}>
                        {dealWithAirline(
                          flight.carriers[
                            flight.return.data.itineraries[0].segments[0]
                              .carrierCode
                          ]
                        ) +
                          " | " +
                          flight.return.data.itineraries[0].segments[0]
                            .carrierCode +
                          "-" +
                          flight.return.data.itineraries[0].segments[0].number}
                      </div>
                      <div className={styles.aircraftType}>
                        {
                          flight.aircraft[
                            flight.return.data.itineraries[0].segments[0]
                              .aircraft.code
                          ]
                        }
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
                            new Date(
                              flight.return.data.itineraries[0].segments[0].arrival.at
                            ),
                            "d	LLL"
                          )}
                        </div>
                      </div>
                      <div className={styles.stopDetail}>
                        <div className={styles.stopLocation}>
                          <span className={styles.stopDot}></span>
                          <div>
                            <div className={styles.stopAirport}>
                              {stopAirportRet && stopAirportRet.name}
                            </div>
                            <div className={styles.stopIATA}>
                              (
                              {
                                flight.return.data.itineraries[0].segments[0]
                                  .arrival.iataCode
                              }
                              )
                            </div>
                            <div className={styles.terminal2}>
                              {flight.return.data.itineraries[0].segments[0]
                                .arrival.terminal
                                ? "Terminal " +
                                  flight.return.data.itineraries[0].segments[0]
                                    .arrival.terminal
                                : ""}
                            </div>
                            <div className={styles.stopCity}>
                              {stopAirportRet &&
                                stopAirportRet.city +
                                  ", " +
                                  stopAirportRet.country}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.waitingContainer}>
                      <div className={styles.waitingStopTime}>
                        {getTimeOfWaiting(
                          flight.return.data.itineraries[0].segments[0].arrival
                            .at,
                          flight.return.data.itineraries[0].segments[1]
                            .departure.at
                        )}
                      </div>
                      <div className={styles.stopDuration}>
                        <span className={styles.waitingLabel}>
                          Waiting time in{" "}
                          <strong>
                            {stopAirportRet && stopAirportRet.city}
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
                            new Date(
                              flight.return.data.itineraries[0].segments[1].departure.at
                            ),
                            "d	LLL"
                          )}
                        </div>
                      </div>
                      <div className={styles.stopDetail}>
                        <div className={styles.stopLocation}>
                          <span className={styles.dot1}></span>
                          <div>
                            <div className={styles.stopAirport}>
                              {stopAirportRet && stopAirportRet.name}
                            </div>
                            <div className={styles.stopIATA}>
                              (
                              {
                                flight.return.data.itineraries[0].segments[0]
                                  .arrival.iataCode
                              }
                              )
                            </div>
                            <div className={styles.terminal2}>
                              {flight.return.data.itineraries[0].segments[1]
                                .departure.terminal
                                ? "Terminal " +
                                  flight.return.data.itineraries[0].segments[1]
                                    .departure.terminal
                                : ""}
                            </div>
                            <div className={styles.stopCity}>
                              {stopAirportRet &&
                                stopAirportRet.city +
                                  ", " +
                                  stopAirportRet.country}
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
                              src={`https://pics.avs.io/40/40/${flight.return.data.itineraries[0].segments[1].carrierCode}.png`}
                              alt="Airline Logo"
                            />
                          </div>
                        </div>
                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineName}>
                            {dealWithAirline(
                              flight.carriers[
                                flight.return.data.itineraries[0].segments[1]
                                  .carrierCode
                              ]
                            ) +
                              " | " +
                              flight.return.data.itineraries[0].segments[1]
                                .carrierCode +
                              "-" +
                              flight.return.data.itineraries[0].segments[1]
                                .number}
                          </div>
                          <div className={styles.aircraftType}>
                            {
                              flight.aircraft[
                                flight.return.data.itineraries[0].segments[1]
                                  .aircraft.code
                              ]
                            }
                          </div>
                          <div className={styles.cabinClass}>
                            {sharedData.passengerClass.class.text}
                          </div>
                        </div>
                      </div>
                    </div>
                    {returnSegmentLength >= 3 && (
                      <div>
                        <div
                          className={`${styles.stopsDropdownContent} ${expandedReturnStops ? styles.expanded : ""}`}
                        >
                          <div className={styles.timeOfStop}>
                            <div className={styles.time}>
                              {formatted(
                                flight.return.data.itineraries[0].segments[1].arrival.at.split(
                                  "T"
                                )[1]
                              )}
                            </div>
                            <div className={styles.day}>
                              {format(
                                new Date(
                                  flight.return.data.itineraries[0].segments[1].arrival.at
                                ),
                                "d	LLL"
                              )}
                            </div>
                          </div>
                          <div className={styles.stopDetail}>
                            <div className={styles.stopLocation}>
                              <span className={styles.stopDot}></span>
                              <div>
                                <div className={styles.stopAirport}>
                                  {stopAirportRet2 && stopAirportRet2.name}
                                </div>
                                <div className={styles.stopIATA}>
                                  (
                                  {
                                    flight.return.data.itineraries[0]
                                      .segments[1].arrival.iataCode
                                  }
                                  )
                                </div>
                                <div className={styles.terminal2}>
                                  {flight.return.data.itineraries[0].segments[1]
                                    .arrival.terminal
                                    ? "Terminal " +
                                      flight.return.data.itineraries[0]
                                        .segments[1].arrival.terminal
                                    : ""}
                                </div>
                                <div className={styles.stopCity}>
                                  {stopAirportRet2 &&
                                    stopAirportRet2.city +
                                      ", " +
                                      stopAirportRet2.country}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.waitingContainer}>
                          <div className={styles.waitingStopTime}>
                            {getTimeOfWaiting(
                              flight.return.data.itineraries[0].segments[1]
                                .arrival.at,
                              flight.return.data.itineraries[0].segments[2]
                                .departure.at
                            )}
                          </div>
                          <div className={styles.stopDuration}>
                            <span className={styles.waitingLabel}>
                              Waiting time in{" "}
                              <strong>
                                {stopAirportRet2 && stopAirportRet2.city}
                              </strong>
                            </span>
                          </div>
                        </div>
                        <div className={styles.stopDeparture}>
                          <div className={styles.timeOfStop}>
                            <div className={styles.time}>
                              {formatted(
                                flight.return.data.itineraries[0].segments[2].departure.at.split(
                                  "T"
                                )[1]
                              )}
                            </div>
                            <div className={styles.day}>
                              {format(
                                new Date(
                                  flight.return.data.itineraries[0].segments[2].departure.at
                                ),
                                "d	LLL"
                              )}
                            </div>
                          </div>
                          <div className={styles.stopDetail}>
                            <div className={styles.stopLocation}>
                              <span className={styles.dot1}></span>
                              <div>
                                <div className={styles.stopAirport}>
                                  {stopAirportRet2 && stopAirportRet2.name}
                                </div>
                                <div className={styles.stopIATA}>
                                  (
                                  {
                                    flight.return.data.itineraries[0]
                                      .segments[1].arrival.iataCode
                                  }
                                  )
                                </div>
                                <div className={styles.terminal2}>
                                  {flight.return.data.itineraries[0].segments[2]
                                    .departure.terminal
                                    ? "Terminal " +
                                      flight.return.data.itineraries[0]
                                        .segments[2].departure.terminal
                                    : ""}
                                </div>
                                <div className={styles.stopCity}>
                                  {stopAirportRet2 &&
                                    stopAirportRet2.city +
                                      ", " +
                                      stopAirportRet2.country}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.stopFlight}>
                          <div className={styles.flightDuration}>
                            <div className={styles.fixedTime}>
                              {formatDuration(
                                flight.return.data.itineraries[0].segments[2]
                                  .duration
                              )}
                            </div>
                          </div>

                          <div className={styles.airlineDetails}>
                            <div className={styles.airlineLogoContainer}>
                              <div className={styles.airlineLogo}>
                                <img
                                  src={`https://pics.avs.io/40/40/${flight.return.data.itineraries[0].segments[2].carrierCode}.png`}
                                  alt="Airline Logo"
                                />
                              </div>
                            </div>
                            <div className={styles.airlineInfo}>
                              <div className={styles.airlineName}>
                                {dealWithAirline(
                                  flight.carriers[
                                    flight.return.data.itineraries[0]
                                      .segments[2].carrierCode
                                  ]
                                ) +
                                  " | " +
                                  flight.return.data.itineraries[0].segments[2]
                                    .carrierCode +
                                  "-" +
                                  flight.return.data.itineraries[0].segments[2]
                                    .number}
                              </div>
                              <div className={styles.aircraftType}>
                                {
                                  flight.aircraft[
                                    flight.return.data.itineraries[0]
                                      .segments[2].aircraft.code
                                  ]
                                }
                              </div>
                              <div className={styles.cabinClass}>
                                {sharedData.passengerClass.class.text}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Arrival */}
            <div className={styles.locationTimeInfo}>
              <div className={styles.timeInfo}>
                <div className={styles.time}>
                  {returnSegmentLength == 1
                    ? formatted(
                        flight.return.data.itineraries[0].segments[0].arrival.at.split(
                          "T"
                        )[1]
                      )
                    : returnSegmentLength == 2
                      ? formatted(
                          flight.return.data.itineraries[0].segments[1].arrival.at.split(
                            "T"
                          )[1]
                        )
                      : formatted(
                          flight.return.data.itineraries[0].segments[2].arrival.at.split(
                            "T"
                          )[1]
                        )}
                </div>
                <div className={styles.day}>
                  {returnSegmentLength == 1
                    ? format(
                        new Date(
                          flight.return.data.itineraries[0].segments[0].arrival.at
                        ),
                        "d	LLL"
                      )
                    : returnSegmentLength == 2
                      ? format(
                          new Date(
                            flight.return.data.itineraries[0].segments[1].arrival.at
                          ),
                          "d	LLL"
                        )
                      : format(
                          new Date(
                            flight.return.data.itineraries[0].segments[2].arrival.at
                          ),
                          "d	LLL"
                        )}
                </div>
              </div>
              <div className={styles.locationInfo}>
                {returnDestination && (
                  <div className={styles.airport}>
                    <span className={styles.dot}></span>
                    {returnDestination.name} ({returnDestination.iata})
                  </div>
                )}
                <div className={styles.terminal}>
                  {(returnSegmentLength == 1 &&
                    (flight.return.data.itineraries[0].segments[0].arrival
                      .terminal
                      ? "Terminal " +
                        flight.return.data.itineraries[0].segments[0].arrival
                          .terminal
                      : "")) ||
                    (returnSegmentLength == 2 &&
                      (flight.return.data.itineraries[0].segments[1].arrival
                        .terminal
                        ? "Terminal " +
                          flight.return.data.itineraries[0].segments[1].arrival
                            .terminal
                        : "")) ||
                    (returnSegmentLength == 3 &&
                      (flight.return.data.itineraries[0].segments[2].arrival
                        .terminal
                        ? "Terminal " +
                          flight.return.data.itineraries[0].segments[2].arrival
                            .terminal
                        : ""))}
                </div>
                {returnDestination && (
                  <div className={styles.city}>
                    {returnDestination.city}, {returnDestination.country}
                  </div>
                )}
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
                route={
                  sharedData
                    ? sharedData.return.dest.airport.iata +
                      " - " +
                      sharedData.return.origin.airport.iata
                    : ""
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
          direction="departure"
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
                    {sharedData && sharedData.passengerClass.children > 0 && (
                      <div className={styles.policyCellHeader}>Child</div>
                    )}
                    {sharedData && sharedData.passengerClass.infants > 0 && (
                      <div className={styles.policyCellHeader}>Infant</div>
                    )}
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
                    {sharedData && sharedData.passengerClass.children > 0 && (
                      <div className={styles.policyCellAmount}>
                        <span className={styles.checkIconSmall}>
                          <CheckIcon />
                        </span>{" "}
                        <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                          USD 58
                        </span>
                      </div>
                    )}
                    {sharedData && sharedData.passengerClass.infants > 0 && (
                      <div className={styles.policyCellAmount}>
                        <span className={styles.checkIconSmall}>
                          <CheckIcon />
                        </span>{" "}
                        <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                          USD 15
                        </span>
                      </div>
                    )}
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
                    {sharedData && sharedData.passengerClass.children > 0 && (
                      <div className={styles.policyCellHeader}>Child</div>
                    )}
                    {sharedData && sharedData.passengerClass.infants > 0 && (
                      <div className={styles.policyCellHeader}>Infant</div>
                    )}
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
                    {sharedData && sharedData.passengerClass.children > 0 && (
                      <div className={styles.policyCellAmount}>
                        <span className={styles.checkIconSmall}>
                          <CheckIcon />
                        </span>{" "}
                        <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                          USD 35
                        </span>
                        <div className={styles.fareDifference}>
                          + Fare Difference
                        </div>
                      </div>
                    )}
                    {sharedData && sharedData.passengerClass.infants > 0 && (
                      <div className={styles.policyCellAmount}>
                        <span className={styles.checkIconSmall}>
                          <CheckIcon />
                        </span>{" "}
                        <span style={{ color: "#36b37e", fontWeight: "bold" }}>
                          Free
                        </span>
                      </div>
                    )}
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
  flight: PropTypes.object,
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
