import React, { useState, useEffect } from 'react';
import styles from './BookingList.module.css';
import BookingCard from './BookingCard';
import TicketPrint from './TicketPrint';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState(null);
  const [error, setError] = useState(null);
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
          setBookings(response.data.data.bookings);
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

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
      try {
        // محاكاة استدعاء API لإلغاء الحجز
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
        alert('تم إلغاء الحجز بنجاح');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('حدث خطأ أثناء إلغاء الحجز');
      }
    }
  };

  const handlePrintTicket = (booking) => {
    setSelectedBookingForPrint(booking);
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Bookings</h1>
        <p className={styles.subtitle}>View and manage all your bookings</p>
      </div>

      <div className={styles.bookingsList}>
        {bookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No bookings available</p>
          </div>
        ) : (
          bookings.map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancelBooking}
              onPrintTicket={handlePrintTicket}
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
    </div>
  );
};

export default BookingList;

