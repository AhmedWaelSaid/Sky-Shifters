import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BookingCard.module.css';
import modalStyles from './ConfirmModal.module.css';
import PaymentSection from '../FlightDetails/PaymentSection/PaymentSection';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import paymentStyles from '../FlightDetails/PaymentSection/paymentsection.module.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Helper function to format ISO 8601 duration
const formatDuration = (isoDuration) => {
  if (!isoDuration || typeof isoDuration !== 'string') return '--';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return '--';
  
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return '--';
};

// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const BookingCard = ({ booking, onCancel, onPrintTicket, onCompletePayment, onDelete }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState(booking.clientSecret || '');
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'cancelled':
        return styles.statusCancelled;
      case 'pending':
        return styles.statusPending;
      default:
        return '';
    }
  };

  const handleCancelClick = () => setShowConfirm(true);
  const handleCloseModal = () => setShowConfirm(false);
  const handleConfirmCancel = () => {
    setShowConfirm(false);
    onCancel(booking._id);
  };

  // حذف الحجز نهائياً (pending فقط)
  const handleDeleteBooking = async () => {
    if (booking.status === 'pending') {
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    // احذف الكارد من الواجهة مباشرة
    if (typeof onDelete === 'function') {
      onDelete(booking._id);
    }
  };

  const handleCloseDeleteModal = () => setShowDeleteConfirm(false);

  useEffect(() => {
    if (booking.status === 'pending' && booking.createdAt) {
      const created = new Date(booking.createdAt);
      const updateCountdown = () => {
        const now = new Date();
        const diff = 5 * 60 * 1000 - (now - created);
        setRemainingTime(diff > 0 ? diff : 0);
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [booking.status, booking.createdAt]);

  const handleOpenPaymentModal = async () => {
    setShowPaymentModal(true);
    if (!clientSecret) {
      setLoadingPayment(true);
      try {
        const userString = localStorage.getItem('user');
        const userData = userString ? JSON.parse(userString) : null;
        const token = userData?.token;
        if (!token) throw new Error('No auth token');
        const amount = booking.totalPrice || booking.price;
        const currency = booking.currency || 'USD';
        const paymentIntentUrl = new URL('/payment/create-payment-intent', import.meta.env.VITE_API_BASE_URL).toString();
        const intentResponse = await axios.post(paymentIntentUrl, {
          bookingId: booking._id,
          amount,
          currency: currency.toLowerCase(),
        }, { headers: { 'Authorization': `Bearer ${token}` } });
        if (intentResponse.data.success) {
          setClientSecret(intentResponse.data.data.clientSecret);
        }
      } catch (err) {
        // يمكن عرض رسالة خطأ هنا
      } finally {
        setLoadingPayment(false);
      }
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
    // يمكن هنا تحديث حالة الحجز في القائمة إذا أردت
  };

  return (
    <div className={styles.bookingCard}>
      <div className={styles.cardHeader}>
        <div className={styles.bookingInfo}>
          <h3 className={styles.bookingReference}>{booking.bookingReference}</h3>
          <span className={`${styles.status} ${getStatusClass(booking.status)}`}>{getStatusText(booking.status)}</span>
        </div>
        <div className={styles.bookingDate}>
          Booking Date: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '--'}
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.leftSection}>
          <div className={styles.flightInfo}>
            <div className={styles.importantInfo}>
              <div className={styles.infoIcon}>!</div>
              <div className={styles.infoContent}>
                <h4>Important flight information</h4>
                <p>Please note that additional fees may apply at the airport.</p>
              </div>
            </div>

            {(booking.flightData && booking.flightData.length > 0) ? (
              booking.flightData.map((flight, index) => (
                <div key={flight.flightID || index} className={styles.flightSegment}>
                  <h4 className={styles.segmentTitle}>
                    {flight.typeOfFlight === 'GO' ? 'Departure Flight' : 'Return Flight'}
                  </h4>
                  <div className={styles.airlineSection}>
                    <div className={styles.airlineIcon}>
                      <div className={styles.airlineLogo}>
                        {(flight.originCIty || flight.originCity || 'F').charAt(0)}
                      </div>
                    </div>
                    <div className={styles.airlineInfo}>
                      <h4>{flight.originCIty || flight.originCity || 'Flight'}</h4>
                      <p>{booking.bookingRef || ''}</p>
                    </div>
                  </div>
                  <div className={styles.flightDetails}>
                    <div className={styles.flightRoute}>
                      <div className={styles.departureInfo}>
                        <div className={styles.time}>{formatTime(flight.departureDate)}</div>
                        <div className={styles.airport}>{flight.originAirportCode}</div>
                        <div className={styles.date}>{new Date(flight.departureDate).toLocaleDateString()}</div>
                      </div>
                      <div className={styles.flightPath}>
                        <div className={styles.stopsInfo}>
                          {flight.numberOfStops > 0 ? `${flight.numberOfStops} Stop(s)` : 'Direct'}
                        </div>
                        <div className={styles.pathLine}>
                          <div className={styles.pathDot}></div>
                          <div className={styles.pathConnector}></div>
                          <div className={styles.pathArrow}>→</div>
                        </div>
                        <div className={styles.duration}>{formatDuration(flight.duration)}</div>
                      </div>
                      <div className={styles.arrivalInfo}>
                        <div className={styles.time}>{formatTime(flight.arrivalDate)}</div>
                        <div className={styles.airport}>{flight.destinationAirportCode}</div>
                        <div className={styles.date}>{new Date(flight.arrivalDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback for old booking structure
              <>
                <div className={styles.airlineSection}>
                  <div className={styles.airlineIcon}>
                    <div className={styles.airlineLogo}>
                      {(booking.airline && typeof booking.airline === 'string')
                        ? booking.airline.charAt(0)
                        : (booking.originCity && typeof booking.originCity === 'string')
                          ? booking.originCity.charAt(0)
                          : (booking.flightId && typeof booking.flightId === 'string')
                            ? booking.flightId.charAt(0)
                            : '?'}
                    </div>
                  </div>
                  <div className={styles.airlineInfo}>
                    <h4>{booking.airline || booking.originCity || booking.flightId || 'Flight'}</h4>
                    <p>{booking.bookingRef || ''}</p>
                  </div>
                </div>
                <div className={styles.flightDetails}>
                  <div className={styles.flightRoute}>
                    <div className={styles.departureInfo}>
                      <div className={styles.time}>{formatTime(booking.departureDate)}</div>
                      <div className={styles.airport}>{booking.departure?.airport || booking.originAirportCode || '--'}</div>
                      <div className={styles.date}>{booking.departure?.date || (booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : '--')}</div>
                    </div>
                    <div className={styles.flightPath}>
                      <div className={styles.stopsInfo}>
                        {booking.stops > 0 ? `${booking.stops} Stop` : 'Direct'}
                      </div>
                      <div className={styles.pathLine}>
                        <div className={styles.pathDot}></div>
                        <div className={styles.pathConnector}></div>
                        <div className={styles.pathArrow}>→</div>
                      </div>
                      <div className={styles.duration}>{formatDuration(booking.duration)}</div>
                    </div>
                    <div className={styles.arrivalInfo}>
                      <div className={styles.time}>{formatTime(booking.arrivalDate)}</div>
                      <div className={styles.airport}>{booking.arrival?.airport || booking.destinationAirportCode || '--'}</div>
                      <div className={styles.date}>{booking.arrival?.date || (booking.arrivalDate ? new Date(booking.arrivalDate).toLocaleDateString() : '--')}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* <div className={styles.baggageInfo}>
              <strong>Baggage Option:</strong> {booking.selectedBaggageOption ? `${booking.selectedBaggageOption.type} - ${booking.selectedBaggageOption.weight} - ${booking.selectedBaggageOption.price} ${booking.selectedBaggageOption.currency}` : 'N/A'}
            </div>

            <div className={styles.contactInfo}>
              <strong>Contact:</strong> {booking.contactDetails ? `${booking.contactDetails.email} | ${booking.contactDetails.phone}` : 'N/A'}
            </div> */}

            <div className={styles.passengers}>
              <h4>Passengers</h4>
              {(booking.travellersInfo || []).map((passenger, index) => (
                <div key={passenger.passportNumber || index} className={styles.passenger}>
                  <span>{passenger.firstName} {passenger.lastName}</span>
                  <span className={styles.passengerType}>({passenger.travelerType})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.flightSummary}>
            <h4>Flight Summary</h4>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Booking Reference:</span> {booking.bookingRef || '--'}
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Payment Status:</span> {booking.paymentStatus || '--'}
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Status:</span> {booking.status || '--'}
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Last Update:</span> {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : '--'}
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Price Details:</span>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceItem}>
                    <span>Passengers {(booking.travellersInfo || []).length}</span>
                    <span>{booking.currency || 'USD'} {(Number(booking.totalPrice) || Number(booking.price) || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className={styles.totalPrice}>
                  <span>Total amount required</span>
                  <span>{booking.currency || 'USD'} {(Number(booking.totalPrice) || Number(booking.price) || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button
          className={styles.printButton}
          onClick={() => onPrintTicket(booking)}
          disabled={booking.status !== 'confirmed'}
        >
          Print Ticket
        </button>
        {booking.status === 'confirmed' && (
          <button
            className={styles.seatButton}
            onClick={() => navigate('/seat-map', { state: { booking } })}
          >
            Know your seat
          </button>
        )}
        <button
          className={styles.cancelButton}
          onClick={handleCancelClick}
          disabled={booking.status !== 'confirmed'}
        >
          Cancel Booking
        </button>
        {/* زر حذف الحجز (Delete Booking) تمت إزالته بناءً على طلب المستخدم */}
        {booking.status === 'pending' && remainingTime > 0 && (
          <button
            className={styles.payButton}
            onClick={handleOpenPaymentModal}
          >
            Complete Payment
            {remainingTime !== null && (
              <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#555' }}>
                ({Math.floor(remainingTime / 60000)}:{String(Math.floor((remainingTime % 60000) / 1000)).padStart(2, '0')})
              </span>
            )}
          </button>
        )}
      </div>

      {showConfirm && (
        <div className={modalStyles.overlay}>
          <div className={modalStyles.modal}>
            <div className={modalStyles.modalTitle}>Cancel Booking</div>
            <div>Are you sure you want to cancel this booking? This action cannot be undone.</div>
            <div className={modalStyles.modalActions}>
              <button className={modalStyles.cancelBtn} onClick={handleCloseModal}>Back</button>
              <button className={modalStyles.confirmBtn} onClick={handleConfirmCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className={modalStyles.overlay}>
          <div className={modalStyles.modal} style={{ minWidth: 400, maxWidth: 500 }}>
            {showSuccessToast && (
              <div className={paymentStyles.successToastExact}>
                Payment completed successfully!
              </div>
            )}
            <div className={modalStyles.modalTitle}>Complete Payment</div>
            {loadingPayment || !clientSecret ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading payment form...</div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <PaymentSection
                  bookingData={booking}
                  onPaymentSuccess={handlePaymentSuccess}
                  onBack={() => setShowPaymentModal(false)}
                  isLoading={false}
                  clientSecret={clientSecret}
                  bookingId={booking._id}
                  hideCardPreview={true}
                />
              </Elements>
            )}
            <div className={modalStyles.modalActions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowPaymentModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className={modalStyles.overlay}>
          <div className={modalStyles.modal}>
            <div className={modalStyles.modalTitle}>Delete Booking</div>
            <div>Are you sure you want to delete this booking? This action cannot be undone.</div>
            <div className={modalStyles.modalActions}>
              <button className={modalStyles.cancelBtn} onClick={handleCloseDeleteModal}>Back</button>
              <button className={modalStyles.confirmBtn} onClick={handleConfirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;

