import React, { useState } from 'react';
import styles from './FinalDetails.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import { ChevronLeft, CreditCard, ShieldCheck } from 'lucide-react';
import PaymentSection from '../PaymentSection/PaymentSection';

const FinalDetails = ({ passengers, formData, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [agreed, setAgreed] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };
  
  const calculateTotal = () => {
    // Calculate base fare for different age groups
    let baseFare = 0;
    
    // Calculate fare based on passenger type and age group
    passengers.forEach(passenger => {
      const ageGroup = passenger.details?.ageGroup || '';
      
      if (passenger.type === 'adult') {
        baseFare += 142.50; // Adult full price
      } else if (passenger.type === 'child') {
        if (ageGroup === 'infant') {
          // Infant (under 2): 15% of adult fare
          baseFare += 142.50 * 0.15;
        } else if (ageGroup === 'child') {
          // Child (2-11): 75% of adult fare
          baseFare += 142.50 * 0.75;
        } else if (ageGroup === 'adolescent') {
          // Adolescent (12+): Full adult fare
          baseFare += 142.50;
        } else {
          // Default child fare if age group not specified (75% of adult fare)
          baseFare += 142.50 * 0.75;
        }
      }
    });
    
    // Add-ons calculation
    const addOns = 
      (formData.addOns?.insurance ? 4.99 * passengers.length : 0) +
      (formData.priorityBoarding ? 6.99 * passengers.length : 0);
    
    // Special services calculation
    const specialServices = 
      (formData.specialServices?.childSeat ? 15.99 : 0) +
      (formData.specialServices?.childMeal ? 8.99 * passengers.filter(p => p.type === 'child').length : 0) +
      (formData.specialServices?.stroller ? 0 : 0); // Strollers are typically free
    
    return {
      baseFare,
      addOns,
      specialServices,
      taxes: 18.95 * passengers.length,
      total: baseFare + addOns + specialServices + (18.95 * passengers.length)
    };
  };
  
  const priceDetails = calculateTotal();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Booking completed! Thank you for your purchase.');
    // Here you would typically process the payment and submit the booking
  };

  // Check if there are any special child services selected
  const hasSpecialServices = formData.specialServices && 
    (formData.specialServices.childSeat || 
     formData.specialServices.childMeal || 
     formData.specialServices.stroller);

  return (
    <div className={styles.finalDetails}>
      <div className={styles.mainContent}>
       <div>
        <PaymentSection />
       </div>
        
       
      </div>
      
      <div className={styles.sidebar}>
        <FlightSummary 
          passengers={passengers} 
          formData={formData}
          onBack={onBack}
          showBackButton={false}
          showContinueButton={false}
        />
      </div>
    </div>
  );
};

export default FinalDetails;
