import React from 'react';
import styles from './TicketPrint.module.css';

const TicketPrint = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.ticketContainer}>
        <div className={styles.ticketHeader}>
          <h2>Flight Ticket</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.ticket}>
          <div className={styles.ticketTop}>
            <div className={styles.ticketInfo}>
              <div className={styles.bookingRef}>
                <strong>Booking Ref: {booking.bookingReference}</strong>
              </div>
              <div className={styles.airline}>
                <div className={styles.airlineLogo}>
                  {(booking.airline && typeof booking.airline === 'string')
                    ? booking.airline.charAt(0)
                    : (booking.originCity && typeof booking.originCity === 'string')
                      ? booking.originCity.charAt(0)
                      : (booking.flightId && typeof booking.flightId === 'string')
                        ? booking.flightId.charAt(0)
                        : '?'}
                </div>
                <div>
                  <div className={styles.airlineName}>{booking.airline || booking.originCity || booking.flightId || 'Flight'}</div>
                  <div className={styles.flightNumber}>{booking.flightNumber || booking.flightId || booking.bookingRef || ''}</div>
                </div>
              </div>
            </div>
            
            <div className={styles.flightRoute}>
              <div className={styles.departure}>
                <div className={styles.city}>{booking.departure?.city || booking.originCity || '--'}</div>
                <div className={styles.airport}>{booking.departure?.airport || booking.originAirportCode || '--'}</div>
                <div className={styles.time}>{booking.departure?.time || booking.departureTime || (booking.departureDate ? new Date(booking.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--')}</div>
                <div className={styles.date}>{formatDate(booking.departure?.date || booking.departureDate || '')}</div>
              </div>
              
              <div className={styles.flightPath}>
                <div className={styles.pathLine}></div>
                <div className={styles.plane}>✈</div>
                <div className={styles.duration}>{booking.duration}</div>
                {booking.stops > 0 && (
                  <div className={styles.stops}>{booking.stops} توقف</div>
                )}
              </div>
              
              <div className={styles.arrival}>
                <div className={styles.city}>{booking.arrival?.city || booking.destinationCity || '--'}</div>
                <div className={styles.airport}>{booking.arrival?.airport || booking.destinationAirportCode || '--'}</div>
                <div className={styles.time}>{booking.arrival?.time || booking.arrivalTime || (booking.arrivalDate ? new Date(booking.arrivalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--')}</div>
                <div className={styles.date}>{formatDate(booking.arrival?.date || booking.arrivalDate || '')}</div>
              </div>
            </div>
          </div>
          
          <div className={styles.ticketDivider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerCircles}>
              <div className={styles.circle}></div>
              <div className={styles.circle}></div>
              <div className={styles.circle}></div>
              <div className={styles.circle}></div>
              <div className={styles.circle}></div>
            </div>
          </div>
          
          <div className={styles.ticketBottom}>
            <div className={styles.passengerInfo}>
              <h3>Passenger Information</h3>
              {(booking.travellersInfo || []).map((passenger, index) => (
                <div key={passenger.passportNumber || index} className={styles.passenger}>
                  <span className={styles.passengerName}>{passenger.firstName} {passenger.lastName}</span>
                  <span className={styles.passengerType}>({passenger.travelerType})</span>
                </div>
              ))}
            </div>
            
            <div className={styles.bookingDetails}>
              <div className={styles.detailRow}>
                <span>Booking Date:</span>
                <span>{formatDate(booking.bookingDate)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Booking Status:</span>
                <span className={styles.status}>Confirmed</span>
              </div>
              <div className={styles.detailRow}>
                <span>Amount Paid:</span>
                <span className={styles.price}>${(Number(booking.totalPrice) || Number(booking.price) || 0).toFixed(2)}</span>
              </div>
            </div>
            
            <div className={styles.barcode}>
              <div className={styles.barcodeLines}>
                {Array.from({length: 30}, (_, i) => (
                  <div 
                    key={i} 
                    className={styles.barcodeLine}
                    style={{
                      height: Math.random() > 0.5 ? '20px' : '15px',
                      width: '2px'
                    }}
                  ></div>
                ))}
              </div>
              <div className={styles.barcodeText}>{booking.bookingReference}</div>
            </div>
          </div>
        </div>
        
        <div className={styles.ticketActions}>
          <button className={styles.printButton} onClick={handlePrint}>
            Print Ticket
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketPrint;

