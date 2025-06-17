import styles from './FinalDetails.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import PaymentSection from '../PaymentSection/PaymentSection';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useData } from "../../../components/context/DataContext.jsx";
import { calculateTotalPrice } from '../PaymentSection/PaymentSection';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const FinalDetails = ({ passengers, formData, onBack }) => {
  const { flight } = useData();
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paymentError, setPaymentError] = useState('');
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const intervalRef = useRef(null);

  // دالة إنشاء الـ Payment Intent
  const createPaymentIntent = async (bookingId, amount, currency, token) => {
    try {
      const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
      const intentResponse = await axios.post(paymentIntentUrl, {
        bookingId,
        amount,
        currency: currency.toLowerCase(),
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      if (!intentResponse.data.success) {
        throw new Error(intentResponse.data.message || 'Failed to create payment intent.');
      }

      const { clientSecret, paymentIntentId } = intentResponse.data.data;
      setClientSecret(clientSecret);
      return { clientSecret, paymentIntentId };
    } catch (err) {
      console.error('🔴 Error creating payment intent:', err);
      setPaymentError(err.message || 'Failed to create payment intent.');
      return null;
    }
  };

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
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else if (response.data.success && response.data.data.status === 'failed') {
        setPaymentStatus('failed');
        setPaymentError('Payment failed. Please try again.');
        setIsLoadingPaymentStatus(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
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

    await pollPaymentStatus(bookingId, token);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => pollPaymentStatus(bookingId, token), 5000);
  };

  useEffect(() => {
    const processBookingAndPayment = async () => {
      if (!flight) {
        setPaymentError('Flight data is missing.');
        return;
      }

      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;

      if (!token) {
        setPaymentError('Authentication token not found.');
        return;
      }

      const bookingUrl = new URL('/booking/book-flight', import.meta.env.VITE_API_BASE_URL).toString();
      const bookingResponse = await axios.post(bookingUrl, formData.finalBookingData, { headers: { 'Authorization': `Bearer ${token}` } });

      if (!bookingResponse.data.success) {
        setPaymentError(bookingResponse.data.message || 'Failed to create booking.');
        return;
      }

      const newBookingId = bookingResponse.data.data.bookingId;
      const amount = calculateTotalPrice(flight, formData.finalBookingData);
      const currency = formData.finalBookingData.currency || 'USD';

      console.log('🔵 Calculated total amount for payment intent:', amount, currency);

      const paymentResult = await createPaymentIntent(newBookingId, amount, currency, token);
      if (!paymentResult) {
        setPaymentError('Failed to create payment intent.');
      }
    };

    processBookingAndPayment();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [flight, formData]);

  const options = clientSecret ? { clientSecret, appearance: { theme: 'stripe' } } : {};

  return (
    <div className={styles.finalDetails}>
      <div className={styles.mainContent}>
        {paymentStatus === 'succeeded' ? (
          <div className={styles.successMessage}>
            <h2>Your booking is confirmed!</h2>
            <p>Booking ID: {bookingDetails?.bookingId}</p>
            <p>Payment Intent ID: {bookingDetails?.paymentIntentId}</p>
          </div>
        ) : paymentStatus === 'failed' ? (
          <div className={styles.errorMessage}>
            <h2>Payment failed.</h2>
            <p>{paymentError || 'Please try again or contact support.'}</p>
          </div>
        ) : (
          <Elements stripe={stripePromise} options={options}>
            <PaymentSection 
              bookingData={formData.finalBookingData} 
              onPaymentSuccess={handlePaymentSuccess}
              onBack={onBack}
              isLoading={isLoadingPaymentStatus}
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