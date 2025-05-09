import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function Flights() {
  const storedFlight = JSON.parse(localStorage.getItem("flight"));
  const [flight, setFlight] = useState(storedFlight);
  console.log(flight);
  useEffect(() => {
    localStorage.setItem("flight", JSON.stringify(flight));
  }, [flight]);
  return <Outlet context={{ flight, setFlight }} />;
}
