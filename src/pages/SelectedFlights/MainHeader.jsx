import styles from "./styles/mainHeader.module.css";
import { useState, useRef, useEffect } from "react";
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
      className={`${styles[className]} ${value.isTextCorrect ? "" : styles.invalid}`}
      onFocus={(e) => {
        e.target.select();
        setFocus(true);
      }}
      onBlur={() => {
        setFocus(false);
      }}
      value={value.text}
      onChange={(e) =>
        setValue((prev) => ({
          ...prev,
          text: e.target.value,
          isTextCorrect: false,
          error: "",
        }))
      }
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

export default function MainHeader({ setAPISearch, setIsReturn ,setHasUserSearched}) {
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
  const [origin, setOrigin] = useState({ text: "", isTextCorrect: false });
  const [dest, setDest] = useState({ text: "", isTextCorrect: false });
  const [passengerClass, setPassengerClass] = useState(
    sharedData.passengerClass
      ? sharedData.passengerClass
      : {
          adults: 1,
          children: 0,
          infants: 0,
          class: { value: "ECONOMY", text: "Economy" },
        }
  );
  useEffect(() => {
    if (sharedData.departure) {
      setOrigin(sharedData.departure.origin);
      setDest(sharedData.departure.dest);
    }
  }, [sharedData]);

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
    if (event.nativeEvent.submitter?.name === "flightSubmit") {
      if (
        (origin.text.trim() == "" && !origin.airport) ||
        (dest.text.trim() == "" && !dest.airport) ||
        !origin.airport ||
        !dest.airport ||
        !origin.isTextCorrect ||
        !dest.isTextCorrect
      ) {
        if (origin.text.trim() == "") {
          setOrigin({
            ...origin,
            error: "Empty field! Please select an airport from the list.",
          });
        }
        if (dest.text.trim() == "")
          setDest({
            ...dest,
            error: "Empty field! Please select an airport from the list.",
          });
        if (
          (!origin.airport || !origin.isTextCorrect) &&
          origin.text.trim() != ""
        )
          setOrigin({
            ...origin,
            error:
              "Incorrect Airport! Please select a valid airport from the list.",
          });
        if ((!dest.airport || !dest.isTextCorrect) && dest.text.trim() != "") {
          setDest({
            ...dest,
            error:
              "Incorrect Airport! Please select a valid airport from the list.",
          });
        }
        return;
      }
      if (origin.airport && dest.airport && dates.departure && !dates.return) {
        setHasUserSearched(true);
        setSharedData((prev) => ({
          ...prev,
          departure: { date: dates.departure, dest, origin },
          return: null,
          passengerClass,
        }));
        setIsReturn(false);
        setAPISearch({
          date: dates.departure,
          dest,
          origin,
          passengerClass,
          currency: sharedData.currency,
        });
      } else if (
        origin.airport &&
        dest.airport &&
        dates.departure &&
        dates.return
      ) {
        setHasUserSearched(true);
        setSharedData((prev) => ({
          ...prev,
          departure: { date: dates.departure, dest, origin },
          return: { date: dates.return, dest: origin, origin: dest },
          passengerClass,
        }));
        setIsReturn(false);
        setAPISearch({
          date: dates.departure,
          dest,
          origin,
          passengerClass,
          currency: sharedData.currency,
        });
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
              getValues={getValues}
            />
          )}
          <span className={styles.error}>{origin.error}</span>
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
              getValues={getValues}
            />
          )}
          <span className={styles.error}>{dest.error}</span>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>magnify</title>
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
MainHeader.propTypes = {
  setAPISearch: PropTypes.func,
  setIsReturn: PropTypes.func,
  setHasUserSearched: PropTypes.func,
};
