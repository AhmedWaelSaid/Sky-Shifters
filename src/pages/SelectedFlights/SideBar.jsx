import styles from "./styles/sidebar.module.css";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useData } from "../../components/context/DataContext";

function InputCheckBox({
  value,
  name,
  airLinesChecked,
  airLinesHandler,
  onImageLoad,
}) {
  function capitalizeWords(str) {
    if (typeof str !== "string") return "";
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return (
    <div className={styles.airlineInput}>
      <input
        type="checkbox"
        id={name}
        name={name}
        value={value ? value : null}
        checked={airLinesChecked ? !!airLinesChecked[value] : false}
        onChange={(e) => airLinesHandler(e)}
      />

      <label htmlFor={name}>
        <img
          className={styles.airLineIcon}
          src={`https://pics.avs.io/30/30/${value}.png`}
          alt={name}
          onLoad={onImageLoad}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "src/assets/no-logo.jpg"; // fallback
            console.warn("Logo failed to load:", e.target.src);
          }}
        />
        {capitalizeWords(name)}
      </label>
    </div>
  );
}
InputCheckBox.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  airLinesChecked: PropTypes.object,
  airLinesHandler: PropTypes.func,
  onImageLoad: PropTypes.func,
};
export default function SideBar({
  stop,
  setStop,
  setAirLinesChecked,
  airLinesChecked,
  setPrice,
  price,
  setFlightDuration,
  flightDuration,
  priceAndDuration,
  airLines,
  flightsData,
  getStops,
}) {
  const sidebarRef = useRef(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
  
    let ticking = false;
  
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isScrollingDown = currentScrollY > lastScrollY;
  
          if (isScrollingDown) {
            sidebar.classList.add(styles.hidden);
          } else {
            sidebar.classList.remove(styles.hidden);
          }
  
          setLastScrollY(currentScrollY);
          ticking = false;
        });
  
        ticking = true;
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  const [isExpandable, setIsExpandable] = useState({
    price: true,
    stops: true,
    airlines: true,
    flightDuration: true,
  });
  const [logosLoaded, setLogosLoaded] = useState(0);
  const [airlinesHeight, setAirlinesHeight] = useState(0);
  const { sharedData } = useData();
  const airlinesRef = useRef(null);
  let airLinesArr = [];
  for (const key in airLines) {
    airLinesArr.push({ code: key, name: airLines[key] });
  }
  useEffect(() => {
    if (logosLoaded == airLinesArr.length && airlinesRef.current) {
      setAirlinesHeight(airlinesRef.current.scrollHeight);
    }
  }, [logosLoaded, airLinesArr.length]);

  if (!flightsData) return null;

  function readableNum(num) {
    const string = String(num);
    if (string.includes(".")) {
      const hours = Number(string.split(".")[0]);
      const mins = Math.round(Number("0." + string.split(".")[1]) * 60);
      return `${hours}h ${mins}m`;
    }
    return `${string}h`;
  }
  const priceHandler = (e) => {
    setPrice(e.target.value);
  };
  const sortResetHandler = () => {
    setPrice(priceAndDuration.highestPrice);
  };
  const stopHandler = (e) => {
    setStop(() => e.target.value);
  };
  const airLinesHandler = (e) => {
    const { value, checked } = e.target;
    setAirLinesChecked((prev) => ({ ...prev, [value]: checked }));
  };
  const flightHandler = (e) => {
    setFlightDuration(e.target.value);
  };
  const filterResetHandler = () => {
    setStop("");
    setAirLinesChecked({});
    setFlightDuration(priceAndDuration.highestFlightDuration);
  };
  const stops = getStops();
  return (
    <div className={styles["side-bar"]} ref={sidebarRef}>
      <div className={styles.sort}>
        <h2>Sort By</h2>
        <button className={styles.reset} onClick={sortResetHandler}>
          Reset
        </button>
        <hr />
        <div className={styles.price}>
          <div
            className={styles.collapsingElement}
            onClick={() => {
              setIsExpandable({ ...isExpandable, price: !isExpandable.price });
            }}
          >
            <h3>Price</h3>
            <button>{isExpandable.price ? "⯅" : "⯆"}</button>
          </div>
          <div
            className={styles.priceContainer}
            style={{ maxHeight: isExpandable.price ? "200px" : "0px" }}
          >
            <input
              type="range"
              min={priceAndDuration.lowestPrice}
              max={priceAndDuration.highestPrice}
              step={0.01}
              value={price}
              onChange={(e) => priceHandler(e)}
              style={{
                "--fill-percent": `${((price - priceAndDuration.lowestPrice) / (priceAndDuration.highestPrice - priceAndDuration.lowestPrice)) * 100}%`,
              }}
              className={styles["price-slider"]}
            />
            <div className={styles.indicatorContainer}>
              <div className={styles["price-range-indicator-low"]}>
                {priceAndDuration.lowestPrice}{" "}
                {sharedData.currency ? sharedData.currency : "USD"}
              </div>
              <div className={styles["price-range-indicator-high"]}>
                {price} {sharedData.currency ? sharedData.currency : "USD"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.filter}>
        <h2>Filters</h2>
        <button className={styles.reset} onClick={filterResetHandler}>
          Reset
        </button>
        <hr />
        <div className={styles.stops}>
          <div
            className={styles.collapsingElement}
            onClick={() => {
              setIsExpandable({
                ...isExpandable,
                stops: !isExpandable.stops,
              });
            }}
          >
            <h3>Stops</h3>
            <button>{isExpandable.stops ? "⯅" : "⯆"}</button>
          </div>
          <div
            className={styles.stopsContainer}
            style={{ maxHeight: isExpandable.stops ? "200px" : "0px" }}
          >
            <form>
              <div>
                <input
                  type="radio"
                  id="direct"
                  name="stop"
                  value="Direct"
                  checked={stop == "Direct"}
                  disabled={!stops.direct}
                  onChange={(e) => stopHandler(e)}
                />
                <label
                  htmlFor="direct"
                  className={!stops.direct ? styles.disabled : ""}
                >
                  Direct
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="1-stop"
                  name="stop"
                  value="1 Stop"
                  checked={stop == "1 Stop"}
                  disabled={!stops.stop1}
                  onChange={(e) => stopHandler(e)}
                />
                <label
                  htmlFor="1-stop"
                  className={!stops.stop1 ? styles.disabled : ""}
                >
                  1 Stop
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="2-stop"
                  name="stop"
                  value="2 Stop"
                  checked={stop == "2 Stop"}
                  disabled={!stops.stop2}
                  onChange={(e) => stopHandler(e)}
                />
                <label
                  htmlFor="2-stop"
                  className={!stops.stop2 ? styles.disabled : ""}
                >
                  2 Stop
                </label>
              </div>
            </form>
          </div>
        </div>
        <hr />
        <div className={styles["air-lines"]}>
          <div
            className={styles.collapsingElement}
            onClick={() => {
              setIsExpandable({
                ...isExpandable,
                airlines: !isExpandable.airlines,
              });
            }}
          >
            <h3>Air Lines</h3>
            <button>{isExpandable.airlines ? "⯅" : "⯆"}</button>
          </div>
          <div
            className={styles.airlinesContainer}
            ref={airlinesRef}
            style={{
              maxHeight: isExpandable.airlines ? airlinesHeight : "0px",
            }}
          >
            <form>
              {airLinesArr.length > 0 &&
                airLinesArr.map((airline) => (
                  <>
                    <InputCheckBox
                      key={airline.code}
                      value={airline.code}
                      name={airline.name}
                      airLinesChecked={airLinesChecked}
                      airLinesHandler={airLinesHandler}
                      onImageLoad={() => setLogosLoaded((prev) => prev + 1)}
                    />
                  </>
                ))}
            </form>
          </div>
        </div>
        <hr />
        <div className={styles["flight-duration"]}>
          <div
            className={styles.collapsingElement}
            onClick={() => {
              setIsExpandable({
                ...isExpandable,
                flightDuration: !isExpandable.flightDuration,
              });
            }}
          >
            <h3>Flight duration</h3>
            <button>{isExpandable.flightDuration ? "⯅" : "⯆"}</button>
          </div>
          <div
            className={styles.flightDurationContainer}
            style={{ maxHeight: isExpandable.flightDuration ? "100px" : "0px" }}
          >
            <input
              type="range"
              min={priceAndDuration.lowestFlightDuration}
              step={5}
              max={priceAndDuration.highestFlightDuration}
              value={flightDuration}
              onChange={(e) => flightHandler(e)}
              style={{
                "--fill-percent": `${((flightDuration - priceAndDuration.lowestFlightDuration) / (priceAndDuration.highestFlightDuration - priceAndDuration.lowestFlightDuration)) * 100}%`,
              }}
              className={styles["flight-slider"]}
            />
            <div className={styles.indicatorContainer}>
              <div className={styles["flight-range-indicator-low"]}>
                {readableNum(priceAndDuration.lowestFlightDuration / 60)}
              </div>
              <div className={styles["flight-range-indicator-high"]}>
                {readableNum(flightDuration / 60)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
SideBar.propTypes = {
  stop: PropTypes.string.isRequired,
  setStop: PropTypes.func.isRequired,
  setAirLinesChecked: PropTypes.func.isRequired,
  airLinesChecked: PropTypes.object.isRequired,
  setPrice: PropTypes.func.isRequired,
  price: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired,
  ]),
  setFlightDuration: PropTypes.func.isRequired,
  flightDuration: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired,
  ]),
  priceAndDuration: PropTypes.object.isRequired,
  airLines: PropTypes.object.isRequired,
  flightsData: PropTypes.object,
  getStops: PropTypes.func,
};
