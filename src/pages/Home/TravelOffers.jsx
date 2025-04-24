import "./TravelOffers.css";
import newYorkImg from "../../assets/new-york.jpg";
import losAngelesImg from "../../assets/los-angeles.jpg";
import bangladesh2 from "../../assets/Image frame (2).png";
import bangladesh3 from "../../assets/Image frame (3).png";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = "pk.eyJ1IjoiYWhtZWR3YWVsMzE1IiwiYSI6ImNtOXNzcGg5ZjA0cjEyaXNkOHdwdzRramcifQ.HYZyW_BX-tqJa-qcntCbUw"; 

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

const londonOffers = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  title: "London Adventure",
  price: "$ 200",
  image: bangladesh2,
}));

const bangladeshImages = [bangladesh3, bangladesh2, bangladesh3, bangladesh3];

export default function TravelOffers() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/ahmedwael315/cm9sv08xa00js01sb9wd35jsx", 
      center: [29.773725, 26.351252], 
      zoom: 5.26,
      pitch :  59.00 ,
      bearing : 0.00 

    });

    new mapboxgl.Marker()
      .setLngLat([31.257847, 30.143224])
      .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <section className="travel-offers">
      <div className="offers-section">
        <div className="offers-header">
          <div className="offers-header-text">
            <h2>Let’s go Places Together</h2>
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
              Going somewhere to celebrate this season? Whether you’re going
              home or somewhere to roam,
              <br />
              we’ve got the travel tools to get you to your destination.
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
