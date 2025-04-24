import SideBar from "./Sidebar.jsx";
import { Main } from "./Main.jsx";
import styles from "./styles/container.module.css";
import { useState } from "react";
import { data } from "./data.jsx";
import {getDurationAndPrice} from "./data.jsx"

function updateSpecificDate(date) {
  return data.filter((value) => {
    if (value.date == date) return true;
    else return false;
  });
}
export default function Container() {
  const [stop, setStop] = useState("");
  const [airLinesChecked, setAirLinesChecked] = useState({
    Emirates: false,
    Qatar: false,
  });
  const [price, setPrice] = useState(2000);
  const [flightDuration, setFlightDuration] = useState("22");
  const [currentPage, setCurrentPage] = useState(1);
  const [flightsData, setFlightsData] = useState(
    updateSpecificDate("2025-04-21")
  );
  function filteredData(data) {
    let filteredFlights = data;
    if (stop !== "") {
      filteredFlights = filteredFlights.filter((flight) => stop == flight.stops);
    } //filter_stop
  
    const activeAirLines = Object.keys(airLinesChecked).filter(
      (airline) => airLinesChecked[airline]
    );
    filteredFlights =
      activeAirLines.length > 0
        ? filteredFlights.filter((flight) =>
            activeAirLines.includes(flight.airline)
          )
        : filteredFlights; //filter_airlines
  
    filteredFlights = filteredFlights.filter((flight) => {
      const arr = flight.price.split(" ");
      if (Number(price) >= Number(arr[0])) return true;
    }); //sort_price
  
    filteredFlights = filteredFlights.filter(
      (flight) =>
        flightDuration >=
        Number(flight.duration.split(" ")[0]) +
          parseFloat(flight.duration.split(" ")[2]) / 60
    ); //filter_duration
    return filteredFlights;
  }
  
  let filteredFlights = filteredData(flightsData);
  const objectOfPriceAndDuration = getDurationAndPrice(filteredFlights);
  return (
    <div className={styles.container}>
      <SideBar
        stop={stop}
        setStop={setStop}
        setCurrentPage={setCurrentPage}
        airLinesChecked={airLinesChecked}
        setAirLinesChecked={setAirLinesChecked}
        setPrice={setPrice}
        price={price}
        setFlightDuration={setFlightDuration}
        flightDuration={flightDuration}
        objectOfPriceAndDuration={objectOfPriceAndDuration}
      />
      <Main
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        filteredFlights={filteredFlights}
        updateSpecificDate={updateSpecificDate}
        setFlightsData={setFlightsData}
      />
    </div>
  );
}
