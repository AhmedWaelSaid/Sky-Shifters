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

const PaymentSection = ({ bookingData, onPaymentSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  useEffect(() => {
    if (!bookingData) {
      console.warn("PaymentSection: bookingData is missing.");
      return;
    }

    const processBookingAndPaymentIntent = async () => {
      setLoading(true);
      setError('');
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
          amount: bookingData.totalPrice,
          currency: bookingData.currency,
        }, { headers: { 'Authorization': `Bearer ${token}` } });
        
        if (!intentResponse.data.success) throw new Error(intentResponse.data.message || 'Failed to create payment intent.');

        setClientSecret(intentResponse.data.data.clientSecret);

      } catch (err) {
        console.error('Error during booking or payment-intent creation:', err);
        setError(err.message || 'An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    processBookingAndPaymentIntent();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system is not ready.');
      return;
    }
    setLoading(true);
    setError('');

    const cardNumberElement = elements.getElement(CardNumberElement);
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardNumberElement, billing_details: { name: cardHolderName } },
    });

    if (stripeError) {
      setError(stripeError.message);
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
      } finally {
        setLoading(false);
      }
    } else {
      setError(`Payment failed. Status: ${paymentIntent.status}`);
      setLoading(false);
    }
  };

  return (
    // ... باقي الـ JSX كما هو بدون تغيير ...
    <div className={styles.paymentSection}>
      <h2 className={styles.sectionTitle}>Payment Details</h2>
      
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
          <button type="submit" className={styles.payButton} disabled={!stripe || loading || !clientSecret}>
            {loading ? 'Processing...' : `Pay ${bookingData?.totalPrice?.toFixed(2)} ${bookingData?.currency}`}
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
};

export default PaymentSection;