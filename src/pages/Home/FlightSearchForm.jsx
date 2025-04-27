import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // استيراد useNavigate
import styles from "./FlightSearchForm.module.css";
import { csvToJson } from "../../helperFun.jsx";
import { ShowTopSearch } from "./ShowTopSearch.jsx";
import { useEffect, useState } from "react";

export default function FlightSearchForm() {
  const [airports, setAirports] = useState([]);
  const [originFocus, setOriginFocus] = useState(false);
  const [destFocus, setDestFocus] = useState(false);
  const [origin, setOrigin] = useState({});
  const [dest, setDest] = useState({});
  const [isSelecting, setIsSelecting] = useState(false);

  const navigate = useNavigate(); // استخدام useNavigate للتنقل
  useEffect(() => {
    fetch("/airports.dat")
      .then((response) => response.text())
      .then((csv) => {
        const airportsArray = csvToJson(csv);
        console.log(airportsArray.filter((data) => data.iata == "DOH"));
        setAirports(airportsArray);
      })
      .catch((err) => console.error("Error loading airports", err));
  }, []);
  return (
    <>
      <div className={styles.flyFormContainer}>
        <div className={styles.formTitle}>Where are You Flying ?</div>
        <form className={styles.flightSearchForm}>
          <div className={styles.formGroup}>
            <label htmlFor="origin">From</label>
            <div className={styles.inputContainer}>
              <FaPlaneDeparture className={styles.iconForm} />
              <input
                type="text"
                name="origin"
                id="origin"
                className={styles.cityInput}
                onFocus={() => setOriginFocus(true)}
                onBlur={() => {
                  setOriginFocus(false);
                }}
                value={origin.text}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin"
              />
              {originFocus && (
                <ShowTopSearch
                  set={setOrigin}
                  setIsSelecting={setIsSelecting}
                />
              )}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="destination">To</label>
            <div className={styles.inputContainer}>
              <FaPlaneArrival className={styles.iconForm} />
              <input
                type="text"
                name="destination"
                id="destination"
                className={styles.cityInput}
                onFocus={() => setDestFocus(true)}
                onBlur={() => setDestFocus(false)}
                value={dest.text}
                onChange={(e) =>
                  setDest((prev) => ({ ...prev, text: e.target.value }))
                }
                placeholder="Destination"
              />
              {destFocus && <ShowTopSearch set={setDest} />}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Date</label>
            <div className={styles.inputContainer}>
              <FaCalendarAlt className={styles.iconForm} />
              <input
                type="date"
                defaultValue="2025-02-22"
                className={styles.baseInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Passengers - Class</label>
            <div className={styles.inputContainer}>
              <FaUser className={styles.iconForm} />
              <select className={styles.selectInput}>
                <option>2 Passengers - Economy</option>
                <option>1 Passenger - Business</option>
              </select>
            </div>
          </div>
        </form>
        <div className={styles.showFlights}>
          <button
            className={styles.flights}
            type="submit"
            onClick={() => navigate("/selected-flights")} // التنقل لصفحة /selected-flights
          >
            Show Flights
          </button>
        </div>
      </div>
    </>
  );
}
