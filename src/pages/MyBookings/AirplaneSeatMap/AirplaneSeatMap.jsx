import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './AirplaneSeatMap.module.css';

const AirplaneSeatMap = () => {
  const location = useLocation();
  // Provide a default empty object for booking if state is not passed
  const { booking } = location.state || { booking: {} };

  // Get the booked seat from the first traveller's info in the booking object.
  const bookedSeat = booking.travellersInfo && booking.travellersInfo.length > 0
    ? booking.travellersInfo[0].seatNumber
    : undefined;
  const availableSeatsForChange = booking.availableSeatsForChange || [];

  const [selectedSeat, setSelectedSeat] = useState(null);
  
  const rows = 30;
  const seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  const getSeatType = (rowNumber) => {
    if (rowNumber <= 3) return 'firstClass';
    if (rowNumber <= 8) return 'business';
    return 'economy';
  };
  
  const handleSeatClick = (seatId) => {
    if (seatId === bookedSeat) return; // Can't select the booked seat
    
    setSelectedSeat(seatId);
  };
  
  const handleSendRequest = () => {
    const message = (
      <div>
        Your request has been submitted.
        <br />
        If the seat becomes available at the airport (due to a no-show or cancellation), we will notify you via the website and email.
      </div>
    );
    toast.info(message, {
      position: "top-center",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: styles.customToast,
    });
    setSelectedSeat(null);
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
    <div className={styles.seatMapPage}>
      <ToastContainer />
      <header className={styles.pageHeader}>
        <h1>Airplane Seat Map</h1>
        <p>View your booked seat and choose another</p>
      </header>

      <div className={styles.mainContainer}>
        <div className={styles.infoCard}>
          <h2>Booking Information</h2>
          {bookedSeat ? (
            <div className={styles.bookedSeatInfo}>
              <span>Your Booked Seat:</span>
              <button className={styles.seatButton}>{bookedSeat}</button>
            </div>
          ) : (
            <p>No seat has been booked yet.</p>
          )}
        </div>
      </div>

      <div className={styles.airplaneContainer}>
        {/* Airplane Nose */}
        <div className={styles.airplaneNose}>
          <div className={styles.cockpit}>
            <h2>Cockpit</h2>
          </div>
        </div>

        {/* Main aircraft body */}
        <div className={styles.seatMap}>
          {/* Column Headers */}
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

          {/* Seat Rows */}
          {Array.from({ length: rows }, (_, index) => {
            const rowNumber = index + 1;
            return (
              <div key={rowNumber} className={styles.row}>
                <div className={styles.rowNumber}>{rowNumber}</div>
              
                {/* Left Seats */}
                <div className={styles.leftSection}>
                  {['F', 'E', 'D'].map(letter => {
                    const seatId = `${rowNumber}${letter}`;
                    return (
                      <div
                        key={seatId}
                        className={getSeatClass(seatId, rowNumber)}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId}`}
                      >
                        <span className={styles.seatNumber}>{seatId}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className={styles.aisle}></div>

                {/* Right Seats */}
                <div className={styles.rightSection}>
                  {['C', 'B', 'A'].map(letter => {
                    const seatId = `${rowNumber}${letter}`;
                    return (
                      <div
                        key={seatId}
                        className={getSeatClass(seatId, rowNumber)}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId}`}
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

        {/* Airplane Tail */}
        <div className={styles.airplaneTail}>
          <div className={styles.tailSection}>
            <h3>Airplane Tail</h3>
          </div>
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <h3>Legend</h3>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.firstClass}`}></div>
              <span>First Class</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.business}`}></div>
              <span>Business Class</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.economy}`}></div>
              <span>Economy Class</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.booked}`}></div>
              <span>Your Booked Seat</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSeat} ${styles.selected}`}></div>
              <span>Selected Seat</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContainer}>
        <div className={styles.infoCard}>
          <h2>Request a Different Seat</h2>
          <div className={styles.changeOptions}>
            {availableSeatsForChange.filter(seat => seat !== bookedSeat).map(seat => {
              const rowNumber = parseInt(seat.match(/(\\d+)/)[0], 10);
              return (
                <div
                  key={seat}
                  className={getSeatClass(seat, rowNumber)}
                  onClick={() => handleSeatClick(seat)}
                  title={`Seat ${seat}`}
                >
                  <span className={styles.seatNumber}>{seat}</span>
                </div>
              )
            })}
          </div>
          {selectedSeat && (
            <button className={styles.sendRequestButton} onClick={handleSendRequest}>
              Send Request
            </button>
          )}
        </div>
      </div>

      <div className={styles.howToUse}>
        <h2>How to Use</h2>
        <ul>
          <li>The red seat is your seat booked from the back-end.</li>
          <li>You can click on any other seat to select it.</li>
          <li>The different colors represent different travel classes.</li>
          <li>Use the buttons above to simulate changing the booked seat.</li>
        </ul>
      </div>
    </div>
  );
};

export default AirplaneSeatMap;

