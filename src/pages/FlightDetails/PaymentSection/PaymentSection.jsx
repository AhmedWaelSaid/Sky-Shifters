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
  const [paymentIntentId, setPaymentIntentId] = useState('');

  // Add function to handle payment intent errors
  const handlePaymentIntentError = (err) => {
    console.error('Payment Intent Error:', err);
    if (err.code === 'resource_missing' || err.type === 'invalid_request_error') {
      setPaymentIntentExpired(true);
      setError('Your payment session has expired. Please try again.');
      setClientSecret('');
      setPaymentIntentId('');
    } else if (err.code === 'payment_intent_invalid_state') {
      setError('This payment has already been processed. Please try a new payment.');
      setPaymentIntentExpired(true);
    } else {
      setError(err.message || 'An error occurred during payment. Please try again.');
    }
  };

  // Separate function to create payment intent
  const createPaymentIntent = async (bookingId, amount, currency, token) => {
    console.log('Attempting to create payment intent with:', {
      bookingId, amount, currency, token: token ? '[TOKEN_EXISTS]' : '[NO_TOKEN]'
    });
    try {
      const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
      const intentResponse = await axios.post(paymentIntentUrl, {
        bookingId,
        amount,
        currency,
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      
      console.log('Payment Intent Creation Response:', JSON.stringify(intentResponse.data, null, 2));

      if (!intentResponse.data.success) {
        throw new Error(intentResponse.data.message || 'Failed to create payment intent.');
      }

      const { clientSecret: newClientSecret, paymentIntentId: newPaymentIntentId } = intentResponse.data.data;
      setClientSecret(newClientSecret);
      setPaymentIntentId(newPaymentIntentId);
      console.log('PaymentIntentId after setting state:', newPaymentIntentId);
      setPaymentIntentExpired(false);
      return true;
    } catch (err) {
      console.error('Error creating payment intent:', err);
      handlePaymentIntentError(err);
      return false;
    }
  };

  useEffect(() => {
    if (!bookingData || !flight) {
      console.warn("PaymentSection: Missing required data.");
      return;
    }

    const processBookingAndPaymentIntent = async () => {
      setLoading(true);
      setError('');
      setPaymentIntentExpired(false);
      
      try {
        const userString = localStorage.getItem('user');
        const userData = userString ? JSON.parse(userString) : null;
        const token = userData?.token;

        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        // Create booking first
        const bookingUrl = new URL('/booking/book-flight', import.meta.env.VITE_API_BASE_URL).toString();
        const bookingResponse = await axios.post(bookingUrl, bookingData, { headers });

        if (!bookingResponse.data.success) {
          throw new Error(bookingResponse.data.message || 'Failed to create booking.');
        }
        
        const newBookingId = bookingResponse.data.data.bookingId;
        setBookingId(newBookingId);
        console.log('Booking created successfully with ID:', newBookingId);
        
        // Then create payment intent
        const amount = calculateTotalPrice(flight, bookingData);
        console.log('Calculated total price for payment intent:', amount);
        await createPaymentIntent(newBookingId, amount, bookingData.currency, token);

      } catch (err) {
        console.error('Error during booking or payment-intent creation:', err);
        handlePaymentIntentError(err);
      } finally {
        // Add a small delay to ensure state updates propagate before enabling button
        setTimeout(() => {
          setLoading(false);
        }, 100); 
      }
    };

    processBookingAndPaymentIntent();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData, flight]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    console.log('Checking payment system readiness:', {
      stripeReady: !!stripe,
      elementsReady: !!elements,
      clientSecretPresent: !!clientSecret,
      paymentIntentIdPresent: !!paymentIntentId,
      clientSecretValue: clientSecret, // Log actual value for debugging
      paymentIntentIdValue: paymentIntentId // Log actual value for debugging
    });

    if (!stripe || !elements || !clientSecret || !paymentIntentId) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentIntentExpired(false);

    // Instead of confirming payment on the frontend, we just signal success
    // The backend will handle the confirmation via webhooks, and the parent
    // component will poll for the status.
    onPaymentSuccess({
      bookingId: bookingId,
      paymentIntentId: paymentIntentId, // Use paymentIntentId from state
      stripeStatus: 'initiated' // Placeholder status, actual status will be polled from backend
    });

    // No need to set loading to false here, as the parent component
    // will manage the loading state based on polling.
  };

  // Add retry button handler
  const handleRetry = async () => {
    setPaymentIntentExpired(false);
    setError('');
    setLoading(true);
    
    try {
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;

      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const amount = calculateTotalPrice(flight, bookingData);
      const success = await createPaymentIntent(bookingId, amount, bookingData.currency, token);
      
      if (!success) {
        throw new Error('Failed to create new payment intent.');
      }
    } catch (err) {
      console.error('Error during retry:', err);
      setError(err.message || 'Failed to retry payment. Please try again.');
    } finally {
      setLoading(false);
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
            <button type="submit" className={styles.payButton} disabled={!stripe || loading || !clientSecret || !paymentIntentId || !flight}>
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