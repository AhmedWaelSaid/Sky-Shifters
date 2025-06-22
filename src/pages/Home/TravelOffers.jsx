import "./TravelOffers.css";
import newYorkImg from "../../assets/new-york.jpg";
import losAngelesImg from "../../assets/los-angeles.jpg";
import bangladesh2 from "../../assets/Image frame (2).png";
import bangladesh3 from "../../assets/pexels-brett-sayles-2310604.jpg";
import bangladesh4 from "../../assets/Image frame (5).png";
import bangladesh5 from "../../assets/pexels-asadphoto-1266831.jpg";
import bangladesh6 from "../../assets/pexels-pixabay-38238.jpg";
import bangladesh7 from "../../assets/pexels-pixabay-237272.jpg";
import logo1 from "../../assets/logo.png";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAirportCoordinates } from "../../services/airportService";
import { bookingService } from "../../services/bookingService";
import * as turf from '@turf/turf';

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
  
  const [showingLeg, setShowingLeg] = useState('GO');
  const [bookingToShow, setBookingToShow] = useState(null);

  // 1. Get booking data directly from localStorage
  useEffect(() => {
    const storedBooking = localStorage.getItem('selectedBookingForMap');
    if (storedBooking) {
      setBookingToShow(JSON.parse(storedBooking));
      localStorage.removeItem('selectedBookingForMap'); // Clean up
    } else {
      // (Optional) Fetch latest booking if none is selected
      // For now, we'll just handle the selected one.
    }
  }, []);

  // 2. Derive all needed data from bookingToShow and showingLeg
  const activeLegData = useMemo(() => {
    if (!bookingToShow) return null;
    if (bookingToShow.bookingType === 'ROUND_TRIP') {
      return showingLeg === 'GO' ? bookingToShow.flightData?.[0] : bookingToShow.flightData?.[1];
    }
    return bookingToShow.flightData?.[0] || bookingToShow; // For ONE_WAY
  }, [bookingToShow, showingLeg]);
  
  const flightDuration = useMemo(() => {
    if (!activeLegData) return null;
    if (activeLegData.duration && typeof activeLegData.duration === 'string') {
        const match = activeLegData.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (match) {
            const hours = parseInt(match[1] || 0, 10);
            const minutes = parseInt(match[2] || 0, 10);
            return { text: `${hours}h ${minutes}m`, seconds: (hours * 3600) + (minutes * 60) };
        }
    }
    if (activeLegData.departureDate && activeLegData.arrivalDate) {
        const depDate = new Date(activeLegData.departureDate);
        const arrDate = new Date(activeLegData.arrivalDate);
        const diffMs = arrDate - depDate;
        if (!isNaN(diffMs) && diffMs > 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return { text: `${hours}h ${minutes}m`, seconds: Math.floor(diffMs / 1000) };
        }
    }
    return null;
  }, [activeLegData]);

  // 3. Main map effect
  useEffect(() => {
    let isMounted = true;
    let map = null;

    const initializeMap = async () => {
      if (!isMounted || !bookingToShow || !activeLegData) return;

      const originCode = activeLegData.originAirportCode;
      const destCode = activeLegData.destinationAirportCode;

      if (!originCode || !destCode) return;

      const [originCoords, destinationCoords] = await Promise.all([
        getAirportCoordinates(originCode),
        getAirportCoordinates(destCode)
      ]).catch(() => [null, null]);

      if (!isMounted || !originCoords || !destinationCoords) return;

      if (mapRef.current) mapRef.current.remove();

      map = new mapboxgl.Map({
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

        map.setFog({});

        // Add markers
        new mapboxgl.Marker({ color: '#32CD32' }).setLngLat(originCoords).addTo(map);
        new mapboxgl.Marker({ color: '#FF4500' }).setLngLat(destinationCoords).addTo(map);

        // Create flight path
        const line = turf.greatCircle(turf.point(originCoords), turf.point(destinationCoords), { 'npoints': 500 });
        map.addSource('route', { 'type': 'geojson', 'data': line });
        map.addLayer({
            'id': 'route',
            'source': 'route',
            'type': 'line',
            'paint': { 'line-width': 4, 'line-color': '#FF4500' }
        });

        // Add airplane icon
        map.addSource('airplane', {
            'type': 'geojson',
            'data': { 'type': 'FeatureCollection', 'features': [{ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'Point', 'coordinates': originCoords } }] }
        });
        map.addLayer({
            'id': 'airplane', 'source': 'airplane', 'type': 'circle',
            'paint': { 'circle-radius': 6, 'circle-color': '#FFFFFF', 'circle-stroke-width': 2, 'circle-stroke-color': '#000000' }
        });

        // Animate plane
        const routeDistance = turf.length(line);
        let animationDuration = 15000; // Default
        if (flightDuration?.seconds > 0) {
            animationDuration = Math.max(10000, Math.min(flightDuration.seconds * 1000, 180000));
        }
        let startTime = 0;

        const animate = (timestamp) => {
            if (!isMounted) return;
            if (!startTime) startTime = timestamp;
            const runtime = timestamp - startTime;
            let progress = runtime / animationDuration;
            if (progress > 1) {
              progress = 1; // Stop at the end
            }
            
            // Update time remaining display
            if (flightDuration?.seconds > 0) {
                const timeElapsed = flightDuration.seconds * progress;
                const remainingSeconds = flightDuration.seconds - timeElapsed;
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                setTimeRemaining(`${hours}h ${minutes}m remaining`);
            }

            const alongRoute = turf.along(line, routeDistance * progress).geometry.coordinates;
            map.getSource('airplane').setData({
                'type': 'FeatureCollection',
                'features': [{'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'Point', 'coordinates': alongRoute }}]
            });
            map.panTo(alongRoute, { duration: 0 });

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };
        animate(0);
      });
      map.on('error', (e) => console.error("Mapbox error:", e.error?.message || e));
    };
    
    initializeMap();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bookingToShow, activeLegData, flightDuration]);

  return (
    <section className="travel-offers">
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
        
        {/* Map Container and Overlays */}
        <div
          style={{ 
            position: 'relative', 
            width: "90%", 
            height: "450px", 
            margin: 'auto',
            borderRadius: "20px" 
          }}
        >
          <div
            ref={mapContainer}
            className="map-container"
            style={{ width: "100%", height: "100%", borderRadius: "20px" }}
          />

          {/* Overlays Wrapper */}
          {bookingToShow && (
            <>
              {/* Top-Right Info Box */}
              <div style={{
                position: 'absolute', top: '20px', right: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white',
                padding: '10px 15px', borderRadius: '8px', zIndex: 2,
                maxWidth: '300px', fontSize: '0.9em'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  Airline: {bookingToShow.airlineName || 'N/A'}
                </div>
                {flightDuration && (
                  <div>Flight Duration: {flightDuration.text}</div>
                )}
              </div>

              {/* Bottom-Center Time Remaining */}
              {timeRemaining && (
                <div style={{
                  position: 'absolute', bottom: '80px', left: '50%',
                  transform: 'translateX(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white', padding: '8px 15px', borderRadius: '8px',
                  zIndex: 2, fontWeight: 600, fontSize: '1em'
                }}>
                  {timeRemaining}
                </div>
              )}
              
              {/* Bottom-Center Toggle Buttons */}
              {bookingToShow.bookingType === 'ROUND_TRIP' && (
                <div className="flight-toggle-buttons" style={{
                    position: 'absolute', bottom: '20px', left: '50%',
                    transform: 'translateX(-50%)', zIndex: 2,
                    display: 'flex', gap: '10px'
                }}>
                  <button onClick={() => setShowingLeg('GO')} className={showingLeg === 'GO' ? 'active' : ''}>
                    Departure Flight
                  </button>
                  <button onClick={() => setShowingLeg('RETURN')} className={showingLeg === 'RETURN' ? 'active' : ''}>
                    Return Flight
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="offers-grid">
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

      <div className="bangladesh-section">
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