// src/components/FlightSearchForm.jsx
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUser } from "react-icons/fa";
import styles from './FlightSearchForm.module.css';

export default function FlightSearchForm() {
  return (
    <>
      <div className={styles.flyFormContainer}>
        <div className={styles.formTitle}>Where are You Flying ?</div>
        <form className={styles.flightSearchForm}>
          <div className={styles.formGroup}>
            <label>From</label>
            <div className={styles.inputContainer}>
              <FaPlaneDeparture className={styles.iconForm} />
              <select className={styles.selectInput}>
                <option>Shahjalal International Airport, Bangladesh</option>
                <option>Qatar International Airport, Qatar</option>
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>To</label>
            <div className={styles.inputContainer}>
              <FaPlaneArrival className={styles.iconForm} />
              <select className={styles.selectInput}>
                <option>Qatar International Airport, Qatar</option>
                <option>Shahjalal International Airport, Bangladesh</option>
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Date</label>
            <div className={styles.inputContainer}>
              <FaCalendarAlt className={styles.iconForm} />
              <input type="date" defaultValue="2025-02-22" className={styles.baseInput} />
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
          <button className={styles.flights} type="submit">Show Flights</button>
        </div>
      </div>
    </>
  );
}