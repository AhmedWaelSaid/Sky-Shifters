import React, { useState, useEffect } from 'react';
import { CreditCard, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import styles from './paymentsection.module.css';

// مكون الدفع بدون Stripe Elements (استخدام الطريقة المباشرة)
const PaymentSection = ({ 
  formData = {},
  priceDetails = { total: 0, serviceFee: 0 },
  onBack, 
  onPaymentSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  // حساب الخدمات الإضافية
  const hasSpecialServices = formData?.specialServices && 
    (formData.specialServices.childSeat || 
     formData.specialServices.childMeal || 
     formData.specialServices.stroller);

  // إنشاء الحجز أولاً عند تحميل الكومبوننت
  useEffect(() => {
    createBooking();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // تنسيق رقم البطاقة
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length <= 19) {
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }
    
    // تنسيق تاريخ الانتهاء
    if (name === 'expiryDate') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length <= 5) {
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }
    
    // CVV فقط أرقام
    if (name === 'cvv') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCardDetails(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  // 1. إنشاء الحجز
  const createBooking = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
      
      const bookingData = {
        flightID: formData?.flightID || "F9123",
        originAirportCode: formData?.originAirportCode || "CAI",
        destinationAirportCode: formData?.destinationAirportCode || "JED",
        originCIty: formData?.originCity || "Cairo",
        destinationCIty: formData?.destinationCity || "Jeddah",
        departureDate: formData?.departureDate || "2025-06-15T14:00:00Z",
        arrivalDate: formData?.arrivalDate || "2025-06-15T18:30:00Z",
        travelersInfo: formData?.travelers || [
          {
            firstName: formData?.travelers?.[0]?.firstName || "John",
            lastName: formData?.travelers?.[0]?.lastName || "Doe",
            birthDate: formData?.travelers?.[0]?.birthDate || "1990-01-15",
            travelerType: formData?.travelers?.[0]?.travelerType || "adult",
            nationality: formData?.travelers?.[0]?.nationality || "EGY",
            passportNumber: formData?.travelers?.[0]?.passportNumber || "A1234567",
            issuingCountry: formData?.travelers?.[0]?.issuingCountry || "EGY",
            expiryDate: formData?.travelers?.[0]?.expiryDate || "2027-03-05"
          }
        ],
        selectedBaggageOption: formData?.selectedBaggageOption ? {
          type: formData.selectedBaggageOption.type || "checked",
          weight: formData.selectedBaggageOption.weight || "23kg",
          price: formData.selectedBaggageOption.price || 50,
          currency: formData.selectedBaggageOption.currency || "USD"
        } : {
          type: "checked",
          weight: "23kg",
          price: 50,
          currency: "USD"
        },
        totalPrice: priceDetails?.total || 0,
        currency: "USD",
        contactDetails: formData?.contactDetails || {
          email: formData?.email || "john@example.com",
          phone: formData?.phone || "+1234567890"
        }
      };

      const bookingUrl = new URL('/booking/book-flight', import.meta.env.VITE_API_BASE_URL).toString();
      const response = await axios.post(
        bookingUrl,
        bookingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const newBookingId = response.data.data.bookingId;
        setBookingId(newBookingId);
        
        // إنشاء Payment Intent
        await createPaymentIntent(newBookingId);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    }
  };

  // 2. إنشاء Payment Intent
  const createPaymentIntent = async (bookingId) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
      
      const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
      const response = await axios.post(
        paymentIntentUrl,
        {
          bookingId: bookingId,
          amount: priceDetails?.total || 0,
          currency: "USD"
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setClientSecret(response.data.data.clientSecret);
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  // 3. معالجة الدفع باستخدام Stripe API مباشرة
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!clientSecret) {
      setError('Payment system not ready. Please wait...');
      return;
    }

    // التحقق من بيانات البطاقة
    if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
      setError('Please fill in all card details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // تأكيد الدفع مع Stripe مباشرة
      const response = await fetch('https://api.stripe.com/v1/payment_intents/' + clientSecret.split('_secret')[0] + '/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}`
        },
        body: new URLSearchParams({
          'client_secret': clientSecret,
          'payment_method_data[type]': 'card',
          'payment_method_data[card][number]': cardDetails.cardNumber.replace(/\s/g, ''),
          'payment_method_data[card][exp_month]': cardDetails.expiryDate.split('/')[0],
          'payment_method_data[card][exp_year]': '20' + cardDetails.expiryDate.split('/')[1],
          'payment_method_data[card][cvc]': cardDetails.cvv,
          'payment_method_data[billing_details][name]': cardDetails.cardHolder
        })
      });

      const paymentIntent = await response.json();

      if (paymentIntent.status === 'succeeded') {
        // تأكيد الدفع مع الباك إند
        await confirmPayment(paymentIntent.id);
      } else {
        setError(paymentIntent.error?.message || 'Payment failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please check your card details and try again.');
      setLoading(false);
    }
  };

  // 4. تأكيد الدفع
  const confirmPayment = async (paymentIntentId) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
      
      const confirmPaymentUrl = new URL('/payment/confirm-payment', import.meta.env.VITE_API_BASE_URL).toString();
      const response = await axios.post(
        confirmPaymentUrl,
        {
          paymentIntentId: paymentIntentId,
          bookingId: bookingId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // نجح الدفع
        onPaymentSuccess({
          bookingId: bookingId,
          paymentStatus: 'completed',
          bookingRef: response.data.data.booking?.bookingRef
        });
      } else {
        setError('Payment processed but booking confirmation failed. Please contact support.');
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError('Payment processed but booking confirmation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentSection}>
      <h2 className={styles.sectionTitle}>Payment Details</h2>
      
      <div className={styles.paymentMethods}>
        <button 
          className={`${styles.paymentMethod} ${paymentMethod === 'credit' ? styles.active : ''}`}
          onClick={() => setPaymentMethod('credit')}
        >
          <CreditCard size={20} />
          <span>Credit/Debit Card</span>
        </button>
        
        <button 
          className={`${styles.paymentMethod} ${paymentMethod === 'apple' ? styles.active : ''}`}
          onClick={() => setPaymentMethod('apple')}
        >
          <div className={styles.appleIcon}></div>
          <span>Apple Pay</span>
        </button>
      </div>
      
      {paymentMethod === 'credit' && (
        <form className={styles.cardForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Card Number</label>
            <input 
              type="text" 
              name="cardNumber" 
              placeholder="1234 5678 9012 3456" 
              value={cardDetails.cardNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Card Holder Name</label>
            <input 
              type="text" 
              name="cardHolder" 
              placeholder="John Doe" 
              value={cardDetails.cardHolder}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Expiry Date</label>
              <input 
                type="text" 
                name="expiryDate" 
                placeholder="MM/YY" 
                value={cardDetails.expiryDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>CVV</label>
              <input 
                type="text" 
                name="cvv" 
                placeholder="123" 
                value={cardDetails.cvv}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          {hasSpecialServices && (
            <div className={styles.specialServicesInfo}>
              <h4>Special Services Selected</h4>
              <ul>
                {formData?.specialServices?.childSeat && (
                  <li>Child Seat ($15.99)</li>
                )}
                {formData?.specialServices?.childMeal && (
                  <li>Kids' Meal ($8.99 per child)</li>
                )}
                {formData?.specialServices?.stroller && (
                  <li>Stroller Service (Free)</li>
                )}
              </ul>
            </div>
          )}
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <div className={styles.termsCheckbox}>
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              required
            />
            <label htmlFor="terms">
              I agree to the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>
            </label>
          </div>
          
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.backButton} onClick={onBack}>
              <ChevronLeft size={16} /> Back
            </button>
            <button 
              type="submit" 
              className={styles.payButton} 
              disabled={!agreed || loading || !clientSecret}
            >
              {loading ? 'Processing...' : `Pay $${priceDetails.total.toFixed(2)}`}
            </button>
          </div>
        </form>
      )}
      
      {paymentMethod === 'apple' && (
        <div className={styles.alternativePayment}>
          <p>Continue with Apple Pay at checkout</p>
          <button className={styles.payButton}>Continue</button>
        </div>
      )}
    </div>
  );
};

export default PaymentSection;