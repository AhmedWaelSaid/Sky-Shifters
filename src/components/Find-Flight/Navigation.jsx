import planeIcon from '../../assets/material-symbols-light_flight-rounded.png';
import hotelIcon from '../../assets/mdi_bedroom.png';
import './Navigation.css';
import { Link } from 'react-router-dom';

export default function Navigation() {
    return (
        <div className="nav-container">
          <Link to="/" className='nav-link' aria-label="Go to Find-flight Page">
            <span className="nav-link"> 
              <img src={planeIcon} alt="Plane" className="icon" />
              Find Flight
            </span>
          </Link>
          <a href="#" className="nav-link">
            <img src={hotelIcon} alt="Hotel" className="icon" />
            Find Stays
          </a>
        </div>
    );
}
