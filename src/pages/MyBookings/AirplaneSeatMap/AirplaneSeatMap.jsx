import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './AirplaneSeatMap.module.css';

const AirplaneSeatMap = () => {
  const location = useLocation();
  // Provide a default empty object for booking if state is not passed
  const { booking } = location.state || { booking: {} };

  // Mocked current seat and available seats for change, assuming they come from booking
  const bookedSeat = booking.seat || '25E'; // Example from image
  const availableSeatsForChange = ['5A', '12F', '20B', bookedSeat]; // Example from image

  const [selectedSeat, setSelectedSeat] = useState(null);
  
  const rows = 30;
  const seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  const getSeatType = (rowNumber) => {
    if (rowNumber <= 3) return 'firstClass';
    if (rowNumber <= 8) return 'business';
    return 'economy';
  };
  
  const handleSeatClick = (seatId) => {
    if (seatId === bookedSeat) return; // لا يمكن اختيار المقعد المحجوز
    
    setSelectedSeat(seatId);
    if (onSeatSelect) {
      onSeatSelect(seatId);
    }
  };
  
  const getSeatClass = (seatId, rowNumber) => {
    const baseClass = `${styles.seat} ${styles[getSeatType(rowNumber)]}`;
    
    if (seatId === bookedSeat) {
      return `${baseClass} ${styles.booked}`;
    }
    
    if (seatId === selectedSeat) {
      return `${baseClass} ${styles.selected}`;
    }
    
    return baseClass;
  };

  return (
    <>
      <header className={styles.pageHeader}>
        <h1>خريطة مقاعد الطائرة</h1>
        <p>اعرض مقعدك المحجوز واختر مقعد آخر</p>
      </header>

      <div className={styles.mainContainer}>
        <div className={styles.infoCard}>
          <h2>معلومات الحجز</h2>
          {bookedSeat ? (
            <div className={styles.bookedSeatInfo}>
              <span>مقعدك المحجوز:</span>
              <button className={styles.seatButton}>{bookedSeat}</button>
            </div>
          ) : (
            <p>لم يتم حجز مقعد بعد.</p>
          )}
        </div>

        <div className={styles.infoCard}>
          <h2>اختار تغيير المقعد المحجوز</h2>
          <p>(محاكاة للبيانات القادمة من الباك إند)</p>
          <div className={styles.changeOptions}>
            {availableSeatsForChange.map(seat => (
              <button
                key={seat}
                className={`${styles.seatOption} ${seat === bookedSeat ? styles.currentSeat : ''}`}
                onClick={() => handleSeatClick(seat)}
              >
                {seat.replace(/([0-9]+)([A-Z])/,'$2 مقعد $1')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.airplaneContainer}>
        {/* مقدمة الطائرة */}
        <div className={styles.airplaneNose}>
          <div className={styles.cockpit}>
            <h2>قمرة القيادة</h2>
          </div>
        </div>

        {/* جسم الطائرة الرئيسي */}
        <div className={styles.seatMap}>
          {/* رأس الأعمدة */}
          <div className={styles.header}>
            <div className={styles.rowNumber}></div>
            <div className={styles.leftSection}>
              <div className={styles.columnHeader}>F</div>
              <div className={styles.columnHeader}>E</div>
              <div className={styles.columnHeader}>D</div>
            </div>
            <div className={styles.aisle}></div>
            <div className={styles.rightSection}>
              <div className={styles.columnHeader}>C</div>
              <div className={styles.columnHeader}>B</div>
              <div className={styles.columnHeader}>A</div>
            </div>
            <div className={styles.rowNumber}></div>
          </div>

          {/* صفوف المقاعد */}
          {Array.from({ length: rows }, (_, index) => {
            const rowNumber = index + 1;
            return (
              <div key={rowNumber} className={styles.row}>
                <div className={styles.rowNumber}>{rowNumber}</div>
              
                {/* المقاعد اليسرى */}
                <div className={styles.leftSection}>
                  {['F', 'E', 'D'].map(letter => {
                    const seatId = `${rowNumber}${letter}`;
                    return (
                      <div
                        key={seatId}
                        className={getSeatClass(seatId, rowNumber)}
                        onClick={() => handleSeatClick(seatId)}
                        title={`مقعد ${seatId}`}
                      >
                        <span className={styles.seatNumber}>{seatId}</span>
                      </div>
                    );
                  })}
                </div>

                {/* الممر */}
                <div className={styles.aisle}></div>

                {/* المقاعد اليمنى */}
                <div className={styles.rightSection}>
                  {['C', 'B', 'A'].map(letter => {
                    const seatId = `${rowNumber}${letter}`;
                    return (
                      <div
                        key={seatId}
                        className={getSeatClass(seatId, rowNumber)}
                        onClick={() => handleSeatClick(seatId)}
                        title={`مقعد ${seatId}`}
                      >
                        <span className={styles.seatNumber}>{seatId}</span>
                      </div>
                    );
                  })}
                </div>
              
                <div className={styles.rowNumber}>{rowNumber}</div>
              </div>
            );
          })}
        </div>

        {/* مؤخرة الطائرة */}
        <div className={styles.airplaneTail}>
          <div className={styles.tailSection}>
            <h3>مؤخرة الطائرة</h3>
          </div>
        </div>

        {/* مفتاح الألوان */}
        <div className={styles.legend}>
          <h3>مفتاح الألوان</h3>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.firstClass}`}></div>
              <span>درجة أولى</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.business}`}></div>
              <span>درجة رجال أعمال</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.economy}`}></div>
              <span>درجة اقتصادية</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.booked}`}></div>
              <span>مقعدك المحجوز</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.selected}`}></div>
              <span>مقعد مختار</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.howToUse}>
        <h2>كيفية الاستخدام</h2>
        <ul>
          <li>المقعد الأحمر هو مقعدك المحجوز من الباك إند.</li>
          <li>يمكنك النقر على أي مقعد آخر لاختياره.</li>
          <li>الألوان المختلفة تمثل درجات السفر المختلفة.</li>
          <li>استخدم الأزرار أعلاه لمحاكاة تغيير المقعد المحجوز.</li>
        </ul>
      </div>
    </>
  );
};

export default AirplaneSeatMap;

