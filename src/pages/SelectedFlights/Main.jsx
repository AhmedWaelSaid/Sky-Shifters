import styles from "./styles/main.module.css";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import stopIcon from "../../assets/stopLine.png";
import { format, parseISO } from "date-fns";
import PropTypes from "prop-types";
import { useData } from "../../components/context/DataContext";
import { formatDuration } from "./someFun";
import DetailsOfTheFlight from "../FlightDetails/DetailsOfTheFlight/DetailsOfTheFlight";
import { useState, useEffect } from "react";
const capitalizeWords = (str) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
function isDurationOneDayOrMore(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);

  const hours = match[1] ? parseInt(match[1], 10) : 0;

  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  const totalHours = hours + minutes / 60;

  return totalHours >= 24;
}
export function FlightsUI({
  flight,
  btnHandler,
  btnHandler2,
  carrier,
  button,
  button2 = { exist: false },
}) {
  return (
    <div className={styles.flight}>
      <div className={styles.airLineContainer}>
        <img
          className={styles.airLineIcon}
          src={`https://pics.avs.io/60/60/${flight.itineraries[0].segments[0].carrierCode}.png`}
          alt={flight.itineraries[0].segments[0].carrierCode}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "src/assets/no-logo.jpg"; // local fallback
            console.warn("Logo failed to load:", e.target.src);
          }}
        />
        <div className={styles.container}>
          <div className={styles.airLine}>{capitalizeWords(carrier)}</div>
          <div className={styles.baggage}>zz</div>
        </div>
      </div>
      <div className={styles.flightTime}>
        {isDurationOneDayOrMore(flight.itineraries[0].duration) && (
          <div className={styles.moreThanADay}>+1</div>
        )}
        <div className={styles.arrivalDeparture}>
          {format(
            parseISO(flight.itineraries[0].segments[0].departure.at),
            "h:mm a"
          )}{" "}
          -{" "}
          {format(
            parseISO(
              flight.itineraries[0].segments[
                flight.itineraries[0].segments.length - 1
              ].arrival.at
            ),
            "h:mm a"
          )}
        </div>
        <div className={styles.totalFlightTime}>
          {formatDuration(flight.itineraries[0].duration)}
        </div>
      </div>
      <div className={styles.stops}>
        <div className={styles.departureName}>
          {flight.itineraries[0].segments[0].departure.iataCode}
        </div>
        <div>
          <img src={stopIcon} alt="stopIcon" />
          <div className={styles.stop}>
            {flight.itineraries[0].segments.length > 1
              ? flight.itineraries[0].segments.length - 1 + " Stop"
              : "Direct"}
          </div>
        </div>
        <div className={styles.arrivalName}>
          {flight.itineraries[0].segments.length > 1
            ? flight.itineraries[0].segments[1].arrival.iataCode
            : flight.itineraries[0].segments[0].arrival.iataCode}
        </div>
      </div>
      <div className={styles.flightPrice}>{flight.price.total} USD</div>
      <button
        className={styles[button.className]}
        onClick={() => btnHandler(flight)}
      >
        {button.text}
      </button>
      {button2.exist && (
        <button
          className={styles[button2.className]}
          onClick={() => btnHandler2(flight)}
        >
          {button2.text}
        </button>
      )}
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
  const { sharedData, flight, setFlight, tempFlight, setTempFlight } =
    useData();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [fakeForm, setFakeForm] = useState({
    baggageSelection: {},
    fakeForm: true,
  });
  const flightsPerPage = 12;
  useEffect(() => {
    if (tempFlight) setTempFlight(null);
  }, []);
  if (!flightsData) return "Data not here";
  const totalPages = Math.ceil(flightsData.data.length / flightsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startIndex = (currentPage - 1) * flightsPerPage;
  const endIndex = startIndex + flightsPerPage;
  const currentFlights = flightsData.data.slice(startIndex, endIndex);

  function selectBtnHandler(data) {
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

  function returnBtnHandler(data) {
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
    setTimeout(() => {
      setIsReturn(true);
    }, 200);
  }
  const toggleDetails = (curFlight, carrier) => {
    if (!isDetailsOpen && !sharedData.return) {
      setTempFlight({ departure: { data: curFlight, carrier } });
    } else if (!isDetailsOpen && sharedData.return) {
      if (!isReturn) setTempFlight({ departure: { data: curFlight, carrier } });
      else
        setTempFlight({
          return: { data: curFlight, carrier },
          departure: {
            data: flight.departure.data,
            carrier: flight.departure.carrier,
          },
        });
    }
    setIsDetailsOpen(!isDetailsOpen);
  };
  console.log(tempFlight);
  return (
    <>
      {tempFlight && (
        <div
          className={`${styles.detailsPanel} ${isDetailsOpen ? styles.open : ""}`}
        >
          <div className={styles.detailsPanelContent}>
            <DetailsOfTheFlight
              onClose={toggleDetails}
              onUpdateForm={setFakeForm}
              formData={fakeForm}
              flight={tempFlight}
            />
          </div>
        </div>
      )}
      <div className={styles.mainBody}>
        {currentFlights.map((flight) => {
          const carrier =
            flightsData.dictionaries.carriers[
              flight.itineraries[0].segments[0].carrierCode
            ];

          let btnHandler;
          let button;
          let button2 = { exist: false };
          let btnHandler2;

          if (sharedData.return) {
            if (isReturn) {
              btnHandler = () => toggleDetails(flight, carrier);
              button = { text: "View Details", className: "detailsBtn" };
              btnHandler2 = selectBtnHandler;
              button2 = {
                text: "Select flight",
                className: "selectFlightBtn",
                exist: true,
              };
            } else {
              btnHandler2 = returnBtnHandler;
              button2 = {
                text: "Select flight",
                className: "selectFlightBtn",
                exist: true,
              };
              btnHandler = () => toggleDetails(flight, carrier);
              button = { text: "View Details", className: "detailsBtn" };
            }
          } else {
            btnHandler = () => toggleDetails(flight, carrier);
            btnHandler2 = selectBtnHandler;
            button = { text: "View Details", className: "detailsBtn" };
            button2 = {
              text: "Select flight",
              className: "selectFlightBtn",
              exist: true,
            };
          }

          return (
            <>
              <FlightsUI
                key={flight.id}
                flight={flight}
                btnHandler={btnHandler}
                btnHandler2={btnHandler2}
                carrier={carrier}
                button={button}
                button2={button2}
              />
            </>
          );
        })}
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
    </>
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
  carrier: PropTypes.string,
  flight: PropTypes.object,
  btnHandler: PropTypes.func,
  btnHandler2: PropTypes.func,
  button: PropTypes.object,
  button2: PropTypes.object,
};
