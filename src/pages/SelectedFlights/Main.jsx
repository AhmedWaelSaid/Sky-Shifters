import styles from "./styles/main.module.css";
import "react-datepicker/dist/react-datepicker.css";

import stopIcon from "../../assets/stopLine.png";
import { format, parseISO } from "date-fns";
import PropTypes from "prop-types";

const formatDuration = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;

  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";

  return [hours, minutes].filter(Boolean).join(" ");
};
const capitalizeWords = (str) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
function isDurationOneDayOrMore(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);

  const hours = match[1] ? parseInt(match[1], 10) : 0;

  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  const totalHours = hours + minutes / 60;

  return totalHours >= 24;
}
export function Main({
  setCurrentPage,
  currentPage,
  flightsData,
}) {
  const flightsPerPage = 8;

  if (!flightsData) return "";
  const totalPages = Math.ceil(flightsData.data.length / flightsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startIndex = (currentPage - 1) * flightsPerPage;
  const endIndex = startIndex + flightsPerPage;
  const currentFlights = flightsData.data.slice(startIndex, endIndex); //filter for pagination

  return (
    <div className={styles.mainBody}>
      {currentFlights.map((value) => {
        return (
          <div className={styles.flight} key={value.id}>
            <div className={styles.airLineContainer}>
              <div
                className={styles.airLineIcon}
                style={{ backgroundColor: "orange" }}
              ></div>
              <div className={styles.container}>
                <div className={styles.airLine}>
                  {capitalizeWords(
                    flightsData.dictionaries.carriers[
                      value.itineraries[0].segments[0].carrierCode
                    ]
                  )}
                </div>
                <div className={styles.baggage}>zz</div>
              </div>
            </div>
            <div className={styles.flightTime}>
              {isDurationOneDayOrMore(value.itineraries[0].duration) && <div className={styles.moreThanADay}>+1</div>}
              <div className={styles.arrivalDeparture}>
                {format(
                  parseISO(value.itineraries[0].segments[0].departure.at),
                  "h:mm a"
                )}{" "}
                -{" "}
                {format(
                  parseISO(
                    value.itineraries[0].segments[
                      value.itineraries[0].segments.length - 1
                    ].arrival.at
                  ),
                  "h:mm a"
                )}
              </div>
              <div className={styles.totalFlightTime}>
                {formatDuration(value.itineraries[0].duration)}
              </div>
            </div>
            <div className={styles.stops}>
              <img src={stopIcon} alt="stopIcon" />
              <div>
                {value.itineraries[0].segments.length > 1
                  ? value.itineraries[0].segments.length - 1 + " Stop"
                  : "Direct"}
              </div>
            </div>
            <div className={styles.flightPrice}>{value.price.total} EUR</div>
            <button className={styles.detailsBtn}>View Details</button>
          </div>
        );
      })}
      <div className={styles.pagination}>
        {pages.map((page) => {
          return (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`${currentPage == page ? styles.active : ""}`}
            >
              {page}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Main.propTypes = {
  setCurrentPage: PropTypes.func.isRequired,
  setFlightsData: PropTypes.func.isRequired,
  currentPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  filteredFlights: PropTypes.arrayOf(PropTypes.object),
};
