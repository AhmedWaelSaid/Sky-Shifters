import React, { useState } from "react";
import { format, addDays, eachDayOfInterval, isSameDay } from "date-fns";
import styles from "./styles/customPriceCalender.module.css";
import { cheapestPrices } from "./data.jsx";

const mockPrices = {};
const dataFormatted = cheapestPrices();
dataFormatted.forEach((data) => {
  mockPrices[data.date] = data.price;
});
export default function FlightPriceCalendar({
  calendarElementHandler,
  setShowPriceCalender,
}) {
  const [currentDate, setCurrentDate] = useState(dataFormatted[0].date);
  const [selectedDate, setSelectedDate] = useState(dataFormatted[0].date);
  const [priceData] = useState(mockPrices);

  const weekDays = eachDayOfInterval({
    start: currentDate,
    end: addDays(currentDate, 6),
  });

  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const cheapestDay = weekDays.reduce(
    (cheapest, day) => {
      const currentPrice = priceData[format(day, "yyyy-MM-dd")];
      if (currentPrice == null || currentPrice== undefined) return cheapest;
      if (cheapest.price === Infinity) {
        return { date: day, price: currentPrice };
      }
      return currentPrice < cheapest.price
        ? { date: day, price: currentPrice }
        : cheapest;
    },
    { price: Infinity }
  );

  return (
    <div className={styles["flight-calendar"]}>
      <div className={styles["calendar-header"]}>
        <button onClick={prevWeek} className={styles["nav-button"]}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
          </svg>
        </button>

        <div className={styles["header-date"]}>
          <h2>{format(currentDate, " MMMM yyyy")}</h2>
          <button onClick={goToToday} className={styles["today-button"]}>
            Today
          </button>
        </div>

        <button onClick={nextWeek} className={styles["nav-button"]}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </button>
      </div>

      <div className={styles["week-days-header"]}>
        {weekDays.map((day) => (
          <div key={day.toString()} className={styles["day-name"]}>
            {format(day, "EEE")}
          </div>
        ))}
      </div>

      <div className={styles["week-grid"]}>
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const price = priceData[dateKey];
          const isCheapest = isSameDay(day, cheapestDay.date);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={day.toString()}
              className={`${styles["day-cell"]} 
                ${isSameDay(day, new Date()) ? styles.today : ""}
                ${isSelected ? styles.selected : ""}
                ${isCheapest ? styles.cheapest : ""}
              `}
              onClick={() => {
                setSelectedDate(day);
                calendarElementHandler(dateKey);
                setShowPriceCalender(false);
              }}
            >
              <div className={styles["day-date"]}>{format(day, "d")}</div>
              <div className={styles["day-price"]}>
                ${price?.toFixed(2) || "N/A"}
              </div>
              {isCheapest && <div className={styles["price-badge"]}>Best</div>}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className={styles["selected-info"]}>
          Selected: {format(selectedDate, "EEEE, MMMM d")} - Price: $
          {priceData[format(selectedDate, "yyyy-MM-dd")]?.toFixed(2)}
        </div>
      )}
    </div>
  );
}
