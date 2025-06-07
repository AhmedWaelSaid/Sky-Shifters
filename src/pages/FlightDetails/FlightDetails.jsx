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
        gender: p.details.title === 'mr' ? 'M' : 'F',
        firstName: p.details.firstName,
        middleName: p.details.middleName || '',
        lastName: p.details.lastName,
        birthDate: p.details.dateOfBirth,
        nationality: p.details.nationality,
        passportNumber: p.details.passportNumber,
        issuingCountry: p.details.nationality,
        expiryDate: p.details.passportExpiry,
        contactEmail: formData.contactInfo.email,
        contactPhone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`
      }));

      const finalBookingData = {
        flightID: flight?.id || "F9123",
        originAirportCode: sharedData?.departure?.origin?.airport?.iata,
        destinationAirportCode: sharedData?.departure?.dest?.airport?.iata,
        originCIty: sharedData?.departure?.origin?.airport?.city,
        destinationCIty: sharedData?.departure?.dest?.airport?.city,
        departureDate: flight?.departure?.data?.itineraries[0]?.segments[0]?.departure?.at,
        arrivalDate: flight?.departure?.data?.itineraries[0]?.segments?.slice(-1)[0]?.arrival?.at,
        currency: flight?.price?.currency || "USD",
        totalPrice: parseFloat(flight?.price?.grandTotal) || 0,
        applicationFee: parseFloat(flight?.price?.serviceFees) || 15.99,
        travellersInfo: travellersInfoForApi,
        selectedBaggageOption: formData.baggageSelection
      };
      
      console.log("FINAL DATA READY FOR PAYMENT:", finalBookingData);

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

        {/* --- ✨ هذا هو التعديل الوحيد والمهم --- */}
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