// src/components/TravelOffers.jsx
import "./TravelOffers.css";
import newYorkImg from "../assets/new-york.jpg";
import losAngelesImg from "../assets/los-angeles.jpg";
import londonImg from "../assets/london.jpg";
import mapImg from "../assets/map.png";
import bangladesh1 from "../assets/Image frame (1).png";
import bangladesh2 from "../assets/Image frame (2).png";
import bangladesh3 from "../assets/Image frame (3).png";

// بيانات العروض السياحية
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

// بيانات عروض لندن
const londonOffers = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  title: "London Adventure",
  price: "$200",
  image: londonImg,
}));

// صور عروض بنجلاديش
const bangladeshImages = [bangladesh1, bangladesh2, bangladesh3];

export default function TravelOffers() {
  return (
    <section className="travel-offers">
      {/* القسم الأول: Let’s go Places Together */}
      <div className="offers-section">
        <div className="offers-header">
          <div className="offers-header-text">
            <h2>Let’s go Places Together</h2>
            <p>Discover the latest offers and news and alerts and start planning your trip</p>
          </div>
          <button className="see-all-btn">See all</button>
        </div>
        <div className="map-container">
          <img src={mapImg} alt="Travel map" className="map-image" />
        </div>
        <div className="offers-flex home-flex">
          {offersData.map((offer) => (
            <div key={offer.id} className="offer-card">
              <img src={offer.image} alt={offer.title} className="offer-image" />
              <div className="offer-details">
                <h3>{offer.title}</h3>
                <p>{offer.date}</p>
                <p>{offer.duration}</p>
                <p className="offer-price">{offer.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* القسم الثاني: Fall into Travel - London Adventure */}
      <div className="offers-section">
        <div className="offers-header">
          <h2>Fall into Travel</h2>
          <p>Discover the latest offers and news and alerts and start planning your trip</p>
          <button className="see-all-btn">See all</button>
        </div>
        <div className="offers-flex london-flex">
          {londonOffers.map((offer) => (
            <div key={offer.id} className="offer-card london-card">
              <img src={offer.image} alt={offer.title} className="offer-image" />
              <div className="offer-details">
                <h3>{offer.title}</h3>
                <p className="offer-price">{offer.price}</p>
                <button className="book-btn">Book Flights</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* القسم الثالث: Fall into Travel - Backpacking Bangladesh */}
      <div className="offers-section">
        <div className="offers-header">
          <h2>Fall into Travel</h2>
          <p>Discover the latest offers and news and alerts and start planning your trip</p>
          <button className="see-all-btn">See all</button>
        </div>
        <div className="offers-flex bangladesh-flex">
          <div className="offer-card bangladesh-card">
            <div className="bangladesh-content">
              <h3>Backpacking Bangladesh</h3>
              <p>Explore the beauty of Bangladesh with our exclusive backpacking trips.</p>
              <p className="offer-price">From $700</p>
              <button className="book-btn">Book Flights</button>
            </div>
          </div>
          <div className="bangladesh-images">
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
