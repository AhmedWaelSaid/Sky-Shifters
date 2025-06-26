import { FaPlaneDeparture, FaPlaneArrival, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // استيراد useNavigate
import styles from "./FlightSearchForm.module.css";
import { useAirports } from "../../helperFun.jsx";
import { ShowTopSearch } from "./ShowTopSearch.jsx";
import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useData } from "../../components/context/DataContext.jsx";
import PropTypes from "prop-types";
import PassengerClass from "../SelectedFlights/Passengers.jsx";
import CustomDatePicker from "../SelectedFlights/CustomDatePicker.jsx";

export function AirportInput({
  name,
  className,
  setFocus,
  setValue,
  placeholder,
  value,
}) {
  return (
    <input
      type="text"
      name={name}
      id={name}
      className={`${styles[className]} ${value.isTextCorrect ? "" : styles.invalid}`}
      onFocus={() => setFocus(true)}
      onBlur={() => {
        setFocus(false);
      }}
      value={value.text}
      onChange={(e) =>
        setValue((prev) => ({
          ...prev,
          text: e.target.value,
          isTextCorrect: false,
          error:""
        }))
      }
      placeholder={placeholder}
      required
    />
  );
}

AirportInput.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  setFocus: PropTypes.func,
  setValue: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.object,
};

export default function FlightSearchForm() {
  const { airports } = useAirports();
  const [originFocus, setOriginFocus] = useState(false);
  const [destFocus, setDestFocus] = useState(false);
  const [origin, setOrigin] = useState({ text: "", isTextCorrect: false });
  const [dest, setDest] = useState({ text: "", isTextCorrect: false });
  const [dates, setDates] = useState({
    departure: format(new Date(), "yyyy-MM-dd"),
    return: null,
  });
  const [passengerClass, setPassengerClass] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    class: { value: "ECONOMY", text: "Economy" },
  });
  const [passengerClassFocus, setPassengerClassFocus] = useState(false);
  const { setSharedData } = useData();
  const navigate = useNavigate(); // استخدام useNavigate للتنقل
  function getPassengerNum() {
    const totalNum =
      passengerClass.adults + passengerClass.children + passengerClass.infants;
    if (totalNum == 1)
      return `${totalNum} Passenger - ${passengerClass.class.text}`;
    else return `${totalNum} Passengers - ${passengerClass.class.text}`;
  }
  function getValues(airport) {
    return {
      airport,
      text:
        (airport.city && airport.city + `, `) +
        airport.country +
        ` - ` +
        airport.name,
      error: "",
      isTextCorrect: true,
    };
  }
  function handleSubmit(event) {
    event.preventDefault();
    // Add additional check to prevent accidental submits
    if (event.nativeEvent.submitter?.className?.includes(styles.flights)) {
      if (
        origin.text.trim() == "" ||
        dest.text.trim() == "" ||
        !origin.airport ||
        !dest.airport || !origin.isTextCorrect ||!dest.isTextCorrect
      ) {
        console.log("hi")
        if (origin.text.trim() == "")
          {
            setOrigin({
            ...origin,
            error: "Empty field! Please select an airport from the list.",
          });}
        if (dest.text.trim() == "")
          setDest({
            ...dest,
            error: "Empty field! Please select an airport from the list.",
          });
        if ((!origin.airport || !origin.isTextCorrect) && origin.text.trim() != "")
          setOrigin({
            ...origin,
            error: "Incorrect Airport! Please select a valid airport from the list.",
          });
        if ((!dest.airport|| !dest.isTextCorrect) && dest.text.trim() != "")
        {
          setDest({
          ...dest,
          error: "Incorrect Airport! Please select a valid airport from the list.",
        });}
        return;
      }
      if (origin.airport && dest.airport && dates.departure && !dates.return) {
        setSharedData({
          departure: { date: dates.departure, dest, origin },
          return: null,
          passengerClass,
        });
        navigate("/selected-flights");
      } else if (
        origin.airport &&
        dest.airport &&
        dates.departure &&
        dates.return
      ) {
        setSharedData({
          departure: { date: dates.departure, dest, origin },
          return: { date: dates.return, dest: origin, origin: dest },
          passengerClass,
        });
        navigate("/selected-flights");
      }
    }
  }
  const popupRef = useRef(null);
  const inputRef = useRef(null);

  // Close popup when clicking outside
  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      // Also check if the click wasn't on the input
      if (inputRef.current !== event.target) {
        setPassengerClassFocus(false);
      }
    }
  };

  // Set up event listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={styles.flyFormContainer}>
        <div className={styles.formTitle}>Where are You Flying ?</div>
        <form
          className={styles.flightSearchForm}
          autoComplete="off"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={styles.container}>
            <div className={styles.formGroup}>
              <label htmlFor="origin">From</label>
              <div className={styles.inputContainer}>
                <FaPlaneDeparture className={styles.iconForm} />
                <AirportInput
                  name="origin"
                  className="cityInput"
                  setFocus={setOriginFocus}
                  setValue={setOrigin}
                  placeholder="Origin"
                  value={origin}
                />
                {originFocus && (
                  <ShowTopSearch
                    set={setOrigin}
                    keyWord={origin.text}
                    airports={airports}
                    getValues={getValues}
                  />
                )}
              </div>
              <span className={styles.error}>{origin.error}</span>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="destination">To</label>
              <div className={styles.inputContainer}>
                <FaPlaneArrival className={styles.iconForm} />
                <AirportInput
                  name="destination"
                  className="cityInput"
                  setFocus={setDestFocus}
                  setValue={setDest}
                  placeholder="Destination"
                  value={dest}
                />
                {destFocus && (
                  <ShowTopSearch
                    set={setDest}
                    keyWord={dest.text}
                    airports={airports}
                    getValues={getValues}
                  />
                )}
              </div>
              <span className={styles.error}>{dest.error}</span>
            </div>

            <div className={styles.formGroup}>
              <label>Date</label>
              <div className={styles.inputContainer}>
                <CustomDatePicker
                  value={{
                    departure: parseISO(dates.departure),
                    return: dates.return ? parseISO(dates.return) : null,
                  }}
                  onChange={(newDates) => {
                    setDates({
                      departure: format(newDates.departure, "yyyy-MM-dd"),
                      return: newDates.return
                        ? format(newDates.return, "yyyy-MM-dd")
                        : null,
                    });
                  }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Passengers - Class</label>
              <div className={styles.inputContainer}>
                <FaUser className={styles.iconForm} />
                <input
                  type="text"
                  ref={inputRef}
                  className={`${styles.cityInput} ${styles.passengerInput}`}
                  value={getPassengerNum()}
                  onClick={() => setPassengerClassFocus(!passengerClassFocus)}
                  readOnly
                />
                {passengerClassFocus && (
                  <div
                    ref={popupRef}
                    className={styles.passengerClassContainer}
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                  >
                    <PassengerClass
                      passengerClass={passengerClass}
                      setPassengerClass={setPassengerClass}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.showFlights}>
            <button
              className={styles.flights}
              type="submit"
              // التنقل لصفحة /selected-flights
            >
              Show Flights
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
