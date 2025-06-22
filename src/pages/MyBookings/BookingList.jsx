import React, { useState, useEffect } from 'react';
import styles from './BookingList.module.css';
import BookingCard from './BookingCard';
import TicketPrint from './TicketPrint';
import axios from 'axios';
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
        const userData = userString ? JSON.parse(userString) : null;
        const token = userData?.token;
        if (!token) {
          navigate('/auth');
          return;
        }
        const response = await axios.get('https://sky-shifters.duckdns.org/booking/my-bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data?.data?.bookings) {
          const bookingsFromApi = response.data.data.bookings;

          const augmentedBookings = bookingsFromApi.map(booking => {
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
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          // Token expired or invalid
          localStorage.removeItem('user');
          navigate('/auth');
        } else {
          setError('Failed to load bookings. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [navigate]);

  // حذف الحجوزات pending المنتهية (أكثر من 5 دقائق)
  useEffect(() => {
    const now = new Date();
    const expiredPending = bookings.filter(b => b.status === 'pending' && b.createdAt && (now - new Date(b.createdAt) > 5 * 60 * 1000));
    if (expiredPending.length > 0) {
      expiredPending.forEach(async (booking) => {
        try {
          const userString = localStorage.getItem('user');
          const userData = userString ? JSON.parse(userString) : null;
          const token = userData?.token;
          if (!token) return;
          await axios.delete(`https://sky-shifters.duckdns.org/booking/${booking._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          // يمكن تجاهل الخطأ هنا
        }
      });
      setBookings(prev => prev.filter(b => !(b.status === 'pending' && b.createdAt && (now - new Date(b.createdAt) > 5 * 60 * 1000))));
    }
  }, [bookings]);

  const handleCancelBooking = async (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      // Optionally show a non-blocking error message here
      return;
    }
    if (booking.status !== 'confirmed') {
      // Optionally show a non-blocking error message here
      return;
    }
    try {
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;
      if (!token) {
        navigate('/auth');
        return;
      }
      const response = await axios.post(`https://sky-shifters.duckdns.org/booking/${bookingId}/cancel`, {
        reason: 'Change of plans'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data?.success) {
        setBookings(prevBookings =>
          prevBookings.map(b =>
            b._id === bookingId
              ? { ...b, status: 'cancelled', cancellationReason: 'Change of plans', cancelledAt: new Date().toISOString() }
              : b
          )
        );
        setShowCancelToast(true);
        setTimeout(() => setShowCancelToast(false), 2500);
      } else {
        // Optionally show a non-blocking error message here
      }
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('user');
        navigate('/auth');
      } else if (error.response && error.response.data && error.response.data.message) {
        // Optionally show a non-blocking error message here
      } else {
        // Optionally show a non-blocking error message here
      }
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
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;
      if (!token) {
        navigate('/auth');
        return;
      }
      await axios.delete(`https://sky-shifters.duckdns.org/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      // يمكن عرض رسالة خطأ هنا إذا أردت
    } finally {
      // احذف الحجز من القائمة فوراً حتى لو فشل الحذف من السيرفر
      setBookings(prev => prev.filter(b => b._id !== bookingId));
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
    if (b.status !== 'cancelled') return true;
    if (!b.cancelledAt) return true;
    const cancelledAt = new Date(b.cancelledAt);
    const diffMs = now - cancelledAt;
    return diffMs < 5 * 60 * 1000; // less than 5 minutes
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

