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

const PaymentSection = ({ bookingData, onPaymentSuccess, onBack, isLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { flight } = useData();

  const [state, setState] = useState({
    loading: false,
    error: '',
    clientSecret: '',
    bookingId: '',
    paymentIntentExpired: false,
    paymentIntentId: '',
    processingPayment: false,
  });

  const { loading, error, clientSecret, bookingId, paymentIntentExpired, paymentIntentId, processingPayment } = state;

  const updateState = (newState) => setState((prev) => ({ ...prev, ...newState }));

  // Handle payment intent errors
  const handlePaymentIntentError = (err) => {
    console.error('🔴 Payment Intent Error:', err);
    let errorMessage = 'An error occurred during payment. Please try again.';
    
    if (err.response?.data) {
      console.error('🔴 Server error details:', err.response.data);
      errorMessage = err.response.data.message || errorMessage;
    }
    
    if (err.code === 'resource_missing' || err.type === 'invalid_request_error') {
      console.warn('⚠️ Payment intent not found. Possible API key mismatch or environment issue.');
      updateState({
        paymentIntentExpired: true,
        error: 'Your payment session has expired or is invalid. Please try again.',
        clientSecret: '',
        paymentIntentId: '',
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('🔵 Payment submission initiated');
    console.log('🔵 Payment system status:', {
      stripeReady: !!stripe,
      elementsReady: !!elements,
      clientSecretPresent: !!clientSecret,
      paymentIntentIdPresent: !!paymentIntentId,
    });

    if (!stripe || !elements || !clientSecret) {
      updateState({ error: 'Payment system is not ready. Please try again.' });
      return;
    }

    updateState({ loading: true, error: '', paymentIntentExpired: false, processingPayment: true });

    try {
      console.log('🔵 Confirming payment with client secret:', clientSecret.substring(0, 10) + '...');
      
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });
      
      console.log('🔵 Payment confirmation result:', { 
        error: stripeError ? '✗ Error present' : '✓ No error', 
        paymentIntent: paymentIntent ? '✓ Payment intent returned' : '✗ No payment intent'
      });

      if (stripeError) {
        console.error('🔴 Stripe confirmation error:', stripeError);
        handlePaymentIntentError(stripeError);
        updateState({ loading: false, processingPayment: false });
        return;
      }

      if (paymentIntent) {
        console.log('✅ Payment successful:', paymentIntent);
        updateState({ loading: false, processingPayment: false });
        onPaymentSuccess({
          bookingId,
          paymentIntentId: paymentIntent.id,
          stripeStatus: paymentIntent.status,
        });
      } else {
        console.log('🔵 Redirect flow detected - awaiting return URL');
        updateState({ 
          loading: false,
          processingPayment: true,
          error: 'Payment processing - please do not close this window.'
        });
      }
    } catch (err) {
      console.error('🔴 Payment submission error:', err);
      handlePaymentIntentError(err);
      updateState({ loading: false, processingPayment: false });
    }
  };

  const handleRetry = async () => {
    updateState({ paymentIntentExpired: false, error: '', loading: true });
    console.warn('Retry not implemented yet. Contact backend to re-create payment intent.');
  };

  return (
    <div className={styles.paymentSection}>
      <h2 className={styles.sectionTitle}>Payment Details</h2>
      
      {processingPayment && (
        <div className={styles.processingMessage}>
          <p>Payment is being processed. Please do not close this window.</p>
        </div>
      )}
      
      <form className={styles.cardForm} onSubmit={handleSubmit}>
        {clientSecret ? (
          <div className={styles.formGroup}>
            <PaymentElement />
          </div>
        ) : (
          <div className={styles.loadingPaymentElement}>
            <p>Loading payment form...</p>
          </div>
        )}
        
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
          <button 
            type="button" 
            className={styles.backButton} 
            onClick={onBack}
            disabled={processingPayment}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button 
            type="submit" 
            className={styles.payButton} 
            disabled={!stripe || loading || isLoading || !clientSecret || !flight || paymentIntentExpired || processingPayment}
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
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default PaymentSection;