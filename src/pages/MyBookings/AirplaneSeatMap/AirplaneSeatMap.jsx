import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './AirplaneSeatMap.module.css';

const AirplaneSeatMap = () => {
  const location = useLocation();
  // Provide a default empty object for booking if state is not passed
  const { booking } = location.state || { booking: {} };

  const storageKey = `seatChangeRequests_${booking.bookingRef}`;
  const [requestsMade, setRequestsMade] = useState(() => {
    if (!booking.bookingRef) return [];
    const savedRequests = localStorage.getItem(storageKey);
    return savedRequests ? JSON.parse(savedRequests) : [];
  });

  const [availableSeatsForChange, setAvailableSeatsForChange] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const totalTravelers = booking.travellersInfo?.length || 0;
  const nextTravelerIndex = booking.travellersInfo?.findIndex((_, index) => !requestsMade.includes(index));
  const currentTraveler = nextTravelerIndex !== -1 ? booking.travellersInfo[nextTravelerIndex] : null;
  const bookedSeat = currentTraveler?.seatNumber;
  
  const allBookedSeats = booking.travellersInfo?.map(t => t.seatNumber).filter(Boolean) || [];
  
  const rows = 30;
  const seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];

  useEffect(() => {
    if (booking.bookingRef) {
      localStorage.setItem(storageKey, JSON.stringify(requestsMade));
    }
  }, [requestsMade, storageKey]);

  useEffect(() => {
    if (!currentTraveler) return;

    if (booking.availableSeatsForChange && booking.availableSeatsForChange.length > 0) {
      setAvailableSeatsForChange(booking.availableSeatsForChange);
    } else {
      // Seeded random number generator to ensure consistent "random" seats for the same booking.
      const mulberry32 = (a) => {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
      }

      const generateSeededRandomSeats = () => {
        const seedString = booking.bookingRef || 'default-seed';
        let seed = 0;
        for (let i = 0; i < seedString.length; i++) {
          seed += seedString.charCodeAt(i);
        }
        const random = mulberry32(seed);
        
        const generatedSeats = new Set();
        const numberOfSeats = Math.floor(random() * 5) + 3; // 3 to 7 seats

        let attempts = 0;
        while (generatedSeats.size < numberOfSeats && attempts < 100) {
          const row = Math.floor(random() * rows) + 1;
          const seatLetter = seatsPerRow[Math.floor(random() * seatsPerRow.length)];
          const seatId = `${row}${seatLetter}`;

          if (seatId !== bookedSeat) {
            generatedSeats.add(seatId);
          }
          attempts++;
        }
        setAvailableSeatsForChange(Array.from(generatedSeats));
      };

      if (booking.bookingRef) {
        generateSeededRandomSeats();
      }
    }
  }, [booking.bookingRef, bookedSeat, currentTraveler]);

  const getSeatType = (rowNumber) => {
    if (rowNumber <= 3) return 'firstClass';
    if (rowNumber <= 8) return 'business';
    return 'economy';
  };
  
  const handleSeatClick = (seatId) => {
    if (!currentTraveler || allBookedSeats.includes(seatId)) return;
    
    setSelectedSeat(seatId);
  };
  
  const handleSendRequest = () => {
    const classValues = {
      'firstClass': 2,
      'business': 1,
      'economy': 0
    };

    let additionalMessage = '';
    if (bookedSeat && selectedSeat) {
      const selectedSeatRow = parseInt(selectedSeat.match(/(\d+)/)[0], 10);
      const bookedSeatRow = parseInt(bookedSeat.match(/(\d+)/)[0], 10);
      const selectedSeatClass = getSeatType(selectedSeatRow);
      const bookedSeatClass = getSeatType(bookedSeatRow);

      if (classValues[selectedSeatClass] > classValues[bookedSeatClass]) {
        additionalMessage = 'Please note: You have selected a seat in a higher travel class. The price difference will be charged at the airport.';
      }
    }
    
    const message = (
      <div>
        Your request has been submitted.
        <br />
        If the seat becomes available at the airport (due to a no-show or cancellation), we will notify you via the website and email.
        {additionalMessage && (
          <>
            <br /><br />
            <strong>{additionalMessage}</strong>
          </>
        )}
      </div>
    );

    toast.info(message, {
      position: "bottom-right",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: styles.customToast,
    });
    setSelectedSeat(null);
    if (nextTravelerIndex !== -1) {
      setRequestsMade([...requestsMade, nextTravelerIndex]);
    }
  };

  const getSeatClass = (seatId, rowNumber) => {
    const baseClass = `${styles.seat} ${styles[getSeatType(rowNumber)]}`;
    
    if (allBookedSeats.includes(seatId)) {
      return `${baseClass} ${styles.booked}`;
    }
    
    if (seatId === selectedSeat) {
      return `${baseClass} ${styles.selected}`;
    }

    if (!currentTraveler) {
      return `${baseClass} ${styles.disabled}`;
    }
    
    return baseClass;
  };

  return (
    <div className={styles.seatMapPage}>
      <ToastContainer className={styles.toastContainer} />
      <header className={styles.pageHeader}>
        <h1>Airplane Seat Map</h1>
        <p>View your booked seat and choose another</p>
      </header>

      <div className={styles.mainContainer}>
        <div className={styles.infoCard}>
          <h2>Booking Information</h2>
          {booking.travellersInfo && booking.travellersInfo.length > 0 ? (
            <div className={styles.travelersList}>
              {booking.travellersInfo.map((traveler, index) => (
                <div key={index} className={styles.travelerInfo}>
                  <span>{traveler.firstName} {traveler.lastName}:</span>
                  <button className={styles.seatButton}>{traveler.seatNumber || 'Not Assigned'}</button>
                </div>
              ))}
            </div>
          ) : (
            <p>No traveler information available.</p>
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
          {nextTravelerIndex !== -1 && currentTraveler ? (
            <>
              <h2>Request a Different Seat for {currentTraveler.firstName} {currentTraveler.lastName}</h2>
              <div className={styles.changeOptions}>
                {availableSeatsForChange.filter(seat => seat !== bookedSeat).map(seat => {
                  const match = seat.match(/(\d+)/);
                  if (!match) return null;
                  const rowNumber = parseInt(match[0], 10);
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
            </>
          ) : (
            <>
              <h2>All seat change requests have been submitted.</h2>
              <p>You can check for updates on this page later, or inquire at the airport check-in counter.</p>
            </>
          )}
        </div>
      </div>

      <div className={styles.howToUse}>
        <h2>How to Use</h2>
        <ul>
          <li>The red seat is your currently booked seat.</li>
          <li>You can select an alternative seat from the available options or the seat map.</li>
          <li>The different colors represent different travel classes.</li>
          <li>Requesting a seat change is not a confirmation. It depends on availability due to no-shows or cancellations.</li>
          <li>If you select a seat in a higher class (e.g., from Economy to Business), the price difference will be charged at the airport.</li>
          <li>If the seat becomes available, you will be notified on the website and by email.</li>
        </ul>
      </div>
    </div>
  );
};

export default AirplaneSeatMap;

