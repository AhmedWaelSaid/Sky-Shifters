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
import {format} from "date-fns";
import { useData } from "../../components/context/DataContext.jsx";

export default function FlightSearchForm() {
  const [airports, setAirports] = useState([]);
  const [originFocus, setOriginFocus] = useState(false);
  const [destFocus, setDestFocus] = useState(false);
  const [origin, setOrigin] = useState({ text: "" });
  const [dest, setDest] = useState({ text: "" });
  const [date, setDate] = useState(format(new Date(), "u-LL-dd"));
  const {setSharedData} = useData();

  const navigate = useNavigate(); // استخدام useNavigate للتنقل
  useEffect(() => {
    fetch("/airports.dat")
      .then((response) => response.text())
      .then((csv) => {
        const airportsArray = csvToJson(csv);
        setAirports(airportsArray);
      })
      .catch((err) => console.error("Error loading airports", err));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (origin.airport && dest.airport){
    setSharedData({origin,dest,date});
    navigate("/selected-flights")
    }
  }

  return (
    <>
      <div className={styles.flyFormContainer}>
        <div className={styles.formTitle}>Where are You Flying ?</div>
        <form
          className={styles.flightSearchForm}
          autoComplete="off"
          onSubmit={handleSubmit}
        >
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
                onChange={(e) =>
                  setOrigin((prev) => ({ ...prev, text: e.target.value }))
                }
                placeholder="Origin"
              />
              {originFocus && (
                <ShowTopSearch
                  set={setOrigin}
                  keyWord={origin.text}
                  airports={airports}
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
              {destFocus && (
                <ShowTopSearch
                  set={setDest}
                  keyWord={dest.text}
                  airports={airports}
                />
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Date</label>
            <div className={styles.inputContainer}>
              <FaCalendarAlt className={styles.iconForm} />
              <input
                type="date"
                defaultValue={date}
                onChange={(e) => {
                  setDate(e.target.value);
                }}
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
