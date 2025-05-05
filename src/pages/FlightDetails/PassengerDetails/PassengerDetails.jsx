
import React, { useState } from 'react';
import styles from './PassengerDetails.module.css';
import { X, User, Baby } from 'lucide-react';

const PassengerDetails = ({ 
  passengerId, 
  passengerType, 
  passengerIndex,
  updateDetails,
  onRemove
}) => {
  const [details, setDetails] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    ageGroup: passengerType === 'child' ? 'child' : '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: ''
  });

  const [dobFields, setDobFields] = useState({
    day: '',
    month: '',
    year: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...details, [name]: value };
    setDetails(updatedDetails);
    updateDetails(passengerId, { [name]: value });
  };

  const handleDobChange = (e) => {
    const { name, value } = e.target;
    const newDobFields = { ...dobFields, [name]: value };
    setDobFields(newDobFields);
    
    // Only update the full date if all fields are filled
    if (name === 'day' || name === 'month' || name === 'year') {
      // Check if we have all fields to make a date
      if (newDobFields.day && newDobFields.month && newDobFields.year) {
        const monthIndex = {
          'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
          'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        }[newDobFields.month];
        
        if (monthIndex !== undefined) {
          const formattedDate = `${newDobFields.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(newDobFields.day).padStart(2, '0')}`;
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
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Nationality options
  const nationalities = [
    'Saudi Arabia', 'United Arab Emirates', 'United States', 'United Kingdom', 
    'Egypt', 'India', 'Pakistan'
  ];

  // Date fields for passport expiry
  const [expiryFields, setExpiryFields] = useState({
    day: '',
    month: '',
    year: ''
  });

  const handleExpiryChange = (e) => {
    const { name, value } = e.target;
    const newExpiryFields = { ...expiryFields, [name]: value };
    setExpiryFields(newExpiryFields);
    
    // Only update the full date if all fields are filled
    if (newExpiryFields.day && newExpiryFields.month && newExpiryFields.year) {
      const monthIndex = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
      }[newExpiryFields.month];
      
      if (monthIndex !== undefined) {
        const formattedDate = `${newExpiryFields.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(newExpiryFields.day).padStart(2, '0')}`;
        const updatedDetails = { ...details, passportExpiry: formattedDate };
        setDetails(updatedDetails);
        updateDetails(passengerId, { passportExpiry: formattedDate });
      }
    }
  };

  return (
    <div className={styles.passengerCard}>
      <div className={styles.passengerHeader}>
        <h3>
          {passengerType === 'adult' ? (
            <><span className={styles.passengerIcon}><User size={16} /></span> Adult {passengerIndex}</>
          ) : (
            <><span className={styles.passengerIcon}><Baby size={16} /></span> Child {passengerIndex}</>
          )}
        </h3>
        {onRemove && (
          <button 
            className={styles.removeButton}
            onClick={() => onRemove(passengerId)}
            aria-label="Remove passenger"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className={styles.passengerForm}>
        {passengerType === 'adult' && (
          <div>
            <h4>Personal details</h4>
            <div className={styles.titleSelector}>
              <button
                type="button"
                className={`${styles.titleButton} ${details.title === 'mr' ? styles.selected : ''}`}
                onClick={() => handleTitleClick('mr')}
              >
                Mr
              </button>
              <button
                type="button"
                className={`${styles.titleButton} ${details.title === 'ms' ? styles.selected : ''}`}
                onClick={() => handleTitleClick('ms')}
              >
                Ms
              </button>
              <button
                type="button"
                className={`${styles.titleButton} ${details.title === 'mrs' ? styles.selected : ''}`}
                onClick={() => handleTitleClick('mrs')}
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
              value={dobFields.day}
              onChange={handleDobChange}
              className={styles.formSelect}
              required
            >
              <option value="">Day*</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <select
              name="month"
              value={dobFields.month}
              onChange={handleDobChange}
              className={styles.formSelect}
              required
            >
              <option value="">Month*</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <select
              name="year"
              value={dobFields.year}
              onChange={handleDobChange}
              className={styles.formSelect}
              required
            >
              <option value="">Year*</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {passengerType === 'child' && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <select 
                name="ageGroup"
                value={details.ageGroup}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                <option value="">Age Group*</option>
                <option value="infant">Infant (under 2 years)</option>
                <option value="child">Child (2-11 years)</option>
                <option value="adolescent">Adolescent (12+ years)</option>
              </select>
            </div>
          </div>
        )}
        
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
              {nationalities.map(nationality => (
                <option key={nationality} value={nationality}>{nationality}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <input 
              type="text"
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
              {days.map(day => (
                <option key={`expiry-day-${day}`} value={day}>{day}</option>
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
              {months.map(month => (
                <option key={`expiry-month-${month}`} value={month}>{month}</option>
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
              {Array.from({ length: 20 }, (_, i) => currentYear + i).map(year => (
                <option key={`expiry-year-${year}`} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
