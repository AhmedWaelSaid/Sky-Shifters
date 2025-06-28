import "./TravelOffers.css";
import newYorkImg from "../../assets/new-york.jpg";
import losAngelesImg from "../../assets/los-angeles.jpg";
import bangladesh2 from "../../assets/Image frame (2).png";
import bangladesh3 from "../../assets/pexels-brett-sayles-2310604.jpg";
import bangladesh4 from "../../assets/Image frame (5).png";
import bangladesh5 from "../../assets/pexels-asadphoto-1266831.jpg";
import bangladesh6 from "../../assets/pexels-pixabay-38238.jpg";
import bangladesh7 from "../../assets/pexels-pixabay-237272.jpg";
const images = import.meta.glob('../../assets/*-unsplash*.jpg', { eager: true, as: 'url' });
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAirportCoordinates, getAirportDetails } from "../../services/airportService";
import { bookingService } from "../../services/bookingService";
import * as turf from '@turf/turf';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// قلل عدد الصور المستخدمة في العروض لتحسين الأداء
const MAX_IMAGES = 10; // يمكن تعديل العدد حسب الحاجة
// استخدم فقط الصور الفريدة حتى لو قل العدد
let allImages = Array.from(new Set(Object.values(images)));
if (allImages.length > MAX_IMAGES) allImages = allImages.slice(0, MAX_IMAGES);
const allImagesFull = Object.values(images); // كل الصور المتاحة
// إذا كانت أول صورتين متشابهتين، بدّل الثانية بصورة مختلفة من الصور الكاملة
if (allImages.length > 1 && allImages[0] === allImages[1]) {
  const replacement = allImagesFull.find(img => img !== allImages[0]);
  if (replacement) allImages[1] = replacement;
}

// بيانات واقعية متنوعة للعروض
const realCities = [
  "Paris", "London", "New York", "Tokyo", "Dubai", "Rome", "Istanbul", "Bangkok", "Barcelona", "Sydney", "Cairo", "Moscow", "Rio de Janeiro", "Cape Town", "Toronto", "Singapore", "Los Angeles", "Berlin", "Amsterdam", "Prague", "Vienna", "Budapest", "Lisbon", "Seoul", "Kuala Lumpur", "Zurich", "Stockholm", "Dublin", "Venice", "Munich", "Brussels", "Warsaw", "Helsinki", "Oslo", "Athens", "Madrid"
];
function getRandomDate() {
  const start = new Date();
  const end = new Date();
  end.setFullYear(start.getFullYear() + 1);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return `${date.getDate().toString().padStart(2, '0')} - ${(date.getMonth()+1).toString().padStart(2, '0')} - ${date.getFullYear()}`;
}
function getRandomDuration() {
  const hours = Math.floor(Math.random() * 12) + 2;
  const minutes = Math.floor(Math.random() * 60);
  return `${hours} hr ${minutes}m`;
}
function getRandomPrice2() {
  return `$${(Math.floor(Math.random() * 900) + 100)}`;
}
const offersDataReal = allImages.map((img, idx) => ({
  id: idx + 1,
  title: realCities[idx % realCities.length],
  date: getRandomDate(),
  duration: getRandomDuration(),
  price: getRandomPrice2(),
  image: img
}));

// بيانات العروض الإعلانية
const placeNames = [
  "Dream Beach", "Mountain Escape", "City Lights", "Tropical Paradise", "Historic Town", "Desert Adventure", "Forest Retreat",
  "Island Getaway", "Urban Vibes", "Hidden Gem", "Sunset Point", "Winter Wonderland", "Cultural Capital", "Seaside Escape",
  "Skyline View", "Nature's Beauty", "Adventure Land", "Peaceful Lake", "Majestic Falls", "Golden Sands", "Wild Safari",
  "Charming Village", "Modern Marvel", "Ancient Ruins", "Colorful Streets", "Lush Valley", "Crystal Waters", "Starry Night",
  "Sunny Fields", "Snowy Peaks", "Royal Palace", "Vibrant Market", "Serene River", "Enchanted Forest", "Sunny Coast", "Epic Canyon"
];
function getRandomPrice() {
  return Math.floor(Math.random() * 1000) + 200;
}
function getRandomDesc() {
  const descs = [
    "A breathtaking destination for your next adventure.",
    "Enjoy unforgettable moments and stunning views.",
    "Perfect for relaxation and exploration.",
    "Discover the beauty and culture of this place.",
    "A must-visit spot for every traveler.",
    "Experience nature and luxury together.",
    "Create memories that last a lifetime."
  ];
  return descs[Math.floor(Math.random() * descs.length)];
}
const adOffers = allImages.map((img, idx) => ({
  title: placeNames[idx % placeNames.length],
  desc: getRandomDesc(),
  price: getRandomPrice(),
  currency: "$",
  image: img
}));

// Get first 4 unique images (no duplicates)
const getBangladeshImages = (allImages) => {
  const unique = [];
  for (const img of allImages) {
    if (!unique.includes(img)) {
      unique.push(img);
      if (unique.length === 4) break;
    }
  }
  return unique;
};

export default function TravelOffers() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [flightDuration, setFlightDuration] = useState('');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const animationSpeedRef = useRef(1);
  const [zoom, setZoom] = useState(3.5);
  const [originDetails, setOriginDetails] = useState(null);
  const [destinationDetails, setDestinationDetails] = useState(null);
  const [airline, setAirline] = useState('');
  const [adIndex, setAdIndex] = useState(0);
  const [adImageLoaded, setAdImageLoaded] = useState(false);
  const [adAnimKey, setAdAnimKey] = useState(0);

  // ثابتة بعد التحميل الأول
  const bangladeshImages = useMemo(() => getBangladeshImages(allImages), []);
  const memoizedAdOffers = useMemo(() => adOffers, []);

  // Memoize map initialization to prevent unnecessary re-creation
  const initializeMap = useCallback(async () => {
    let isMounted = true;
    let originCoords = null;
    let destinationCoords = null;
    let flightDurationSeconds = 0;
    let originCode, destCode;

    const selectedFlightPathStr = localStorage.getItem('selectedFlightPath');

    if (selectedFlightPathStr) {
      try {
        const flightPath = JSON.parse(selectedFlightPathStr);
        localStorage.removeItem('selectedFlightPath'); // Clear after use

        if (flightPath.originAirportCode && flightPath.destinationAirportCode) {
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
            setFlightDuration('--'); }

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
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Latest booking

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
        console.error("Failed to fetch latest confirmed booking:", error);
      }
    }

    if (originCode && destCode) {
      // Fetch airport details in parallel
      Promise.all([
        getAirportDetails(originCode).then(details => isMounted && setOriginDetails(details)),
        getAirportDetails(destCode).then(details => isMounted && setDestinationDetails(details))
      ]);
    }

    if (!isMounted || !mapContainer.current) return;

    // Remove existing map instance if any to prevent memory leaks on re-renders
    if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
    }

    const center = destinationCoords || [31.257847, 30.143224]; // Default to Cairo if no coords
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
      map.setFog({});

      map.on('zoom', () => {
        // Debounce setZoom if it causes performance issues due to re-renders elsewhere
        setZoom(map.getZoom());
      });

      if (originCoords && destinationCoords) {
        new mapboxgl.Marker({ color: '#32CD32' }) // Green for origin
          .setLngLat(originCoords)
          .addTo(map);
        new mapboxgl.Marker({ color: '#FF4500' }) // OrangeRed for destination
          .setLngLat(destinationCoords)
          .addTo(map);

        const line = turf.greatCircle(
          turf.point(originCoords),
          turf.point(destinationCoords),
          { 'npoints': 500 }
        );

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

        map.addSource('airplane', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [{ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'Point', 'coordinates': originCoords } }]
          }
        });

        map.addLayer({
          'id': 'airplane',
          'source': 'airplane',
          'type': 'circle',
          'paint': {
            'circle-radius': 10,
            'circle-color': '#FFA500',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF'
          }
        });

        const routeDistance = turf.length(line);
        const baseAnimationDuration = 40000; // 40 seconds at 1x speed

        let lastTime = 0;
        let progress = 0;

        const animate = (timestamp) => {
          if (!isMounted) return;
          if (!lastTime) lastTime = timestamp;

          const deltaTime = timestamp - lastTime;
          lastTime = timestamp;

          const progressIncrement = (deltaTime / baseAnimationDuration) * animationSpeedRef.current;
          progress += progressIncrement;

          if (progress > 1) {
            progress = 0; // Loop the animation
          }

          if (flightDurationSeconds > 0) {
              const timeElapsed = flightDurationSeconds * progress;
              const remainingSeconds = flightDurationSeconds - timeElapsed;
              const hours = Math.floor(remainingSeconds / 3600);
              const minutes = Math.floor((remainingSeconds % 3600) / 60);
              setTimeRemaining(`${hours}h ${minutes}m remaining`);
          }

          const alongRoute = turf.along(line, routeDistance * progress).geometry.coordinates;

          const airplaneSource = map.getSource('airplane');
          if (airplaneSource?._data) { // Check if _data exists before accessing
            const airplaneData = airplaneSource._data;
            airplaneData.features[0].geometry.coordinates = alongRoute;
            airplaneSource.setData(airplaneData);
          }

          map.panTo(alongRoute, { duration: 0 });

          animationFrameRef.current = requestAnimationFrame(animate);
        }
        animationFrameRef.current = requestAnimationFrame(animate); // Start animation
      } else {
          // Default marker if no booking found
          new mapboxgl.Marker({ color: '#808080' })
           .setLngLat([31.257847, 30.143224])
           .addTo(map);
      }
    });
    map.on('error', (e) => console.error("Mapbox error:", e.error?.message || e));

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array as this should only run once on mount

  useEffect(() => {
    initializeMap(); // Call the memoized map initialization
  }, [initializeMap]);

  // Effect for the AD-card auto-changing offers
  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % memoizedAdOffers.length);
      setAdImageLoaded(false); // Reset load status for the new image
      setAdAnimKey((k) => k + 1); // trigger animation
    }, 10000); // Change every 10 seconds
    return () => clearInterval(interval);
  }, [memoizedAdOffers.length]);

  // Preload the next image for the AD-card to prevent blank background
  useEffect(() => {
    const currentAdImage = memoizedAdOffers[adIndex].image;
    const img = new Image();
    img.src = currentAdImage;
    img.onload = () => setAdImageLoaded(true);
    img.onerror = () => {
        console.warn(`Failed to load image: ${currentAdImage}`);
        setAdImageLoaded(true); // Still set to true to show fallback if image fails
    };
  }, [adIndex, memoizedAdOffers]);

  const adPriceRef = useRef(null);
  const adTextRef = useRef(null);

  useEffect(() => {
    if (adPriceRef.current) {
      adPriceRef.current.classList.remove('ad-price-animate');
      // force reflow
      void adPriceRef.current.offsetWidth;
      adPriceRef.current.classList.add('ad-price-animate');
    }
    if (adTextRef.current) {
      adTextRef.current.classList.remove('ad-text-animate');
      void adTextRef.current.offsetWidth;
      adTextRef.current.classList.add('ad-text-animate');
    }
  }, [adIndex]);

  return (
    <section className="travel-offers">
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
                setZoom(newZoom); // Update local state for slider position
                if (mapRef.current) {
                    mapRef.current.setZoom(newZoom); // Directly update Mapbox zoom
                }
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
                animationSpeedRef.current = newSpeed; // Update ref for animation loop
              }}
              style={{cursor: 'pointer', width: '130px'}}
            />
          </div>
        </div>
      </div>
      {/* Swiper slider for horizontal cards */}
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
          {offersDataReal.slice(0, 5).map((offer) => (
            <SwiperSlide key={offer.id}>
              <div
                className="offer-card"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  minHeight: 170,
                  minWidth: 'auto', // Allow flexible width
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
                  loading="lazy"
                  style={{ width: 220, height: 150, objectFit: 'cover', borderRadius: '18px', flexShrink: 0 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0, gap: 4 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.25em', margin: 0, color: 'var(--Darktext-color)' }}>{offer.title}</h3>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--LightDarktext-color)', fontSize: '1.05em' }}>{offer.date}</p>
                  <span style={{ color: 'var(--Btnbg-color)', fontWeight: 600, fontSize: '1.05em', marginTop: 4, whiteSpace: 'nowrap' }}>{offer.duration}</span>
                </div>
                <div style={{ marginLeft: 28, minWidth: 70, textAlign: 'right', alignSelf: 'center' }}>
                  <span style={{ color: 'var(--Btnbg-color)', fontWeight: 700, fontSize: '1.22em', whiteSpace: 'nowrap' }}>{offer.price}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div
        className="offers-section"
        style={{ position: 'relative', paddingBottom: 0 }}
      >
        <div className="offers-header">
          <div className="offers-header-text">
            <h2>Fall into Travel</h2>
            <p>
              Discover the latest offers and news and alerts and start planning
              your trip
            </p>
          </div>
          <button
            className="see-all-btn"
          >
            See all
          </button>
        </div>
        <div className="more-offers">
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
            {memoizedAdOffers.slice(0, 5).map((offer, idx) => (
              <SwiperSlide key={idx}> {/* Using idx as key is fine if array content doesn't change order */}
                <div
                  className="more-offers-card"
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="more-offers-image"
                    loading="lazy"
                    style={{ objectFit: 'cover', width: '100%', height: '250px', borderRadius: '12px 12px 0 0' }}
                  />
                  <div className="moreoffers-details">
                    <div className="moreoffers-header">
                      <h3 ref={adTextRef} className={`ad-text-animate`}>{offer.title}</h3>
                      <span className="offer-price">${offer.price}</span>
                    </div>
                    <p ref={adTextRef} className={`AD-disc ad-text-animate`}>{offer.desc}</p>
                    <button
                      className="book-btn"
                    >
                      Book Flights
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div
        className="offers-section"
      >
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
          <button
            className="see-all-btn"
          >
            See all
          </button>
        </div>
        <div className="hot-offers">
          <div
            className="AD-card"
            style={{
              background: adImageLoaded
                ? `linear-gradient(120deg, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.25) 100%), url(${memoizedAdOffers[adIndex].image}) center/cover no-repeat`
                : 'repeating-linear-gradient(120deg, #bbb 0px, #e6e6e6 100px)', // Placeholder/loading background
              position: 'relative',
              transition: 'background 0.5s ease',
              minHeight: '350px', // Maintain height during loading for smoother layout
            }}
          >
            <div className="bangladesh-content">
              <h3
                style={{
                  minHeight: 60,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '2em',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {memoizedAdOffers[adIndex].title}
              </h3>
              <p
                className={`AD-disc ad-text-animate`}
                style={{
                  minHeight: 90,
                  color: '#fff',
                  fontSize: '1.15em',
                  margin: '10px 0 0 0',
                  textShadow: '0 2px 8px rgba(0,0,0,0.18)'
                }}
              >
                {memoizedAdOffers[adIndex].desc}
              </p>
              <p ref={adPriceRef} className={`AD-price ad-price-animate`} style={{
                minWidth: 90,
                textAlign: 'center'
              }}>
                From<br />
                {memoizedAdOffers[adIndex].currency}{memoizedAdOffers[adIndex].price}
              </p>
              <div className="AD-Dbtn">
                <button
                  className="AD-btn"
                >
                  Book Flight
                </button>
              </div>
            </div>
          </div>
          <div className="offers-images">
            {bangladeshImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Travel destination ${index + 1}`}
                className="bangladesh-image"
                loading="lazy"
                style={{ borderRadius: '20px' }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}