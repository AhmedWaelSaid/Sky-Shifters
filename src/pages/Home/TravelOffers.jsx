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
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAirportCoordinates } from "../../services/airportService";
import { bookingService } from "../../services/bookingService";
import * as turf from '@turf/turf';
import { FaArrowRight } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; 

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
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [flightDuration, setFlightDuration] = useState('');
  const [showingLeg, setShowingLeg] = useState('GO'); // 'GO' or 'RETURN'
  const [bookingToShow, setBookingToShow] = useState(null);

  // Effect to fetch the initial booking data (runs once)
  useEffect(() => {
    const fetchBookingForMap = async () => {
      console.log('Step 1: Fetching initial booking data...');
      try {
        const userString = localStorage.getItem('user');
        if (!userString) return;
        const userData = JSON.parse(userString);
        if (!userData?.token) return;

        console.log('Step 2: User token found. Fetching all bookings...');
        const allBookings = await bookingService.getMyBookings();
        console.log('Step 3: Received response from bookings API.');
        
        const selectedBookingId = localStorage.getItem('selectedBookingId');
        let bookingToSet = null;

        if (selectedBookingId) {
          bookingToSet = allBookings.find(b => b._id === selectedBookingId);
          console.log(`Found selected booking from BookingList:`, bookingToSet);
          localStorage.removeItem('selectedBookingId'); // Clean up
        } else {
          const futureConfirmedBookings = allBookings
            .filter(b => b.status === 'confirmed' && new Date(b.flightData?.[0]?.departureDate || b.departureDate) > new Date())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          if (futureConfirmedBookings.length > 0) {
            bookingToSet = futureConfirmedBookings[0];
            console.log(`Using latest future confirmed booking for map:`, bookingToSet);
          }
        }
        setBookingToShow(bookingToSet);
      } catch (error) {
        console.error("Failed to fetch initial booking for map:", error);
      }
    };
    fetchBookingForMap();
  }, []); // Empty dependency array ensures this runs only once

  // Effect to draw and update the map (runs when booking or leg changes)
  useEffect(() => {
    let isMounted = true;
    if (!bookingToShow) {
      // Clear map or show default state if no booking is selected
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    };

    const initializeMap = async () => {
      console.log('Step 4: Initializing or updating map for the selected booking.');
      
      const legIndex = (bookingToShow.bookingType === 'ROUND_TRIP' && showingLeg === 'RETURN') ? 1 : 0;
      console.log(`Map rendering for leg: ${showingLeg} (index: ${legIndex})`);

      const currentLegData = bookingToShow.flightData?.[legIndex];
      const originCode = currentLegData?.originAirportCode || bookingToShow.originAirportCode;
      const destCode = currentLegData?.destinationAirportCode || bookingToShow.destinationAirportCode;
      
      console.log(`Fetching coordinates for origin: ${originCode} and destination: ${destCode}`);
      const [originCoords, destinationCoords] = await Promise.all([
        getAirportCoordinates(originCode),
        getAirportCoordinates(destCode)
      ]).catch(err => {
        console.error("Error fetching coordinates:", err);
        return [null, null];
      });

      if (!isMounted || !originCoords || !destinationCoords) return;
      console.log('Coordinates found.');

      // Calculate Flight Duration
      let flightDurationSeconds = 0;
      const durationISO = currentLegData?.duration || bookingToShow.duration;
      if (durationISO) {
        const match = durationISO.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (match) {
          const hours = parseInt(match[1] || 0, 10);
          const minutes = parseInt(match[2] || 0, 10);
          flightDurationSeconds = (hours * 3600) + (minutes * 60);
          setFlightDuration(`${hours}h ${minutes}m`);
        }
      } else {
         const dep = new Date(currentLegData?.departureDate || bookingToShow.departureDate);
         const arr = new Date(currentLegData?.arrivalDate || bookingToShow.arrivalDate);
         if(dep && arr && !isNaN(dep) && !isNaN(arr)) {
            const diffMs = arr - dep;
            const hours = Math.floor(diffMs / 3600000);
            const minutes = Math.floor((diffMs % 3600000) / 60000);
            flightDurationSeconds = diffMs / 1000;
            setFlightDuration(`${hours}h ${minutes}m`);
         } else {
           setFlightDuration('--');
         }
      }

      if (mapContainer.current) {
        if (mapRef.current) {
          mapRef.current.remove();
        }
        
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/ahmedwael315/cm9sv08xa00js01sb9wd35jsx",
          center: destinationCoords,
          zoom: 3.5,
          pitch: 59.00,
          projection: 'globe'
        });
        mapRef.current = map;

        map.on('load', () => {
          if (!isMounted) return;
          console.log('Step 5: Map loaded.');
          map.setFog({});

          new mapboxgl.Marker({ color: '#32CD32' }).setLngLat(originCoords).addTo(map);
          new mapboxgl.Marker({ color: '#FF4500' }).setLngLat(destinationCoords).addTo(map);
          
          const line = turf.greatCircle(turf.point(originCoords), turf.point(destinationCoords), { 'npoints': 500 });
          
          map.addSource('route', { 'type': 'geojson', 'data': line });
          map.addLayer({
            'id': 'route',
            'source': 'route',
            'type': 'line',
            'paint': { 'line-width': 4, 'line-color': '#FF4500' }
          });

          map.addSource('airplane', {
            'type': 'geojson',
            'data': { 'type': 'FeatureCollection', 'features': [{ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'Point', 'coordinates': originCoords } }] }
          });
          map.addLayer({
            'id': 'airplane',
            'source': 'airplane',
            'type': 'circle',
            'paint': { 'circle-radius': 6, 'circle-color': '#FFFFFF', 'circle-stroke-width': 2, 'circle-stroke-color': '#000000' }
          });
          
          const routeDistance = turf.length(line);
          let animationDuration = flightDurationSeconds > 0 ? Math.max(10000, Math.min(flightDurationSeconds * 50, 180000)) : 15000;
          let startTime = 0;

          const animate = (timestamp) => {
            if (!isMounted) return;
            if (!startTime) startTime = timestamp;
            const runtime = timestamp - startTime;
            let progress = runtime / animationDuration;
            if (progress > 1) progress = 1;

            if (flightDurationSeconds > 0) {
              const timeElapsed = flightDurationSeconds * progress;
              const remainingSeconds = flightDurationSeconds - timeElapsed;
              const hours = Math.floor(remainingSeconds / 3600);
              const minutes = Math.floor((remainingSeconds % 3600) / 60);
              setTimeRemaining(`${hours}h ${minutes}m remaining`);
            }

            const alongRoute = turf.along(line, routeDistance * progress).geometry.coordinates;
            map.getSource('airplane').setData({ 'type': 'FeatureCollection', 'features': [{ 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': alongRoute } }] });
            map.panTo(alongRoute, { duration: 0 });

            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animate);
            }
          };
          animate(0);
        });
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      setTimeRemaining('');
      setFlightDuration('');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mapRef.current) {
        console.log('Component unmounting or re-rendering. Removing map instance.');
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bookingToShow, showingLeg]);

  return (
    <section className="travel-offers">
      <div className="offers-section">
        <div className="offers-header">
          <div className="offers-header-text">
            <h2>Travel Offers And Great Deals</h2>
            <p>
              Discover the latest offers and news and alerts and start planning
              your trip
            </p>
          </div>
          <div className="all-offers-link">
            <Link to="/flights">
              <h3>See All</h3>
              <FaArrowRight />
            </Link>
          </div>
        </div>
        <div
          ref={mapContainer}
          className="map-container"
          style={{ width: "90%", height: "450px", borderRadius: "20px", position: 'relative' }}
        >
          {bookingToShow && bookingToShow.bookingType === 'ROUND_TRIP' && bookingToShow.flightData?.length > 1 && (
            <button
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 3,
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: '7px',
                padding: '8px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1em'
              }}
              onClick={() => setShowingLeg(prev => prev === 'GO' ? 'RETURN' : 'GO')}
            >
              {showingLeg === 'GO' ? 'View Return Path' : 'View Departure Path'}
            </button>
          )}
          {flightDuration && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              zIndex: 3,
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '7px',
              fontSize: '1em',
              fontWeight: '500'
            }}>
              Flight Duration: {flightDuration}
            </div>
          )}
          {timeRemaining && (
            <div style={{
              position: 'absolute',
              bottom: '55px',
              left: '20px',
              zIndex: 3,
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '7px',
              fontSize: '1em',
              fontWeight: '500'
            }}>
              {timeRemaining}
            </div>
          )}
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
  );
}