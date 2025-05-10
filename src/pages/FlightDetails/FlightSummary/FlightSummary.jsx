import { useEffect, useState } from "react";
import styles from "./FlightSummary.module.css";
import FlightLeg from "./FlightLeg";
import CancellationPolicy from "./CancellationPolicy";
import FareBreakdown from "./FareBreakdown";
import { useOutletContext } from "react-router-dom";
import { format } from "date-fns";
import { formatDuration } from "../../SelectedFlights/someFun";
import DetailsOfTheFlight from '../DetailsOfTheFlight/DetailsOfTheFlight'

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
function dealWithAirline(airline) {
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

const FlightSummary = ({
  passengers = [],
  formData = {},
  onContinue,
  onBack,
  showBackButton = false,
  showContinueButton = true,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  let context = useOutletContext();
  const flight = context?.flight || JSON.parse(localStorage.getItem("flight"));

  useEffect(() => {
    if (flight) {
      localStorage.setItem("flight", JSON.stringify(flight));
    }
    return () => {
      localStorage.removeItem("flight");
    };
  }, [flight]);

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  return (
    <div className={styles.flightSummary}>
      <div className={styles.summaryHeader}>
        <h3>Flight summary</h3>
        <button className={styles.detailsButton} onClick={toggleDetails}>Details</button>
      </div>

      {/* Details Side Panel */}
      <div className={`${styles.detailsPanel} ${isDetailsOpen ? styles.open : ''}`}>
        <div className={styles.detailsPanelContent}>
          <DetailsOfTheFlight onClose={toggleDetails} />
        </div>
      </div>

      {/* Overlay when details panel is open */}
      {isDetailsOpen && (
        <div className={styles.overlay} onClick={toggleDetails} />
      )}

      {flight.data.itineraries[0].segments.length == 1 ? ( //check if its direct or there is a stop
        <FlightLeg
          type="Departure"
          date={format(
            flight.data.itineraries[0].segments[0].departure.at.split("T")[0],
            "EEE, d	LLL u"
          )}
          airline={
            dealWithAirline(flight.carrier) +
            " " +
            flight.data.itineraries[0].segments[0].aircraft.code
          }
          departure={{
            time: formatted(
              flight.data.itineraries[0].segments[0].departure.at.split("T")[1]
            ),
            period: checkPeriod(
              flight.data.itineraries[0].segments[0].departure.at.split("T")[1]
            ),
            code: flight.data.itineraries[0].segments[0].departure.iataCode,
          }}
          arrival={{
            time: formatted(
              flight.data.itineraries[0].segments[0].arrival.at.split("T")[1]
            ),
            period: checkPeriod(
              flight.data.itineraries[0].segments[0].arrival.at.split("T")[1]
            ),
            code: flight.data.itineraries[0].segments[0].arrival.iataCode,
          }}
          duration={
            flight.data.itineraries[0].segments.length == 1
              ? "Direct"
              : "1 Stop"
          }
          flightTime={formatDuration(flight.data.itineraries[0].duration)}
          currencySymbol="$"
        />
      ) : (
        <FlightLeg
          type="Departure"
          date={format(
            flight.data.itineraries[0].segments[0].departure.at.split("T")[0],
            "EEE, d	LLL u"
          )}
          airline={
            dealWithAirline(flight.carrier) +
            " " +
            flight.data.itineraries[0].segments[0].aircraft.code +
            ", " +
            dealWithAirline(flight.carrier) +
            " " +
            flight.data.itineraries[0].segments[1].aircraft.code
          }
          departure={{
            time: formatted(
              flight.data.itineraries[0].segments[0].departure.at.split("T")[1]
            ),
            period: checkPeriod(
              flight.data.itineraries[0].segments[0].departure.at.split("T")[1]
            ),
            code: flight.data.itineraries[0].segments[0].departure.iataCode,
          }}
          arrival={{
            time: formatted(
              flight.data.itineraries[0].segments[1].arrival.at.split("T")[1]
            ),
            period: checkPeriod(
              flight.data.itineraries[0].segments[1].arrival.at.split("T")[1]
            ),
            code: flight.data.itineraries[0].segments[1].arrival.iataCode,
          }}
          duration={
            flight.data.itineraries[0].segments.length == 1
              ? "Direct"
              : "1 Stop"
          }
          flightTime={formatDuration(flight.data.itineraries[0].duration)}
          currencySymbol="$"
        />
      )}
      {flight.data.itineraries.length == 2 && //return only appears when there are 2 flights (round trip)
        (flight.data.itineraries[1].segments.length == 1 ? ( //check if its direct or there is a stop
          <FlightLeg
            type="Return"
            date={format(
              flight.data.itineraries[1].segments[0].departure.at.split("T")[0],
              "EEE, d	LLL u"
            )}
            airline={
              dealWithAirline(flight.carrier) +
              " " +
              flight.data.itineraries[1].segments[0].aircraft.code
            }
            departure={{
              time: formatted(
                flight.data.itineraries[1].segments[0].departure.at.split(
                  "T"
                )[1]
              ),
              period: checkPeriod(
                flight.data.itineraries[1].segments[0].departure.at.split(
                  "T"
                )[1]
              ),
              code: flight.data.itineraries[1].segments[0].departure.iataCode,
            }}
            arrival={{
              time: formatted(
                flight.data.itineraries[1].segments[0].arrival.at.split("T")[1]
              ),
              period: checkPeriod(
                flight.data.itineraries[1].segments[0].arrival.at.split("T")[1]
              ),
              code: flight.data.itineraries[1].segments[0].arrival.iataCode,
            }}
            duration={
              flight.data.itineraries[1].segments.length == 1
                ? "Direct"
                : "1 Stop"
            }
            flightTime={formatDuration(flight.data.itineraries[1].duration)}
            currencySymbol="$"
          />
        ) : (
          <FlightLeg
            type="Return"
            date={format(
              flight.data.itineraries[1].segments[0].departure.at.split("T")[0],
              "EEE, d	LLL u"
            )}
            airline={
              dealWithAirline(flight.carrier) +
              " " +
              flight.data.itineraries[1].segments[0].aircraft.code +
              ", " +
              dealWithAirline(flight.carrier) +
              " " +
              flight.data.itineraries[1].segments[1].aircraft.code
            }
            departure={{
              time: formatted(
                flight.data.itineraries[1].segments[0].departure.at.split(
                  "T"
                )[1]
              ),
              period: checkPeriod(
                flight.data.itineraries[1].segments[0].departure.at.split(
                  "T"
                )[1]
              ),
              code: flight.data.itineraries[1].segments[0].departure.iataCode,
            }}
            arrival={{
              time: formatted(
                flight.data.itineraries[1].segments[1].arrival.at.split("T")[1]
              ),
              period: checkPeriod(
                flight.data.itineraries[1].segments[1].arrival.at.split("T")[1]
              ),
              code: flight.data.itineraries[1].segments[1].arrival.iataCode,
            }}
            duration={
              flight.data.itineraries[1].segments.length == 1
                ? "Direct"
                : "1 Stop"
            }
            flightTime={formatDuration(flight.data.itineraries[1].duration)}
            currencySymbol="$"
          />
        ))}
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

export default FlightSummary;
