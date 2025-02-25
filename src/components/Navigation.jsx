import planeIcon from '../assets/material-symbols-light_flight-rounded.png';
import hotelIcon from '../assets/mdi_bedroom.png';
import './Navigation.css'

export default function Navigation() {
    return (
        <div className="nav-container">
          <a href="#" className="nav-link">
            <img src={planeIcon} alt="Plane" className="icon" />
            Find Flight
          </a>
          <a href="#" className="nav-link">
            <img src={hotelIcon} alt="Hotel" className="icon" />
            Find Stays
          </a>
        </div>
      );
    }