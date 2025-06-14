import styles from "./styles/main.module.css";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import stopIcon from "../../assets/stopLine.png";
import { format, parseISO } from "date-fns";
import PropTypes from "prop-types";
import { useData } from "../../components/context/DataContext";
import { formatDuration } from "./someFun";

const capitalizeWords = (str) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
function isDurationOneDayOrMore(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);

  const hours = match[1] ? parseInt(match[1], 10) : 0;

  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  const totalHours = hours + minutes / 60;

  return totalHours >= 24;
}
export function FlightsUI({ value, btnHandler, flightsData, button }) {
  return (
    <div className={styles.flight}>
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
        {isDurationOneDayOrMore(value.itineraries[0].duration) && (
          <div className={styles.moreThanADay}>+1</div>
        )}
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
        <div className={styles.departureName}>
          {value.itineraries[0].segments[0].departure.iataCode}
        </div>
        <div>
          <img src={stopIcon} alt="stopIcon" />
          <div className={styles.stop}>
            {value.itineraries[0].segments.length > 1
              ? value.itineraries[0].segments.length - 1 + " Stop"
              : "Direct"}
          </div>
        </div>
        <div className={styles.arrivalName}>
          {value.itineraries[0].segments.length > 1
            ? value.itineraries[0].segments[1].arrival.iataCode
            : value.itineraries[0].segments[0].arrival.iataCode}
        </div>
      </div>
      <div className={styles.flightPrice}>{value.price.total} USD</div>
      <button
        className={styles[button.className]}
        onClick={() => btnHandler(value)}
      >
        {button.text}
      </button>
    </div>
  );
}

export function Main({
  setCurrentPage,
  currentPage,
  flightsData,
  setAPISearch,
  setIsReturn,
  isReturn,
}) {
  const navigate = useNavigate();
  const { sharedData, flight, setFlight } = useData();
  
  const flightsPerPage = 8;
  if (!flightsData) return "Data not here";
  const totalPages = Math.ceil(flightsData.data.length / flightsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startIndex = (currentPage - 1) * flightsPerPage;
  const endIndex = startIndex + flightsPerPage;
  const currentFlights = flightsData.data.slice(startIndex, endIndex);

  function detailsBtnHandler(data) {
    const newFlight =
      !isReturn && !sharedData.return
        ? {
            return: null,
            departure: {
              data,
              carrier:
                flightsData.dictionaries.carriers[
                  data.itineraries[0].segments[0].operating.carrierCode
                ],
            },
          }
        : {
            ...flight,
            return: {
              data,
              carrier:
                flightsData.dictionaries.carriers[
                  data.itineraries[0].segments[0].operating.carrierCode
                ],
            },
          };
    setFlight(newFlight);
    navigate("./flight-details");
  }

  function selectBtnHandler(data) {
    setFlight(() => ({
      return: null,
      departure: {
        data,
        carrier:
          flightsData.dictionaries.carriers[
            data.itineraries[0].segments[0].operating.carrierCode
          ],
      },
    }));
    setAPISearch({
      ...sharedData.return,
      passengerClass: sharedData.passengerClass,
    });
    setIsReturn(true);
  }

  return (
    <div className={styles.mainBody}>
      {sharedData.return
        ? isReturn
          ? currentFlights.map((value) => (
              <FlightsUI
                key={value.id}
                value={value}
                btnHandler={detailsBtnHandler}
                flightsData={flightsData}
                button={{ text: "View Details", className: "detailsBtn" }}
              />
            ))
          : currentFlights.map((value) => (
              <FlightsUI
                key={value.id}
                value={value}
                btnHandler={selectBtnHandler}
                flightsData={flightsData}
                button={{ text: "Select flight", className: "selectFlightBtn" }}
              />
            ))
        : currentFlights.map((value) => (
            <FlightsUI
              key={value.id}
              value={value}
              btnHandler={detailsBtnHandler}
              flightsData={flightsData}
              button={{ text: "View Details", className: "detailsBtn" }}
            />
          ))}
      <div className={styles.pagination}>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`${currentPage === page ? styles.active : ""}`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}

Main.propTypes = {
  setCurrentPage: PropTypes.func.isRequired,
  currentPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  flightsData: PropTypes.object,
  setAPISearch: PropTypes.func.isRequired,
  setIsReturn: PropTypes.func.isRequired,
  isReturn: PropTypes.bool,
};
FlightsUI.propTypes = {
  flightsData: PropTypes.object,
  value: PropTypes.object,
  btnHandler: PropTypes.func,
  button: PropTypes.object,
};
