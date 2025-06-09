import { useState } from "react";
import PassengerDetailsForm from "./PassengerDetailsForm/PassengerDetailsForm";
import UpgradeExperience from "./UpgradeExperience/UpgradeExperience";
import FinalDetails from "./FinalDetails/FinalDetails";
import StepIndicator from "./StepIndicator/StepIndicator";
import "./FlightDetails.css";
import { useData } from "../../components/context/DataContext";

const Index = () => {
  const { sharedData, flight } = useData();

  const getPassengerArr = () => {
    const passengerObj = sharedData?.passengerClass || { adults: 1, children: 0, infants: 0 };
    const passengerArr = [];
    let id = 1;
    for (let i = 0; i < passengerObj.adults; i++) {
      passengerArr.push({ type: "adult", id: id++, details: {} });
    }
    for (let i = 0; i < passengerObj.children; i++) {
      passengerArr.push({ type: "child", id: id++, details: {} });
    }
    for (let i = 0; i < passengerObj.infants; i++) {
      passengerArr.push({ type: "infant", id: id++, details: {} });
    }
    return passengerArr;
  };

  const [passengers, setPassengers] = useState(getPassengerArr());
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState({
    contactInfo: {},
    addOns: {},
    specialServices: {},
    priorityBoarding: false,
    baggageSelection: {},
    finalBookingData: null 
  });

  const updatePassengerDetails = (id, newDetails) => {
    setPassengers(
      passengers.map((passenger) =>
        passenger.id === id
          ? { ...passenger, details: { ...passenger.details, ...newDetails } }
          : passenger
      )
    );
  };

  const updateFormData = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleContinue = () => {
    if (currentStep === 3) {
      const travellersInfoForApi = passengers.map(p => ({
        firstName: p.details.firstName,
        lastName: p.details.lastName,
        birthDate: p.details.dateOfBirth,
        travelerType: p.type,
        nationality: p.details.nationality,
        passportNumber: p.details.passportNumber,
        issuingCountry: p.details.issuingCountry,
        expiryDate: p.details.passportExpiry,
      }));

      const finalBookingData = {
        flightID: flight?.id || "FL123456",
        originAirportCode: sharedData?.departure?.origin?.airport?.iata,
        destinationAirportCode: sharedData?.departure?.dest?.airport?.iata,
        // --- ✨ تم تصحيح الخطأ الإملائي هنا ✨ ---
        originCity: sharedData?.departure?.origin?.airport?.city,
        destinationCity: sharedData?.departure?.dest?.airport?.city,
        // ------------------------------------
        departureDate: flight?.departure?.data?.itineraries[0]?.segments[0]?.departure?.at?.split('T')[0],
        arrivalDate: flight?.departure?.data?.itineraries[0]?.segments?.slice(-1)[0]?.arrival?.at?.split('T')[0],
        selectedBaggageOption: formData.baggageSelection?.departure || {}, 
        totalPrice: parseFloat(flight?.price?.grandTotal) || 0,
        currency: flight?.price?.currency || "USD",
        travellersInfo: travellersInfoForApi,
        contactDetails: {
          email: formData.contactInfo.email,
          phone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`
        }
      };
      
      console.log("FINAL BOOKING DATA (Corrected for final docs):", finalBookingData);

      setFormData(prev => ({ ...prev, finalBookingData }));
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  return (
    <div className="page-container">
      <div className="booking-container">
        <StepIndicator currentStep={currentStep} />
        {currentStep === 2 && (
          <PassengerDetailsForm
            passengers={passengers}
            onUpdatePassenger={updatePassengerDetails}
            onUpdateForm={updateFormData}
            formData={formData}
            onContinue={handleContinue}
          />
        )}
        {currentStep === 3 && (
          <UpgradeExperience
            passengers={passengers}
            formData={formData}
            onUpdateForm={updateFormData}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
          <FinalDetails
            passengers={passengers}
            formData={formData}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default Index;