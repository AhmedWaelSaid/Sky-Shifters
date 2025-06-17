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

const PaymentSection = ({ bookingData, onPaymentSuccess, onBack, isLoading, clientSecret: initialClientSecret, bookingId: initialBookingId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { flight } = useData();

  const [state, setState] = useState({
    loading: false,
    error: '',
    clientSecret: initialClientSecret || '',
    bookingId: initialBookingId || '',
    paymentIntentExpired: false,
    paymentIntentId: '',
    processingPayment: false,
  });

  const { loading, error, clientSecret, bookingId, paymentIntentExpired, paymentIntentId, processingPayment } = state;

  const updateState = (newState) => setState((prev) => ({ ...prev, ...newState }));

  // Update state when props change
  useEffect(() => {
    if (initialClientSecret && initialClientSecret !== clientSecret) {
      updateState({ 
        clientSecret: initialClientSecret,
        paymentIntentExpired: false,
        error: ''
      });
    }
    if (initialBookingId && initialBookingId !== bookingId) {
      updateState({ bookingId: initialBookingId });
    }
  }, [initialClientSecret, initialBookingId]);

  // Validate Stripe environment
  useEffect(() => {
    if (clientSecret) {
      console.log('🔍 Validating Stripe environment...');
      console.log('🔍 Client secret format check:', {
        startsWithPi: clientSecret.startsWith('pi_'),
        length: clientSecret.length,
        prefix: clientSecret.substring(0, 20) + '...',
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
      });
      
      // Check if we're using test vs live keys
      const isTestKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');
      const isLiveKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_');
      
      console.log('🔍 Stripe environment:', {
        isTestKey,
        isLiveKey,
        keyType: isTestKey ? 'test' : isLiveKey ? 'live' : 'unknown',
      });
    }
  }, [clientSecret]);

  // Handle payment intent errors
  const handlePaymentIntentError = (err) => {
    console.error('🔴 Payment Intent Error:', err);
    let errorMessage = 'An error occurred during payment. Please try again.';
    
    if (err.response?.data) {
      console.error('🔴 Server error details:', err.response.data);
      errorMessage = err.response.data.message || errorMessage;
    }
    
    // Check for client secret mismatch error
    if (err.type === 'invalid_request_error' && err.param === 'client_secret') {
      console.warn('⚠️ Client secret mismatch detected. PaymentIntent may be expired or from different account.');
      
      // Check for environment mismatch
      const frontendKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const isFrontendTest = frontendKey?.startsWith('pk_test_');
      const isFrontendLive = frontendKey?.startsWith('pk_live_');
      
      console.warn('🔍 Environment check:', {
        frontendKey: frontendKey?.substring(0, 20) + '...',
        isFrontendTest,
        isFrontendLive,
        clientSecretPrefix: clientSecret?.substring(0, 20) + '...',
      });
      
      let specificError = 'Your payment session has expired or is invalid. Please try again.';
      
      // If we can detect an environment mismatch, provide a more specific error
      if (clientSecret && clientSecret.startsWith('pi_test_') && isFrontendLive) {
        specificError = 'Environment mismatch detected. The payment was created in test mode but you are using live mode. Please contact support.';
      } else if (clientSecret && clientSecret.startsWith('pi_live_') && isFrontendTest) {
        specificError = 'Environment mismatch detected. The payment was created in live mode but you are using test mode. Please contact support.';
      }
      
      updateState({
        paymentIntentExpired: true,
        error: specificError,
        clientSecret: '',
        paymentIntentId: '',
      });
    } else if (err.code === 'resource_missing' || err.type === 'invalid_request_error') {
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
      clientSecretLength: clientSecret?.length || 0,
      clientSecretPrefix: clientSecret?.substring(0, 20) || 'N/A',
    });

    if (!stripe || !elements || !clientSecret) {
      updateState({ error: 'Payment system is not ready. Please try again.' });
      return;
    }

    // Validate client secret format
    if (!clientSecret.startsWith('pi_') && !clientSecret.startsWith('pi_')) {
      console.error('🔴 Invalid client secret format:', clientSecret.substring(0, 20) + '...');
      updateState({ 
        error: 'Invalid payment session. Please try again.',
        paymentIntentExpired: true 
      });
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
        paymentIntent: paymentIntent ? '✓ Payment intent returned' : '✗ No payment intent',
        errorType: stripeError?.type,
        errorCode: stripeError?.code,
        errorParam: stripeError?.param,
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

  // Retry function to recreate PaymentIntent
  const handleRetry = async () => {
    updateState({ paymentIntentExpired: false, error: '', loading: true });
    
    try {
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;

      if (!token) {
        updateState({ 
          error: 'Authentication token not found. Please log in again.',
          loading: false 
        });
        return;
      }

      // Recreate PaymentIntent
      const amount = calculateTotalPrice(flight, bookingData);
      const currency = bookingData?.currency || 'USD';
      
      const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
      const intentResponse = await axios.post(paymentIntentUrl, {
        bookingId,
        amount,
        currency: currency.toLowerCase(),
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      if (!intentResponse.data.success) {
        throw new Error(intentResponse.data.message || 'Failed to create payment intent.');
      }

      const { clientSecret: newClientSecret, paymentIntentId: newPaymentIntentId } = intentResponse.data.data;
      
      updateState({
        clientSecret: newClientSecret,
        paymentIntentId: newPaymentIntentId,
        paymentIntentExpired: false,
        error: '',
        loading: false,
      });
      
      console.log('✅ PaymentIntent recreated successfully');
    } catch (err) {
      console.error('🔴 Error recreating payment intent:', err);
      updateState({
        error: err.message || 'Failed to recreate payment intent. Please try again.',
        loading: false,
      });
    }
  };

  return (
    <div className={styles.paymentSection}>
      <h2 className={styles.sectionTitle}>Payment Details</h2>
      
      {/* Debug information - only show in development */}
      {import.meta.env.DEV && (
        <div className={styles.debugInfo} style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '4px', 
          fontSize: '12px' 
        }}>
          <strong>Debug Info:</strong><br/>
          Client Secret: {clientSecret ? `${clientSecret.substring(0, 20)}...` : 'Not set'}<br/>
          Booking ID: {bookingId || 'Not set'}<br/>
          Stripe Ready: {stripe ? 'Yes' : 'No'}<br/>
          Elements Ready: {elements ? 'Yes' : 'No'}<br/>
          Environment: {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') ? 'Test' : 'Live'}
        </div>
      )}
      
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
  clientSecret: PropTypes.string,
  bookingId: PropTypes.string,
};

export default PaymentSection;