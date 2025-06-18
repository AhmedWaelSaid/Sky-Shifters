import React from 'react';
import styles from './BookingCard.module.css';

const BookingCard = ({ booking, onCancel, onPrintTicket }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'مؤكد';
      case 'cancelled':
        return 'ملغى';
      case 'pending':
        return 'في الانتظار';
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
          تاريخ الحجز: {new Date(booking.bookingDate).toLocaleDateString('ar-EG')}
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.leftSection}>
          <div className={styles.flightInfo}>
            <div className={styles.importantInfo}>
              <div className={styles.infoIcon}>!</div>
              <div className={styles.infoContent}>
                <h4>معلومات مهمة عن الرحلة</h4>
                <p>يرجى العلم أنه توجد رسوم إضافية قد تطبق عند المطار</p>
              </div>
            </div>

            <div className={styles.airlineSection}>
              <div className={styles.airlineIcon}>
                <div className={styles.airlineLogo}>
                  {booking.airline.charAt(0)}
                </div>
              </div>
              <div className={styles.airlineInfo}>
                <h4>{booking.airline}</h4>
                <p>{booking.flightNumber}</p>
              </div>
            </div>

            <div className={styles.flightDetails}>
              <div className={styles.flightRoute}>
                <div className={styles.departureInfo}>
                  <div className={styles.time}>{booking.departure.time}</div>
                  <div className={styles.airport}>{booking.departure.airport}</div>
                  <div className={styles.date}>{booking.departure.date}</div>
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
                  <div className={styles.duration}>{booking.duration}</div>
                </div>
                
                <div className={styles.arrivalInfo}>
                  <div className={styles.time}>{booking.arrival.time}</div>
                  <div className={styles.airport}>{booking.arrival.airport}</div>
                  <div className={styles.date}>{booking.arrival.date}</div>
                </div>
              </div>
            </div>

            <div className={styles.passengers}>
              <h4>المسافرون</h4>
              {booking.passengers.map((passenger, index) => (
                <div key={passenger.id} className={styles.passenger}>
                  <span>{passenger.name}</span>
                  <span className={styles.passengerType}>({passenger.type})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.flightSummary}>
            <h4>ملخص الرحلة</h4>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>المغادرة</span>
                <div className={styles.summaryFlight}>
                  <div>{booking.departure.date}</div>
                  <div className={styles.flightNumber}>{booking.flightNumber}</div>
                  <div className={styles.flightTime}>
                    <span className={styles.time}>{booking.departure.time}</span>
                    <span className={styles.airport}>{booking.departure.airport}</span>
                  </div>
                  <div className={styles.flightPath}>
                    {booking.stops > 0 && <span className={styles.stops}>{booking.stops} Stop</span>}
                    <div className={styles.pathArrow}>→</div>
                  </div>
                  <div className={styles.flightTime}>
                    <span className={styles.time}>{booking.arrival.time}</span>
                    <span className={styles.airport}>{booking.arrival.airport}</span>
                  </div>
                  <div className={styles.duration}>{booking.duration}</div>
                </div>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.label}>الإلغاء وتغيير التاريخ</span>
                <div className={styles.policyInfo}>
                  <div className={`${styles.policyItem} ${!booking.cancellationPolicy.refundable ? styles.nonRefundable : ''}`}>
                    • {booking.cancellationPolicy.refundable ? 'قابل للاسترداد' : 'غير قابل للاسترداد'}
                  </div>
                  <div className={`${styles.policyItem} ${booking.cancellationPolicy.changeableWithFees ? styles.changeable : ''}`}>
                    • {booking.cancellationPolicy.changeableWithFees ? 'قابل للتغيير مع رسوم' : 'غير قابل للتغيير'}
                  </div>
                </div>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.label}>تفاصيل السعر</span>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceItem}>
                    <span>البالغون {booking.passengers.length}</span>
                    <span>${booking.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className={styles.totalPrice}>
                  <span>المجموع المطلوب دفعه</span>
                  <span>${booking.price.toFixed(2)}</span>
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
          طباعة التذكرة
        </button>
        <button
          className={styles.cancelButton}
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === 'cancelled'}
        >
          إلغاء الحجز
        </button>
      </div>
    </div>
  );
};

export default BookingCard;

