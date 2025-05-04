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
        checked={airLinesChecked ? !!airLinesChecked[value] : false}
        onChange={(e) => airLinesHandler(e)}
      />
      <label htmlFor={name}>{name}</label>
    </div>
  );
}
InputCheckBox.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  airLinesChecked: PropTypes.object,
  airLinesHandler: PropTypes.func,
}
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
}) {
  let airLinesArr = [];
  for (const key in airLines) {
    airLinesArr.push({ code: key, name: airLines[key] });
  }
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
          <div className={styles["price-range-indicator-low"]}>
            {priceAndDuration.lowestPrice} USD
          </div>
          <div className={styles["price-range-indicator-high"]}>
            {priceAndDuration.highestPrice} USD
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
            {airLinesArr.length > 0 &&
              airLinesArr.map((airline) => (
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
          <div className={styles["flight-range-indicator-low"]}>
            {readableNum(priceAndDuration.lowestFlightDuration / 60)}
          </div>
          <div className={styles["flight-range-indicator-high"]}>
            {readableNum(priceAndDuration.highestFlightDuration / 60)}
          </div>
          <div className={styles.flightRangeValue}>
            {readableNum(flightDuration / 60)}
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
};
