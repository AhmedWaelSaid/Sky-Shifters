
import React, { useState } from 'react';
import './PassengerDetailsForm.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import { ChevronRight, Plus } from 'lucide-react';
import PassengerDetails from '../PassengerDetails/PassengerDetails';

const PassengerDetailsForm = ({ 
  passengers, 
  onUpdatePassenger, 
  onUpdateForm, 
  formData,
  onContinue 
}) => {
  const [contactData, setContactData] = useState({
    email: '',
    code: '',
    mobile: '',
    bookingForSomeoneElse: false
  });
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setContactData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    onUpdateForm('contactInfo', { [name]: newValue });
  };
  
  const handleContinueClick = (e) => {
    e.preventDefault();
    onContinue();
  };

  // Calculate counts for displaying
  console.log(passengers)
  const adultCount = passengers.filter(p => p.type === 'adult').length;
  const childCount = passengers.filter(p => p.type === 'child').length;

  // Create separate indices for adults and children
  const adultIndices = {};
  const childIndices = {};
  const infantIndices = {};
  
  passengers.forEach(passenger => {
    if (passenger.type === 'adult') {
      if (!adultIndices[passenger.id]) {
        adultIndices[passenger.id] = Object.keys(adultIndices).length + 1;
      }
    } else if (passenger.type === 'child'){
      if (!childIndices[passenger.id]) {
        childIndices[passenger.id] = Object.keys(childIndices).length + 1;
      }
    }
    else {
      if (!infantIndices[passenger.id]) {
        infantIndices[passenger.id] = Object.keys(infantIndices).length + 1;
      }
    }
  });

  return (
    <div className="passenger-details-container">
      <div className="main-content">
        <div className="left-section">
          <div className="warning-box">
            <div className="warning-icon">!</div>
            <div className="warning-text">
              <h4>Important flight information</h4>
              <p>Please be advised that there are additional charges (applicable of $9.99 per passenger per flight for fly Badala fare in order to obtain at the airport</p>
            </div>
          </div>

          {passengers.map((passenger) => (
            <PassengerDetails
              key={passenger.id}
              passengerId={passenger.id}
              passengerType={passenger.type}
              passengerIndex={passenger.type === 'adult' ? adultIndices[passenger.id] : passenger.type === 'child' ? childIndices[passenger.id] : infantIndices[passenger.id]}
              updateDetails={(id, details) => onUpdatePassenger(id, details)}
            />
          ))}
          
          
          <div className="contact-section">
            <h3>Contact details</h3>
            <div className="booking-toggle">
              <span>I`m booking for someone else</span>
              <label className="switch">
                <input 
                  type="checkbox"
                  name="bookingForSomeoneElse"
                  checked={contactData.bookingForSomeoneElse}
                  onChange={handleInputChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email*" 
                  value={contactData.email}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
                <p className="email-note">Your purchased tickets will be sent to this email.</p>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group phone-group">
                <select 
                  name="code" 
                  value={contactData.code}
                  onChange={handleInputChange}
                  className="form-select code-select" 
                  required
                >
                  <option value="">Code*</option>
                  <option value="+966">+966</option>
                  <option value="+971">+971</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
                <input 
                  type="tel" 
                  name="mobile" 
                  placeholder="Mobile Number*" 
                  value={contactData.mobile}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="continue-button-container">
            <button className="continue-button" onClick={handleContinueClick}>
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="right-section">
          <FlightSummary 
            passengers={passengers} 
            formData={formData} 
            onContinue={onContinue}
          />
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsForm;
