import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUser } from "react-icons/fa";
import "./FlightSearchForm.css";

export default function FlightSearchForm() {
  return (
    <>
      <div className="FlyFormContainer">
      <div className="form-title">Where are You Flying ?</div>
      <form className="flight-search-form">
        
        <div className="form-group">
          <label>From</label>
          <div className="input-container">
            <FaPlaneDeparture className="icon-form" />
            <select>
              <option>Shahjalal International Airport, Bangladesh</option>
              <option>Qatar International Airport, Qatar</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>To</label>
          <div className="input-container">
            <FaPlaneArrival className="icon-form" />
            <select>
              <option>Qatar International Airport, Qatar</option>
              <option>Shahjalal International Airport, Bangladesh</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Date</label>
          <div className="input-container">
            <FaCalendarAlt className="icon-form" />
            <input type="date" defaultValue="2025-02-22" />
          </div>
        </div>
        
        <div className="form-group">
          <label>Passengers - Class</label>
          <div className="input-container">
            <FaUser className="icon-form" />
            <select>
              <option>2 Passengers - Economy</option>
              <option>1 Passenger - Business</option>
            </select>
          </div>
        </div>

        

      </form>
      <div className="show-flights">
          <button type="submit">Show Flights</button>
        </div>
      </div>
    </>
  );
}