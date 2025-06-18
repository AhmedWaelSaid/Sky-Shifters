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
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      alert('Booking not found.');
      return;
    }
    if (booking.status !== 'confirmed') {
      alert('Only confirmed bookings can be cancelled.');
      return;
    }
    if (window.confirm('Are you sure you want to cancel this booking?')) {
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
          alert('Booking cancelled successfully.');
        } else {
          alert('Failed to cancel booking.');
        }
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('user');
          navigate('/auth');
        } else if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('An error occurred while cancelling the booking.');
        }
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

  // Filter out cancelled bookings older than 1 day
  const now = new Date();
  const filteredBookings = bookings.filter(b => {
    if (b.status !== 'cancelled') return true;
    if (!b.cancelledAt) return true;
    const cancelledAt = new Date(b.cancelledAt);
    const diffMs = now - cancelledAt;
    return diffMs < 24 * 60 * 60 * 1000; // less than 1 day
  });

  const sortedBookings = [
    ...filteredBookings.filter(b => b.status !== 'cancelled').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    ...filteredBookings.filter(b => b.status === 'cancelled').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Bookings</h1>
        <p className={styles.subtitle}>View and manage all your bookings</p>
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

