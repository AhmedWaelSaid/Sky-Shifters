import styles from "./styles/sidebar.module.css";

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
  objectOfPriceAndDuration,
}) {
  const formattedFlightDurationValue = (flightDuration) =>{
    const hours = Math.floor(parseFloat(flightDuration));
    const minutes = Math.round((parseFloat(flightDuration)-hours)*60);
    return `${hours}h ${minutes}m`;
  }
  const resetState = () => {
    return Object.keys(airLinesChecked).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
  };
  const priceHandler = (e) => {
    setPrice(e.target.value);
  };
  const sortResetHandler = () => {
    setPrice(objectOfPriceAndDuration.highestPrice);
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
  const flightHandler= (e)=> {
    const rawValue = parseFloat(e.target.value);
    const { lowestFlightDuration, highestFlightDuration } = objectOfPriceAndDuration;
  
    const nearMax = Math.abs(rawValue - highestFlightDuration) < 0.01;
  
    const snappedValue = nearMax ? highestFlightDuration : rawValue;
  
    setFlightDuration(snappedValue);
  }
  const filterResetHandler = () => {
    setStop("");
    setAirLinesChecked(resetState());
    setFlightDuration(objectOfPriceAndDuration.highestFlightDuration);
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
            min={objectOfPriceAndDuration.lowestPrice}
            max={objectOfPriceAndDuration.highestPrice}
            step={0.01  }
            value={price}
            onChange={(e) => priceHandler(e)}
            style={{"--fill-percent":`${((price-objectOfPriceAndDuration.lowestPrice)/(objectOfPriceAndDuration.highestPrice-objectOfPriceAndDuration.lowestPrice))*100}%`}}
            className={styles["price-slider"]}
          />
          <div className={styles["price-range-indicator-low"]}>{objectOfPriceAndDuration.lowestPrice} USD </div>
          <div className={styles["price-range-indicator-high"]}>{objectOfPriceAndDuration.highestPrice} USD</div>
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
            <div>
              <input
                type="checkbox"
                id="emirates"
                name="emirates"
                value="Emirates"
                checked={airLinesChecked.Emirates}
                onChange={(e) => airLinesHandler(e)}
              />
              <label htmlFor="emirates">Emirates</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="qatar"
                name="qatar"
                value="Qatar"
                checked={airLinesChecked.Qatar}
                onChange={(e) => airLinesHandler(e)}
              />
              <label htmlFor="qatar">Qatar</label>
            </div>
          </form>
        </div>
        <hr />
        <div className={styles["flight-duration"]}>
          <h3>Flight duration</h3>
          <input
            type="range"
            min={objectOfPriceAndDuration.lowestFlightDuration}
            step={(objectOfPriceAndDuration.highestFlightDuration - objectOfPriceAndDuration.lowestFlightDuration) / 500}
            max={objectOfPriceAndDuration.highestFlightDuration}
            value={flightDuration}
            onChange={(e)=>flightHandler(e)}
            style={{"--fill-percent" : `${((flightDuration-objectOfPriceAndDuration.lowestFlightDuration)/(objectOfPriceAndDuration.highestFlightDuration-objectOfPriceAndDuration.lowestFlightDuration))*100}%`}}
            className={styles["flight-slider"]}
          />
          <div className={styles["flight-range-indicator-low"]}>{formattedFlightDurationValue(objectOfPriceAndDuration.lowestFlightDuration)}</div>
          <div className={styles["flight-range-indicator-high"]}>{formattedFlightDurationValue(objectOfPriceAndDuration.highestFlightDuration)}</div>
          <div className={styles.flightRangeValue}>{formattedFlightDurationValue(flightDuration)}</div>
        </div>
      </div>
    </div>
  );
}
