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
import { getAirportCoordinates, getAirportDetails } from "../../services/airportService";
import { bookingService } from "../../services/bookingService";
import * as turf from '@turf/turf';
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  {
    id: 3,
    title: "Berlin",
    date: "12 - 14 Mar, 2023",
    duration: "5 hr 50m",
    price: "$320",
    image: bangladesh3,
  },
  {
    id: 4,
    title: "Dubai",
    date: "20 - 22 Apr, 2023",
    duration: "4 hr 30m",
    price: "$410",
    image: bangladesh4,
  },
  {
    id: 5,
    title: "Istanbul",
    date: "1 - 3 May, 2023",
    duration: "3 hr 45m",
    price: "$280",
    image: bangladesh5,
  },
  {
    id: 6,
    title: "Tokyo",
    date: "15 - 17 Jun, 2023",
    duration: "10 hr 20m",
    price: "$670",
    image: bangladesh6,
  },
  {
    id: 7,
    title: "Cape Town",
    date: "5 - 7 Jul, 2023",
    duration: "8 hr 10m",
    price: "$540",
    image: bangladesh7,
  },
  {
    id: 8,
    title: "Sydney",
    date: "18 - 20 Aug, 2023",
    duration: "13 hr 5m",
    price: "$890",
    image: bangladesh2,
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

// Add more diverse offers for the slider
const sliderOffers = [
  {
    id: 1,
    title: "London Adventure",
    price: "$200",
    image: bangladesh7,
    desc: "Explore the heart of the UK with iconic sights and vibrant culture."
  },
  {
    id: 2,
    title: "Maldives Paradise",
    price: "$850",
    image: bangladesh5,
    desc: "Relax on white sandy beaches and crystal-clear waters."
  },
  {
    id: 3,
    title: "New York City",
    price: "$420",
    image: newYorkImg,
    desc: "Experience the city that never sleeps with endless attractions."
  },
  {
    id: 4,
    title: "Los Angeles Dream",
    price: "$399",
    image: losAngelesImg,
    desc: "Enjoy Hollywood, beaches, and sunny California vibes."
  },
  {
    id: 5,
    title: "Bangkok Explorer",
    price: "$310",
    image: bangladesh3,
    desc: "Discover temples, street food, and vibrant nightlife."
  },
  {
    id: 6,
    title: "Paris Romance",
    price: "$510",
    image: bangladesh4,
    desc: "Stroll by the Eiffel Tower and savor French cuisine."
  },
  {
    id: 7,
    title: "Tokyo Lights",
    price: "$670",
    image: bangladesh6,
    desc: "Dive into futuristic cityscapes and ancient traditions."
  },
  {
    id: 8,
    title: "Cairo Mysteries",
    price: "$350",
    image: bangladesh2,
    desc: "Marvel at the pyramids and the Nile's timeless beauty."
  },
];

export default function TravelOffers() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [flightDuration, setFlightDuration] = useState('');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const animationSpeedRef = useRef(1);
  const [zoom, setZoom] = useState(3.5); // Initial zoom level
  const [originDetails, setOriginDetails] = useState(null);
  const [destinationDetails, setDestinationDetails] = useState(null);
  const [airline, setAirline] = useState('');
  const [offersAnimationKey, setOffersAnimationKey] = useState(0);
  // Slider state for 2x2 cards
  const CARDS_PER_ROW = 2;
  const ROWS = 2;
  const CARDS_VISIBLE = CARDS_PER_ROW * ROWS;
  const [sliderIndex, setSliderIndex] = useState(0);
  const initialIndexes = Array.from({length: bangladeshImages.length}, (_, i) => i % bangladeshImages.length);
  const [imgIndexes, setImgIndexes] = useState(initialIndexes);
  const [changingIndex, setChangingIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchAndInitializeMap = async () => {
      console.log('Step 1: Starting map initialization process...');
      let originCoords = null;
      let destinationCoords = null;
      let flightDurationSeconds = 0;
      let originCode, destCode;

      const selectedFlightPathStr = localStorage.getItem('selectedFlightPath');

      if (selectedFlightPathStr) {
        try {
          const flightPath = JSON.parse(selectedFlightPathStr);
          localStorage.removeItem('selectedFlightPath'); 

          if (flightPath.originAirportCode && flightPath.destinationAirportCode) {
            console.log('Path 1: Displaying selected flight from bookings.', flightPath);
            originCode = flightPath.originAirportCode;
            destCode = flightPath.destinationAirportCode;
            
            setAirline(flightPath.airline || '');

            if (flightPath.departureDate && flightPath.arrivalDate) {
                const depDate = new Date(flightPath.departureDate);
                const arrDate = new Date(flightPath.arrivalDate);
                const diffMs = arrDate - depDate;
                if (!isNaN(diffMs) && diffMs > 0) {
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    flightDurationSeconds = Math.floor(diffMs / 1000);
                    setFlightDuration(`${hours}h ${minutes}m`);
                } else { setFlightDuration('--'); }
            } else if (flightPath.duration && typeof flightPath.duration === 'string') {
                const match = flightPath.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
                if (match) {
                    const hours = match[1] ? parseInt(match[1], 10) : 0;
                    const minutes = match[2] ? parseInt(match[2], 10) : 0;
                    flightDurationSeconds = (hours * 3600) + (minutes * 60);
                    setFlightDuration(`${hours}h ${minutes}m`);
                } else { setFlightDuration('--'); }
            } else {
                setFlightDuration('--');
            }
            
            const [origin, dest] = await Promise.all([
                getAirportCoordinates(originCode),
                getAirportCoordinates(destCode)
            ]).catch(err => {
                console.error("Error fetching coordinates for selected flight:", err);
                return [null, null];
            });
            originCoords = origin;
            destinationCoords = dest;
          }
        } catch (error) {
          console.error("Failed to process selected flight path:", error);
        }
      }

      if (!originCoords || !destinationCoords) {
        console.log('Path 2: Showing latest confirmed flight.');
        let bookingToShow = null;
        try {
          const userString = localStorage.getItem('user');
          if (userString) {
            const userData = JSON.parse(userString);
            if (userData?.token) {
              const bookings = await bookingService.getMyBookings();
              
              const futureConfirmedBookings = bookings
                .filter(booking => {
                  if (booking.status !== 'confirmed') return false;
                  const hasFlightData = booking.flightData && booking.flightData.length > 0;
                  const departureDateStr = hasFlightData ? booking.flightData[0].departureDate : booking.departureDate;
                  if (!departureDateStr) return false;
                  return new Date(departureDateStr) > new Date();
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              
              if (futureConfirmedBookings.length > 0) {
                bookingToShow = futureConfirmedBookings[0];
              }
            }
            
            if (bookingToShow) {
              originCode = bookingToShow.flightData?.[0]?.originAirportCode || bookingToShow.originAirportCode;
              destCode = bookingToShow.flightData?.[bookingToShow.flightData.length - 1]?.destinationAirportCode || bookingToShow.destinationAirportCode;
              setAirline(bookingToShow.flightData?.[0]?.airline || bookingToShow.airline || '');

              const dep = bookingToShow.flightData?.[0]?.departureDate || bookingToShow.departureDate;
              const arr = bookingToShow.flightData?.[0]?.arrivalDate || bookingToShow.arrivalDate;

              if (dep && arr) {
                const depDate = new Date(dep);
                const arrDate = new Date(arr);
                const diffMs = arrDate - depDate;
                if (!isNaN(diffMs) && diffMs > 0) {
                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  flightDurationSeconds = Math.floor(diffMs / 1000);
                  setFlightDuration(`${hours}h ${minutes}m`);
                } else { setFlightDuration('--'); }
              } else { setFlightDuration('--'); }
              
              if (originCode && destCode) {
                const [origin, dest] = await Promise.all([
                  getAirportCoordinates(originCode),
                  getAirportCoordinates(destCode)
                ]);
                originCoords = origin;
                destinationCoords = dest;
              }
            }
          }
        } catch (error) {
          console.error("Failed to process user data for map:", error);
        }
      }
      
      if (originCode && destCode) {
        getAirportDetails(originCode).then(details => isMounted && setOriginDetails(details));
        getAirportDetails(destCode).then(details => isMounted && setDestinationDetails(details));
      }
      
      if (!isMounted) return;
      
      console.log(`Step 9: Proceeding to initialize map.`);

      if (mapContainer.current) {
        if (mapRef.current) {
            mapRef.current.remove();
        }

        const center = destinationCoords || [31.257847, 30.143224];
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/ahmedwael315/cm9sv08xa00js01sb9wd35jsx",
          center: center,
          zoom: 3.5,
          pitch: 59.00,
          projection: 'globe'
        });

        mapRef.current = map;

        map.on('load', () => {
          console.log('Step 10: Map loaded.');
          map.setFog({});

          // Keep the slider in sync with map zoom
          map.on('zoom', () => {
            setZoom(map.getZoom());
          });

          if (originCoords && destinationCoords) {
            // Add markers for origin and destination
            new mapboxgl.Marker({ color: '#32CD32' }) // Green for origin
              .setLngLat(originCoords)
              .addTo(map);
            new mapboxgl.Marker({ color: '#FF4500' }) // OrangeRed for destination
              .setLngLat(destinationCoords)
              .addTo(map);

            // 1. Create a curved flight path using the reliable greatCircle method
            const line = turf.greatCircle(
                turf.point(originCoords), 
                turf.point(destinationCoords), 
                { 'npoints': 500 }
            );

            // 2. Add the styled route to the map
            map.addSource('route', {
              'type': 'geojson',
              'data': line
            });
            
            map.addLayer({
              'id': 'route',
              'source': 'route',
              'type': 'line',
              'paint': {
                'line-width': 4,
                'line-color': '#FF4500'
              }
            });

            // Add the airplane source
            map.addSource('airplane', {
              'type': 'geojson',
              'data': {
                'type': 'FeatureCollection',
                'features': [{ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'Point', 'coordinates': originCoords } }]
              }
            });

            // Add the airplane layer as a bright circle
            map.addLayer({
              'id': 'airplane',
              'source': 'airplane',
              'type': 'circle',
              'paint': {
                'circle-radius': 10, // Even larger for visibility
                'circle-color': '#FFA500', // Bright Orange
                'circle-stroke-width': 2,
                'circle-stroke-color': '#FFFFFF' // White outline for contrast
              }
            });

            // Animate the circle along the greatCircle path
            const routeDistance = turf.length(line);
            
            // Set a base duration for 1x speed. 
            // We'll use the speed multiplier to adjust this.
            const baseAnimationDuration = 40000; // 40 seconds at 1x speed

            let lastTime = 0;
            let progress = 0;

            const animate = (timestamp) => {
              if (!isMounted) return;
              if (!lastTime) lastTime = timestamp;

              // Calculate time elapsed since last frame
              const deltaTime = timestamp - lastTime;
              lastTime = timestamp;

              // Adjust progress based on speed
              const progressIncrement = (deltaTime / baseAnimationDuration) * animationSpeedRef.current;
              progress += progressIncrement;

              if (progress > 1) {
                progress = 0; // Loop the animation
              }

              // Update time remaining display
              if (flightDurationSeconds > 0) {
                  const timeElapsed = flightDurationSeconds * progress;
                  const remainingSeconds = flightDurationSeconds - timeElapsed;
                  const hours = Math.floor(remainingSeconds / 3600);
                  const minutes = Math.floor((remainingSeconds % 3600) / 60);
                  setTimeRemaining(`${hours}h ${minutes}m remaining`);
              }

              // Calculate the circle's position
              const alongRoute = turf.along(line, routeDistance * progress).geometry.coordinates;

              // Update the map source data
              const airplaneSource = map.getSource('airplane');
              if (airplaneSource?._data) {
                const airplaneData = airplaneSource._data;
                airplaneData.features[0].geometry.coordinates = alongRoute;
                airplaneSource.setData(airplaneData);
              }
              
              // Pan the map to follow the circle
              map.panTo(alongRoute, { duration: 0 });

              animationFrameRef.current = requestAnimationFrame(animate);
            }
            animate(0);
          } else {
             // Default marker if no booking found
             new mapboxgl.Marker({ color: '#808080' })
              .setLngLat([31.257847, 30.143224])
            .addTo(map);
          }
        });
        map.on('error', (e) => console.error("Mapbox error:", e.error?.message || e));
      }
    };

    fetchAndInitializeMap();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mapRef.current) {
        console.log('Component unmounting. Removing map instance.');
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run only once on mount

  useEffect(() => {
    const interval = setInterval(() => {
      setOffersAnimationKey((k) => k + 1);
    }, 4000); // كل 4 ثواني تعيد الأنيميشن
    return () => clearInterval(interval);
  }, []);

  // Auto-loop effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + CARDS_VISIBLE) % offersData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndexes(prev => {
        const newIndexes = [...prev];
        newIndexes[changingIndex] = (newIndexes[changingIndex] + 1) % bangladeshImages.length;
        return newIndexes;
      });
      setFadeKey(k => k + 1); // لإعادة الأنيميشن
      setChangingIndex(idx => (idx + 1) % bangladeshImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [changingIndex]);

  // Get the current 4 cards (looping)
  const visibleCards = [];
  for (let i = 0; i < CARDS_VISIBLE; i++) {
    visibleCards.push(offersData[(sliderIndex + i) % offersData.length]);
  }

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.7,
        type: "spring"
      }
    })
  };
  const fadeLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
  };
  const fadeRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
  };
  // Animation variants for sliding in/out
  const slideVariant = {
    initial: { x: 120, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: "spring", duration: 0.7 } },
    exit: { x: -120, opacity: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="travel-offers">
      <motion.div
        className="offers-section"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
      >
        <motion.div className="offers-header" variants={fadeLeft}>
          <div className="offers-header-text">
            <h2>Let's go Places Together</h2>
            <p>
              Discover the latest offers and news and alerts and start planning
              your trip
            </p>
          </div>
          <motion.button
            className="see-all-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            See all
          </motion.button>
        </motion.div>
        <div
          ref={mapContainer}
          className="map-container"
          style={{ width: "90%", height: "450px", borderRadius: "20px", position: 'relative' }}
        >
          {flightDuration && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '7px 16px',
              borderRadius: '7px',
              fontWeight: 600,
              fontSize: '1.1em',
              zIndex: 2,
              minWidth: '260px'
            }}>
              Flight Duration: {flightDuration}
              <div style={{
                marginTop: 10,
                fontWeight: 400,
                fontSize: '0.98em',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                {originDetails && (
                  <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                    <span role="img" aria-label="depart">🛫</span>
                    {originDetails.name}
                    {((originDetails.city && originDetails.country) || originDetails.city || originDetails.country) && (
                      <span style={{marginLeft: 3, color: '#ccc', fontWeight: 400}}>
                        {[
                          originDetails.city,
                          originDetails.country
                        ].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </span>
                )}
                {destinationDetails && (
                  <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                    <span role="img" aria-label="arrive">🛬</span>
                    {destinationDetails.name}
                    {((destinationDetails.city && destinationDetails.country) || destinationDetails.city || destinationDetails.country) && (
                      <span style={{marginLeft: 3, color: '#ccc', fontWeight: 400}}>
                        {[
                          destinationDetails.city,
                          destinationDetails.country
                        ].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </span>
                )}
                {airline && (
                  <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                    <span role="img" aria-label="airline">✈️</span>
                    {airline}
                  </span>
                )}
              </div>
            </div>
          )}
          {timeRemaining && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              zIndex: 1
            }}>
              {timeRemaining}
            </div>
          )}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '10px',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
             <div style={{display: 'flex', alignItems: 'center', gap: '10px', width: '200px', justifyContent: 'space-between'}}>
              <label htmlFor="zoom" style={{fontWeight: 500, flexShrink: 0}}>Zoom</label>
              <input
                type="range"
                id="zoom"
                min={mapRef.current ? mapRef.current.getMinZoom() : 0}
                max={mapRef.current ? mapRef.current.getMaxZoom() : 22}
                step="0.1"
                value={zoom}
                onChange={(e) => {
                  const newZoom = parseFloat(e.target.value);
                  mapRef.current.setZoom(newZoom);
                }}
                style={{cursor: 'pointer', width: '130px'}}
              />
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', width: '200px', justifyContent: 'space-between'}}>
              <label htmlFor="speed" style={{fontWeight: 500, flexShrink: 0}}>Speed: {animationSpeed.toFixed(1)}x</label>
              <input
                type="range"
                id="speed"
                min="0.2"
                max="5"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => {
                  const newSpeed = parseFloat(e.target.value);
                  setAnimationSpeed(newSpeed);
                  animationSpeedRef.current = newSpeed;
                }}
                style={{cursor: 'pointer', width: '130px'}}
              />
            </div>
          </div>
        </div>
        {/* Swiper سلايدر أفقي للكروت بنفس التصميم */}
        <div style={{ width: '100%', maxWidth: '1200px', margin: '40px auto 0 auto' }}>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={24}
            slidesPerView={2}
            loop={true}
            autoplay={{ delay: 2200, disableOnInteraction: false }}
            style={{ width: '100%' }}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 2 },
            }}
          >
            {offersData.map((offer, idx) => (
              <SwiperSlide key={offer.id}>
                <motion.div
                  className="offer-card"
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    minHeight: 170,
                    minWidth: 600,
                    maxWidth: 750,
                    width: '95%',
                    padding: '32px 44px',
                    gap: 36,
                    margin: '0 auto',
                  }}
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="offer-image"
                    style={{ width: 220, height: 150, objectFit: 'cover', borderRadius: '18px', flexShrink: 0 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0, gap: 4 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.25em', margin: 0, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{offer.title}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#444', fontSize: '1.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{offer.date}</p>
                    <span style={{ color: '#1976d2', fontWeight: 600, fontSize: '1.05em', marginTop: 4, whiteSpace: 'nowrap' }}>{offer.duration}</span>
                  </div>
                  <div style={{ marginLeft: 28, minWidth: 70, textAlign: 'right', alignSelf: 'center' }}>
                    <span style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.22em', whiteSpace: 'nowrap' }}>{offer.price}</span>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.div>

      <motion.div
        className="offers-section"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
      >
        <motion.div className="offers-header" variants={fadeLeft}>
          <div className="offers-header-text">
            <h2>Fall into Travel</h2>
            <p>
              Discover the latest offers and news and alerts and start planning
              your trip
            </p>
          </div>
          <motion.button
            className="see-all-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            See all
          </motion.button>
        </motion.div>
        <div className="more-offers" style={{ position: 'relative', paddingBottom: 0 }}>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={15}
            slidesPerView={4}
            loop={true}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '20px 0' }}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
          >
            {sliderOffers.map((offer, idx) => (
              <SwiperSlide key={offer.id}>
                <motion.div
                  className="more-offers-card"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={idx + 1}
                  whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{ cursor: 'pointer' }}
                >
                  <motion.img
                    src={offer.image}
                    alt={offer.title}
                    className="more-offers-image"
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ objectFit: 'cover', width: '100%', height: '250px', borderRadius: '12px 12px 0 0' }}
                  />
                  <div className="moreoffers-details">
                    <div className="moreoffers-header">
                      <h3>{offer.title}</h3>
                      <span className="offer-price">{offer.price}</span>
                    </div>
                    <p>{offer.desc}</p>
                    <motion.button
                      className="book-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Book Flights
                    </motion.button>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.div>

      <motion.div
        className="offers-section"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={2}
      >
        <motion.div className="offers-header" variants={fadeLeft}>
          <div className="offers-header-text">
            <h2>Fall into Travel</h2>
            <p>
              Going somewhere to celebrate this season? Whether you're going
              home or somewhere to roam,
              <br />
              we've got the travel tools to get you to your destination.
            </p>
          </div>
          <motion.button
            className="see-all-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            See all
          </motion.button>
        </motion.div>
        <div className="hot-offers">
          <motion.div
            className="AD-card"
            variants={fadeRight}
            initial="hidden"
            animate="visible"
          >
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
                <motion.button
                  className="AD-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Flight
                </motion.button>
              </div>
            </div>
          </motion.div>
          <div className="offers-images">
            {bangladeshImages.map((img, index) => (
              <motion.img
                key={index + '-' + imgIndexes[index] + '-' + fadeKey}
                src={bangladeshImages[imgIndexes[index]]}
                alt={`Backpacking Bangladesh ${index + 1}`}
                className="bangladesh-image"
                initial={index === changingIndex ? { opacity: 0, scale: 0.85, rotate: -8 } : { opacity: 1, scale: 1, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                style={{ willChange: 'transform', borderRadius: '20px' }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}