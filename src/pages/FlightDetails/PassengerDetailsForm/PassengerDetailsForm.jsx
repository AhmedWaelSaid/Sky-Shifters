import { useState, useEffect, useRef } from "react";
import "./PassengerDetailsForm.css";
import FlightSummary from "../FlightSummary/FlightSummary";
import { ChevronRight, Plus } from "lucide-react";
import PassengerDetails from "../PassengerDetails/PassengerDetails";
import { getNames } from "country-list";

const PassengerDetailsForm = ({
  passengers,
  onUpdatePassenger,
  onUpdateForm,
  formData,
  onContinue,
  passengerRefs,
  setPassengerRef,
  setFareSelectionIndex,
  fareSelectionIndex,
}) => {
  const contactFormRef = useRef(null);
  const [contactData, setContactData] = useState(
    formData.contactInfo?.email
      ? formData.contactInfo
      : {
          email: "",
          code: "",
          mobile: "",
          bookingForSomeoneElse: false,
        }
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setContactData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    onUpdateForm("contactInfo", { [name]: newValue });
  };

  const handleContinueClick = (e) => {
    e.preventDefault();
    const isValid = contactFormRef.current?.reportValidity();
    if (!isValid) {
      return;
    }
    onContinue();
  };
  useEffect(() => {
    // This ensures all child components are mounted with their refs
    console.log("PassengerDetails mounted with refs:", passengerRefs.current);
  }, [passengerRefs]);
  // Calculate counts for displaying
  console.log(passengers);
  const adultCount = passengers.filter((p) => p.type === "adult").length;
  const childCount = passengers.filter((p) => p.type === "child").length;

  // Create separate indices for adults and children
  const adultIndices = {};
  const childIndices = {};
  const infantIndices = {};

  passengers.forEach((passenger) => {
    if (passenger.type === "adult") {
      if (!adultIndices[passenger.id]) {
        adultIndices[passenger.id] = Object.keys(adultIndices).length + 1;
      }
    } else if (passenger.type === "child") {
      if (!childIndices[passenger.id]) {
        childIndices[passenger.id] = Object.keys(childIndices).length + 1;
      }
    } else {
      if (!infantIndices[passenger.id]) {
        infantIndices[passenger.id] = Object.keys(infantIndices).length + 1;
      }
    }
  });

  const countryOptions = getNames().map((name) => ({
    value: name,
    label: name,
  }));
  return (
    <div className="passenger-details-container">
      <div className="main-content">
        <div className="left-section">
          {passengers.map((passenger) => (
            <PassengerDetails
              key={passenger.id}
              passenger={passenger}
              passengerId={passenger.id}
              passengerType={passenger.type}
              passengerIndex={
                passenger.type === "adult"
                  ? adultIndices[passenger.id]
                  : passenger.type === "child"
                    ? childIndices[passenger.id]
                    : infantIndices[passenger.id]
              }
              updateDetails={(id, details) => onUpdatePassenger(id, details)}
              ref={setPassengerRef(passenger.id)}
              formData={formData}
            />
          ))}
          <form onSubmit={handleContinueClick} ref={contactFormRef}>
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
                  <p className="email-note">
                    Your purchased tickets will be sent to this email.
                  </p>
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
                    <option value="+20">+20 Egypt (مصر)</option>
                    <option value="+966">+966 Saudi Arabia (السعودية)</option>
                    <option value="+971">+971 UAE (الإمارات)</option>
                    <option value="+965">+965 Kuwait (الكويت)</option>
                    <option value="+974">+974 Qatar (قطر)</option>
                    <option value="+973">+973 Bahrain (البحرين)</option>
                    <option value="+968">+968 Oman (عمان)</option>
                    <option value="+962">+962 Jordan (الأردن)</option>
                    <option value="+961">+961 Lebanon (لبنان)</option>
                    <option value="+963">+963 Syria (سوريا)</option>
                    <option value="+964">+964 Iraq (العراق)</option>
                    <option value="+212">+212 Morocco (المغرب)</option>
                    <option value="+213">+213 Algeria (الجزائر)</option>
                    <option value="+216">+216 Tunisia (تونس)</option>
                    <option value="+218">+218 Libya (ليبيا)</option>
                    <option value="+249">+249 Sudan (السودان)</option>
                    <option value="+967">+967 Yemen (اليمن)</option>
                    <option value="+970">+970 Palestine (فلسطين)</option>
                    <option value="+1">+1 USA/Canada</option>
                    <option value="+44">+44 UK</option>
                    <option value="+33">+33 France</option>
                    <option value="+49">+49 Germany</option>
                    <option value="+39">+39 Italy</option>
                    <option value="+34">+34 Spain</option>
                    <option value="+90">+90 Turkey (تركيا)</option>
                  </select>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Mobile Number*"
                    pattern="[0-9]{6,15}"
                    value={contactData.mobile}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="continue-button-container">
              <button className="continue-button" type="submit">
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </form>
        </div>
        <div className="right-section">
          <FlightSummary
            passengers={passengers}
            formData={formData}
            onContinue={handleContinueClick}
            onUpdateForm={onUpdateForm}
            setFareSelectionIndex={setFareSelectionIndex}
            fareSelectionIndex={fareSelectionIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsForm;
