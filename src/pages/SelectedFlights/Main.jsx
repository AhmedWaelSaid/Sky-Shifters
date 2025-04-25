import styles from "./styles/main.module.css";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import submitIcon from "../../assets/submit.png";
import calenderIcon from "../../assets/calendar.png";
import stopIcon from "../../assets/stopLine.png";
import WeeklyPriceCalendar from "./CustomPriceCalender";
import { format } from "date-fns";
import { cheapestPrices } from "./data.jsx";

export function Main({ setCurrentPage, currentPage,filteredFlights,setFlightsData,updateSpecificDate }) {
  const flightsPerPage = 8;

  const [dateRange, setDateRange] = useState([
    new Date("2025-04-21"),
    new Date("2025-04-26"),
  ]);
  const [startDate, endDate] = dateRange;
  const [showPriceCalender, setShowPriceCalender] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2025-04-21");

  const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startIndex = (currentPage - 1) * flightsPerPage;
  const endIndex = startIndex + flightsPerPage;
  const currentFlights = filteredFlights.slice(startIndex, endIndex); //filter for pagination
  const lowestPrices = cheapestPrices()
    .filter((value) => value.hasFlights)
    .slice(0, 4);

  const calendarHandler = () => {
    showPriceCalender
      ? setShowPriceCalender(false)
      : setShowPriceCalender(true);
  };
  const calendarElementHandler = (date) => {
    setFlightsData(updateSpecificDate(date));
    setCurrentPage(1);
    setSelectedDate(date);
  };
  return (
    <div className={styles.main}>
      <div className={styles["main-header-container"]}>
        <form action="" className={styles.form}>
          <div className={styles["first-row"]}>
            <div className={styles.way}>
              <select name="way" defaultValue="one-way">
                <option value="one-way">➜ One way</option>
                <option value="round-trip">🔄 Round trip</option>
              </select>
            </div>
            <div className={styles.group}>
              <select name="group-number" defaultValue="1">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className={styles.seat}>
              <select name="class" defaultValue="economy">
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium </option>
                <option value="business-class">Business</option>
                <option value="first-class">First Class</option>
              </select>
            </div>
          </div>
          <div className={styles["second-row"]}>
            <div className={styles.location}>
              <div className={styles.from}>
                <select name="from" id="from">
                  <option value="houston">Houston(HOU)</option>
                  <option value="LA">Los Angeles(LAX)</option>
                </select>
              </div>
              <div className={styles.between}></div>
              <div className={styles.to}>
                <select name="to" id="to" defaultValue="LA">
                  <option value="houston">Houston(HOU)</option>
                  <option value="LA">Los Angeles(LAX)</option>
                </select>
              </div>
            </div>
            <div className={styles.calender}>
              <DatePicker
                name="date"
                className={styles["date-picker"]}
                showIcon
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                }}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 48 48"
                  >
                    <mask id="ipSApplication0">
                      <g
                        fill="none"
                        stroke="#fff"
                        strokeLinejoin="round"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          d="M40.04 22v20h-32V22"
                        ></path>
                        <path
                          fill="#fff"
                          d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
                        ></path>
                      </g>
                    </mask>
                    <path
                      fill="currentColor"
                      d="M0 0h48v48H0z"
                      mask="url(#ipSApplication0)"
                    ></path>
                  </svg>
                }
              />
            </div>
            <div className={styles["form-submit"]}>
              <button type="submit">
                <img src={submitIcon} alt="submit" />
              </button>
            </div>
          </div>
        </form>
        <div className={styles["calender-price-container"]}>
          {lowestPrices.map((value) => (
            <div
              className={`${styles["calender-element"]} ${
                selectedDate == value.date ? styles.selected : ""
              }`}
              key={value.date}
              onClick={() => calendarElementHandler(value.date)}
            >
              <div className={styles["calender-element-header"]}>
                {format(value.date, "ccc, d LLL")}
              </div>
              <div className={styles["calender-element-price"]}>
                {value.hasFlights ? `${value.price} USD` : "No Flights"}
              </div>
            </div>
          ))}
          <div className={styles.calenderIcon}>
            <button onClick={calendarHandler}>
              <img src={calenderIcon} alt="calender" />
            </button>
          </div>
        </div>
        {showPriceCalender && (
          <WeeklyPriceCalendar
            calendarElementHandler={calendarElementHandler}
            setShowPriceCalender={setShowPriceCalender}
          />
        )}
      </div>
      <div className={styles.mainBody}>
        {currentFlights.map((value) => {
          return (
            <div className={styles.flight} key={value.id}>
              <div className={styles.airLineContainer}>
                <div
                  className={styles.airLineIcon}
                  style={{ backgroundColor: value.iconColor }}
                ></div>
                <div className={styles.container}>
                  <div className={styles.airLine}>{value.airline}</div>
                  <div className={styles.baggage}>{value.baggage}</div>
                </div>
              </div>
              <div className={styles.flightTime}>
                <div>
                  {value.departure} - {value.arrival}
                </div>
                <div className={styles.totalFlightTime}>{value.duration}</div>
              </div>
              <div className={styles.stops}>
                <img src={stopIcon} alt="stopIcon" />
                <div>{value.stops}</div>
              </div>
              <div className={styles.flightPrice}>{value.price}</div>
              <button className={styles.detailsBtn}>View Details</button>
            </div>
          );
        })}
        <div className={styles.pagination}>
          {pages.map((page) => {
            return (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`${currentPage == page ? styles.active : ""}`}
              >
                {page}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
