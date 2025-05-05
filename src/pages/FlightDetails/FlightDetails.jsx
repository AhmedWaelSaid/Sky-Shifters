
import  { useState } from 'react';
import PassengerDetailsForm from '../FlightDetails/PassengerDetailsForm/PassengerDetailsForm';
import UpgradeExperience from '../FlightDetails/UpgradeExperience/UpgradeExperience';
import FinalDetails from '../FlightDetails/FinalDetails/FinalDetails';
import StepIndicator from '../FlightDetails/StepIndicator/StepIndicator';
import './FlightDetails.css';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [passengers, setPassengers] = useState([
    { type: 'adult', id: 1, details: {} }
  ]);
  const [formData, setFormData] = useState({
    contactInfo: {},
    addOns: {
      insurance: false,
      stayDiscount: false
    },
    specialServices: {
      childSeat: false,
      childMeal: false,
      stroller: false
    },
    priorityBoarding: false,
    baggageSelection: {
      outbound: { id: 1, weight: '0kg', price: 0, description: 'Only cabin baggage', included: true },
      inbound: { id: 1, weight: '0kg', price: 0, description: 'Only cabin baggage', included: true },
      totalPrice: 0
    }
  });

  const handleAddPassenger = (type) => {
    const newId = passengers.length + 1;
    setPassengers([...passengers, { type, id: newId, details: {} }]);
  };

  const handleRemovePassenger = (id) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(passenger => passenger.id !== id));
    }
  };

  const updatePassengerDetails = (id, details) => {
    setPassengers(passengers.map(passenger => 
      passenger.id === id ? { ...passenger, details: { ...passenger.details, ...details } } : passenger
    ));
  };

  const updateFormData = (section, data) => {
    setFormData({
      ...formData,
      [section]: { ...formData[section], ...data }
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
            onAddPassenger={handleAddPassenger}
            onRemovePassenger={handleRemovePassenger}
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
