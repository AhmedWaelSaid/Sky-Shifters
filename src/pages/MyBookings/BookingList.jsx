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
            
            if (storedDetailsRaw) {
              const storedDetails = JSON.parse(storedDetailsRaw);
              
              // Handle round-trip bookings (they have a flightData array)
              if (booking.flightData && booking.flightData.length > 0) {
                const newFlightData = booking.flightData.map(flightLeg => {
                  const legType = flightLeg.typeOfFlight === 'GO' ? 'departure' : 'return';
                  const details = storedDetails[legType];
                  if (details) {
                    return { ...flightLeg, ...details };
                  }
                  return flightLeg;
                });
                return { ...booking, flightData: newFlightData };
              } 
              // Handle one-way bookings (data is on the root object)
              else if (storedDetails.departure) {
                return {
                  ...booking,
                  ...storedDetails.departure
                };
              }
            }
            return booking;
          });

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

  const handleShowOnMap = (bookingId) => {
    // Find the specific, fully-augmented booking object from the state
    const bookingToShow = bookings.find(b => b._id === bookingId);

    if (bookingToShow) {
      // Store the entire serialized object to ensure all data is passed
      localStorage.setItem('bookingForMap', JSON.stringify(bookingToShow));
      navigate('/');
    } else {
      console.error("Could not find the selected booking in the list.");
    }
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

