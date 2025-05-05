
import React, { useState } from 'react';
import styles from './FinalDetails.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import { ChevronLeft, CreditCard, ShieldCheck } from 'lucide-react';

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
    
    // Baggage calculation based on the new baggageSelection object
    let baggageCost = 0;
    
    if (formData.baggageSelection) {
      baggageCost += (formData.baggageSelection.outbound?.price || 0);
      baggageCost += (formData.baggageSelection.inbound?.price || 0);
    }
    
    return {
      baseFare,
      addOns,
      specialServices,
      baggageUpgrade: baggageCost,
      taxes: 18.95 * passengers.length,
      total: baseFare + addOns + specialServices + baggageCost + (18.95 * passengers.length)
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
        <div className={styles.paymentSection}>
          <h2 className={styles.sectionTitle}>Payment Details</h2>
          
          <div className={styles.paymentMethods}>
            <button 
              className={`${styles.paymentMethod} ${paymentMethod === 'credit' ? styles.active : ''}`}
              onClick={() => setPaymentMethod('credit')}
            >
              <CreditCard size={20} />
              <span>Credit/Debit Card</span>
            </button>
            
            <button 
              className={`${styles.paymentMethod} ${paymentMethod === 'apple' ? styles.active : ''}`}
              onClick={() => setPaymentMethod('apple')}
            >
              <div className={styles.appleIcon}></div>
              <span>Apple Pay</span>
            </button>
            
            <button 
              className={`${styles.paymentMethod} ${paymentMethod === 'bank' ? styles.active : ''}`}
              onClick={() => setPaymentMethod('bank')}
            >
              <div className={styles.bankIcon}></div>
              <span>Bank Transfer</span>
            </button>
          </div>
          
          {paymentMethod === 'credit' && (
            <form className={styles.cardForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Card Number</label>
                <input 
                  type="text" 
                  name="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Card Holder Name</label>
                <input 
                  type="text" 
                  name="cardHolder" 
                  placeholder="John Doe" 
                  value={cardDetails.cardHolder}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    name="expiryDate" 
                    placeholder="MM/YY" 
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>CVV</label>
                  <input 
                    type="text" 
                    name="cvv" 
                    placeholder="123" 
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              {hasSpecialServices && (
                <div className={styles.specialServicesInfo}>
                  <h4>Special Services Selected</h4>
                  <ul>
                    {formData.specialServices?.childSeat && (
                      <li>Child Seat ($15.99)</li>
                    )}
                    {formData.specialServices?.childMeal && (
                      <li>Kids' Meal ($8.99 per child)</li>
                    )}
                    {formData.specialServices?.stroller && (
                      <li>Stroller Service (Free)</li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className={styles.termsCheckbox}>
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                  required
                />
                <label htmlFor="terms">
                  I agree to the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>
                </label>
              </div>
              
              <div className={styles.buttonGroup}>
                <button type="button" className={styles.backButton} onClick={onBack}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  type="submit" 
                  className={styles.payButton} 
                  disabled={!agreed}
                >
                  Pay ${priceDetails.total.toFixed(2)}
                </button>
              </div>
            </form>
          )}
          
          {paymentMethod === 'apple' && (
            <div className={styles.alternativePayment}>
              <p>Continue with Apple Pay at checkout</p>
              <button className={styles.payButton}>Continue</button>
            </div>
          )}
          
          {paymentMethod === 'bank' && (
            <div className={styles.alternativePayment}>
              <p>You'll receive bank transfer instructions after booking</p>
              <button className={styles.payButton}>Continue</button>
            </div>
          )}
        </div>
        
        <div className={styles.securityNote}>
          <div className={styles.securityIcon}>
            <ShieldCheck size={20} />
          </div>
          <p>Your payment information is secure. We use industry-standard encryption to protect your data.</p>
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
