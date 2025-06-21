import React, { useState } from 'react';
import styles from './TicketPrint.module.css';

const TicketPrint = ({ booking, onClose }) => {
  const [activeFlightIndex, setActiveFlightIndex] = useState(0);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isRoundTrip = booking.flightData && booking.flightData.length > 1;
  const activeFlight = (booking.flightData && booking.flightData[activeFlightIndex]) || {};

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
                <strong>Booking Ref: {booking.bookingRef}</strong>
              </div>
              <div className={styles.airline}>
                <div className={styles.airlineLogo}>
                  {(activeFlight.originCIty || 'F').charAt(0)}
                </div>
                <div>
                  <div className={styles.airlineName}>{activeFlight.originCIty || 'Flight'}</div>
                  <div className={styles.flightNumber}>{activeFlight.flightID || ''}</div>
                </div>
              </div>
            </div>
            
            <div className={styles.flightRoute}>
              <div className={styles.departure}>
                <div className={styles.city}>{activeFlight.originCIty || '--'}</div>
                <div className={styles.airport}>{activeFlight.originAirportCode || '--'}</div>
                <div className={styles.time}>{new Date(activeFlight.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--'}</div>
                <div className={styles.date}>{formatDate(activeFlight.departureDate)}</div>
              </div>
              
              <div className={styles.flightPath}>
                <div className={styles.pathLine}></div>
                <div className={styles.plane}>✈</div>
                <div className={styles.duration}>{activeFlight.duration || '--'}</div>
                {activeFlight.numberOfStops > 0 && (
                  <div className={styles.stops}>{activeFlight.numberOfStops} Stop{activeFlight.numberOfStops > 1 ? 's' : ''}</div>
                )}
              </div>
              
              <div className={styles.arrival}>
                <div className={styles.city}>{activeFlight.destinationCIty || '--'}</div>
                <div className={styles.airport}>{activeFlight.destinationAirportCode || '--'}</div>
                <div className={styles.time}>{new Date(activeFlight.arrivalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--'}</div>
                <div className={styles.date}>{formatDate(activeFlight.arrivalDate)}</div>
              </div>
            </div>
          </div>
          
          <div className={styles.ticketDivider}>
            <div className={styles.dividerLine}></div>
            {isRoundTrip && (
              <div className={styles.navDots}>
                {booking.flightData.map((_, index) => (
                  <button 
                    key={index}
                    className={`${styles.dot} ${index === activeFlightIndex ? styles.activeDot : ''}`}
                    onClick={() => setActiveFlightIndex(index)}
                  />
                ))}
              </div>
            )}
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
                <span>{formatDate(booking.createdAt)}</span>
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

