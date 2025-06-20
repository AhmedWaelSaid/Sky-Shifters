import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './paymentsection.module.css';
import { ChevronLeft, User, CreditCard, Calendar, Lock, AlertTriangle } from 'lucide-react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
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

const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  }
  return value;
};

const formatExpiryDate = (value) => {
    const clearValue = value.replace(/\s*\/\s*/g, "").replace(/[^0-9]/g, '');
    if (clearValue.length >= 3) {
        return `${clearValue.slice(0, 2)} / ${clearValue.slice(2, 4)}`;
    }
    return clearValue;
}

const detectCardBrand = (number) => {
    const cleaned = number.replace(/\s+/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'visa'; // Default brand
}

const CardLogo = ({ brand }) => {
    const logos = {
        visa: (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 38 24" fill="none">
                <path d="M37.36 9.429L32.189 9.17l-.396 6.838 5.171.259.396-6.838zM31.22 20.94l.395-6.838-5.17-.26.395 6.838 4.38.26z" fill="#E6A329"/>
                <path d="M25.684 20.94l-.01-11.411-5.383 11.41h3.333l.97-2.172h3.9l.52 2.172h3.323L26.6 9.53h-3.56l-4.93 11.41h3.33l.25-1.157h5.18l-.209 1.157h3.32zM21.05 9.53l-6.08 11.41h3.33l6.08-11.41h-3.33z" fill="#2441C2"/>
            </svg>
        ),
        mastercard: (
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 38 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#EB001B"/>
                <circle cx="26" cy="12" r="12" fill="#F79E1B" fillOpacity="0.8"/>
            </svg>
        ),
         amex: (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 38 24" fill="#006FCF">
                <rect width="38" height="24" rx="3"/>
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">AMEX</text>
            </svg>
        ),
    };
    return <div className={styles.card__logo_container}>{logos[brand.toLowerCase()] || logos.visa}</div>
}

const PaymentSection = ({ bookingData, onPaymentSuccess, onBack, isLoading, clientSecret: initialClientSecret, bookingId: initialBookingId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { flight } = useData();
  const [cardholderName, setCardholderName] = useState(bookingData?.contactDetails?.fullName || '');
  
  // UI-only state for card preview
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardBrand, setCardBrand] = useState('visa');

  const [state, setState] = useState({
    loading: false,
    clientSecret: initialClientSecret || '',
    bookingId: initialBookingId || '',
    paymentIntentExpired: false,
    paymentIntentId: '',
    processingPayment: false,
    isCardElementReady: false,
    errors: {
        name: '',
        number: '',
        expiry: '',
        cvc: '',
        general: ''
    }
  });

  const { loading, clientSecret, bookingId, paymentIntentExpired, paymentIntentId, processingPayment, isCardElementReady, errors } = state;

  const updateState = (newState) => setState((prev) => ({ 
      ...prev, 
      ...newState,
      errors: { ...prev.errors, ...(newState.errors || {}) }
    }));
  
  // NOTE: This handler is for the original Stripe Elements. It is not currently used
  // but kept for easy reversion from design-mode.
  const handleCardElementChange = (elementName) => (event) => {
    if (elementName === 'expiry') {
        setCardExpiry(event.empty ? '' : '••/••');
    }
    if (elementName === 'number' && event.brand) {
        setCardBrand(event.brand);
    }
    if (event.error) {
        updateState({ errors: { [elementName]: event.error.message } });
    } else {
        updateState({ errors: { [elementName]: '' } });
    }
  };
  
  // --- Handlers for UI-only inputs ---
  const handleCardNumberInput = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardBrand(detectCardBrand(e.target.value));
  };
  
  const handleExpiryInput = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setCardExpiry(formatted);
  };
  // --- End of UI-only handlers ---

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

  const handleSubmit = async (event) => {
    event.preventDefault();

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
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name: bookingData.contactDetails?.fullName || 'guest@example.com',
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

  // NOTE: These options are for the original Stripe Elements.
  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'var(--greyDark-2)',
        fontFamily: '"Nunito", sans-serif',
        '::placeholder': {
          color: 'var(--greyLight-2)',
        },
      },
      invalid: {
        color: 'var(--alert)',
      },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.payment}>
        {/* Card Preview */}
        <div className={styles.card}>
          <CardLogo brand={cardBrand} />
          <div className={styles['card__number']}>{cardNumber || '•••• •••• •••• ••••'}</div>
          <div className={styles['card__name']}>
            <h3>Card Holder</h3>
            <p>{cardholderName || 'FULL NAME'}</p>
          </div>
          <div className={styles['card__expiry']}>
            <h3>Valid Thru</h3>
            <p>{cardExpiry || 'MM/YY'}</p>
          </div>
        </div>

        {/* Payment Form */}
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
        
          <h3 className={styles.designModeWarning}>
            <AlertTriangle size={14} style={{ marginRight: '8px' }}/> 
            Design-Mode Active. Payments are disabled.
          </h3>
          
          {/* Cardholder Name */}
          <div className={`${styles['form__detail']} ${styles['form__name']}`}>
            <label htmlFor="cardholder">Cardholder Name</label>
            <User className={styles.icon} size={20} />
            <input
              id="cardholder"
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Cardholder Name"
            />
            {errors.name && <div className={styles.alert}><AlertTriangle size={14}/> {errors.name}</div>}
          </div>

          {/* Card Number */}
          <div className={`${styles['form__detail']} ${styles['form__number']}`}>
            <label htmlFor="card-number">Card Number</label>
             <CreditCard className={styles.icon} size={20}/>
            {/* <div className={styles.stripeCardElement}>
              <CardNumberElement
                id="card-number"
                options={elementOptions}
                onReady={() => updateState({ isCardElementReady: true })}
                onChange={handleCardElementChange('number')}
              />
            </div> */}
            <input
              id="card-number"
              type="text"
              value={cardNumber}
              onChange={handleCardNumberInput}
              placeholder="0000 0000 0000 0000"
              maxLength="19"
            />
             {errors.number && <div className={styles.alert}><AlertTriangle size={14}/> {errors.number}</div>}
          </div>

          {/* Expiry Date */}
          <div className={`${styles['form__detail']} ${styles['form__expiry']}`}>
            <label htmlFor="exp-date">Exp Date</label>
            <Calendar className={styles.icon} size={20}/>
            {/* <div className={styles.stripeCardElement}>
              <CardExpiryElement
                id="exp-date"
                options={elementOptions}
                onChange={handleCardElementChange('expiry')}
              />
            </div> */}
             <input
              id="exp-date"
              type="text"
              value={cardExpiry}
              onChange={handleExpiryInput}
              placeholder="MM / YY"
              maxLength="7"
            />
             {errors.expiry && <div className={styles.alert}><AlertTriangle size={14}/> {errors.expiry}</div>}
          </div>

          {/* CVV */}
          <div className={`${styles['form__detail']} ${styles['form__cvv']}`}>
            <label htmlFor="cvv">CVV</label>
             <Lock className={styles.icon} size={20}/>
            {/* <div className={styles.stripeCardElement}>
              <CardCvcElement
                id="cvv"
                options={elementOptions}
                onChange={handleCardElementChange('cvc')}
              />
            </div> */}
            <input
              id="cvv"
              type="text"
              value={cardCvc}
              onChange={(e) => setCardCvc(e.target.value)}
              placeholder="CVC"
              maxLength="4"
            />
             {errors.cvc && <div className={styles.alert}><AlertTriangle size={14}/> {errors.cvc}</div>}
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className={`${styles.alert} ${styles.form__name}`}><AlertTriangle size={14}/> {errors.general}</div>
          )}

          {/* Buttons */}
          <button
            type="submit"
            className={styles.form__btn}
            disabled={true}
          >
            {'Confirm'}
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