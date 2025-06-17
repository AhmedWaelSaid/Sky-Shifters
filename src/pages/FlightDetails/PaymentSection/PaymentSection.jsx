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
    paymentElementMounted: false,
    paymentElementLoading: false,
  });

  const { loading, error, clientSecret, bookingId, paymentIntentExpired, paymentIntentId, processingPayment, paymentElementMounted, paymentElementLoading } = state;

  const updateState = (newState) => setState((prev) => ({ ...prev, ...newState }));

  // Update state when props change
  useEffect(() => {
    if (initialClientSecret && initialClientSecret !== clientSecret) {
      updateState({ 
        clientSecret: initialClientSecret,
        paymentIntentExpired: false,
        error: '',
        paymentElementMounted: false, // Reset to allow new element to mount
        paymentElementLoading: false,
      });
    }
    if (initialBookingId && initialBookingId !== bookingId) {
      updateState({ bookingId: initialBookingId });
    }
  }, [initialClientSecret, initialBookingId]);

  // Global error handler for unhandled Stripe errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.error && event.error.message && event.error.message.includes('stripe')) {
        console.error('🔴 Global Stripe error caught:', event.error);
        updateState({
          error: 'A payment system error occurred. Please try again.',
          paymentIntentExpired: true,
        });
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('stripe')) {
        console.error('🔴 Unhandled Stripe promise rejection:', event.reason);
        updateState({
          error: 'Payment system error. Please try again.',
          paymentIntentExpired: true,
        });
      }
    });

    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

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

      // Validate client secret format more thoroughly
      if (!clientSecret.startsWith('pi_')) {
        console.error('🔴 Invalid client secret format - should start with "pi_"');
        updateState({
          error: 'Invalid payment session format. Please try again.',
          paymentIntentExpired: true,
          clientSecret: '',
        });
      }

      // Validate Elements instance
      if (elements) {
        console.log('🔍 Elements instance validation:', {
          hasElements: !!elements,
          elementsType: typeof elements,
        });
      }
    }
  }, [clientSecret, elements]);

  // Handle Payment Element load errors
  const handlePaymentElementError = (error) => {
    console.error('🔴 Payment Element load error:', error);
    updateState({
      paymentElementMounted: false,
      paymentElementLoading: false,
    });
    
    if (error.error?.type === 'validation_error' || error.error?.code === 'resource_missing') {
      updateState({
        error: 'Payment form failed to load. Please try again.',
        paymentIntentExpired: true,
        clientSecret: '',
      });
    } else {
      updateState({
        error: 'Unable to load payment form. Please refresh the page and try again.',
        paymentIntentExpired: true,
      });
    }
  };

  // Handle Payment Element loading states
  const handlePaymentElementLoaderStart = () => {
    console.log('🔵 Payment Element loading...');
    updateState({ paymentElementLoading: true, paymentElementMounted: false });
    
    // Set a timeout to handle cases where Payment Element takes too long to load
    setTimeout(() => {
      setState(prev => {
        if (prev.paymentElementLoading && !prev.paymentElementMounted) {
          console.warn('⚠️ Payment Element loading timeout');
          return {
            ...prev,
            paymentElementLoading: false,
            error: 'Payment form is taking too long to load. Please try again.',
            paymentIntentExpired: true,
          };
        }
        return prev;
      });
    }, 30000); // 30 second timeout
  };

  const handlePaymentElementLoaderEnd = () => {
    console.log('✅ Payment Element loaded successfully');
    updateState({ paymentElementLoading: false, paymentElementMounted: true });
  };

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
    } else if (err.status === 400 || err.statusCode === 400) {
      // Handle 400 Bad Request errors
      console.error('🔴 Stripe API 400 Bad Request:', err);
      updateState({
        error: 'Payment session is invalid. Please try again.',
        paymentIntentExpired: true,
        clientSecret: '',
        paymentIntentId: '',
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
      paymentElementMounted,
      paymentElementLoading,
    });

    // Comprehensive validation before proceeding
    if (!stripe) {
      updateState({ error: 'Stripe is not initialized. Please refresh the page and try again.' });
      return;
    }

    if (!elements) {
      updateState({ error: 'Payment form is not initialized. Please refresh the page and try again.' });
      return;
    }

    if (!clientSecret) {
      updateState({ error: 'Payment session is not ready. Please try again.' });
      return;
    }

    if (!flight) {
      updateState({ error: 'Flight information is missing. Please go back and try again.' });
      return;
    }

    // Check if Payment Element is properly mounted
    if (!paymentElementMounted) {
      console.error('🔴 Payment Element not mounted. Cannot proceed with payment.');
      updateState({ 
        error: 'Payment form is not ready. Please wait for it to load or try again.',
        paymentIntentExpired: true 
      });
      return;
    }

    // Validate client secret format
    if (!clientSecret.startsWith('pi_')) {
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
    updateState({ 
      paymentIntentExpired: false, 
      error: '', 
      loading: true,
      paymentElementMounted: false,
      paymentElementLoading: false,
    });
    
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
        paymentElementMounted: false, // Reset to allow new element to mount
        paymentElementLoading: false,
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
          Payment Element Mounted: {paymentElementMounted ? 'Yes' : 'No'}<br/>
          Payment Element Loading: {paymentElementLoading ? 'Yes' : 'No'}<br/>
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
            <PaymentElement 
              onLoaderStart={handlePaymentElementLoaderStart}
              onLoaderEnd={handlePaymentElementLoaderEnd}
              onError={handlePaymentElementError}
            />
          </div>
        ) : paymentIntentExpired ? (
          <div className={styles.fallbackPaymentForm}>
            <div className={styles.formGroup}>
              <label>Card Number</label>
              <input 
                type="text" 
                placeholder="1234 1234 1234 1234" 
                disabled 
                className={styles.disabledInput}
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  disabled 
                  className={styles.disabledInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>CVC</label>
                <input 
                  type="text" 
                  placeholder="123" 
                  disabled 
                  className={styles.disabledInput}
                />
              </div>
            </div>
            <div className={styles.paymentNote}>
              <p>⚠️ Payment form is temporarily unavailable. Please click "Try Again" to reload the payment form.</p>
            </div>
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
            disabled={!stripe || loading || isLoading || !clientSecret || !flight || paymentIntentExpired || processingPayment || !paymentElementMounted || paymentElementLoading}
          >
            {loading || isLoading ? 'Processing...' : 
             paymentElementLoading ? 'Loading payment form...' :
             !paymentElementMounted ? 'Payment form not ready' :
             `Pay ${calculateTotalPrice(flight, bookingData).toFixed(2)} ${bookingData?.currency}`}
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