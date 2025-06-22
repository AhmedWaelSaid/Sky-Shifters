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
  const mapRef = useRef(null); // Use a ref to hold the map instance
  const animationFrameRef = useRef(null); // Ref to hold animation frame id

  useEffect(() => {
    let isMounted = true; // Flag to check if the component is still mounted

    const fetchAndInitializeMap = async () => {
      console.log('Step 1: Starting map initialization process...');
      let originCoords = null;
      let destinationCoords = null;

      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          if (userData?.token) {
            console.log('Step 2: User token found. Fetching bookings...');
            const bookings = await bookingService.getMyBookings();
            console.log('Step 3: Received response from bookings API.');

            if (bookings && bookings.length > 0) {
              console.log(`Found ${bookings.length} bookings. Starting filter...`);
              const futureConfirmedBookings = bookings
                .filter(booking => booking.status === 'confirmed' && new Date(booking.flightData?.[0]?.departureDate) > new Date())
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

              console.log(`Filter complete. Found ${futureConfirmedBookings.length} future confirmed bookings.`);

              if (futureConfirmedBookings.length > 0) {
                const latestBooking = futureConfirmedBookings[0];
                console.log(`Latest booking for map:`, latestBooking);

                const originCode = latestBooking.flightData?.[0]?.originAirportCode;
                const destCode = latestBooking.flightData?.[latestBooking.flightData.length - 1]?.destinationAirportCode;
                
                if (originCode && destCode) {
                  console.log(`Fetching coordinates for origin: ${originCode} and destination: ${destCode}`);
                  const [origin, dest] = await Promise.all([
                    getAirportCoordinates(originCode),
                    getAirportCoordinates(destCode)
                  ]);
                  originCoords = origin;
                  destinationCoords = dest;
                  if(originCoords && destinationCoords) console.log(`Coordinates found.`);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to process user data for map:", error);
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

          if (originCoords && destinationCoords) {
            // 1. Create the route
            const route = {
              'type': 'FeatureCollection',
              'features': [{
                'type': 'Feature',
                'geometry': {
                  'type': 'LineString',
                  'coordinates': [originCoords, destinationCoords]
                }
              }]
            };

            // 2. Create a curved line
            const line = turf.greatCircle(turf.point(originCoords), turf.point(destinationCoords), { 'npoints': 500 });

            map.addSource('route', {
              'type': 'geojson',
              'data': line
            });
            
            map.addLayer({
              'id': 'route',
              'source': 'route',
              'type': 'line',
              'paint': {
                'line-width': 2,
                'line-color': '#007cbf'
              }
            });

            // 3. Add airplane icon
            const airplane = {
              'type': 'geojson',
              'data': {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                      'type': 'Point',
                      'coordinates': originCoords
                    }
                  }]
              }
            };
            map.addSource('airplane', airplane);
            map.addLayer({
              'id': 'airplane',
              'source': 'airplane',
              'type': 'symbol',
              'layout': {
                'icon-image': 'airport-15', // a default mapbox icon
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
              }
            });

            // 4. Animate the plane
            const routeDistance = turf.length(line);
            const animationDuration = 15000; // 15 seconds for the animation
            let startTime = 0;

            const animate = (timestamp) => {
              if (!isMounted) return;
              if (!startTime) startTime = timestamp;
              
              const runtime = timestamp - startTime;
              const progress = runtime / animationDuration;

              if (progress > 1) {
                // reset animation
                startTime = timestamp;
              }

              const alongRoute = turf.along(line, routeDistance * progress).geometry.coordinates;
              airplane.data.features[0].geometry.coordinates = alongRoute;

              // Calculate bearing for icon rotation
              const nextPoint = turf.along(line, routeDistance * (progress + 0.001)).geometry.coordinates;
              const bearing = turf.bearing(turf.point(alongRoute), turf.point(nextPoint));
              airplane.data.features[0].properties.bearing = bearing;
              
              map.getSource('airplane').setData(airplane.data);
              map.panTo(alongRoute);

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

  return (
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
        <div
          ref={mapContainer}
          className="map-container"
          style={{ width: "90%", height: "450px", borderRadius: "20px" }}
        />
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
                alt={`Backpacking Bangladesh ${index + 1}`