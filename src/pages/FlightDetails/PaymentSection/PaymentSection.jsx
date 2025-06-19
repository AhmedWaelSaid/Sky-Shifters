import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './paymentsection.module.css';
import { ChevronLeft } from 'lucide-react';
import PropTypes from 'prop-types';
import { useData } from '../../../components/context/DataContext.jsx';

// Helper function to safely get price from pricing info
const getPriceFromPricingInfo = (pricingInfo) => {
  if (!pricingInfo?.price?.total) return 0;
  return Number(pricingInfo.price.total);
};

// Calculate total price (exported لاستخدامه في FinalDetails)
export function calculateTotalPrice(flightData, bookingData) {
  if (!flightData || !bookingData) return 0;
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
  const { flight } = useData();

  const [state, setState] = useState({
    loading: false,
    error: '',
    clientSecret: initialClientSecret || '',
    bookingId: initialBookingId || '',
    paymentIntentExpired: false,
    paymentIntentId: '',
    processingPayment: false,
    isCardElementReady: false,
  });

  const { loading, error, clientSecret, bookingId, paymentIntentExpired, paymentIntentId, processingPayment, isCardElementReady } = state;

  const updateState = (newState) => setState((prev) => ({ ...prev, ...newState }));

  useEffect(() => {
    // 🔍 LOG: Component receives new props from parent
    console.log('🔍 useEffect: Props received.', { initialClientSecret: initialClientSecret?.substring(0, 20) + '...', initialBookingId });
    if (initialClientSecret && initialClientSecret !== clientSecret) {
      updateState({
        clientSecret: initialClientSecret,
        paymentIntentExpired: false,
        error: '',
      });
    }
    if (initialBookingId && initialBookingId !== bookingId) {
      updateState({ bookingId: initialBookingId });
    }
  }, [initialClientSecret, initialBookingId]); // Removed dependencies clientSecret and bookingId to prevent re-renders from its own state update.

  const handlePaymentIntentError = (err) => {
    // 🔍 LOG: Detailed error object from Stripe or server
    console.error('🔴 Payment Intent Error:', err);
    let errorMessage = 'An error occurred during payment. Please try again.';
    
    if (err.response?.data) {
      console.error('🔴 Server error details:', err.response.data);
      errorMessage = err.response.data.message || errorMessage;
    }
    
    // 🔍 LOG: Full raw error for detailed inspection
    console.log('🔍 Full raw error object:', JSON.parse(JSON.stringify(err)));

    if (err.type === 'invalid_request_error' && err.param === 'client_secret') {
      console.warn('⚠️ Client secret mismatch detected. PaymentIntent may be expired or from different account.');
      
      const frontendKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const isFrontendTest = frontendKey?.startsWith('pk_test_');
      const isLiveKey = frontendKey?.startsWith('pk_live_');
      
      console.warn('🔍 Environment check:', {
        frontendKey: frontendKey?.substring(0, 20) + '...',
        isFrontendTest,
        isLiveKey,
        clientSecretPrefix: clientSecret?.substring(0, 20) + '...',
      });
      
      let specificError = 'Your payment session has expired or is invalid. Please try again.';
      if (clientSecret && clientSecret.startsWith('pi_test_') && isLiveKey) {
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

  const handleRetry = async () => {
    // 🔍 LOG: User clicked 'Try Again' button.
    console.log("🔍 handleRetry: Initiating recreation of Payment Intent.");
    updateState({
      paymentIntentExpired: false,
      error: '',
      loading: true,
    });

    try {
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;

      if (!token) {
        updateState({
          error: 'Authentication token not found. Please log in again.',
          loading: false,
        });
        return;
      }

      const amount = calculateTotalPrice(flight, bookingData);
      const currency = bookingData?.currency || 'USD';
      // 🔍 LOG: Data being sent to the backend to create a new Payment Intent.
      console.log("🔍 handleRetry: Sending request to create new Payment Intent with:", {
        bookingId,
        amount,
        currency: currency.toLowerCase(),
        apiUrl: import.meta.env.VITE_API_BASE_URL
      });

      const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
      const intentResponse = await axios.post(paymentIntentUrl, {
        bookingId,
        amount,
        currency: currency.toLowerCase(),
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      
      // 🔍 LOG: Full response from the backend after attempting to create a new Payment Intent.
      console.log("🔍 handleRetry: Received response from server:", intentResponse);

      if (!intentResponse.data.success) {
        throw new Error(intentResponse.data.message || 'Failed to create payment intent.');
      }

      const { clientSecret: newClientSecret, paymentIntentId: newPaymentIntentId } = intentResponse.data.data;

      // 🔍 LOG: New credentials received from the backend.
      console.log("🔍 handleRetry: Successfully received new credentials.", {
        newClientSecret: newClientSecret?.substring(0, 20) + '...',
        newPaymentIntentId
      });

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

  // State for card fields
  const [cardFields, setCardFields] = useState({
    name: bookingData?.contactDetails?.fullName || '',
    number: '',
    exp: '',
    cvv: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    number: false,
    exp: false,
    cvv: false,
  });

  // Live update handlers
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    // Format card number
    if (name === 'number') {
      newValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    // Format exp date
    if (name === 'exp') {
      newValue = value.replace(/[^\d]/g, '').replace(/(\d{2})(\d{0,2})/, (match, p1, p2) => p2 ? `${p1}/${p2}` : p1);
      if (newValue.length > 5) newValue = newValue.slice(0, 5);
    }
    // Format cvv
    if (name === 'cvv') {
      newValue = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardFields((prev) => ({ ...prev, [name]: newValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: false }));
  };

  // Simple validation
  const validateFields = () => {
    const errors = {
      name: cardFields.name.trim() === '',
      number: cardFields.number.replace(/\s/g, '').length !== 16,
      exp: !/^\d{2}\/\d{2}$/.test(cardFields.exp),
      cvv: cardFields.cvv.length < 3,
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateFields()) return;

    if (!flight) {
      updateState({ error: 'Flight information is missing. Please go back and try again.' });
      return;
    }

    if (!clientSecret.startsWith('pi_')) {
      console.error('🔴 Invalid client secret format:', clientSecret.substring(0, 20) + '...');
      updateState({
        error: 'Invalid payment session. Please try again.',
        paymentIntentExpired: true,
      });
      return;
    }

    updateState({ loading: true, error: '', processingPayment: true });

    try {
      console.log('🔵 Confirming payment with client secret:', clientSecret.substring(0, 10) + '...');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardFields.name,
              email: bookingData.contactDetails?.email || 'guest@example.com',
            },
          },
        }
      );

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
          error: 'Payment processing - please do not close this window.',
        });
      }
    } catch (err) {
      console.error('🔴 Payment submission error:', err);
      handlePaymentIntentError(err);
      updateState({ loading: false, processingPayment: false });
    }
  };

  const totalAmount = bookingData ? calculateTotalPrice(flight, bookingData).toFixed(2) : "0.00";
  const currency = bookingData?.currency || "USD";

  return (
    <div className={styles.container}>
      <div className={styles.payment} style={{ width: '50rem', height: '32rem', gridTemplateColumns: '20rem 1fr', padding: '2rem 2rem', gridGap: '2rem' }}>
        {/* Card Preview */}
        <div className={styles.card} style={{ width: '18rem', height: '11rem', padding: '0 1rem' }}>
          <div className={styles['card__visa']}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" style={{ width: '100%' }} />
          </div>
          <div className={styles['card__number']} style={{ fontSize: '1.1rem' }}>
            {cardFields.number || '0000 0000 0000 0000'}
          </div>
          <div className={styles['card__name']}>
            <h3>Card Holder</h3>
            <p>{cardFields.name || 'FULL NAME'}</p>
          </div>
          <div className={styles['card__expiry']}>
            <h3>Valid Thru</h3>
            <p>{cardFields.exp || 'MM/YY'}</p>
          </div>
        </div>

        {/* Payment Form */}
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          <h2>Payment Details</h2>
          {/* Cardholder Name */}
          <div className={`${styles['form__detail']} ${styles['form__name']}`}> 
            <label htmlFor="cardholder">Cardholder Name</label>
            <input
              id="cardholder"
              name="name"
              type="text"
              value={cardFields.name}
              placeholder="Full Name"
              onChange={handleFieldChange}
              className={fieldErrors.name ? styles.alert : ''}
            />
            {fieldErrors.name && <div className={styles.alert} style={{ opacity: 1 }}>Full name required</div>}
          </div>
          {/* Card Number */}
          <div className={`${styles['form__detail']} ${styles['form__number']}`}> 
            <label htmlFor="card-number">Card Number</label>
            <input
              id="card-number"
              name="number"
              type="text"
              value={cardFields.number}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              onChange={handleFieldChange}
              className={fieldErrors.number ? styles.alert : ''}
            />
            {fieldErrors.number && <div className={styles.alert} style={{ opacity: 1 }}>Card number must be 16 digits</div>}
          </div>
          {/* Expiry Date */}
          <div className={`${styles['form__detail']} ${styles['form__expiry']}`}> 
            <label htmlFor="exp-date">Exp Date</label>
            <input
              id="exp-date"
              name="exp"
              type="text"
              value={cardFields.exp}
              placeholder="MM/YY"
              maxLength={5}
              onChange={handleFieldChange}
              className={fieldErrors.exp ? styles.alert : ''}
            />
            {fieldErrors.exp && <div className={styles.alert} style={{ opacity: 1 }}>Invalid date</div>}
          </div>
          {/* CVV */}
          <div className={`${styles['form__detail']} ${styles['form__cvv']}`}> 
            <label htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              name="cvv"
              type="password"
              value={cardFields.cvv}
              placeholder="000"
              maxLength={4}
              onChange={handleFieldChange}
              className={fieldErrors.cvv ? styles.alert : ''}
            />
            {fieldErrors.cvv && <div className={styles.alert} style={{ opacity: 1 }}>CVV required</div>}
          </div>
          {/* Error Message */}
          {error && (
            <div className={styles.alert} style={{ opacity: 1 }}>{error}</div>
          )}
          {/* Buttons */}
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
            style={{ gridColumn: '1/2', marginTop: '1rem' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            type="submit"
            className={styles.form__btn}
            style={{ gridColumn: '2/3', marginTop: '1rem' }}
          >
            Pay {totalAmount} {currency}
          </button>
        </form>
      </div>
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