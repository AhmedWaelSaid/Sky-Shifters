import SideBar from "./Sidebar.jsx";
import { Main } from "./Main.jsx";
import styles from "./styles/container.module.css";
import { useState, useEffect } from "react";
import { getDurationAndPrice } from "./data.jsx";
import { useData } from "../../components/context/DataContext.jsx";
import { getAmadeusAccessToken } from "../../helperFun.jsx";
import { format } from "date-fns";
import MainHeader from "./MainHeader.jsx";
import Loading from "./Loading.jsx";

async function getFlightsFromAPI(input, signal) {
  if (!input) return;
  const key = import.meta.env.VITE_API_KEY;
  const secret = import.meta.env.VITE_API_SECRET;
  const accessToken = await getAmadeusAccessToken(key, secret);
  const data = await fetch(
    `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${input.origin.airport.iata}&destinationLocationCode=${input.dest.airport.iata}&departureDate=${format(input.date, "u-LL-dd")}&adults=1`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    }
  ).then((response) => {
    if (response.status >= 400) {
      throw new Error("server error");
    }
    return response.json();
  });
  console.log(data);
  return data;
}
function useSearchData() {
  const { sharedData } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchFlights = async () => {
      if (!sharedData || !sharedData.origin.airport || !sharedData.dest.airport)
        return;
      try {
        setLoading(true);
        const result = await getFlightsFromAPI(sharedData, controller.signal);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();

    return () => controller.abort();
  }, [sharedData]);
  return { data, loading, error };
}
export default function Container() {
  const { data: flightsData, loading, error } = useSearchData();
  const [stop, setStop] = useState("");
  const [airLinesChecked, setAirLinesChecked] = useState({});
  const [price, setPrice] = useState(null);
  const [flightDuration, setFlightDuration] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [airLinesChecked]);
  console.log("loading:", loading, "data:", flightsData, "error:", error);

  if (loading) return <Loading />;
  if (error && error.name !== "AbortError") {
    return <h1 className={styles.error}>Network error detected!</h1>;
  }
  if (!flightsData) return <Loading />;
  function filteredData(flights) {
    if (!flights) return null;
    let filteredFlights = { ...flights };
    if (stop !== "") {
      filteredFlights.data = flights.data.filter((flight) => {
        if (stop == "Direct") return flight.itineraries[0].segments.length == 1;
        else return flight.itineraries[0].segments.length > 1;
      });
    } //filter_stop
    const activeAirlines = Object.keys(airLinesChecked).filter(
      (code) => airLinesChecked[code]
    );
    if (activeAirlines.length > 0)
      filteredFlights.data = filteredFlights.data.filter((flight) => {
        return activeAirlines.includes(flight.validatingAirlineCodes[0]);
      });
    //filter_airlines
    /* filteredFlights = filteredFlights.filter((flight) => {
      const arr = flight.price.split(" ");
      if (Number(price) >= Number(arr[0])) return true;
    }); //sort_price

    filteredFlights = filteredFlights.filter(
      (flight) =>
        flightDuration >=
        Number(flight.duration.split(" ")[0]) +
          parseFloat(flight.duration.split(" ")[2]) / 60
    ); //filter_duration*/
    return filteredFlights;
  }
  let filteredFlights = filteredData(flightsData);
  //const objectOfPriceAndDuration = getDurationAndPrice(flightsData);
  return (
    <div className={styles.container}>
      {
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
          //objectOfPriceAndDuration={objectOfPriceAndDuration}
          airLines={flightsData.dictionaries.carriers}
        />
      }
      <MainHeader />
      <Main
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        flightsData={filteredFlights}
      />
    </div>
  );
}
