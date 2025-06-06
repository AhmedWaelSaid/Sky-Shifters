import styles from "./styles/mainHeader.module.css";
import { useState, useRef, useEffect } from "react";
import submitIcon from "../../assets/submit.png";
import { ShowTopSearch } from "../Home/ShowTopSearch";
import { useAirports } from "../../helperFun";
import { useData } from "../../components/context/DataContext";
import { format, parseISO } from "date-fns";
import PropTypes from "prop-types";
import PassengerClass from "./Passengers.jsx";
import CustomDatePicker from "./CustomDatePicker.jsx";
import { FaPlaneDeparture, FaPlaneArrival, FaUser } from "react-icons/fa";
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
      className={styles[className]}
      onFocus={() => setFocus(true)}
      onBlur={() => {
        setFocus(false);
      }}
      value={value.text}
      onChange={(e) => setValue((prev) => ({ ...prev, text: e.target.value }))}
      placeholder={placeholder}
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

export default function MainHeader({isReturn,setAPISearch}) {
  const { sharedData, setSharedData } = useData();
  const [dates, setDates] = useState(
    sharedData.departure.date
      ? {
          departure: sharedData.departure.date,
          return: sharedData.return ? sharedData.return.date : null,
        }
      : { departure: format(new Date(), "yyyy-MM-dd"), return: null }
  );
  const { airports } = useAirports();
  const [originFocus, setOriginFocus] = useState(false);
  const [destFocus, setDestFocus] = useState(false);
  const [origin, setOrigin] = useState({ text: "" });
  const [dest, setDest] = useState({ text: "" });
  const [passengerClass, setPassengerClass] = useState(
    sharedData.passengerClass
      ? sharedData.passengerClass
      : {
          adults: 1,
          children: 0,
          infants: 0,
          class: { value: "ALL", text: "All" },
        }
  );
  const [passengerClassFocus, setPassengerClassFocus] = useState(false);
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

  function getPassengerNum() {
    const totalNum =
      passengerClass.adults + passengerClass.children + passengerClass.infants;
    if (totalNum == 1)
      return `${totalNum} Passenger - ${passengerClass.class.text}`;
    else return `${totalNum} Passengers - ${passengerClass.class.text}`;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (event.nativeEvent.submitter?.name === "flightSubmit") {
      if (origin.airport && dest.airport && dates.departure && !dates.return) {
        setSharedData({
          departure: { date: dates.departure, dest, origin },
          return: null,
          passengerClass,
        });
        setAPISearch({date: dates.departure, dest, origin ,passengerClass});
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
        setAPISearch({date: dates.departure, dest, origin ,passengerClass});
      }
    }
  }
  return (
    <div className={styles["main-header-container"]}>
      <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
        <div className={styles.from}>
          <FaPlaneDeparture className={styles.iconForm} />
          <AirportInput
            name="origin"
            className="origin"
            setFocus={setOriginFocus}
            setValue={setOrigin}
            value={origin}
            placeholder={
              sharedData.departure.origin
                ? sharedData.departure.origin.text
                : "Origin"
            }
          />
          {originFocus && (
            <ShowTopSearch
              set={setOrigin}
              keyWord={origin.text}
              airports={airports}
            />
          )}
        </div>
        <div className={styles.to}>
          <FaPlaneArrival className={styles.iconForm} />
          <AirportInput
            name="destination"
            className="destination"
            setFocus={setDestFocus}
            setValue={setDest}
            value={dest}
            placeholder={
              sharedData.departure.dest
                ? sharedData.departure.dest.text
                : "Destination"
            }
          />
          {destFocus && (
            <ShowTopSearch
              set={setDest}
              keyWord={dest.text}
              airports={airports}
            />
          )}
        </div>
        <div className={styles.calender}>
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
        <div className={styles.passengerContainer}>
          <FaUser className={styles.iconForm} />
          <input
            type="text"
            ref={inputRef}
            className={`${styles.passengerInput}`}
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
        <div className={styles["form-submit"]}>
          <button type="submit" name="flightSubmit" className={styles.flights}>
            <img src={submitIcon} alt="submit" />
          </button>
        </div>
      </form>

    </div>
  );
}
MainHeader.propTypes = {
  isReturn: PropTypes.bool,
}