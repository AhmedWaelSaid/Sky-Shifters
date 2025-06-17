import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './paymentsection.module.css';
import { ChevronLeft } from 'lucide-react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import { useData } from '../../../components/context/DataContext.jsx';

// Helper function to safely get price from pricing info
const getPriceFromPricingInfo = (pricingInfo) => {
  if (!pricingInfo?.price?.total) return 0;
  return Number(pricingInfo.price.total);
};

// Calculate total price (exported لاستخدامه في FinalDetails)
export function calculateTotalPrice(flightData, bookingData) {
  let baseFareTotal = 0;
  const passengers = bookingData.travellersInfo || [];
  const formData = bookingData.formData || {};

  if (flightData?.departure?.data?.travelerPricings) {
    passengers.forEach((passenger, index) => {
      const departurePricingInfo = flightData.departure.data.travelerPricings[index];
      let price = getPriceFromPricingInfo(departurePricingInfo);

      if (flightData.return?.data?.travelerPricings?.[index]) {
        const returnPricingInfo = flightData.return.data.travelerPricings[index];
        price += getPriceFromPricingInfo(returnPricingInfo);
      }
      baseFareTotal += price;
    });
  }

  const totalBaggageCost = bookingData?.selectedBaggageOption?.price || 0;
  const addOns = (formData.addOns?.insurance ? 4.99 * passengers.length : 0);
  const specialServices = (formData.specialServices?.childSeat ? 15.99 : 0);

  const total = baseFareTotal + addOns + specialServices + totalBaggageCost;
  return total;
}

const PaymentSection = ({ bookingData, onPaymentSuccess, onBack, isLoading, clientSecret, bookingId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { flight } = useData();

  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isCardElementReady, setIsCardElementReady] = useState(false);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      setError("Stripe.js has not loaded yet. Please wait a moment and try again.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (cardElement == null) {
      console.error("Card Element not found.");
      setError("Payment form is not ready. Please wait a moment and try again.");
      setProcessing(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingData.contactDetails?.email ? bookingData.contactDetails.email.split('@')[0] : 'Guest',
            email: bookingData.contactDetails?.email || 'guest@example.com',
          },
        },
      }
    );

    if (stripeError) {
      console.error("Stripe Error:", stripeError);
      setError(stripeError.message);
    } else {
      console.log("Payment Succeeded:", paymentIntent);
      setError('');
      onPaymentSuccess({
        bookingId,
        paymentIntentId: paymentIntent.id,
        stripeStatus: paymentIntent.status,
      });
    }

    setProcessing(false);
  };
  
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'var(--Darktext-color)',
        '::placeholder': {
          color: 'var(--LightDarktext-color)',
        },
      },
      invalid: {
        color: '#dc2626',
      },
    },
  };

  return (
    <div className={styles.paymentSection}>
      <h2 className={styles.sectionTitle}>Payment Details</h2>
      
      <form className={styles.cardForm} onSubmit={handleSubmit}>
        {clientSecret ? (
          <div className={styles.formGroup}>
            <label htmlFor="card-element" className={styles.formLabel}>Card Details</label>
            <CardElement 
              id="card-element"
              options={cardElementOptions}
              onReady={() => {
                console.log("✅ Card Element is ready.");
                setIsCardElementReady(true);
              }}
            />
          </div>
        ) : (
          <div className={styles.loadingPaymentElement}>
            <p>Initializing payment form...</p>
          </div>
        )}
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            className={styles.backButton} 
            onClick={onBack}
            disabled={processing}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button 
            type="submit" 
            className={styles.payButton}
            disabled={!stripe || !clientSecret || processing || !isCardElementReady}
          >
            {processing ? 'Processing...' : `Pay ${bookingData ? calculateTotalPrice(flight, bookingData).toFixed(2) : '0.00'} USD`}
          </button>
        </div>
      </form>
    </div>
  );
};

PaymentSection.propTypes = {
  bookingData: PropTypes.object,
  onPaymentSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  clientSecret: PropTypes.string,
  bookingId: PropTypes.string,
};

export default PaymentSection;