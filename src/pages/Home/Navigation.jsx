import { Link } from 'react-router-dom';
import { MdAirplanemodeActive } from 'react-icons/md'; // أيقونة طيارة من Material Design
import { MdHotel } from 'react-icons/md'; // أيقونة فندق/سرير من Material Design
import './Navigation.css';

export default function Navigation() {
  return (
    <div className="nav-container">
      <Link to="/" className="nav-link" aria-label="Go to Find-flight Page">
        <span className="nav-link">
          <MdAirplanemodeActive className="icon" />
          Find Flight
        </span>
      </Link>
      <a href="#" className="nav-link">
        <MdHotel className="icon" />
        Find Stays
      </a>
    </div>
  );
}