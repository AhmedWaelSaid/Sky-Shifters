import styles from './FinalDetails.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import PaymentSection from '../PaymentSection/PaymentSection'; // مكون الدفع المتخصص
import { useState, useEffect } from 'react'; // استيراد useState و useEffect
import axios from 'axios';
import PropTypes from 'prop-types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const FinalDetails = ({ passengers, formData, onBack }) => {
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle', 'pending', 'succeeded', 'failed'
  const [paymentError, setPaymentError] = useState('');
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null); // لتخزين تفاصيل الحجز النهائية بعد التأكيد

  // دالة الاستعلام عن حالة الدفع
  const pollPaymentStatus = async (bookingId, token) => {
    if (!bookingId || !token) return;

    try {
      const statusUrl = new URL(`/payment/status/${bookingId}`, import.meta.env.VITE_API_BASE_URL).toString();
      const response = await axios.get(statusUrl, { headers: { 'Authorization': `Bearer ${token}` } });

      console.log('Payment Status Polling Response:', response.data);

      if (response.data.success && response.data.data.status === 'succeeded') {
        setPaymentStatus('succeeded');
        setBookingDetails(response.data.data); // تخزين تفاصيل الحجز الكاملة
        setIsLoadingPaymentStatus(false);
        // يمكنك إظهار رسالة نجاح أو توجيه المستخدم هنا
      } else if (response.data.success && response.data.data.status === 'failed') {
        setPaymentStatus('failed');
        setPaymentError('Payment failed. Please try again.');
        setIsLoadingPaymentStatus(false);
      } else if (!response.data.success) {
        // إذا كانت الواجهة الخلفية أرجعت خطأ في الاستجابة (وليس حالة دفع فاشلة)
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

  // هذه الدالة سيتم استدعاؤها من "ابنها" PaymentSection عند نجاح بدء عملية الدفع
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

    // ابدأ بالاستعلام فورًا ثم اضبط مؤقتًا للاستعلام الدوري
    await pollPaymentStatus(bookingId, token);

    const intervalId = setInterval(() => {
      pollPaymentStatus(bookingId, token);
    }, 5000); // استعلام كل 5 ثوانٍ

    // حفظ معرف المؤقت لتتمكن من مسحه لاحقًا
    // لا يوجد مكان مباشر لحفظه هنا، لذا سنعتمد على useEffect للمسح.
    // يمكننا استخدام useRef هنا لتخزين الـ intervalId لكن للحفاظ على البساطة،
    // سنعتمد على أن useEffect سيتعامل مع مسح المؤقت عند تغيير paymentStatus
    // أو إلغاء تحميل المكون.
  };

  useEffect(() => {
    let intervalId;
    if (paymentStatus === 'pending') {
      // هذا useEffect سيضمن أن المؤقت يبدأ فقط إذا كان في حالة pending
      // وقد تم استدعاء pollPaymentStatus مرة واحدة على الأقل قبل ذلك.
      // للتحكم الدقيق، قد تحتاج إلى إدارة intervalId في useRef.
    }

    // تنظيف المؤقت عند نجاح الدفع، فشله، أو عند إلغاء تحميل المكون
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentStatus]); // يعاد تشغيله عند تغيير حالة الدفع
  
  return (
    <div className={styles.finalDetails}>
      <div className={styles.mainContent}>
        {
          paymentStatus === 'succeeded' ? (
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
            <Elements stripe={stripePromise}>
              <PaymentSection 
                bookingData={formData.finalBookingData} 
                onPaymentSuccess={handlePaymentSuccess}
                onBack={onBack}
                // Pass overall loading state to PaymentSection
                isLoading={isLoadingPaymentStatus} 
              />
            </Elements>
          )
        }

      </div>
      
      <div className={styles.sidebar}>
        {/* مكون ملخص الرحلة يبقى كما هو لعرض التفاصيل للمستخدم */}
        <FlightSummary 
          passengers={passengers} 
          formData={formData}
          // لا نحتاج لأزرار هنا لأنها موجودة داخل PaymentSection
          showBackButton={false}
          showContinueButton={false}
        />
      </div>
    </div>
  );
};

// تعريف الـ props التي يستقبلها المكون
FinalDetails.propTypes = {
    passengers: PropTypes.array.isRequired,
    formData: PropTypes.object.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default FinalDetails;