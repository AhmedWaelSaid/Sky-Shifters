import { useState } from "react";
import { Outlet } from "react-router-dom";


export default function Flights() {
    const [flight,setFlight] = useState(null);
    return <Outlet context={{flight,setFlight}}/>
}