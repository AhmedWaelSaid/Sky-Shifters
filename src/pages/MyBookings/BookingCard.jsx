import React from 'react';
import styles from './BookingCard.module.css';

const BookingCard = ({ booking, onCancel, onPrintTicket }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'cancelled':
        return styles.statusCancelled;
      case 'pending':
        return styles.statusPending;
      default:
        return '';
    }
  };

  return (
    <div className={styles.bookingCard}>
      <div className={styles.cardHeader}>
        <div className={styles.bookingInfo}>
          <h3 className={styles.bookingReference}>{booking.bookingReference}</h3>
          <span className={`${styles.status} ${getStatusClass(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
        </div>
        <div className={styles.bookingDate}>
          Booking Date: {new Date(booking.bookingDate).toLocaleDateString('en-US')}
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.leftSection}>
          <div className={styles.flightInfo}>
            <div className={styles.importantInfo}>
              <div className={styles.infoIcon}>!</div>
              <div className={styles.infoContent}>
                <h4>Important flight information</h4>
                <p>Please note that additional fees may apply at the airport.</p>
              </div>
            </div>

            <div className={styles.airlineSection}>
              <div className={styles.airlineIcon}>
                <div className={styles.airlineLogo}>
                  {(booking.airline && typeof booking.airline === 'string')
                    ? booking.airline.charAt(0)
                    : (booking.originCity && typeof booking.originCity === 'string')
                      ? booking.originCity.charAt(0)
                      : (booking.flightId && typeof booking.flightId === 'string')
                        ? booking.flightId.charAt(0)
                        : '?'}
                </div>
              </div>
              <div className={styles.airlineInfo}>
                <h4>{booking.airline || booking.originCity || booking.flightId || 'Flight'}</h4>
                <p>{booking.flightNumber || booking.flightId || booking.bookingRef || ''}</p>
              </div>
            </div>

            <div className={styles.flightDetails}>
              <div className={styles.flightRoute}>
                <div className={styles.departureInfo}>
                  <div className={styles.time}>{booking.departure?.time || booking.departureTime || (booking.departureDate ? new Date(booking.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--')}</div>
                  <div className={styles.airport}>{booking.departure?.airport || booking.originAirportCode || '--'}</div>
                  <div className={styles.date}>{booking.departure?.date || (booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : '--')}</div>
                </div>
                
                <div className={styles.flightPath}>
                  <div className={styles.stopsInfo}>
                    {booking.stops > 0 ? `${booking.stops} Stop` : 'Direct'}
                  </div>
                  <div className={styles.pathLine}>
                    <div className={styles.pathDot}></div>
                    <div className={styles.pathConnector}></div>
                    <div className={styles.pathArrow}>→</div>
                  </div>
                  <div className={styles.duration}>{booking.duration || '--'}</div>
                </div>
                
                <div className={styles.arrivalInfo}>
                  <div className={styles.time}>{booking.arrival?.time || booking.arrivalTime || (booking.arrivalDate ? new Date(booking.arrivalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--')}</div>
                  <div className={styles.airport}>{booking.arrival?.airport || booking.destinationAirportCode || '--'}</div>
                  <div className={styles.date}>{booking.arrival?.date || (booking.arrivalDate ? new Date(booking.arrivalDate).toLocaleDateString() : '--')}</div>
                </div>
              </div>
            </div>

            <div className={styles.passengers}>
              <h4>Passengers</h4>
              {(booking.travellersInfo || []).map((passenger, index) => (
                <div key={passenger.passportNumber || index} className={styles.passenger}>
                  <span>{passenger.firstName} {passenger.lastName}</span>
                  <span className={styles.passengerType}>({passenger.travelerType})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.flightSummary}>
            <h4>Flight Summary</h4>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Departure</span>
                <div className={styles.summaryFlight}>
                  <div>{booking.departure?.date || (booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : '--')}</div>
                  <div className={styles.flightNumber}>{booking.flightNumber || booking.flightId || booking.bookingRef || ''}</div>
                  <div className={styles.flightTime}>
                    <span className={styles.time}>{booking.departure?.time || booking.departureTime || (booking.departureDate ? new Date(booking.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--')}</span>
                    <span className={styles.airport}>{booking.departure?.airport || booking.originAirportCode || '--'}</span>
                  </div>
                  <div className={styles.flightPath}>
                    {booking.stops > 0 && <span className={styles.stops}>{booking.stops} Stop</span>}
                    <div className={styles.pathArrow}>→</div>
                  </div>
                  <div className={styles.flightTime}>
                    <span className={styles.time}>{booking.arrival?.time || booking.arrivalTime || (booking.arrivalDate ? new Date(booking.arrivalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--')}</span>
                    <span className={styles.airport}>{booking.arrival?.airport || booking.destinationAirportCode || '--'}</span>
                  </div>
                  <div className={styles.duration}>{booking.duration || '--'}</div>
                </div>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.label}>Cancellation and Date Change</span>
                <div className={styles.policyInfo}>
                  <div className={`${styles.policyItem} ${!booking.cancellationPolicy?.refundable ? styles.nonRefundable : ''}`}>
                    • {booking.cancellationPolicy?.refundable === true ? 'Refundable' : booking.cancellationPolicy?.refundable === false ? 'Non-refundable' : 'N/A'}
                  </div>
                  <div className={`${styles.policyItem} ${booking.cancellationPolicy?.changeableWithFees ? styles.changeable : ''}`}>
                    • {booking.cancellationPolicy?.changeableWithFees === true ? 'Changeable with fees' : booking.cancellationPolicy?.changeableWithFees === false ? 'Non-changeable' : 'N/A'}
                  </div>
                </div>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.label}>Price Details</span>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceItem}>
                    <span>Passengers {(booking.travellersInfo || []).length}</span>
                    <span>${(Number(booking.totalPrice) || Number(booking.price) || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className={styles.totalPrice}>
                  <span>Total amount required</span>
                  <span>${(Number(booking.totalPrice) || Number(booking.price) || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button
          className={styles.printButton}
          onClick={() => onPrintTicket(booking)}
          disabled={booking.status === 'cancelled'}
        >
          Print Ticket
        </button>
        <button
          className={styles.cancelButton}
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === 'cancelled'}
        >
          Cancel Booking
        </button>
      </div>
    </div>
  );
};

export default BookingCard;

