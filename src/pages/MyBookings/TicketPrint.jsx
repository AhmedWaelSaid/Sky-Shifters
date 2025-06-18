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
          <h2>تذكرة الطيران</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.ticket}>
          <div className={styles.ticketTop}>
            <div className={styles.ticketInfo}>
              <div className={styles.bookingRef}>
                <strong>رقم الحجز: {booking.bookingReference}</strong>
              </div>
              <div className={styles.airline}>
                <div className={styles.airlineLogo}>
                  {booking.airline.charAt(0)}
                </div>
                <div>
                  <div className={styles.airlineName}>{booking.airline}</div>
                  <div className={styles.flightNumber}>{booking.flightNumber}</div>
                </div>
              </div>
            </div>
            
            <div className={styles.flightRoute}>
              <div className={styles.departure}>
                <div className={styles.city}>{booking.departure.city}</div>
                <div className={styles.airport}>{booking.departure.airport}</div>
                <div className={styles.time}>{booking.departure.time}</div>
                <div className={styles.date}>{formatDate(booking.departure.date)}</div>
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
                <div className={styles.city}>{booking.arrival.city}</div>
                <div className={styles.airport}>{booking.arrival.airport}</div>
                <div className={styles.time}>{booking.arrival.time}</div>
                <div className={styles.date}>{formatDate(booking.arrival.date)}</div>
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
              <h3>معلومات المسافرين</h3>
              {booking.passengers.map((passenger, index) => (
                <div key={passenger.id} className={styles.passenger}>
                  <span className={styles.passengerName}>{passenger.name}</span>
                  <span className={styles.passengerType}>({passenger.type})</span>
                </div>
              ))}
            </div>
            
            <div className={styles.bookingDetails}>
              <div className={styles.detailRow}>
                <span>تاريخ الحجز:</span>
                <span>{formatDate(booking.bookingDate)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>حالة الحجز:</span>
                <span className={styles.status}>مؤكد</span>
              </div>
              <div className={styles.detailRow}>
                <span>المبلغ المدفوع:</span>
                <span className={styles.price}>${booking.price.toFixed(2)}</span>
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
            طباعة التذكرة
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketPrint;

