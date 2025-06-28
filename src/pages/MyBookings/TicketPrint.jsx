import React, { useState, useEffect, useRef } from 'react';
import styles from './TicketPrint.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDuration } from '../SelectedFlights/someFun';

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/_/g, ' ').toLowerCase().split(' ').map(word => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const TicketPrint = ({ booking, onClose }) => {
  const [activeFlightIndex, setActiveFlightIndex] = useState(0);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const ticketRef = useRef(null);

  // Filter out infants to create a list of passengers who get a ticket
  const ticketableTravelers = booking.travellersInfo?.filter(p => p.travelerType !== 'infant') || [];
  const currentTraveler = ticketableTravelers[currentTicketIndex] || {};

  // Normalize flight data to handle both one-way and round-trip structures
  const flights = (booking.flightData && booking.flightData.length > 0)
    ? booking.flightData
    : [{
        // Fallback for old one-way trip data structure
        flightID: booking.flightId,
        typeOfFlight: 'GO',
        numberOfStops: booking.stops,
        originAirportCode: booking.originAirportCode || booking.departure?.airport,
        destinationAirportCode: booking.destinationAirportCode || booking.arrival?.airport,
        originCIty: booking.originCity || booking.departure?.city,
        destinationCIty: booking.destinationCity || booking.arrival?.city,
        departureDate: booking.departureDate || booking.departure?.date,
        arrivalDate: booking.arrivalDate || booking.arrival?.date,
        airline: booking.airline,
        duration: booking.duration,
      }];

  const isRoundTrip = flights.length > 1;
  const activeFlight = flights[activeFlightIndex] || {};

  const handlePrint = () => {
    const printContent = ticketRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Ticket</title>');
        
        // Clone all styles and links from the main document head
        const headEls = document.head.querySelectorAll('link, style');
        headEls.forEach(el => {
          printWindow.document.head.appendChild(el.cloneNode(true));
        });

        printWindow.document.write('</head><body style="margin: 0;">');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Use a timeout to ensure styles are applied before printing
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        alert('Please allow popups for this website to print the ticket.');
      }
    }
  };

  const handleNavClick = (index) => {
    if (index === activeFlightIndex) return;
    setIsFading(true);
    setTimeout(() => {
      setActiveFlightIndex(index);
      // Fading in is handled by the re-render with the new key/class
    }, 300); // This duration should match the CSS fade-out duration
  };

  const handleTicketNav = (direction) => {
    const newIndex = currentTicketIndex + direction;
    if (newIndex >= 0 && newIndex < ticketableTravelers.length) {
      setCurrentTicketIndex(newIndex);
    }
  };

  useEffect(() => {
    if (isFading) {
      const timer = setTimeout(() => setIsFading(false), 300); // Reset fading state
      return () => clearTimeout(timer);
    }
  }, [activeFlightIndex]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.ticketContainer} ref={ticketRef}>
        <div className={styles.ticketHeader}>
          <h2>Flight Ticket</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.ticket}>
          <div className={`${styles.ticketTop} ${isFading ? styles.fadeOut : styles.fadeIn}`}>
            <div className={styles.ticketInfo}>
              <div className={styles.airline}>
                <div className={styles.airlineLogo}>
                  {activeFlight.airlineLogo ? (
                    <img
                      src={activeFlight.airlineLogo}
                      alt={activeFlight.airline || 'Airline Logo'}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'src/assets/no-logo.jpg';
                      }}
                      style={{ width: 40, height: 40, borderRadius: '50%' }}
                    />
                  ) : (
                    (activeFlight.airline || 'F').charAt(0)
                  )}
                </div>
                <div>
                  <div className={styles.airlineName}>{toTitleCase(activeFlight.airline) || 'Flight'}</div>
                  <div className={styles.flightNumber}>{booking.bookingRef || activeFlight.flightID || ''}</div>
                </div>
              </div>
            </div>
            
            <div className={styles.flightRoute}>
              <div className={styles.departure}>
                <div className={styles.city}>{activeFlight.originCIty || '--'}</div>
                <div className={styles.airport}>{activeFlight.originAirportCode || '--'}</div>
                <div className={styles.time}>{activeFlight.departureDate ? new Date(activeFlight.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</div>
                <div className={styles.date}>{formatDate(activeFlight.departureDate)}</div>
              </div>
              
              <div className={styles.flightPath}>
                <div className={styles.stops}>
                  {typeof activeFlight.numberOfStops === 'number'
                    ? (activeFlight.numberOfStops > 0
                        ? `${activeFlight.numberOfStops} Stop${activeFlight.numberOfStops > 1 ? 's' : ''}`
                        : 'Direct')
                    : 'Direct'}
                </div>
                <div className={styles.pathLine}></div>
                <div className={styles.plane}>✈</div>
                <div className={styles.duration}>{formatDuration(activeFlight.duration) || '--'}</div>
              </div>
              
              <div className={styles.arrival}>
                <div className={styles.city}>{activeFlight.destinationCIty || '--'}</div>
                <div className={styles.airport}>{activeFlight.destinationAirportCode || '--'}</div>
                <div className={styles.time}>{activeFlight.arrivalDate ? new Date(activeFlight.arrivalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</div>
                <div className={styles.date}>{formatDate(activeFlight.arrivalDate)}</div>
              </div>
            </div>
          </div>
          
          <div className={styles.ticketDivider}>
            {isRoundTrip ? (
              <div className={styles.navTabs}>
                {flights.map((flight, index) => (
                  <button
                    key={index}
                    className={`${styles.tabButton} ${index === activeFlightIndex ? styles.activeTab : ''}`}
                    onClick={() => handleNavClick(index)}
                  >
                    {flight.typeOfFlight === 'GO' ? 'Departure' : 'Return'}
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.dividerLine}></div>
            )}
          </div>
          
          <div className={styles.ticketBottom}>
            <div className={styles.passengerInfo}>
              <div className={styles.passengerHeader}>
                <h3>Passenger Information</h3>
                {ticketableTravelers.length > 1 && (
                  <div className={styles.ticketNav}>
                    <button onClick={() => handleTicketNav(-1)} disabled={currentTicketIndex === 0}><ChevronLeft size={20} /></button>
                    <span>{currentTicketIndex + 1} of {ticketableTravelers.length}</span>
                    <button onClick={() => handleTicketNav(1)} disabled={currentTicketIndex === ticketableTravelers.length - 1}><ChevronRight size={20} /></button>
                  </div>
                )}
              </div>
              <div className={styles.passenger}>
                <span className={styles.passengerName}>{currentTraveler.firstName} {currentTraveler.lastName}</span>
                <span className={styles.passengerType}>({currentTraveler.travelerType})</span>
              </div>
            </div>
            
            <div className={styles.bookingDetails}>
              <div className={styles.detailRow}>
                <span>Booking Date:</span>
                <span>{formatDate(booking.createdAt)}</span>
              </div>
              
              {currentTraveler.seatNumber && (
                <div className={styles.detailRow}>
                  <span>Seat(s):</span>
                  <span>{currentTraveler.seatNumber}</span>
                </div>
              )}

              <div className={styles.detailRow}>
                <span>Booking Ref:</span>
                <span>{booking.bookingRef}</span>
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

