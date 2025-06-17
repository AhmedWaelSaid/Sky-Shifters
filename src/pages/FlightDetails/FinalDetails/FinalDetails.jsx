import styles from './FinalDetails.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import PaymentSection from '../PaymentSection/PaymentSection';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Separate component to handle Stripe Elements with client secret
const StripeProvider = ({ clientSecret, children }) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

const FinalDetails = ({ passengers, formData, onBack }) => {
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle', 'pending', 'succeeded', 'failed'
  const [paymentError, setPaymentError] = useState('');
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
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

  // Handle client secret update from PaymentSection
  const handleClientSecretUpdate = (secret) => {
    setClientSecret(secret);
  };

  useEffect(() => {
    // تنظيف المؤقت عند تغيير paymentStatus أو عند إلغاء تحميل المكون
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [paymentStatus]);

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
        ) : (
          clientSecret ? (
            <StripeProvider clientSecret={clientSecret}>
              <PaymentSection 
                bookingData={formData.finalBookingData} 
                onPaymentSuccess={handlePaymentSuccess}
                onClientSecretUpdate={handleClientSecretUpdate}
                onBack={onBack}
                isLoading={isLoadingPaymentStatus} 
              />
            </StripeProvider>
          ) : (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingMessage}>
                Setting up payment system...
              </div>
            </div>
          )
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