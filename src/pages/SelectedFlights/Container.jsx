import SideBar from "./SideBar.jsx";
import { Main } from "./Main.jsx";
import styles from "./styles/container.module.css";
import { useState, useEffect } from "react";
import { getDurationAndPrice, dealWithDuration } from "./someFun.jsx";
import { useData } from "../../components/context/DataContext.jsx";
import { getAmadeusAccessToken } from "../../helperFun.jsx";
import { format } from "date-fns";
import MainHeader from "./MainHeader.jsx";
import Loading from "./Loading.jsx";
import Error from "./Error.jsx";
import EmptyData from "./EmptyData.jsx";

async function getFlightsFromAPI(input, signal) {
  if (!input) return;
  const key = import.meta.env.VITE_API_KEY;
  const secret = import.meta.env.VITE_API_SECRET;
  const accessToken = await getAmadeusAccessToken(key, secret);
  const data = await fetch(
    `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${input.origin.airport.iata}&destinationLocationCode=${input.dest.airport.iata}&departureDate=${format(input.date, "u-LL-dd")}&adults=1&currencyCode=USD`,
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
    let isMounted = true;
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const result = await getFlightsFromAPI(sharedData, controller.signal);
        if (isMounted) {
          setData(result);
          setError(null);
          setLoading(false); // ← only happens if still mounted
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setData(null);
          setLoading(false); // ← same here
        }
      }
    };
    fetchFlights();

    return () => {
      isMounted = false;
      controller.abort();
    };
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
  const [priceAndDuration, setPriceAndDuration] = useState({});
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [airLinesChecked, stop, flightDuration, price]);
  useEffect(() => {
    if (
      flightsData &&
      Array.isArray(flightsData.data) &&
      flightsData.data.length > 0
    ) {
      const object = getDurationAndPrice(flightsData.data);
      setPriceAndDuration(object);
      setPrice(object.highestPrice);
      setFlightDuration(object.highestFlightDuration);
    }
  }, [flightsData]);
  if (loading) return <Loading />; //loading screen
  if (error && !error.name === "AbortError") return <Error />; //error screen
  if (flightsData.data.length === 0 || !flightsData.data) return <EmptyData/>;

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
      }); //filter_airlines
    if (price != null) {
      filteredFlights.data = filteredFlights.data.filter((flight) => {
        return price >= Number(flight.price.total);
      }); //sort_price
    }
    if (flightDuration != null) {
      filteredFlights.data = filteredFlights.data.filter(
        (flight) =>
          flightDuration >= dealWithDuration(flight.itineraries[0].duration)
      ); //filter_duration
    }
    return filteredFlights;
  }
  let filteredFlights = filteredData(flightsData);
  return (
    <div className={styles.container}>
      {
        <SideBar
          stop={stop}
          setStop={setStop}
          airLinesChecked={airLinesChecked}
          setAirLinesChecked={setAirLinesChecked}
          setPrice={setPrice}
          price={price}
          setFlightDuration={setFlightDuration}
          flightDuration={flightDuration}
          priceAndDuration={priceAndDuration}
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
