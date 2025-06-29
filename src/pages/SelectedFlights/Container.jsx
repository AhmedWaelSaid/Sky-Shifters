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
import { FlightsUI } from "./Main.jsx";

async function getFlightsFromAPI(input, signal) {
  const baseUrl = "https://api.amadeus.com/v2/shopping/flight-offers";
  if (!input) return;
  const params = new URLSearchParams({
    originLocationCode: input.origin.airport.iata,
    destinationLocationCode: input.dest.airport.iata,
    departureDate: format(input.date, "u-LL-dd"),
    currencyCode: input.currency,
  });
  // Add passengers
  if (input.passengerClass) {
    params.append("adults", input.passengerClass.adults);
    params.append("children", input.passengerClass.children);
    params.append("infants", input.passengerClass.infants);

    if (input.passengerClass.class?.value) {
      params.append("travelClass", input.passengerClass.class.value);
    }
  } else {
    // Default adults=1 if no passenger info
    params.append("adults", "1");
  }
  /*if (input.dates.return != null) {
    params.append("returnDate", input.dates.return);
  }*/

  const url = `${baseUrl}?${params.toString()}`;
  const key = import.meta.env.VITE_API_KEY;
  const secret = import.meta.env.VITE_API_SECRET;
  const accessToken = await getAmadeusAccessToken(key, secret);
  const data = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  }).then((response) => {
    if (response.status >= 400) {
      throw new Error("server error");
    }
    return response.json();
  });
  console.log(data);
  return data;
}
function useSearchData(searchData) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    const fetchFlights = async () => {
      if (!searchData?.origin || !searchData?.dest || !searchData?.date) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const result = await getFlightsFromAPI(searchData, controller.signal);
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
  }, [searchData]);
  return { data, loading, error };
}
function parseDuration(durationStr) {
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const hours = parseInt(match?.[1]) || 0;
  const minutes = parseInt(match?.[2]) || 0;
  return hours * 60 + minutes;
}
function getFlights(flights) {
  const groupMap = {};

  for (const flight of flights.data) {
    const segments = flight.itineraries[0].segments;
    const stops = segments.length - 1;
    const price = flight.price.total;

    // Get all unique airline codes in the segments
    const airlineCombo = [
      ...new Set(segments.map((seg) => seg.carrierCode)),
    ].sort(); // sort to avoid ["MS", "SV"] vs ["SV", "MS"] mismatch

    const airlineKey = airlineCombo.join("-");
    const groupKey = `${stops}_stops_${airlineKey}_${price}`;

    if (!groupMap[groupKey]) {
      groupMap[groupKey] = {
        stops,
        airlineCombo,
        price,
        flights: [],
      };
    }

    groupMap[groupKey].flights.push(flight);
  }

  // Format into list
  const groupedFlights = Object.values(groupMap).map((group) => {
    const sortedByDuration = group.flights.sort((a, b) => {
      const durA = parseDuration(a.itineraries[0].duration);
      const durB = parseDuration(b.itineraries[0].duration);
      return durA - durB;
    });

    return {
      stops: group.stops,
      price: group.price,
      airlineCombo: group.airlineCombo,
      main: sortedByDuration[0],
      others: sortedByDuration.slice(1),
    };
  });

  groupedFlights.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  return groupedFlights;
}
export default function Container() {
  const { sharedData, flight } = useData();
  const [APISearch, setAPISearch] = useState({
    ...sharedData.departure,
    passengerClass: sharedData.passengerClass,
    currency: sharedData.currency,
  });
  const { data: flightsData, loading, error } = useSearchData(APISearch);
  const [stop, setStop] = useState("");
  const [airLinesChecked, setAirLinesChecked] = useState({});
  const [price, setPrice] = useState(null);
  const [flightDuration, setFlightDuration] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceAndDuration, setPriceAndDuration] = useState({});
  const [isReturn, setIsReturn] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [stop, price, airLinesChecked, flightDuration]);

  useEffect(() => {
    setAPISearch((prev) => ({ ...prev, currency: sharedData.currency }));
    setIsReturn(false);
  }, [sharedData.currency]);

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

  if (loading ) return <Loading />;
  if (error && error.name !== "AbortError")
    return (
      <Error
        setIsReturn={setIsReturn}
        setAPISearch={setAPISearch}
        isReturn={isReturn}
      />
    );
  if (!flightsData || flightsData.data.length === 0 || !flightsData.data)
    return (
      <EmptyData
        setIsReturn={setIsReturn}
        setAPISearch={setAPISearch}
        isReturn={isReturn}
      />
    );

  function getStops() {
    const stops = { direct: false, stop1: false, stop2: false };
    stops.direct = flightsData.data.some(
      (flight) => flight.itineraries[0].segments.length == 1
    );
    stops.stop1 = flightsData.data.some(
      (flight) => flight.itineraries[0].segments.length == 2
    );
    stops.stop2 = flightsData.data.some(
      (flight) => flight.itineraries[0].segments.length == 3
    );
    return stops;
  }
  function getAirlines() {
    const airlinesCode = [];
    flightsData.data.map((flight) => {
      flight.itineraries[0].segments.map((segment) => {
        airlinesCode.push(segment.carrierCode);
      });
    });
    const uniqueCodes = [...new Set(airlinesCode)];
    const newCarriers = {};
    const carriers = flightsData.dictionaries.carriers;
    for (let code in carriers) {
      if (uniqueCodes.includes(code)) newCarriers[code] = carriers[code];
    }
    return newCarriers;
  }
  const airlines = getAirlines();

  function filteredData(flights) {
    if (!flights) return null;
    let filteredFlights = { ...flights };
    if (stop !== "") {
      filteredFlights.data = flights.data.filter((flight) => {
        if (stop === "Direct")
          return flight.itineraries[0].segments.length === 1;
        else if (stop === "1 Stop")
          return flight.itineraries[0].segments.length === 2;
        else return flight.itineraries[0].segments.length > 2;
      });
    }
    const activeAirlines = Object.keys(airLinesChecked).filter(
      (code) => airLinesChecked[code]
    );
    if (activeAirlines.length > 0)
      filteredFlights.data = filteredFlights.data.filter((flight) => {
        return flight.itineraries[0].segments.some((seg) =>
          activeAirlines.includes(seg.carrierCode)
        );
      });
    if (price != null) {
      filteredFlights.data = filteredFlights.data.filter(
        (flight) => price >= Number(flight.price.total)
      );
    }
    if (flightDuration != null) {
      filteredFlights.data = filteredFlights.data.filter(
        (flight) =>
          flightDuration >= dealWithDuration(flight.itineraries[0].duration)
      );
    }
    return filteredFlights;
  }

  let filteredFlights = filteredData(flightsData);
  const groupedFlights = getFlights(filteredFlights);
  console.log(groupedFlights);

  function ChangeDepHandler() {
    setAPISearch({
      ...sharedData.departure,
      passengerClass: sharedData.passengerClass,
    });
    setTimeout(() => {
      setIsReturn(false);
    }, 200);
  }
  return (
    <div className={styles.container}>
      <MainHeader
        setIsReturn={setIsReturn}
        setAPISearch={setAPISearch}
        isReturn={isReturn}
      />
      {sharedData.return && !isReturn && (
        <div className={styles.flightTextContainer}>
          <h2>Choose your departure flight!</h2>
        </div>
      )}
      {sharedData.return && isReturn && (
        <div className={styles.flightTextContainer}>
          <h2>Choose your return flight!</h2>
          <div className={styles.flight}>
            <FlightsUI
              flight={flight.departure.data}
              carriers={flight.carriers}
              btnHandler={ChangeDepHandler}
              button={{
                text: "Change departure",
                className: "selectDepFlightBtn",
              }}
              currency={sharedData.currency}
            />
          </div>
        </div>
      )}
      <div className={styles.bodyContainer}>
        <SideBar
          flightsData={filteredFlights}
          stop={stop}
          setStop={setStop}
          airLinesChecked={airLinesChecked}
          setAirLinesChecked={setAirLinesChecked}
          setPrice={setPrice}
          price={price}
          setFlightDuration={setFlightDuration}
          flightDuration={flightDuration}
          priceAndDuration={priceAndDuration}
          airLines={airlines}
          getStops={getStops}
        />
        <Main
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          flightsData={filteredFlights}
          setAPISearch={setAPISearch}
          setIsReturn={setIsReturn}
          isReturn={isReturn}
          groupedFlights={groupedFlights}
        />
      </div>
    </div>
  );
}
