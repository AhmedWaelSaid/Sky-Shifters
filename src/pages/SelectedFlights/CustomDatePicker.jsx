import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import { format, addDays, addMonths, isAfter, isBefore, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import styles from "./styles/CustomDatePicker.module.css";

export default function CustomDatePicker({ 
  value = { departure: new Date(), return: null },
  onChange 
}) {
  const [dates, setDates] = useState({
    departure: value.departure,
    return: value.return
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  // Handle clicks outside the calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveInput(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (date) => {
    if (!date) return "Add return";
    return format(date, "MMM d EEEE");
  };

  const handleDateSelect = (date) => {
    if (activeInput === "departure") {
      const newDates = { 
        departure: date,
        return: dates.return 
          ? isAfter(date, dates.return) 
            ? addDays(date, 1) 
            : dates.return
          : null
      };
      setDates(newDates);
      onChange(newDates);
    } else if (activeInput === "return") {
      const newDates = { ...dates, return: date };
      setDates(newDates);
      onChange(newDates);
    }
    
    setIsOpen(false);
    setActiveInput(null);
  };

  const toggleReturnDate = () => {
    if (dates.return) {
      const newDates = { ...dates, return: null };
      setDates(newDates);
      onChange(newDates);
    } else {
      const newDates = { 
        ...dates, 
        return: addDays(dates.departure, 1) 
      };
      setDates(newDates);
      onChange(newDates);
    }
  };

  const changeMonth = (offset) => {
    setCurrentMonth(addMonths(currentMonth, offset));
  };

  const generateDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const isDateDisabled = (date) => {
    if (activeInput === "return") {
      return isBefore(date, dates.departure);
    }
    return false;
  };

  return (
    <div className={styles.datePickerContainer} ref={calendarRef}>
      <div className={styles.displayDates}>
        <div 
          className={`${styles.dateDisplay} ${activeInput === "departure" && styles.active}`}
          onClick={() => {
            setIsOpen(true);
            setActiveInput("departure");
            setCurrentMonth(dates.departure);
          }}
        >
          <div className={styles.dateLabel}>Departure</div>
          <div className={styles.dateValue}>{formatDisplayDate(dates.departure)}</div>
        </div>
        
        {dates.return ? (
          <>
            <div className={styles.dateSeparator}>→</div>
            <div 
              className={`${styles.dateDisplay} ${activeInput === "return" && styles.active}`}
              onClick={() => {
                setIsOpen(true);
                setActiveInput("return");
                setCurrentMonth(dates.return || dates.departure);
              }}
            >
              <div className={styles.dateLabel}>Return</div>
              <div className={styles.dateValue}>{formatDisplayDate(dates.return)}</div>
            </div>
            <button 
              className={styles.removeReturnButton}
              onClick={(e) => {
                e.stopPropagation();
                toggleReturnDate();
              }}
            >
              ×
            </button>
          </>
        ) : (
          <button 
            className={styles.addReturnButton}
            onClick={(e) => {
              e.stopPropagation();
              toggleReturnDate();
            }}
          >
            + Add return
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.calendarPopup}>
          <div className={styles.calendarHeader}>
            <button 
              className={styles.navButton}
              onClick={() => changeMonth(-1)}
            >
              &lt;
            </button>
            <div className={styles.monthYear}>
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <button 
              className={styles.navButton}
              onClick={() => changeMonth(1)}
            >
              &gt;
            </button>
          </div>
          <div className={styles.calendarGrid}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
              <div key={day} className={styles.weekdayHeader}>{day}</div>
            ))}
            {generateDays().map((day) => {
              const isDeparture = dates.departure && isSameDay(day, dates.departure);
              const isReturn = dates.return && isSameDay(day, dates.return);
              const isInRange = dates.return && 
                isAfter(day, dates.departure) && 
                isBefore(day, dates.return);
              const isDisabled = isDateDisabled(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <div
                  key={day.toString()}
                  className={`
                    ${styles.calendarDay}
                    ${isCurrentMonth ? "" : styles.otherMonthDay}
                    ${isDeparture && styles.departureDay}
                    ${isReturn && styles.returnDay}
                    ${isInRange && styles.inRangeDay}
                    ${isDisabled && styles.disabledDay}
                  `}
                  onClick={() => isCurrentMonth && !isDisabled && handleDateSelect(day)}
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
CustomDatePicker.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
}