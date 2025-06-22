import "./TravelOffers.css";
import newYorkImg from "../../assets/new-york.jpg";
import losAngelesImg from "../../assets/los-angeles.jpg";
import bangladesh2 from "../../assets/Image frame (2).png";
import bangladesh3 from "../../assets/pexels-brett-sayles-2310604.jpg";
import bangladesh4 from "../../assets/Image frame (5).png";
import bangladesh5 from "../../assets/pexels-asadphoto-1266831.jpg";
import bangladesh6 from "../../assets/pexels-pixabay-38238.jpg";
import bangladesh7 from "../../assets/pexels-pixabay-237272.jpg";

import { useEffect, useRef, useState } from "react";
import FlightMap from "../../components/Map/FlightMap";
import { bookingService } from "../../services/bookingService";
import { getAirportDetails } from "../../services/airportService";
import styles from './TravelOffers.module.css';

const offersData = [
  {
    id: 1,
    title: "New York",
    date: "9 - 10 Feb, 2023",
    duration: "7 hr 15m",
    price: "$294",
    image: newYorkImg,
  },
  {
    id: 2,
    title: "Los Angeles",
    date: "9 - 10 Feb, 2023",
    duration: "6 hr 18m",
    price: "$399",
    image: losAngelesImg,
  },
];
const images = [bangladesh7 ,bangladesh3 , bangladesh5 , bangladesh6 ]
const londonOffers = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  title: "London Adventure",
  price: "$ 200",
  image: images[index]
}));

const bangladeshImages = [losAngelesImg, newYorkImg, bangladesh5 , bangladesh4];

export default function TravelOffers() {
  const [latestFlightForMap, setLatestFlightForMap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndPrepareMapData = async () => {
      console.log('Starting map data preparation...');
      setIsLoading(true);
      setError(null);
      
      try {
        const userString = localStorage.getItem('user');
        if (!userString) return;

        const bookings = await bookingService.getMyBookings();
        if (!bookings || bookings.length === 0) return;
        
        const selectedBookingId = localStorage.getItem('selectedBookingId');
        let bookingToShow = null;

        if (selectedBookingId) {
          bookingToShow = bookings.find(b => b._id === selectedBookingId);
          localStorage.removeItem('selectedBookingId'); 
        } else {
          const futureConfirmedBookings = bookings
            .filter(b => b.status === 'confirmed' && b.flightData?.[0]?.departure?.at && new Date(b.flightData[0].departure.at) > new Date())
            .sort((a, b) => new Date(a.flightData[0].departure.at) - new Date(b.flightData[0].departure.at));
          
          if (futureConfirmedBookings.length > 0) {
            bookingToShow = futureConfirmedBookings[0];
          }
        }

        if (!bookingToShow) {
            console.log("No suitable booking found to display on map.");
            return;
        }
        
        const bookingKey = bookingToShow.bookingRef || bookingToShow._id;
        const storedDetailsRaw = localStorage.getItem(`flightDetails_${bookingKey}`);

        if (!storedDetailsRaw) {
            console.error(`Flight details for bookingRef ${bookingKey} not found in localStorage.`);
            setError("Could not find detailed flight data to display.");
            return;
        }
        
        const storedDetails = JSON.parse(storedDetailsRaw);
        const flightOfferData = storedDetails.departure?.data;

        if (!flightOfferData || !flightOfferData.itineraries || flightOfferData.itineraries.length === 0) {
            console.error("Incompatible flight data structure from localStorage:", flightOfferData);
            setError("Could not display flight path due to incompatible data.");
            return;
        }

        const itinerary = flightOfferData.itineraries[0];
        const segments = itinerary.segments;
        if (!segments || segments.length === 0) {
            setError("Could not display flight path because it has no segments.");
            return;
        }

        const originSegment = segments[0];
        const destinationSegment = segments[segments.length - 1];
        const originIata = originSegment.departure.iataCode;
        const destinationIata = destinationSegment.arrival.iataCode;

        const [originAirport, destinationAirport] = await Promise.all([
            getAirportDetails(originIata),
            getAirportDetails(destinationIata)
        ]);

        if (!originAirport || !destinationAirport) {
            setError("Airport coordinate data is unavailable.");
            return;
        }

        const flightForMap = {
            originAirport,
            destinationAirport,
            departure: { at: originSegment.departure.at },
            arrival: { at: destinationSegment.arrival.at },
            duration: itinerary.duration,
        };
        
        console.log("SUCCESS: Prepared flight data for map from localStorage:", flightForMap);
        setLatestFlightForMap(flightForMap);
        
      } catch (err) {
        console.error("A critical error occurred while preparing map data:", err);
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndPrepareMapData();
  }, []);

  return (
    <div className={styles.travelOffers}>
      <div className={styles.container}>
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Your Upcoming Flight Path</h2>
          <div className={styles.mapContainer}>
            {isLoading && <div className={styles.mapPlaceholder}>Loading Flight Path...</div>}
            {error && <div className={styles.mapPlaceholder}>{error}</div>}
            {!isLoading && !error && latestFlightForMap && <FlightMap flight={latestFlightForMap} />}
            {!isLoading && !error && !latestFlightForMap && <div className={styles.mapPlaceholder}>No upcoming flights to display.</div>}
          </div>
        </div>
        
        <section className="travel-offers">
          <div className="offers-section">
            <div className="offers-header">
              <div className="offers-header-text">
                <h2>Let's go Places Together</h2>
                <p>
                  Discover the latest offers and news and alerts and start planning
                  your trip
                </p>
              </div>
              <button className="see-all-btn">See all</button>
            </div>
            <div className="offers-flex home-flex">
              {offersData.map((offer) => (
                <div key={offer.id} className="offer-card">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="offer-image"
                  />
                  <div className="offer-details">
                    <h3>{offer.title}</h3>
                    <p>{offer.date}</p>
                    <span className="offer-duration">{offer.duration}</span>
                    <p className="offer-price">{offer.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="offers-section">
            <div className="offers-header">
              <div className="offers-header-text">
                <h2>Fall into Travel</h2>
                <p>
                  Discover the latest offers and news and alerts and start planning
                  your trip
                </p>
              </div>
              <button className="see-all-btn">See all</button>
            </div>
            <div className="more-offers">
              {londonOffers.map((offer) => (
                <div key={offer.id} className="more-offers-card">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="more-offers-image"
                  />
                  <div className="moreoffers-details">
                    <h3>{offer.title}</h3>
                    <p>{offer.title}</p>
                    <span className="offer-price">{offer.price}</span>
                    <button className="book-btn">Book Flights</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="offers-section">
            <div className="offers-header">
              <div className="offers-header-text">
                <h2>Fall into Travel</h2>
                <p>
                  Going somewhere to celebrate this season? Whether you're going
                  home or somewhere to roam,
                  <br />
                  we've got the travel tools to get you to your destination.
                </p>
              </div>
              <button className="see-all-btn">See all</button>
            </div>
            <div className="hot-offers">
              <div className="AD-card">
                <div className="bangladesh-content">
                  <h3>Backpacking Bangladesh</h3>
                  <p className="AD-disc">
                    Traveling is a unique experience as it is the best way to unplug
                    from the pushes and pulls of daily life. It helps us to forget
                    about our problems, frustrations, and fears at home. During our
                    journey, we experience life in different ways. We explore new
                    places, cultures, cuisines, traditions, and ways of living.
                  </p>
                  <p className="AD-price">
                    From
                    <br />
                    $700
                  </p>
                  <div className="AD-Dbtn">
                    <button className="AD-btn">Book Flight</button>
                  </div>
                </div>
              </div>
              <div className="offers-images">
                {bangladeshImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Backpacking Bangladesh ${index + 1}`}
                    className="bangladesh-image"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}