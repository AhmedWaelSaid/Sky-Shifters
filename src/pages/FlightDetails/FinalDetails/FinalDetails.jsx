import styles from './FinalDetails.module.css';
import FlightSummary from '../FlightSummary/FlightSummary';
import PaymentSection from '../PaymentSection/PaymentSection';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useData } from '../../../components/context/DataContext.jsx';
import { calculateTotalPrice } from '../PaymentSection/PaymentSection';

// تهيئة Stripe مرة واحدة خارج المكون
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const FinalDetails = ({ passengers, formData, onBack, sharedData }) => {
    const { flight } = useData();
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, succeeded, failed
    const [paymentError, setPaymentError] = useState('');
    const [isLoading, setIsLoading] = useState(true); // حالة تحميل عامة للتهيئة الأولية
    const [bookingDetails, setBookingDetails] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const intervalRef = useRef(null);

    // ... (دوال createPaymentIntent, pollPaymentStatus, handlePaymentSuccess تبقى كما هي)
    const createPaymentIntent = async (bookingId, amount, currency, token) => {
        try {
            const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
            console.log('🔵 Sending payment intent request to:', paymentIntentUrl, 'with amount:', amount, 'and currency:', currency);
            const intentResponse = await axios.post(paymentIntentUrl, {
                bookingId,
                amount,
                currency: currency.toLowerCase(),
            }, { headers: { 'Authorization': `Bearer ${token}` } });

            if (!intentResponse.data.success) {
                throw new Error(intentResponse.data.message || 'Failed to create payment intent.');
            }

            const { clientSecret, paymentIntentId } = intentResponse.data.data;
            console.log('🔵 Received clientSecret:', clientSecret.substring(0, 10) + '...', 'and paymentIntentId:', paymentIntentId);
            setClientSecret(clientSecret);
            return { clientSecret, paymentIntentId };
        } catch (err) {
            console.error('🔴 Error creating payment intent:', err.response ? err.response.data : err.message);
            setPaymentError(err.response?.data?.message || err.message || 'Failed to create payment intent.');
            return null;
        }
    };

    const pollPaymentStatus = async (bookingId, token) => {
        // ... (هذه الدالة تبقى كما هي)
    };

    const handlePaymentSuccess = async ({ bookingId, paymentIntentId, stripeStatus }) => {
        // ... (هذه الدالة تبقى كما هي)
    };

    useEffect(() => {
        // دالة لتنفيذ عملية الحجز وإنشاء نية الدفع
        const processBookingAndPayment = async () => {
            setIsLoading(true); // بدء التحميل
            if (!flight) {
                setPaymentError('Flight data is missing.');
                setIsLoading(false);
                return;
            }

            const userString = localStorage.getItem('user');
            const userData = userString ? JSON.parse(userString) : null;
            const token = userData?.token;

            if (!token) {
                setPaymentError('Authentication token not found.');
                setIsLoading(false);
                return;
            }

            try {
                // 1. إنشاء الحجز
                const bookingUrl = new URL('/booking/book-flight', import.meta.env.VITE_API_BASE_URL).toString();
                const bookingResponse = await axios.post(bookingUrl, formData.finalBookingData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });

                if (!bookingResponse.data.success) {
                    throw new Error(bookingResponse.data.message || 'Failed to create booking.');
                }

                const newBookingId = bookingResponse.data.data.bookingId;
                const newBookingRef = bookingResponse.data.data.bookingRef;
                setBookingId(newBookingId);

                // Store detailed flight data in localStorage
                try {
                  const isRoundTrip = flight?.return?.data;
                  const flightDetailsToStore = {
                      departure: {
                          duration: flight.departure.data.itineraries[0].duration,
                          departureDate: flight.departure.data.itineraries[0].segments[0].departure.at,
                          arrivalDate: flight.departure.data.itineraries[0].segments.slice(-1)[0].arrival.at,
                          airline: flight.carriers[flight.departure.data.itineraries[0].segments[0].carrierCode],
                          carrierCode: flight.departure.data.itineraries[0].segments[0].carrierCode,
                          numberOfStops: flight.departure.data.itineraries[0].segments.length - 1,
                          originCIty: sharedData?.departure?.origin?.airport?.city,
                          destinationCIty: sharedData?.departure?.dest?.airport?.city,
                          originAirportCode: sharedData?.departure?.origin?.airport?.iata,
                          destinationAirportCode: sharedData?.departure?.dest?.airport?.iata,
                      }
                  };

                  if (isRoundTrip) {
                      flightDetailsToStore.return = {
                          duration: flight.return.data.itineraries[0].duration,
                          departureDate: flight.return.data.itineraries[0].segments[0].departure.at,
                          arrivalDate: flight.return.data.itineraries[0].segments.slice(-1)[0].arrival.at,
                          airline: flight.carriers[flight.return.data.itineraries[0].segments[0].carrierCode],
                          carrierCode: flight.return.data.itineraries[0].segments[0].carrierCode,
                          numberOfStops: flight.return.data.itineraries[0].segments.length - 1,
                          originCIty: sharedData?.return?.origin?.airport?.city,
                          destinationCIty: sharedData?.return?.dest?.airport?.city,
                          originAirportCode: sharedData?.return?.origin?.airport?.iata,
                          destinationAirportCode: sharedData?.return?.dest?.airport?.iata,
                      };
                  }
                  // NOTE: using bookingRef from backend response as the key.
                  if (newBookingRef) {
                    localStorage.setItem(`flightDetails_${newBookingRef}`, JSON.stringify(flightDetailsToStore));
                  } else {
                    // Fallback in case bookingRef is not returned, though it should be.
                    localStorage.setItem(`flightDetails_${newBookingId}`, JSON.stringify(flightDetailsToStore));
                  }
                } catch (e) {
                    console.error("Failed to store flight details in localStorage", e);
                }

                // 2. إنشاء نية الدفع
                const amount = formData.finalBookingData.totalPrice;
                const currency = formData.finalBookingData.currency || 'USD';
                console.log('🔵 Calculated total amount for payment intent:', amount, currency);

                await createPaymentIntent(newBookingId, amount, currency, token);
            } catch (error) {
                console.error("🔴 Error during booking/payment setup:", error);
                setPaymentError(error.message || "An unexpected error occurred during setup.");
            } finally {
                setIsLoading(false); // انتهاء التحميل
            }
        };

        processBookingAndPayment();

        // تنظيف المؤقت عند إلغاء تحميل المكون
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [flight, formData, sharedData]); // الاعتماديات صحيحة

    // لا نمرر clientSecret إلا إذا كان موجود فعلاً
    const options = clientSecret
      ? { clientSecret, appearance: { theme: 'stripe' } }
      : undefined;

    const renderContent = () => {
        if (paymentStatus === 'succeeded') {
            return (
                <div className={styles.successMessage}>
                    <h2>Your booking is confirmed!</h2>
                    <p>Booking ID: {bookingDetails?.bookingId}</p>
                    <p>Payment Intent ID: {bookingDetails?.paymentIntentId}</p>
                </div>
            );
        }

        if (paymentStatus === 'failed' || paymentError) {
             return (
                <div className={styles.errorMessage}>
                    <h2>An error occurred.</h2>
                    <p>{paymentError || 'Please try again or contact support.'}</p>
                    {/* يمكنك إضافة زر لإعادة المحاولة هنا إذا أردت */}
                </div>
            );
        }
        // نعرض PaymentSection دائماً، ونمرر options فقط إذا كان clientSecret موجود
        return (
            options ? (
                <Elements stripe={stripePromise} options={options}>
                    <PaymentSection
                        bookingData={formData.finalBookingData}
                        onPaymentSuccess={handlePaymentSuccess}
                        onBack={onBack}
                        isLoading={isLoading || paymentStatus === 'pending'}
                        clientSecret={clientSecret}
                        bookingId={bookingId}
                    />
                </Elements>
            ) : (
                <PaymentSection
                    bookingData={formData.finalBookingData}
                    onPaymentSuccess={handlePaymentSuccess}
                    onBack={onBack}
                    isLoading={true}
                    clientSecret={''}
                    bookingId={bookingId}
                />
            )
        );
    };

    return (
        <div className={styles.finalDetails}>
            <div className={styles.mainContent}>
                {renderContent()}
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
    sharedData: PropTypes.object.isRequired
};

export default FinalDetails;