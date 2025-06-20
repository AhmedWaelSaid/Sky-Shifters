import { useState, useEffect } from "react";
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
      
      const baggageDataFromState = formData.baggageSelection || {};
      let baggagePrice = 0;
      if (formData.baggageSelection) {
        if (formData.baggageSelection.departure || formData.baggageSelection.return) {
          baggagePrice += formData.baggageSelection.departure?.price || 0;
          baggagePrice += formData.baggageSelection.return?.price || 0;
        } else if (formData.baggageSelection.outbound || formData.baggageSelection.inbound) {
          baggagePrice += formData.baggageSelection.outbound?.price || 0;
          baggagePrice += formData.baggageSelection.inbound?.price || 0;
        } else {
          baggagePrice = formData.baggageSelection.price || 0;
        }
      }
      const baggageObjectForApi = {
        type: baggageDataFromState.type || "checked",
        weight: baggageDataFromState.weight || "23kg",
        price: baggagePrice,
        currency: baggageDataFromState.currency || "USD"
      };
      
      const basePrice = parseFloat(flight?.departure?.data?.price?.grandTotal) || 0;
      let addOnsPrice = 0;
      if (formData.addOns?.insurance) {
        addOnsPrice += 27 * passengers.filter(p => p.type !== 'infant').length;
      }
      if (formData.priorityBoarding) {
        addOnsPrice += 6.99 * passengers.length;
      }
      if (formData.addOns?.stayDiscount) {
        addOnsPrice += 5 * passengers.length;
      }

      const specialServicesPrice =
        (formData.specialServices?.childSeat ? 15.99 : 0) +
        (formData.specialServices?.childMeal
          ? 8.99 * passengers.filter((p) => p.type === "child").length
          : 0) +
        (formData.specialServices?.stroller ? 0 : 0);
      
      const finalTotalPrice = basePrice + baggagePrice + addOnsPrice + specialServicesPrice;

      const finalBookingData = {
        flightID: flight?.departure?.data?.id || "FL123456",
        originAirportCode: sharedData?.departure?.origin?.airport?.iata,
        destinationAirportCode: sharedData?.departure?.dest?.airport?.iata,
        originCIty: sharedData?.departure?.origin?.airport?.city,
        destinationCIty: sharedData?.departure?.dest?.airport?.city,
        departureDate: flight?.departure?.data?.itineraries[0]?.segments[0]?.departure?.at?.split('T')[0],
        arrivalDate: flight?.departure?.data?.itineraries[0]?.segments?.slice(-1)[0]?.arrival?.at?.split('T')[0],
        selectedBaggageOption: baggageObjectForApi, 
        totalPrice: parseFloat(finalTotalPrice.toFixed(2)),
        currency: flight?.departure?.data?.price?.currency || "USD",
        travellersInfo: travellersInfoForApi,
        contactDetails: {
          email: formData.contactInfo.email,
          phone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`
        }
      };
      
      console.log("FINAL BOOKING DATA (All fixes applied):", finalBookingData);
      setFormData(prev => ({ ...prev, finalBookingData }));
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // إعادة حساب finalBookingData تلقائياً عند الدخول لخطوة الدفع
  useEffect(() => {
    if (currentStep === 4) {
      // إعادة بناء finalBookingData بنفس منطق handleContinue
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
      const baggageDataFromState = formData.baggageSelection || {};
      let baggagePrice = 0;
      if (formData.baggageSelection) {
        if (formData.baggageSelection.departure || formData.baggageSelection.return) {
          baggagePrice += formData.baggageSelection.departure?.price || 0;
          baggagePrice += formData.baggageSelection.return?.price || 0;
        } else if (formData.baggageSelection.outbound || formData.baggageSelection.inbound) {
          baggagePrice += formData.baggageSelection.outbound?.price || 0;
          baggagePrice += formData.baggageSelection.inbound?.price || 0;
        } else {
          baggagePrice = formData.baggageSelection.price || 0;
        }
      }
      const baggageObjectForApi = {
        type: baggageDataFromState.type || "checked",
        weight: baggageDataFromState.weight || "23kg",
        price: baggagePrice,
        currency: baggageDataFromState.currency || "USD"
      };
      const basePrice = parseFloat(flight?.departure?.data?.price?.grandTotal) || 0;
      
      let addOnsPrice = 0;
      if (formData.addOns?.insurance) {
        addOnsPrice += 27 * passengers.filter(p => p.type !== 'infant').length;
      }
      if (formData.priorityBoarding) {
        addOnsPrice += 6.99 * passengers.length;
      }
      if (formData.addOns?.stayDiscount) {
        addOnsPrice += 5 * passengers.length;
      }

      const specialServicesPrice =
        (formData.specialServices?.childSeat ? 15.99 : 0) +
        (formData.specialServices?.childMeal
          ? 8.99 * passengers.filter((p) => p.type === "child").length
          : 0) +
        (formData.specialServices?.stroller ? 0 : 0);
      
      const finalTotalPrice = basePrice + baggagePrice + addOnsPrice + specialServicesPrice;
      const finalBookingData = {
        flightID: flight?.departure?.data?.id || "FL123456",
        originAirportCode: sharedData?.departure?.origin?.airport?.iata,
        destinationAirportCode: sharedData?.departure?.dest?.airport?.iata,
        originCIty: sharedData?.departure?.origin?.airport?.city,
        destinationCIty: sharedData?.departure?.dest?.airport?.city,
        departureDate: flight?.departure?.data?.itineraries[0]?.segments[0]?.departure?.at?.split('T')[0],
        arrivalDate: flight?.departure?.data?.itineraries[0]?.segments?.slice(-1)[0]?.arrival?.at?.split('T')[0],
        selectedBaggageOption: baggageObjectForApi, 
        totalPrice: parseFloat(finalTotalPrice.toFixed(2)),
        currency: flight?.departure?.data?.price?.currency || "USD",
        travellersInfo: travellersInfoForApi,
        contactDetails: {
          email: formData.contactInfo.email,
          phone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`
        }
      };
      // إذا لم يكن finalBookingData موجود أو تغير السعر، حدثه
      if (!formData.finalBookingData || formData.finalBookingData.totalPrice !== finalBookingData.totalPrice) {
        setFormData(prev => ({ ...prev, finalBookingData }));
      }
    }
  }, [currentStep, passengers, formData, flight, sharedData]);

  return (
    <div className="page-container">
      <div className="booking-container">
        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />
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