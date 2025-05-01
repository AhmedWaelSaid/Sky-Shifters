import styles from "./styles/sidebar.module.css";
import PropTypes from "prop-types";

function InputCheckBox({ value, name, airLinesChecked, airLinesHandler }) {
  return (
    <div>
      <input
        type="checkbox"
        id={name}
        name={name}
        value={value}
        checked={!!airLinesChecked[value]}
        onChange={(e) => airLinesHandler(e)}
      />
      <label htmlFor={name}>{name}</label>
    </div>
  );
}
export default function SideBar({
  stop,
  setStop,
  setCurrentPage,
  setAirLinesChecked,
  airLinesChecked,
  setPrice,
  price,
  setFlightDuration,
  flightDuration,
  airLines,
}) {
  let airLinesArr = [];
  for (const key in airLines) {
    airLinesArr.push({ code: key, name: airLines[key] });
  }
  const formattedFlightDurationValue = (flightDuration) => {
    const hours = Math.floor(parseFloat(flightDuration));
    const minutes = Math.round((parseFloat(flightDuration) - hours) * 60);
    return `${hours}h ${minutes}m`;
  };
  const priceHandler = (e) => {
    setPrice(e.target.value);
  };
  const sortResetHandler = () => {
    //setPrice(objectOfPriceAndDuration.highestPrice);
  };
  const stopHandler = (e) => {
    setStop(() => e.target.value);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const airLinesHandler = (e) => {
    const { value, checked } = e.target;
    setAirLinesChecked((prev) => ({ ...prev, [value]: checked }));
  };
  const flightHandler = (e) => {
    //const rawValue = parseFloat(e.target.value);
    //const { highestFlightDuration } = objectOfPriceAndDuration;

    //const nearMax = Math.abs(rawValue - highestFlightDuration) < 0.01;

    //const snappedValue = nearMax ? highestFlightDuration : rawValue;

    //setFlightDuration(snappedValue);
  };
  const filterResetHandler = () => {
    setStop("");
    setAirLinesChecked({});
    //setFlightDuration(objectOfPriceAndDuration.highestFlightDuration);
  };
  return (
    <div className={styles["side-bar"]}>
      <div className={styles.sort}>
        <h2>Sort By</h2>
        <button className={styles.reset} onClick={sortResetHandler}>
          Reset
        </button>
        <hr />
        <div className={styles.price}>
          <h3>Price</h3>
          <input
            type="range"
            min={1}
            max={20}
            step={0.01}
            value={price}
            onChange={(e) => priceHandler(e)}
            style={{
              "--fill-percent": `100%`,
            }}
            className={styles["price-slider"]}
          />
          <div className={styles["price-range-indicator-low"]}>
            1 USD{" "}
          </div>
          <div className={styles["price-range-indicator-high"]}>
            2 USD
          </div>
          <div className={styles.priceValue}>{price} USD</div>
        </div>
      </div>
      <div className={styles.filter}>
        <h2>Filters</h2>
        <button className={styles.reset} onClick={filterResetHandler}>
          Reset
        </button>
        <hr />
        <div className={styles.stops}>
          <h3>Stops</h3>
          <form>
            <div>
              <input
                type="radio"
                id="direct"
                name="stop"
                value="Direct"
                checked={stop == "Direct"}
                onChange={(e) => stopHandler(e)}
              />
              <label htmlFor="direct">Direct</label>
              <label htmlFor="direct">30 USD</label>
            </div>
            <div>
              <input
                type="radio"
                id="1-stop"
                name="stop"
                value="1 Stop"
                checked={stop == "1 Stop"}
                onChange={(e) => stopHandler(e)}
              />
              <label htmlFor="1-stop">1 Stop</label>
              <label htmlFor="1-stop">45 USD</label>
            </div>
          </form>
        </div>
        <hr />
        <div className={styles["air-lines"]}>
          <h3>Air Lines</h3>
          <form>
            {airLinesArr.map((airline) => (
              <InputCheckBox
                key={airline.code}
                value={airline.code}
                name={airline.name}
                airLinesChecked={airLinesChecked}
                airLinesHandler={airLinesHandler}
              />
            ))}
          </form>
        </div>
        <hr />
        <div className={styles["flight-duration"]}>
          <h3>Flight duration</h3>
          <input
            type="range"
            min={0}
            step={0.1}
            max={22}
            value={flightDuration}
            onChange={(e) => flightHandler(e)}
            style={{
              "--fill-percent": `100%`,
            }}
            className={styles["flight-slider"]}
          />
          <div className={styles["flight-range-indicator-low"]}>
            0
          </div>
          <div className={styles["flight-range-indicator-high"]}>
            22h
          </div>
          <div className={styles.flightRangeValue}>
            {flightDuration}
          </div>
        </div>
      </div>
    </div>
  );
}