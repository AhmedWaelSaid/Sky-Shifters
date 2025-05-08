import { useState } from "react";
import PassengerDetailsForm from "../FlightDetails/PassengerDetailsForm/PassengerDetailsForm";
import UpgradeExperience from "../FlightDetails/UpgradeExperience/UpgradeExperience";
import FinalDetails from "../FlightDetails/FinalDetails/FinalDetails";
import StepIndicator from "../FlightDetails/StepIndicator/StepIndicator";
import "./FlightDetails.css";
import { useData } from "../../components/context/DataContext";

const Index = () => {
  
  const { sharedData } = useData();
  function getPassengerArr() {
    const passengerObj = sharedData.passengerClass;
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
  }
  const [passengers,setPassengers] = useState(getPassengerArr());
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState({
    contactInfo: {},
    addOns: {
      insurance: false,
      stayDiscount: false,
    },
    specialServices: {
      childSeat: false,
      childMeal: false,
      stroller: false,
    },
    priorityBoarding: false,
    baggageSelection: {
      outbound: {
        id: 1,
        weight: "0kg",
        price: 0,
        description: "Only cabin baggage",
        included: true,
      },
      inbound: {
        id: 1,
        weight: "0kg",
        price: 0,
        description: "Only cabin baggage",
        included: true,
      },
      totalPrice: 0,
    },
  });


  const updatePassengerDetails = (id, details) => {
    setPassengers(
      passengers.map((passenger) =>
        passenger.id === id
          ? { ...passenger, details: { ...passenger.details, ...details } }
          : passenger
      )
    );
  };

  const updateFormData = (section, data) => {
    setFormData({
      ...formData,
      [section]: { ...formData[section], ...data },
    });
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
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
