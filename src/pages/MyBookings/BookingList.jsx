import React, { useState, useEffect } from 'react';
import styles from './BookingList.module.css';
import BookingCard from './BookingCard';
import TicketPrint from './TicketPrint';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toastStyles from './Toast.module.css';
import modalStyles from './ConfirmModal.module.css';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState(null);
  const [error, setError] = useState(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [showPaymentToast, setShowPaymentToast] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
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

          // فلترة الحجوزات الملغية القديمة (أكثر من 5 دقائق) قبل معالجتها
          const now = new Date();
          const filteredBookingsFromApi = bookingsFromApi.filter(booking => {
            if (booking.status !== 'cancelled') return true;
            if (!booking.cancelledAt) return true;
            const cancelledAt = new Date(booking.cancelledAt);
            // إذا كان التاريخ في المستقبل، اعتبره قديم (أكثر من 5 دقائق)
            const diffMs = now > cancelledAt ? now - cancelledAt : 5 * 60 * 1000 + 1;
            return diffMs < 5 * 60 * 1000; // أقل من 5 دقائق
          });

          const augmentedBookings = filteredBookingsFromApi.map(booking => {
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
    const expiredPending = bookings.filter(b => {
      if (b.status !== 'pending' || !b.createdAt) return false;
      const createdAt = new Date(b.createdAt);
      // إذا كان التاريخ في المستقبل، اعتبره قديم (أكثر من 5 دقائق)
      const timeDiff = now > createdAt ? now - createdAt : 5 * 60 * 1000 + 1;
      return timeDiff > 5 * 60 * 1000;
    });
    
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
      setBookings(prev => prev.filter(b => {
        if (b.status !== 'pending' || !b.createdAt) return true;
        const createdAt = new Date(b.createdAt);
        const timeDiff = now > createdAt ? now - createdAt : 5 * 60 * 1000 + 1;
        return timeDiff <= 5 * 60 * 1000;
      }));
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

  // حذف الحجز نهائياً من قاعدة البيانات (pending و cancelled)
  const handleDeleteBooking = async (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking || (booking.status !== 'pending' && booking.status !== 'cancelled')) return;
    
    try {
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;
      if (!token) {
        navigate('/auth');
        return;
      }
      
      // حذف من قاعدة البيانات
      await axios.delete(`https://sky-shifters.duckdns.org/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // حذف من الواجهة
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      
    } catch (err) {
      console.error('Error deleting booking:', err);
      // حتى لو فشل الحذف من السيرفر، احذف من الواجهة
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    }
  };

  // حذف الحجز من الواجهة فقط (للحجوزات الملغية)
  const handleRemoveFromUI = (bookingId) => {
    setBookings(prev => prev.filter(b => b._id !== bookingId));
  };

  // حذف جميع الحجوزات الملغية من قاعدة البيانات
  const handleRemoveAllCancelled = async () => {
    setShowDeleteAllConfirm(true);
  };

  const handleConfirmDeleteAll = async () => {
    setShowDeleteAllConfirm(false);
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    if (cancelledBookings.length === 0) return;
    
    try {
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;
      if (!token) {
        navigate('/auth');
        return;
      }
      
      // حذف جميع الحجوزات الملغية من قاعدة البيانات
      const deletePromises = cancelledBookings.map(booking => 
        axios.delete(`https://sky-shifters.duckdns.org/booking/${booking._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          console.error(`Error deleting booking ${booking._id}:`, err);
          return null; // تجاهل الأخطاء الفردية
        })
      );
      
      await Promise.all(deletePromises);
      
      // حذف من الواجهة
      setBookings(prev => prev.filter(b => b.status !== 'cancelled'));
      
    } catch (err) {
      console.error('Error deleting cancelled bookings:', err);
      // حتى لو فشل الحذف من السيرفر، احذف من الواجهة
      setBookings(prev => prev.filter(b => b.status !== 'cancelled'));
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
    // إذا كان التاريخ في المستقبل، اعتبره قديم (أكثر من 5 دقائق)
    const diffMs = now > cancelledAt ? now - cancelledAt : 5 * 60 * 1000 + 1;
    return diffMs < 5 * 60 * 1000; // less than 5 minutes
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
        {filteredBookings.some(b => b.status === 'cancelled') && (
          <button 
            className={styles.removeAllButton}
            onClick={handleRemoveAllCancelled}
          >
            Delete All Cancelled Bookings Permanently
          </button>
        )}
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
              onDelete={handleDeleteBooking}
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
      
      {/* Confirmation modal for deleting all cancelled bookings */}
      {showDeleteAllConfirm && (
        <div className={modalStyles.overlay}>
          <div className={modalStyles.modal}>
            <div className={modalStyles.modalTitle}>Delete All Cancelled Bookings</div>
            <div>Are you sure you want to permanently delete all cancelled bookings? This action cannot be undone and all cancelled bookings will be removed from the database.</div>
            <div className={modalStyles.modalActions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowDeleteAllConfirm(false)}>Cancel</button>
              <button className={modalStyles.confirmBtn} onClick={handleConfirmDeleteAll}>Yes, Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;

