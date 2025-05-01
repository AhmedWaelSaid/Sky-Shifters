
import styles from "./styles/mainHeader.module.css";
import { useState } from "react";
import submitIcon from "../../assets/submit.png";
import DatePicker from "react-datepicker";

export default function MainHeader() {
    const [dateRange, setDateRange] = useState([
        new Date("2025-04-21"),
        new Date("2025-04-26"),
      ]);
      const [startDate, endDate] = dateRange;

    return (
        <div className={styles["main-header-container"]}>
        <form action="" className={styles.form}>
          <div className={styles["first-row"]}>
            <div className={styles.way}>
              <select name="way" defaultValue="one-way">
                <option value="one-way">➜ One way</option>
                <option value="round-trip">🔄 Round trip</option>
              </select>
            </div>
            <div className={styles.group}>
              <select name="group-number" defaultValue="1">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className={styles.seat}>
              <select name="class" defaultValue="economy">
                <option value="economy">Economy</option>
                <option value="premium-economy">Premium </option>
                <option value="business-class">Business</option>
                <option value="first-class">First Class</option>
              </select>
            </div>
          </div>
          <div className={styles["second-row"]}>
            <div className={styles.location}>
              <div className={styles.from}>
                <select name="from" id="from">
                  <option value="houston">Houston(HOU)</option>
                  <option value="LA">Los Angeles(LAX)</option>
                </select>
              </div>
              <div className={styles.between}></div>
              <div className={styles.to}>
                <select name="to" id="to" defaultValue="LA">
                  <option value="houston">Houston(HOU)</option>
                  <option value="LA">Los Angeles(LAX)</option>
                </select>
              </div>
            </div>
            <div className={styles.calender}>
              <DatePicker
                name="date"
                className={styles["date-picker"]}
                showIcon
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                }}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 48 48"
                  >
                    <mask id="ipSApplication0">
                      <g
                        fill="none"
                        stroke="#fff"
                        strokeLinejoin="round"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          d="M40.04 22v20h-32V22"
                        ></path>
                        <path
                          fill="#fff"
                          d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
                        ></path>
                      </g>
                    </mask>
                    <path
                      fill="currentColor"
                      d="M0 0h48v48H0z"
                      mask="url(#ipSApplication0)"
                    ></path>
                  </svg>
                }
              />
            </div>
            <div className={styles["form-submit"]}>
              <button type="submit">
                <img src={submitIcon} alt="submit" />
              </button>
            </div>
          </div>
        </form>
      </div>
    );
}