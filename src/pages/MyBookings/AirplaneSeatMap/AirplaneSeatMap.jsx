import { useState } from 'react';
import styles from './AirplaneSeatMap.module.css';

const AirplaneSeatMap = ({ bookedSeat = '15C', onSeatSelect }) => {
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
  );
};

export default AirplaneSeatMap;

