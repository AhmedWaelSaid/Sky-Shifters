
import React from 'react';
import styles from './FlightSummary.module.css';
const FlightLeg = ({ type, date, airline, departure, arrival, duration, flightTime }) => {
  return (
    <div className={styles.flightSection}>
      <h4>{type}</h4>
      <div className={styles.flightInfo}>
        <div className={styles.date}>{date}</div>
        <div className={styles.airline}>
          <div className={styles.airlineLogo}></div>
          <span>{airline}</span>
        </div>
        
        <div className={styles.route}>
          <div className={styles.timeLocation}>
            <div className={styles.time}>{departure.time}<span>{departure.period}</span></div>
            <div className={styles.location}>{departure.code}</div>
          </div>
          
          <div className={styles.flightPath}>
            <div className={styles.duration}>{duration}</div>
            <div className={styles.path}>
              <div className={styles.line}></div>
              <div className={styles.planeIcon}>✈</div>
              <div className={styles.line}></div>
            </div>
            <div className={styles.flightTime}>{flightTime}</div>
          </div>
          
          <div className={styles.timeLocation}>
            <div className={styles.time}>{arrival.time}<span>{arrival.period}</span></div>
            <div className={styles.location}>{arrival.code}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightLeg;
