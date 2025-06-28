import React, { useState, useEffect } from 'react';
import styles from './BookingList.module.css';
import BookingCard from './BookingCard';
import TicketPrint from './TicketPrint';
import { bookingService } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import toastStyles from './Toast.module.css';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState(null);
  const [error, setError] = useState(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [showPaymentToast, setShowPaymentToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          navigate('/auth');
          return;
        }
        
        const bookingsFromApi = await bookingService.getMyBookings();
        const now = new Date();

        // Filter out expired pending bookings before setting the state
        const validBookings = bookingsFromApi.filter(b => {
          const isPending = b.status === 'pending';
          if (!isPending) return true; // Keep all non-pending bookings

          const isExpired = b.createdAt && (now - new Date(b.createdAt) > 5 * 60 * 1000);
          return !isExpired; // Keep pending bookings that are not expired
        });
        
        if (validBookings && validBookings.length > 0) {
          const augmentedBookings = validBookings.map(booking => {
            // Use bookingRef if available, otherwise fall back to _id
            const bookingKey = booking.bookingRef || booking._id;
            const storedDetailsRaw = localStorage.getItem(`flightDetails_${bookingKey}`);
            // Helper to get airline logo from carrier code
            const getAirlineLogo = (carrierCode) => carrierCode ? `https://pics.avs.io/40/40/${carrierCode}.png` : undefined;
            // Helper to get airline name from booking or details
            const getAirlineName = (flightLeg, details) => {
              // Try details first, then flightLeg, then booking
              return (details && details.airline) || flightLeg.airline || booking.airline || 'Unknown Airline';
            };
            // Helper to get carrier code
            const getCarrierCode = (flightLeg, details) => {
              return (details && details.carrierCode) || flightLeg.carrierCode || flightLeg.airlineCode || undefined;
            };
            if (storedDetailsRaw) {
              const storedDetails = JSON.parse(storedDetailsRaw);
              // Handle round-trip bookings (they have a flightData array)
              if (booking.flightData && booking.flightData.length > 0) {
                const newFlightData = booking.flightData.map(flightLeg => {
                  const legType = flightLeg.typeOfFlight === 'GO' ? 'departure' : 'return';
                  const details = storedDetails[legType];
                  const airline = getAirlineName(flightLeg, details);
                  const carrierCode = getCarrierCode(flightLeg, details);
                  const airlineLogo = getAirlineLogo(carrierCode);
                  if (details) {
                    return { ...flightLeg, ...details, airline, airlineLogo };
                  }
                  return { ...flightLeg, airline, airlineLogo };
                });
                return { ...booking, flightData: newFlightData };
              } 
              // Handle one-way bookings (data is on the root object)
              else if (storedDetails.departure) {
                const airline = getAirlineName(booking, storedDetails.departure);
                const carrierCode = getCarrierCode(booking, storedDetails.departure);
                const airlineLogo = getAirlineLogo(carrierCode);
                // تأكد من نقل numberOfStops من الحجز الأصلي إذا لم تكن موجودة في التفاصيل
                const numberOfStops = storedDetails.departure.numberOfStops ?? booking.numberOfStops;
                return {
                  ...booking,
                  ...storedDetails.departure,
                  airline,
                  airlineLogo,
                  numberOfStops
                };
              }
            }
            // fallback: add airline info if possible
            if (booking.flightData && booking.flightData.length > 0) {
              const newFlightData = booking.flightData.map(flightLeg => {
                const airline = getAirlineName(flightLeg);
                const carrierCode = getCarrierCode(flightLeg);
                const airlineLogo = getAirlineLogo(carrierCode);
                return { ...flightLeg, airline, airlineLogo };
              });
              return { ...booking, flightData: newFlightData };
            } else {
              const airline = getAirlineName(booking);
              const carrierCode = getCarrierCode(booking);
              const airlineLogo = getAirlineLogo(carrierCode);
              return { ...booking, airline, airlineLogo };
            }
          });

          console.log('DEBUG BOOKINGS:', augmentedBookings);

          setBookings(augmentedBookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      return;
    }
    if (booking.status !== 'confirmed') {
      return;
    }
    try {
      const success = await bookingService.cancelBooking(bookingId, 'Change of plans');
      if (success) {
        setBookings(prevBookings =>
          prevBookings.map(b =>
            b._id === bookingId
              ? { ...b, status: 'cancelled', cancellationReason: 'Change of plans', cancelledAt: new Date().toISOString() }
              : b
          )
        );
        setShowCancelToast(true);
        setTimeout(() => setShowCancelToast(false), 2500);
      }
    } catch (error) {
      console.warn('Failed to cancel booking:', bookingId, error.message);
    }
  };

  const handlePrintTicket = (booking) => {
    setSelectedBookingForPrint(booking);
  };

  // حذف الحجز نهائياً (pending فقط)
  const handleDeleteBooking = async (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking || booking.status !== 'pending') return;
    try {
      const success = await bookingService.deleteBooking(bookingId);
      if (success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      }
    } catch (err) {
      console.warn('Failed to delete booking:', bookingId, err.message);
      // Still remove from state to prevent UI issues for pending bookings
      if (booking?.status === 'pending') {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      }
    }
  };

  const handleShowOnMap = (bookingId, booking) => {
    // booking is the full booking object
    const flightSegment = booking.flightData && booking.flightData.length > 0 ? booking.flightData[0] : booking;

    if (!flightSegment.originAirportCode || !flightSegment.destinationAirportCode) {
      console.error("Incomplete flight data, cannot show on map.", flightSegment);
      return;
    }

    const flightPathData = {
      originAirportCode: flightSegment.originAirportCode,
      destinationAirportCode: flightSegment.destinationAirportCode,
      duration: flightSegment.duration,
      departureDate: flightSegment.departureDate,
      arrivalDate: flightSegment.arrivalDate,
      airline: flightSegment.airline || booking.airline || 'Unknown Airline'
    };
    
    localStorage.setItem('selectedFlightPath', JSON.stringify(flightPathData));
    navigate('/');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Filter out cancelled bookings older than 5 minutes
  const now = new Date();
  const filteredBookings = bookings.filter(b => {
    if (b.status !== 'cancelled') {
      return true;
    }
    // Use cancelledAt if available, otherwise fall back to updatedAt
    const cancellationTimestamp = b.cancelledAt || b.updatedAt;

    // If there's no timestamp, hide it to be safe
    if (!cancellationTimestamp) {
      return false;
    }
    const cancelledDate = new Date(cancellationTimestamp);
    const diffMs = now - cancelledDate;
    
    // Keep it visible for 5 minutes after cancellation
    return diffMs < 5 * 60 * 1000;
  });

  const sortedBookings = [
    ...filteredBookings.filter(b => b.status !== 'cancelled').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    ...filteredBookings.filter(b => b.status === 'cancelled').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>My Bookings</h1>
        <p>View and manage all your bookings</p>
      </div>

      <div className={styles.bookingsList}>
        {sortedBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No bookings available</p>
          </div>
        ) : (
          sortedBookings.map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancelBooking}
              onPrintTicket={handlePrintTicket}
              onShowOnMap={handleShowOnMap}
              onCompletePayment={() => {
                setShowPaymentToast(true);
                setTimeout(() => setShowPaymentToast(false), 2500);
              }}
            />
          ))
        )}
      </div>
      {selectedBookingForPrint && (
        <TicketPrint
          booking={selectedBookingForPrint}
          onClose={() => setSelectedBookingForPrint(null)}
        />
      )}
      {/* Toast notification for cancel success */}
      {showCancelToast && (
        <div className={toastStyles.toast}>
          Booking cancelled successfully.
        </div>
      )}
      {/* Toast notification for payment success */}
      {showPaymentToast && (
        <div className={toastStyles.toast} style={{background: '#e6f9ed', color: '#137333', boxShadow: '0 4px 16px rgba(19,115,51,0.10)'}}>
          Payment completed successfully!
        </div>
      )}
    </div>
  );
};

export default BookingList;

