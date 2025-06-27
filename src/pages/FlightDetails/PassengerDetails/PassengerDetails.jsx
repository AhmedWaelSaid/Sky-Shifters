import { useEffect, useState } from "react";
import styles from "./PassengerDetails.module.css";
import { X, User, Baby, ChevronDown, ChevronUp } from "lucide-react";
import { getNames } from "country-list";

const PassengerDetails = ({
  passengerId,
  passengerType,
  passengerIndex,
  updateDetails,
  formRef,
  passenger,
}) => {
  const [details, setDetails] = useState(passenger.details? passenger.details :{
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    ageGroup: passengerType === "child" ? "child" : "",
    dateOfBirth: "",
    nationality: "",
    issuingCountry: "",
    passportNumber: "",
    passportExpiry: "",
    day:"",
    month:"",
    year:"",
  });



  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...details, [name]: value };
    setDetails(updatedDetails);
    updateDetails(passengerId, { [name]: value });
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDobChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...details, [name]: value };
    setDetails(updatedDetails);
    updateDetails(passengerId, { [name]: value });

    // Only update the full date if all fields are filled
    if (name === "day" || name === "month" || name === "year") {
      // Check if we have all fields to make a date
      if (passenger.details.day && passenger.details.month && passenger.details.year) {
        const monthIndex = {
          January: 0,
          February: 1,
          March: 2,
          April: 3,
          May: 4,
          June: 5,
          July: 6,
          August: 7,
          September: 8,
          October: 9,
          November: 10,
          December: 11,
        }[passenger.details.month];

        if (monthIndex !== undefined) {
          const formattedDate = `${passenger.details.year}-${String(monthIndex + 1).padStart(2, "0")}-${String(passenger.details.day).padStart(2, "0")}`;
          const updatedDetails = { ...details, dateOfBirth: formattedDate };
          setDetails(updatedDetails);
          updateDetails(passengerId, { dateOfBirth: formattedDate });
        }
      }
    }
  };

  const handleTitleClick = (title) => {
    const updatedDetails = { ...details, title };
    setDetails(updatedDetails);
    updateDetails(passengerId, { title });
  };
  // Generate arrays for day, month, year selectors
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Nationality options
  const nationalities = getNames();

  // Date fields for passport expiry
  const [expiryFields, setExpiryFields] = useState({
    day: "",
    month: "",
    year: "",
  });
  useEffect(()=>{
    if (passenger.details){
      const expiryDate = passenger.details.passportExpiry.split("-");
      let year = expiryDate[0];
      let month = expiryDate[1];
      let day =expiryDate[2];
      if (month.split("")[0] == "0")
        month = month.split("")[1];
      if (day.includes(0))
        day = day.split("")[1];
      month =month-1;
      console.log(month)
      setExpiryFields({day,month:months[month],year})
    }
  },[])
  const handleExpiryChange = (e) => {
    const { name, value } = e.target;
    const newExpiryFields = { ...expiryFields, [name]: value };
    setExpiryFields(newExpiryFields);

    // Only update the full date if all fields are filled
    if (newExpiryFields.day && newExpiryFields.month && newExpiryFields.year) {
      const monthIndex = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
      }[newExpiryFields.month];

      if (monthIndex !== undefined) {
        const formattedDate = `${newExpiryFields.year}-${String(monthIndex + 1).padStart(2, "0")}-${String(newExpiryFields.day).padStart(2, "0")}`;
        const updatedDetails = { ...details, passportExpiry: formattedDate };
        setDetails(updatedDetails);
        updateDetails(passengerId, { passportExpiry: formattedDate });
      }
    }
  };
  return (
    <div className={styles.passengerCard}>
      <div className={styles.passengerHeader} onClick={handleToggleCollapse}>
        <h3>
          {passengerType === "adult" ? (
            <>
              <span className={styles.passengerIcon}>
                <User size={16} />
              </span>{" "}
              Adult {passengerIndex}
            </>
          ) : passengerType === "child" ? (
            <>
              <span className={styles.passengerIcon}>
                <Baby size={16} />
              </span>{" "}
              Child {passengerIndex}
            </>
          ) : (
            <>
              <span className={styles.passengerIcon}>
                <Baby size={16} />
              </span>{" "}
              Infant {passengerIndex}
            </>
          )}
        </h3>
        <div className={styles.collapseIcon}>
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>

      <form
        className={`${styles.passengerForm} ${isCollapsed ? styles.collapsed : ""}`}
        autoComplete="off"
        ref={formRef}
      >
        {passengerType === "adult" && (
          <div>
            <h4>Personal details</h4>
            <div className={styles.titleSelector}>
              <button
                type="button"
                className={`${styles.titleButton} ${details.title === "mr" ? styles.selected : ""}`}
                onClick={() => handleTitleClick("mr")}
              >
                Mr
              </button>
              <button
                type="button"
                className={`${styles.titleButton} ${details.title === "ms" ? styles.selected : ""}`}
                onClick={() => handleTitleClick("ms")}
              >
                Ms
              </button>
              <button
                type="button"
                className={`${styles.titleButton} ${details.title === "mrs" ? styles.selected : ""}`}
                onClick={() => handleTitleClick("mrs")}
              >
                Mrs
              </button>
            </div>
          </div>
        )}

        <div className={styles.sectionTitle}>Full Name</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="firstName"
              value={details.firstName}
              onChange={handleChange}
              placeholder="First name*"
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="middleName"
              value={details.middleName}
              onChange={handleChange}
              placeholder="Middle name (optional)"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="lastName"
              value={details.lastName}
              onChange={handleChange}
              placeholder="Last name*"
              className={styles.formInput}
              required
            />
          </div>
        </div>

        <div className={styles.sectionTitle}>Date of Birth</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <select
              name="day"
              value={details.day}
              onChange={handleDobChange}
              className={styles.formSelect}
              required
            >
              <option value="">Day*</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <select
              name="month"
              value={details.month}
              onChange={handleDobChange}
              className={styles.formSelect}
              required
            >
              <option value="">Month*</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <select
              name="year"
              value={details.year}
              onChange={handleDobChange}
              className={styles.formSelect}
              required
            >
              <option value="">Year*</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.sectionTitle}>Passport Information</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <select
              name="nationality"
              value={details.nationality}
              onChange={handleChange}
              className={styles.formSelect}
              required
            >
              <option value="">Nationality*</option>
              {nationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <select
              name="issuingCountry"
              value={details.issuingCountry}
              onChange={handleChange}
              className={styles.formSelect}
              required
            >
              <option value="">Issuing Country*</option>
              {nationalities.map((country) => (
                <option key={`issue-${country}`} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <input
              type="number"
              name="passportNumber"
              value={details.passportNumber}
              onChange={handleChange}
              placeholder="Passport Number*"
              className={styles.formInput}
              required
            />
          </div>
        </div>

        <div className={styles.sectionTitle}>Passport Expiry Date</div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <select
              name="day"
              value={expiryFields.day}
              onChange={handleExpiryChange}
              className={styles.formSelect}
              required
            >
              <option value="">Day*</option>
              {days.map((day) => (
                <option key={`expiry-day-${day}`} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <select
              name="month"
              value={expiryFields.month}
              onChange={handleExpiryChange}
              className={styles.formSelect}
              required
            >
              <option value="">Month*</option>
              {months.map((month) => (
                <option key={`expiry-month-${month}`} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <select
              name="year"
              value={expiryFields.year}
              onChange={handleExpiryChange}
              className={styles.formSelect}
              required
            >
              <option value="">Year*</option>
              {Array.from({ length: 20 }, (_, i) => currentYear + i).map(
                (year) => (
                  <option key={`expiry-year-${year}`} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PassengerDetails;
