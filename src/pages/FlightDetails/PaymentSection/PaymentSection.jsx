import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './paymentsection.module.css';
import { ChevronLeft } from 'lucide-react';
import { 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import { useData } from "../../../components/context/DataContext";

const ELEMENT_OPTIONS = {
  style: {
    base: {
      color: 'var(--Darktext-color)',
      fontSize: '14px',
      fontFamily: 'inherit',
      '::placeholder': { color: 'var(--LightDarktext-color)' },
    },
    invalid: { color: '#fa755a', iconColor: '#fa755a' },
  },
};

// Helper function to safely get price from pricing info
const getPriceFromPricingInfo = (pricingInfo) => {
  if (!pricingInfo?.price?.total) return 0;
  return Number(pricingInfo.price.total);
};

// Modified calculateTotalPrice to take flight from context, and passengers/formData from bookingData
function calculateTotalPrice(flightData, bookingData) {
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

const PaymentSection = ({ bookingData, onPaymentSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { flight } = useData();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [paymentIntentExpired, setPaymentIntentExpired] = useState(false);

  // Add function to handle payment intent errors
  const handlePaymentIntentError = (err) => {
    if (err.code === 'resource_missing' && err.type === 'invalid_request_error') {
      setPaymentIntentExpired(true);
      setError('Your payment session has expired. Please try again.');
      // Clear the expired client secret
      setClientSecret('');
    } else {
      setError(err.message || 'An error occurred during payment. Please try again.');
    }
  };

  useEffect(() => {
    if (!bookingData) {
      console.warn("PaymentSection: bookingData is missing.");
      return;
    }
    if (!flight) {
      console.warn("PaymentSection: flight data from DataContext is missing.");
      return;
    }

    const processBookingAndPaymentIntent = async () => {
      setLoading(true);
      setError('');
      setPaymentIntentExpired(false);
      try {
        // --- ✨ هذا هو السطر الذي قمنا بتعديله ---
        // 1. اقرأ كائن المستخدم كاملاً من localStorage
        const userString = localStorage.getItem('user');
        // 2. حوله من نص إلى كائن
        const userData = userString ? JSON.parse(userString) : null;
        // 3. استخرج التوكن من داخل الكائن
        const token = userData ? userData.token : '';
        // -----------------------------------------

        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        // --- إنشاء الحجز ---
        const bookingUrl = new URL('/booking/book-flight', import.meta.env.VITE_API_BASE_URL).toString();
        const bookingResponse = await axios.post(bookingUrl, bookingData, { headers });

        if (!bookingResponse.data.success) throw new Error(bookingResponse.data.message || 'Failed to create booking.');
        
        const newBookingId = bookingResponse.data.data.bookingId;
        setBookingId(newBookingId);
        
        // --- إنشاء نية الدفع ---
        const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
        const intentResponse = await axios.post(paymentIntentUrl, {
          bookingId: newBookingId,
          amount: calculateTotalPrice(flight, bookingData),
          currency: bookingData.currency,
        }, { headers: { 'Authorization': `Bearer ${token}` } });
        
        if (!intentResponse.data.success) throw new Error(intentResponse.data.message || 'Failed to create payment intent.');

        setClientSecret(intentResponse.data.data.clientSecret);

      } catch (err) {
        console.error('Error during booking or payment-intent creation:', err);
        handlePaymentIntentError(err);
      } finally {
        setLoading(false);
      }
    };

    processBookingAndPaymentIntent();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData, flight]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system is not ready.');
      return;
    }
    setLoading(true);
    setError('');
    setPaymentIntentExpired(false);

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumberElement, billing_details: { name: cardHolderName } },
      });

      if (stripeError) {
        handlePaymentIntentError(stripeError);
        setLoading(false);
        return;
      }
      
      if (paymentIntent.status === 'succeeded') {
        try {
          const userString = localStorage.getItem('user');
          const userData = userString ? JSON.parse(userString) : null;
          const token = userData ? userData.token : '';

          const confirmUrl = new URL('/payment/confirm-payment', import.meta.env.VITE_API_BASE_URL).toString();
          const confirmResponse = await axios.post(confirmUrl, 
            { paymentIntentId: paymentIntent.id, bookingId: bookingId },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (confirmResponse.data.success) {
            onPaymentSuccess(confirmResponse.data.data);
          } else {
            throw new Error(confirmResponse.data.message || 'Booking confirmation failed.');
          }
        } catch (err) {
          setError(err.message || 'An error occurred on our server.');
        }
      } else {
        setError(`Payment failed. Status: ${paymentIntent.status}`);
      }
    } catch (err) {
      handlePaymentIntentError(err);
    } finally {
      setLoading(false);
    }
  };

  // Add retry button handler
  const handleRetry = () => {
    setPaymentIntentExpired(false);
    setError('');
    // Trigger the useEffect by updating bookingData
    if (bookingData) {
      const updatedBookingData = { ...bookingData };
      processBookingAndPaymentIntent();
    }
  };



  return (
    <div className={styles.paymentSection}>
      <h2 className={styles.sectionTitle}>Payment Details</h2>
      
      {paymentIntentExpired ? (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error}</div>
          <button 
            onClick={handleRetry} 
            className={styles.retryButton}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Try Again'}
          </button>
        </div>
      ) : (
        <form className={styles.cardForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Card Number</label>
            <div className={styles.inputContainer}><CardNumberElement options={ELEMENT_OPTIONS} /></div>
          </div>
          <div className={styles.formGroup}>
            <label>Card Holder Name</label>
            <input 
              type="text"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              placeholder="John Doe"
              required
              className={styles.formGroupInput} 
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Expiry Date</label>
              <div className={styles.inputContainer}><CardExpiryElement options={ELEMENT_OPTIONS} /></div>
            </div>
            <div className={styles.formGroup}>
              <label>CVV</label>
              <div className={styles.inputContainer}><CardCvcElement options={ELEMENT_OPTIONS} /></div>
            </div>
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.backButton} onClick={onBack}>
              <ChevronLeft size={16} /> Back
            </button>
            <button type="submit" className={styles.payButton} disabled={!stripe || loading || !clientSecret || !flight}>
              {loading ? 'Processing...' : `Pay ${calculateTotalPrice(flight, bookingData).toFixed(2)} ${bookingData?.currency}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

PaymentSection.propTypes = {
  bookingData: PropTypes.object,
  onPaymentSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default PaymentSection;