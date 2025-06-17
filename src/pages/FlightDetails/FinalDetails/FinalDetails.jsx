import styles from './FinalDetails.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import PaymentSection from '../PaymentSection/PaymentSection';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const FinalDetails = ({ passengers, formData, onBack }) => {
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle', 'pending', 'succeeded', 'failed'
  const [paymentError, setPaymentError] = useState('');
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true); // Initialize loading to true
  const intervalRef = useRef(null); // لتخزين معرف الـ interval

  // دالة الاستعلام عن حالة الدفع
  const pollPaymentStatus = async (bookingId, token) => {
    if (!bookingId || !token) return;

    try {
      const statusUrl = new URL(`/payment/status/${bookingId}`, import.meta.env.VITE_API_BASE_URL).toString();
      const response = await axios.get(statusUrl, { headers: { 'Authorization': `Bearer ${token}` } });

      console.log('Payment Status Polling Response:', response.data);

      if (response.data.success && response.data.data.status === 'succeeded') {
        setPaymentStatus('succeeded');
        setBookingDetails(response.data.data);
        setIsLoadingPaymentStatus(false);
        if (intervalRef.current) clearInterval(intervalRef.current); // إلغاء الاستعلام عند النجاح
      } else if (response.data.success && response.data.data.status === 'failed') {
        setPaymentStatus('failed');
        setPaymentError('Payment failed. Please try again.');
        setIsLoadingPaymentStatus(false);
        if (intervalRef.current) clearInterval(intervalRef.current); // إلغاء الاستعلام عند الفشل
      } else if (!response.data.success) {
        setPaymentStatus('failed');
        setPaymentError(response.data.message || 'Failed to get payment status.');
        setIsLoadingPaymentStatus(false);
      }
    } catch (err) {
      console.error('Error polling payment status:', err);
      setPaymentStatus('failed');
      setPaymentError('An error occurred while checking payment status. Please try again.');
      setIsLoadingPaymentStatus(false);
    }
  };

  // Create payment intent and booking (now in FinalDetails)
  const createPaymentIntent = async (bookingId, amount, currency, token) => {
    console.log('Attempting to create payment intent from FinalDetails with:', { bookingId, amount, currency, token: token ? '[TOKEN_EXISTS]' : '[NO_TOKEN]' });
    try {
      const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
      const intentResponse = await axios.post(paymentIntentUrl, {
        bookingId,
        amount: amount,
        currency: currency.toLowerCase(),
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      
      console.log('Payment Intent Creation Response from FinalDetails:', intentResponse.data);

      if (!intentResponse.data.success) {
        throw new Error(intentResponse.data.message || 'Failed to create payment intent.');
      }

      const { clientSecret: newClientSecret, paymentIntentId } = intentResponse.data.data;
      setClientSecret(newClientSecret);
      setLoading(false);
      console.log('PaymentIntentId after setting state in FinalDetails:', paymentIntentId);
      return true;
    } catch (err) {
      console.error('Error creating payment intent in FinalDetails:', err);
      setPaymentError(err.message || 'Failed to create payment intent. Please try again.');
      setPaymentStatus('failed');
      setLoading(false);
      return false;
    }
  };

  // هذه الدالة سيتم استدعاؤها من PaymentSection عند نجاح بدء عملية الدفع
  const handlePaymentSuccess = async ({ bookingId, paymentIntentId, stripeStatus }) => {
    console.log("Booking and Payment initiation successful! Starting polling...", { bookingId, paymentIntentId, stripeStatus });
    setPaymentStatus('pending');
    setPaymentError('');
    setIsLoadingPaymentStatus(true);

    const userString = localStorage.getItem('user');
    const userData = userString ? JSON.parse(userString) : null;
    const token = userData?.token;

    if (!token) {
      setPaymentStatus('failed');
      setPaymentError('Authentication token not found. Cannot poll for payment status.');
      setIsLoadingPaymentStatus(false);
      return;
    }

    // استدعاء الاستعلام مرة واحدة فوراً
    await pollPaymentStatus(bookingId, token);

    // إعداد الاستعلام الدوري
    if (intervalRef.current) clearInterval(intervalRef.current); // مسح أي interval سابق
    intervalRef.current = setInterval(() => pollPaymentStatus(bookingId, token), 5000); // استعلام كل 5 ثوانٍ
  };

  // Handle client secret update from PaymentSection (now it triggers payment intent creation)
  const handleClientSecretUpdate = async (bookingIdFromPaymentSection, amount, currency, token) => {
    // This function is now responsible for initiating the payment intent creation from FinalDetails
    // It's called by PaymentSection's retry mechanism or on initial booking
    await createPaymentIntent(bookingIdFromPaymentSection, amount, currency, token);
  };

  useEffect(() => {
    const processBookingAndPayment = async () => {
      if (!formData.finalBookingData || !formData.flight) {
        console.warn("FinalDetails: Missing required booking or flight data.");
        setLoading(false);
        setPaymentError('Missing required booking or flight data.');
        setPaymentStatus('failed');
        return;
      }

      setLoading(true);
      setPaymentError('');
      setPaymentStatus('idle');

      try {
        const userString = localStorage.getItem('user');
        const userData = userString ? JSON.parse(userString) : null;
        const token = userData?.token;

        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        // Create booking
        const bookingUrl = new URL('/booking/book-flight', import.meta.env.VITE_API_BASE_URL).toString();
        const bookingResponse = await axios.post(bookingUrl, formData.finalBookingData, { headers });

        if (!bookingResponse.data.success) {
          throw new Error(bookingResponse.data.message || 'Failed to create booking.');
        }

        const newBookingId = bookingResponse.data.data.bookingId;
        const amount = calculateTotalPrice(formData.flight, formData.finalBookingData);

        // Create payment intent using the new booking ID
        const success = await createPaymentIntent(newBookingId, amount, formData.finalBookingData.currency, token);

        if (!success) {
          throw new Error('Failed to finalize payment intent setup.');
        }

        console.log('Booking created and payment intent initiated successfully with ID:', newBookingId);
      } catch (err) {
        console.error('Error during booking or payment-intent creation in FinalDetails:', err);
        setPaymentError(err.message || 'An error occurred during booking or payment setup. Please try again.');
        setPaymentStatus('failed');
        setLoading(false);
      }
    };

    processBookingAndPayment();

    // Cleanup for polling, remains here
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [formData.finalBookingData, formData.flight]);

  return (
    <div className={styles.finalDetails}>
      <div className={styles.mainContent}>
        {paymentStatus === 'succeeded' ? (
          <div className={styles.successMessage}>
            <h2>Your booking is confirmed!</h2>
            <p>Booking ID: {bookingDetails?.bookingId}</p>
            <p>Payment Intent ID: {bookingDetails?.paymentIntentId}</p>
            {/* يمكنك إضافة المزيد من التفاصيل هنا */}
          </div>
        ) : paymentStatus === 'failed' ? (
          <div className={styles.errorMessage}>
            <h2>Payment failed.</h2>
            <p>{paymentError || 'Please try again or contact support.'}</p>
          </div>
        ) : loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingMessage}>
              Setting up payment system...
            </div>
          </div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <PaymentSection 
              bookingData={formData.finalBookingData} 
              onPaymentSuccess={handlePaymentSuccess}
              onClientSecretUpdate={handleClientSecretUpdate}
              onBack={onBack}
              isLoading={isLoadingPaymentStatus} 
              clientSecret={clientSecret}
              paymentIntentId={clientSecret ? clientSecret.split('_secret_')[0] : ''} // Derive paymentIntentId if needed
            />
          </Elements>
        )}
      </div>
      
      <div className={styles.sidebar}>
        <FlightSummary 
          passengers={passengers} 
          formData={formData}
          showBackButton={false}
          showContinueButton={false}
        />
      </div>
    </div>
  );
};

FinalDetails.propTypes = {
  passengers: PropTypes.array.isRequired,
  formData: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default FinalDetails;