const data = [
  {
    id: "2082",
    name: "King Khaled International Airport",
    city: "Riyadh",
    country: "Saudi Arabia",
    iata: "RUH",
    icao: "OERK",
    latitude: "24.957599639892578",
    longitude: "46.69879913330078",
    altitude: "2049",
    timezone: "3",
    dst: "U",
    tz_database: "Asia/Riyadh",
    type: "airport",
    source: "OurAirports",
  },
  {
    id: "1128",
    name: "Cairo International Airport",
    city: "Cairo",
    country: "Egypt",
    iata: "CAI",
    icao: "HECA",
    latitude: "30.12190055847168",
    longitude: "31.40559959411621",
    altitude: "382",
    timezone: "2",
    dst: "U",
    tz_database: "Africa/Cairo",
    type: "airport",
    source: "OurAirports",
  },
  {
    id: "2072",
    name: "King Abdulaziz International Airport",
    city: "Jeddah",
    country: "Saudi Arabia",
    iata: "JED",
    icao: "OEJN",
    latitude: "21.6796",
    longitude: "39.156502",
    altitude: "48",
    timezone: "3",
    dst: "U",
    tz_database: "Asia/Riyadh",
    type: "airport",
    source: "OurAirports",
  },
  {
    id: "2064",
    name: "King Fahd International Airport",
    city: "Dammam",
    country: "Saudi Arabia",
    iata: "DMM",
    icao: "OEDF",
    latitude: "26.471200942993164",
    longitude: "49.79790115356445",
    altitude: "72",
    timezone: "3",
    dst: "U",
    tz_database: "Asia/Riyadh",
    type: "airport",
    source: "OurAirports",
  },
  {
    id: "2074",
    name: "Prince Mohammad Bin Abdulaziz Airport",
    city: "Madinah",
    country: "Saudi Arabia",
    iata: "MED",
    icao: "OEMA",
    latitude: "24.5534",
    longitude: "39.705101",
    altitude: "2151",
    timezone: "3",
    dst: "U",
    tz_database: "Asia/Riyadh",
    type: "airport",
    source: "OurAirports",
  },
  {
    id: "2057",
    name: "Bahrain International Airport",
    city: "Bahrain",
    country: "Bahrain",
    iata: "BAH",
    icao: "OBBI",
    latitude: "26.27079963684082",
    longitude: "50.63359832763672",
    altitude: "6",
    timezone: "3",
    dst: "U",
    tz_database: "Asia/Bahrain",
    type: "airport",
    source: "OurAirports",
  },
  {
    id: "11051",
    name: "Hamad International Airport",
    city: "Doha",
    country: "Qatar",
    iata: "DOH",
    icao: "OTHH",
    latitude: "25.273056",
    longitude: "51.608056",
    altitude: "13",
    timezone: "3",
    dst: "N",
    tz_database: null,
    type: "airport",
    source: "OurAirports",
  },
];
import styles from "./ShowTopSearch.module.css";
import PropTypes from "prop-types";
function getValues(airport) {
  return {
    airport,
    text: airport.city + `, ` + airport.country + ` - ` + airport.name,
  };
}
export function ShowTopSearch({ set, keyWord, airports }) {
  const filteredAirports =
    keyWord.length >= 3
      ? airports.filter(
          (airport) =>
            airport.country.toLowerCase().includes(keyWord.toLowerCase()) ||
            airport.city.toLowerCase().includes(keyWord.toLowerCase()) ||
            airport.name.toLowerCase().includes(keyWord.toLowerCase()) || 
            airport.iata?.toLowerCase().includes(keyWord.toLowerCase())
        ).sort((a,b)=> {
          const kw = keyWord.toLowerCase();
          const getPriority = (airport) => {
            if (airport.iata?.toLowerCase() == kw) return 0;
            if (airport.iata?.toLowerCase().includes(kw)) return 1;
            if (airport.name.toLowerCase().includes(kw)) return 2;
            return 3;
          }
          return getPriority(a)- getPriority(b);
        })
      : data;

  return (
    <div className={styles.showTopContainer}>
      <h3 className={styles.showTopHeader}>
        {keyWord.length >= 3 ? "Search Results" : "Top Searches!"}
      </h3>

      {filteredAirports.map((airport) => (
        <div
          key={airport.id}
          className={styles.showTopAirport}
          onMouseDown={() => set(getValues(airport))}
        >
          <div>
            <div>
              {airport.city}, {airport.country}
            </div>
            {airport.iata != null && <div>{airport.iata}</div>}
            {airport.iata == null && <div style={{display : "none"}}></div>}
          </div>
          <div>{airport.name}</div>
        </div>
      ))}
    </div>
  );
}
ShowTopSearch.propTypes = {
  set: PropTypes.func.isRequired,
  keyWord: PropTypes.string.isRequired,
  airports: PropTypes.arrayOf(PropTypes.object),
}