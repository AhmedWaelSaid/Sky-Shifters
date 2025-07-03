import { useEffect, useState,useRef,useContext } from "react";
import styles from "./currency.module.css";
import { useData } from "../context/DataContext";
import Portal from "../Portal/Portal";
import { useLocation } from "react-router-dom";
import {ThemeContext} from "../context/ThemeContext"
const currency = [
  { code: "USD", name: "US Dollar" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "EUR", name: "EURO" },
];
export default function Currency() {
  const {theme} = useContext(ThemeContext);
  const [openCurrency, setOpenCurrency] = useState(false);
  const { setSharedData, sharedData } = useData();
  const currencyRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [selectedCurrency, setSelectedCurrency] = useState(
    sharedData.currency ? sharedData.currency : "USD"
  );
  const location = useLocation();
  const isDetailsPage = location.pathname.includes(
    "/selected-flights/flight-details"
  );

  useEffect(() => {
    setSharedData((prev) => ({ ...prev, currency: selectedCurrency }));
  }, [selectedCurrency, setSharedData]);
  return (
    <>
      {isDetailsPage ? (
        <div
          className={styles.disabledWrapper}
          title="Can`t change currency in this page."
        >
          <div className={`${styles.currency} ${styles.disabled}`}>
            {selectedCurrency}
            {!openCurrency ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
              </svg>
            )}
          </div>
        </div>
      ) : (
        <div
          ref={currencyRef}
          className={`${styles.currency} ${isDetailsPage ? styles.disabled : ""}`}
          onClick={() => {
            const rect = currencyRef.current.getBoundingClientRect();
            setDropdownPosition({
              top: rect.bottom + 5, // add some spacing
              right: window.innerWidth - rect.right, // for `right` positioning
            });
            setOpenCurrency(!openCurrency);
          }}
        >
          {selectedCurrency}
          {!openCurrency ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
            </svg>
          )}
        </div>
      )}
      {openCurrency && (
        <Portal>
          <div
            className={styles.container}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenCurrency(false);
            }}
          >
            <div
              className={`${styles.listContainer} ${theme === "dark" ? styles.dark : ""}`}
              style={{
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
              }}
            >
              {currency.map((curr) => {
                return (
                  <div
                    key={curr.code}
                    onClick={() => {
                      setSelectedCurrency(curr.code);
                      setOpenCurrency(false);
                    }}
                  >
                    <strong>{curr.code}</strong> {curr.name}
                  </div>
                );
              })}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
