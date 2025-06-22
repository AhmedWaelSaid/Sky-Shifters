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
import axios from "axios";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import FlightMap from "../../components/Map/FlightMap";
import { getAirportDetails } from "../../services/airportService";

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
  const [latestRoute, setLatestRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapContainer = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestRoute = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) return;

        const userData = JSON.parse(userString);
        if (!userData?.token) return;
        
        const response = await axios.get('https://sky-shifters.duckdns.org/booking/my-bookings', {
          headers: { Authorization: `Bearer ${userData.token}` },
        });

        const bookings = response.data?.data?.bookings;
        if (!bookings || bookings.length === 0) return;

        const futureConfirmedBookings = bookings
          .filter(booking => {
            if (booking.status !== 'confirmed') return false;
            const departureDateStr = booking.flightData?.[0]?.departureDate || booking.departureDate;
            return departureDateStr && new Date(departureDateStr) > new Date();
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (futureConfirmedBookings.length > 0) {
          const latestBooking = futureConfirmedBookings[0];
          
          const originCode = latestBooking.flightData?.[0]?.originAirportCode || latestBooking.originAirportCode;
          const destinationCode = latestBooking.flightData?.[latestBooking.flightData.length - 1]?.destinationAirportCode || latestBooking.destinationAirportCode;

          if (originCode && destinationCode) {
            const [originAirport, destinationAirport] = await Promise.all([
              getAirportDetails(originCode),
              getAirportDetails(destinationCode)
            ]);
            
            if (originAirport && destinationAirport && isMounted) {
              setLatestRoute({ origin: originAirport, destination: destinationAirport });
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch latest flight route:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLatestRoute();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading || latestRoute || !mapContainer.current) return;

    const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/ahmedwael315/cm9sv08xa00js01sb9wd35jsx",
        center: [31.257847, 30.143224],
        zoom: 3.5,
        pitch: 59.00,
        projection: 'globe'
    });

    map.on('load', () => {
        map.setFog({});
        new mapboxgl.Marker({ color: '#808080' }).setLngLat([31.257847, 30.143224]).addTo(map);
    });
    
    return () => map.remove();

  }, [isLoading, latestRoute]);

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
        <div className="map-container" style={{ width: "90%", height: "450px", borderRadius: "20px", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
          {isLoading ? (
            <p>Loading your travel map...</p>
          ) : latestRoute ? (
            <FlightMap originAirport={latestRoute.origin} destinationAirport={latestRoute.destination} />
          ) : (
            <div ref={mapContainer} style={{ width: "100%", height: "100%", borderRadius: '20px' }} />
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
