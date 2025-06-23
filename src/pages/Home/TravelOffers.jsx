import "./TravelOffers.css";
import newYorkImg from "../../assets/new-york.jpg";
import losAngelesImg from "../../assets/los-angeles.jpg";
import bangladesh2 from "../../assets/Image frame (2).png";
import bangladesh3 from "../../assets/pexels-brett-sayles-2310604.jpg";
import bangladesh4 from "../../assets/Image frame (5).png";
import bangladesh5 from "../../assets/pexels-asadphoto-1266831.jpg";
import bangladesh6 from "../../assets/pexels-pixabay-38238.jpg";
import bangladesh7 from "../../assets/pexels-pixabay-237272.jpg";

import { useEffect, useState } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAirportDetails } from "../../services/airportService";
import { bookingService } from "../../services/bookingService";
import FlightMap from "../../components/Map/FlightMap"; // Use our trusted FlightMap component

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
  const [bookingForMap, setBookingForMap] = useState(null);
  const [activeLeg, setActiveLeg] = useState(0); // 0 for departure, 1 for return
  const [flightDetails, setFlightDetails] = useState(null);

  useEffect(() => {
    const fetchBookingForMap = async () => {
      let bookingToShow = null;
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const bookings = await bookingService.getMyBookings();
          const selectedBookingId = localStorage.getItem('selectedBookingId');

          if (selectedBookingId) {
            bookingToShow = bookings.find(b => b._id === selectedBookingId);
            localStorage.removeItem('selectedBookingId'); // Clean up
          } else {
            const futureConfirmedBookings = bookings
              .filter(b => b.status === 'confirmed' && new Date(b.flightData?.[0]?.departureDate || b.departureDate) > new Date())
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            if (futureConfirmedBookings.length > 0) {
              bookingToShow = futureConfirmedBookings[0];
            }
          }
          if (bookingToShow) {
            setBookingForMap(bookingToShow);
          }
        }
      } catch (error) {
        console.error("Failed to fetch booking for map:", error);
      }
    };

    fetchBookingForMap();
  }, []);

  useEffect(() => {
    const prepareFlightDetails = async () => {
      if (!bookingForMap) return;

      const isRoundTrip = bookingForMap.flightData && bookingForMap.flightData.length > 1;
      const legToShow = (isRoundTrip && bookingForMap.flightData[activeLeg]) ? bookingForMap.flightData[activeLeg] : bookingForMap;
      
      if (!legToShow.originAirportCode || !legToShow.destinationAirportCode) return;

      try {
        const [origin, destination] = await Promise.all([
          getAirportDetails(legToShow.originAirportCode),
          getAirportDetails(legToShow.destinationAirportCode)
        ]);
        
        if (origin && destination) {
          setFlightDetails({
            ...legToShow,
            originAirport: origin,
            destinationAirport: destination,
            // Ensure departure and arrival objects with 'at' property exist for the map
            departure: { at: legToShow.departureDate || legToShow.departure?.at },
            arrival: { at: legToShow.arrivalDate || legToShow.arrival?.at },
          });
        }
      } catch (error) {
        console.error("Failed to get airport details for map:", error);
      }
    };
    
    prepareFlightDetails();
  }, [bookingForMap, activeLeg]);


  const isRoundTrip = bookingForMap?.flightData && bookingForMap.flightData.length > 1;

  return (
    <>
      {flightDetails && (
        <div className="map-container-homepage">
          <FlightMap flight={flightDetails} />
          {isRoundTrip && (
            <div className="flight-leg-selector">
              <button 
                onClick={() => setActiveLeg(0)} 
                className={activeLeg === 0 ? 'active' : ''}
              >
                Departure
              </button>
              <button 
                onClick={() => setActiveLeg(1)} 
                className={activeLeg === 1 ? 'active' : ''}
              >
                Return
              </button>
            </div>
          )}
        </div>
      )}
      
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
    </>
  );
}