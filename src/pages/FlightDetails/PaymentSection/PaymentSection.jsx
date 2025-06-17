import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './paymentsection.module.css';
import { ChevronLeft } from 'lucide-react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import { useData } from "../../../components/context/DataContext.jsx";

// Helper function to safely get price from pricing info
const getPriceFromPricingInfo = (pricingInfo) => {
  if (!pricingInfo?.price?.total) return 0;
  return Number(pricingInfo.price.total);
};

// Calculate total price
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

const PaymentSection = ({ bookingData, onPaymentSuccess, onClientSecretUpdate, onBack, isLoading, clientSecret, paymentIntentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { flight } = useData();

  const [state, setState] = useState({
    loading: false,
    error: '',
    bookingId: '',
    paymentIntentExpired: false,
  });

  const { loading, error, bookingId, paymentIntentExpired } = state;

  const updateState = (newState) => setState((prev) => ({ ...prev, ...newState }));

  // Handle payment intent errors
  const handlePaymentIntentError = (err) => {
    console.error('Payment Intent Error:', err);
    let errorMessage = 'An error occurred during payment. Please try again.';
    if (err.code === 'resource_missing' || err.type === 'invalid_request_error') {
      console.warn('Payment intent not found. Possible API key mismatch or environment issue.');
      updateState({
        paymentIntentExpired: true,
        error: 'Your payment session has expired or is invalid. Please try again.',
      });
    } else if (err.code === 'payment_intent_invalid_state') {
      updateState({
        error: 'This payment has already been processed. Please try a new payment.',
        paymentIntentExpired: true,
      });
    } else {
      updateState({ error: err.message || errorMessage });
    }
  };

  // No longer responsible for creating payment intent, this is done by parent
  // const createPaymentIntent = async (bookingId, amount, currency, token) => { ... };

  // Booking creation and payment intent fetching is now handled by the parent (FinalDetails)
  useEffect(() => {
    if (bookingData && flight && !bookingId) {
      // This means a booking was just created by parent, but payment section hasn't got bookingId yet.
      // This useEffect will be simplified to just set bookingId if it's missing.
      // The actual payment intent creation will be handled in FinalDetails.
      // We still need to ensure bookingId is set in state if it's passed after first render.
      if (bookingData.bookingId) {
        updateState({ bookingId: bookingData.bookingId });
      }
    }
  }, [bookingData, flight, bookingId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('Checking payment system readiness:', {
      stripeReady: !!stripe,
      elementsReady: !!elements,
      clientSecretPresent: !!clientSecret,
      paymentIntentIdPresent: !!paymentIntentId,
    });

    if (!stripe || !elements || !clientSecret || !paymentIntentId) {
      updateState({ error: 'Payment system is not ready. Please try again.' });
      return;
    }

    updateState({ loading: true, error: '', paymentIntentExpired: false });

    try {
      console.log('Before confirmPayment:', { clientSecret, paymentIntentId });
      
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });
      
      console.log('Stripe confirmPayment result:', { stripeError, paymentIntent });

      if (stripeError) {
        handlePaymentIntentError(stripeError);
        updateState({ loading: false });
        return;
      }

      if (!paymentIntent) {
        updateState({
          error: 'Payment processing failed. No payment intent returned. Please try again.',
          loading: false,
        });
        return;
      }

      updateState({ loading: false });
      onPaymentSuccess({
        bookingId,
        paymentIntentId: paymentIntent.id,
        stripeStatus: paymentIntent.status,
      });
    } catch (err) {
      console.error('Payment submission error:', err);
      handlePaymentIntentError(err);
      updateState({ loading: false });
    }
  };

  const handleRetry = async () => {
    updateState({ paymentIntentExpired: false, error: '', loading: true });

    try {
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;

      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const bookingUrl = new URL('/booking/book-flight', import.meta.env.VITE_API_BASE_URL).toString();
      const bookingResponse = await axios.post(bookingUrl, bookingData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!bookingResponse.data.success) {
        throw new Error(bookingResponse.data.message || 'Failed to create booking.');
      }

      const newBookingId = bookingResponse.data.data.bookingId;
      const amount = calculateTotalPrice(flight, bookingData);
      // Now calling the parent's onClientSecretUpdate to re-fetch payment intent
      if (onClientSecretUpdate) {
        onClientSecretUpdate(newBookingId, amount, bookingData.currency, token);
      }

      updateState({ bookingId: newBookingId, loading: false });
      console.log('New booking created for retry with ID:', newBookingId);
    } catch (err) {
      console.error('Error during retry:', err);
      updateState({
        error: err.message || 'Failed to retry payment. Please try again.',
        loading: false,
      });
    }
  };

  return (
    <div className={styles.paymentSection}>
      <h2 className={styles.sectionTitle}>Payment Details</h2>
      
      <form className={styles.cardForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Payment Information</label>
          <PaymentElement />
        </div>
        
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorMessage}>{error}</div>
            {paymentIntentExpired && (
              <button 
                onClick={handleRetry} 
                className={styles.retryButton}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Try Again'}
              </button>
            )}
          </div>
        )}
        
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.backButton} onClick={onBack}>
            <ChevronLeft size={16} /> Back
          </button>
          <button 
            type="submit" 
            className={styles.payButton} 
            disabled={!stripe || loading || isLoading || !clientSecret || !paymentIntentId || !flight || paymentIntentExpired}
          >
            {loading || isLoading ? 'Processing...' : `Pay ${calculateTotalPrice(flight, bookingData).toFixed(2)} ${bookingData?.currency}`}
          </button>
        </div>
      </form>
    </div>
  );
};

PaymentSection.propTypes = {
  bookingData: PropTypes.object,
  onPaymentSuccess: PropTypes.func.isRequired,
  onClientSecretUpdate: PropTypes.func,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  clientSecret: PropTypes.string,
  paymentIntentId: PropTypes.string,
};

export default PaymentSection;