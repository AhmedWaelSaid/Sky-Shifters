import PropTypes from "prop-types";
import styles from "./FlightSummary.module.css";
import { format } from "date-fns";
import { useState } from "react";
const FlightLeg = ({
  type,
  date,
  airline,
  departure,
  arrival,
  duration,
  flightTime,
  dayDiff,
  flight,
}) => {
  const [showPlusTime, setShowPlusTime] = useState(false);
  return (
    <div className={styles.flightSection}>
      <h4>{type}</h4>
      <div className={styles.flightInfo}>
        <div className={styles.date}>{date}</div>
        <div className={styles.airline}>
          <img
            className={styles.airlineLogo}
            src={`https://pics.avs.io/60/60/${flight.itineraries[0].segments[0].carrierCode}.png`}
            alt={flight.itineraries[0].segments[0].carrierCode}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "src/assets/no-logo.jpg"; // fallback
              console.warn("Logo failed to load:", e.target.src);
            }}
          />
          <span>{airline}</span>
        </div>

        <div className={styles.route}>
          <div className={styles.timeLocation}>
            <div className={styles.time}>
              {departure.time}
              <span>{departure.period}</span>
            </div>
            <div className={styles.location}>{departure.code}</div>
          </div>

          <div className={styles.flightPath}>
            <div className={styles.duration}>{duration}</div>
            <div className={styles.path}>
              <div className={styles.line}></div>
              <div className={styles.planeIcon}>✈</div>
              <div className={styles.line}></div>
            </div>
            <div className={styles.flightTime}>{flightTime}</div>
          </div>

          <div className={styles.timeLocation}>
            <div className={styles.time}>
              {arrival.time}
              <span>{arrival.period}</span>
            </div>
            <div className={styles.location}>{arrival.code}</div>
            <div
              onMouseEnter={() => setShowPlusTime(true)}
              onMouseLeave={() => setShowPlusTime(false)}
            >
              <div className={styles.dayDiff}>{dayDiff}</div>
              {showPlusTime && (
                <div className={styles.plusTime}>
                  Arrives on{" "}
                  <strong>
                    {flight.itineraries[0].segments.length == 1 //direct
                      ? format(
                          new Date(
                            flight.itineraries[0].segments[0].arrival.at
                          ),
                          "ccc, d MMM"
                        )
                      : flight.itineraries[0].segments.length == 2 //1 stop
                        ? format(
                            new Date(
                              flight.itineraries[0].segments[1].arrival.at
                            ),
                            "ccc, d MMM"
                          )
                        : format(
                            new Date(
                              flight.itineraries[0].segments[2].arrival.at
                            ), // 2 stop
                            "ccc, d MMM"
                          )}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
FlightLeg.propTypes = {
  type: PropTypes.oneOf[(PropTypes.string, PropTypes.number)],
  date: PropTypes.oneOf[(PropTypes.string, PropTypes.number)],
  airline: PropTypes.string,
  departure: PropTypes.object,
  arrival: PropTypes.object,
  duration: PropTypes.oneOf[(PropTypes.string, PropTypes.number)],
  flightTime: PropTypes.oneOf[(PropTypes.string, PropTypes.number)],
  dayDiff: PropTypes.oneOf[(PropTypes.string, PropTypes.number)],
  flight: PropTypes.object,
};
export default FlightLeg;
