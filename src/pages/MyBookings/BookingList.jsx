import React, { useState, useEffect } from 'react';
import styles from './BookingList.module.css';
import BookingCard from './BookingCard';
import ProgressSteps from './ProgressSteps';
import TicketPrint from './TicketPrint';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState(null);

  // محاكاة جلب البيانات من API
  useEffect(() => {
    // محاكاة استدعاء API
    const fetchBookings = async () => {
      try {
        // هنا يمكن استبدال هذا بـ API حقيقي
        const mockBookings = [
          {
            id: 1,
            bookingReference: 'SV388-2025',
            airline: 'Saudi Arabian Airlines',
            flightNumber: 'SV-388',
            departure: {
              airport: 'CAI',
              city: 'Cairo',
              time: '11:25 PM',
              date: 'Wed, 18 Jun 2025'
            },
            arrival: {
              airport: 'RUH',
              city: 'Riyadh',
              time: '7:50 AM',
              date: 'Thu, 19 Jun 2025'
            },
            duration: '8h 25m',
            stops: 1,
            passengers: [
              {
                id: 1,
                name: 'Adult 1',
                type: 'Adult'
              }
            ],
            price: 96.02,
            currency: 'USD',
            status: 'confirmed',
            bookingDate: '2025-06-15',
            cancellationPolicy: {
              refundable: false,
              changeableWithFees: true
            }
          },
          {
            id: 2,
            bookingReference: 'EK205-2025',
            airline: 'Emirates',
            flightNumber: 'EK-205',
            departure: {
              airport: 'DXB',
              city: 'Dubai',
              time: '2:15 PM',
              date: 'Fri, 20 Jun 2025'
            },
            arrival: {
              airport: 'CAI',
              city: 'Cairo',
              time: '5:30 PM',
              date: 'Fri, 20 Jun 2025'
            },
            duration: '4h 15m',
            stops: 0,
            passengers: [
              {
                id: 1,
                name: 'Adult 1',
                type: 'Adult'
              },
              {
                id: 2,
                name: 'Adult 2',
                type: 'Adult'
              }
            ],
            price: 245.50,
            currency: 'USD',
            status: 'confirmed',
            bookingDate: '2025-06-16',
            cancellationPolicy: {
              refundable: true,
              changeableWithFees: false
            }
          }
        ];
        
        setTimeout(() => {
          setBookings(mockBookings);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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
          <p>جاري تحميل الحجوزات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProgressSteps currentStep={4} />
      
      <div className={styles.header}>
        <h1 className={styles.title}>حجوزاتي</h1>
        <p className={styles.subtitle}>عرض وإدارة جميع حجوزاتك</p>
      </div>

      <div className={styles.bookingsList}>
        {bookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>لا توجد حجوزات حالياً</p>
          </div>
        ) : (
          bookings.map(booking => (
            <BookingCard
              key={booking.id}
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

