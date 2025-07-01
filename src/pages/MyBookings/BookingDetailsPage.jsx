import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import BookingCard from './BookingCard';

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      setError(null);
      try {
        const bookingData = await bookingService.getBookingById(bookingId);
        setBooking(bookingData);
      } catch (err) {
        setError('Booking not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div style={{padding:'2rem'}}>Loading booking details...</div>;
  if (error) return <div style={{padding:'2rem', color:'red'}}>{error}</div>;
  if (!booking) return <div style={{padding:'2rem'}}>No booking found.</div>;

  return (
    <div style={{padding:'2rem', maxWidth:700, margin:'0 auto'}}>
      <BookingCard booking={booking} />
    </div>
  );
} 