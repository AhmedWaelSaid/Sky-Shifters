import { useState } from "react";
import PassengerDetailsForm from "./PassengerDetailsForm/PassengerDetailsForm";
import UpgradeExperience from "./UpgradeExperience/UpgradeExperience";
import FinalDetails from "./FinalDetails/FinalDetails";
import StepIndicator from "./StepIndicator/StepIndicator";
import "./FlightDetails.css";
import { useData } from "../../components/context/DataContext";

// --- ✨ 1. تم حذف الدالة المساعدة countryNameToIsoCode من هنا ---

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
      // --- ✨ 2. الآن نرسل اسم الدولة مباشرة كما هو ✨ ---
      const travellersInfoForApi = passengers.map(p => ({
        firstName: p.details.firstName,
        lastName: p.details.lastName,
        birthDate: p.details.dateOfBirth,
        travelerType: p.type,
        nationality: p.details.nationality,
        issuingCountry: p.details.issuingCountry,
        passportNumber: p.details.passportNumber,
        expiryDate: p.details.passportExpiry,
      }));

      const baggageDataFromState = formData.baggageSelection || {};
      const baggageObjectForApi = {
        type: baggageDataFromState.type || "checked",
        weight: baggageDataFromState.weight || "23kg",
        price: baggageDataFromState.price || 0,
        currency: baggageDataFromState.currency || "USD"
      };

      const finalBookingData = {
        flightID: flight?.id || "FL123456",
        originAirportCode: sharedData?.departure?.origin?.airport?.iata,
        destinationAirportCode: sharedData?.departure?.dest?.airport?.iata,
        originCIty: sharedData?.departure?.origin?.airport?.city,
        destinationCIty: sharedData?.departure?.dest?.airport?.city,
        departureDate: flight?.departure?.data?.itineraries[0]?.segments[0]?.departure?.at?.split('T')[0],
        arrivalDate: flight?.departure?.data?.itineraries[0]?.segments?.slice(-1)[0]?.arrival?.at?.split('T')[0],
        selectedBaggageOption: baggageObjectForApi, 
        totalPrice: parseFloat(flight?.price?.grandTotal) || 0,
        currency: flight?.price?.currency || "USD",
        travellersInfo: travellersInfoForApi,
        contactDetails: {
          email: formData.contactInfo.email,
          phone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`
        }
      };
      
      console.log("FINAL BOOKING DATA (Using Full Country Name):", finalBookingData);

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