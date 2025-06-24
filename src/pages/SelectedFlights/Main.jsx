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
import { dayDifference } from "./someFun";
const capitalizeWords = (str) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export function FlightsUI({
  flight,
  btnHandler,
  btnHandler2,
  carriers,
  button,
  button2 = { exist: false },
}) {
  const [showPlusTime, setShowPlusTime] = useState(false);
  const carrierCode = flight?.itineraries?.[0]?.segments?.[0]?.carrierCode;
  const carrier = carrierCode ? carriers?.[carrierCode] : "";
  return (
    <div className={styles.flight}>
      <div className={styles.airLineContainer}>
        <img
          className={styles.airLineIcon}
          src={`https://pics.avs.io/60/60/${flight.itineraries[0].segments[0].carrierCode}.png`}
          alt={flight.itineraries[0].segments[0].carrierCode}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "src/assets/no-logo.jpg"; // fallback
            console.warn("Logo failed to load:", e.target.src);
          }}
        />
        <div className={styles.airLine}>
          {carrier && capitalizeWords(carrier)}
        </div>
      </div>
      <div className={styles.flightTime}>
        <div
          className={styles.plusDays}
          onMouseEnter={() => {
            setShowPlusTime(true);
          }}
          onMouseLeave={() => {
            setShowPlusTime(false);
          }}
        >
          <div className={styles.moreThanADay}>{dayDifference(flight)}</div>
          {showPlusTime && (
            <div className={styles.plusTime}>
              Arrives on{" "}
              <strong>
                {flight.itineraries[0].segments.length == 1 //direct
                  ? format(
                      new Date(flight.itineraries[0].segments[0].arrival.at),
                      "ccc, d MMM"
                    )
                  : flight.itineraries[0].segments.length == 2 //1 stop
                    ? format(
                        new Date(flight.itineraries[0].segments[1].arrival.at),
                        "ccc, d MMM"
                      )
                    : format(
                        new Date(flight.itineraries[0].segments[2].arrival.at), // 2 stop
                        "ccc, d MMM"
                      )}
              </strong>
            </div>
          )}
        </div>
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
    const carriers = flightsData.dictionaries.carriers;
    const aircraft = flightsData.dictionaries.aircraft;
    const newFlight =
      !isReturn && !sharedData.return
        ? {
            return: null,
            departure: {
              data,
            },
            carriers,
            aircraft,
          }
        : {
            ...flight,
            return: {
              data,
            },
          };
    setFlight(newFlight);
    navigate("./flight-details");
  }

  function returnBtnHandler(data) {
    const carriers = flightsData.dictionaries.carriers;
    const aircraft = flightsData.dictionaries.aircraft;
    setFlight(() => ({
      return: null,
      departure: {
        data,
      },
      carriers,
      aircraft,
    }));
    setAPISearch({
      ...sharedData.return,
      passengerClass: sharedData.passengerClass,
    });
    setTimeout(() => {
      setIsReturn(true);
    }, 200);
  }
  const toggleDetails = (curFlight, carriers,aircraft) => {
    if (!isDetailsOpen && !sharedData.return) {
      setTempFlight({ departure: { data: curFlight }, carriers, aircraft });
    } else if (!isDetailsOpen && sharedData.return) {
      if (!isReturn)
        setTempFlight({ departure: { data: curFlight }, carriers,aircraft });
      else
        setTempFlight({
          return: { data: curFlight },
          departure: {
            data: flight.departure.data,
          },
          carriers,
          aircraft,
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
          const carriers = flightsData.dictionaries.carriers;
          const aircraft = flightsData.dictionaries.aircraft;
          let btnHandler;
          let button;
          let button2 = { exist: false };
          let btnHandler2;

          if (sharedData.return) {
            if (isReturn) {
              btnHandler = () => toggleDetails(flight, carriers,aircraft);
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
              btnHandler = () => toggleDetails(flight, carriers,aircraft);
              button = { text: "View Details", className: "detailsBtn" };
            }
          } else {
            btnHandler = () => toggleDetails(flight, carriers,aircraft);
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
                carriers={carriers}
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
  carriers: PropTypes.object,
  flight: PropTypes.object,
  btnHandler: PropTypes.func,
  btnHandler2: PropTypes.func,
  button: PropTypes.object,
  button2: PropTypes.object,
};
