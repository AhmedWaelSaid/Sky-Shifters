import MainHeader from "./MainHeader";
import styles from "./styles/container.module.css";
import PropTypes from "prop-types";

export default function EmptyData({ setIsReturn, setAPISearch, isReturn ,setHasUserSearched}) {
  return (
    <>
      <MainHeader
        setIsReturn={setIsReturn}
        setAPISearch={setAPISearch}
        isReturn={isReturn}
        setHasUserSearched={setHasUserSearched}
      />
      <div className={styles.containerNoData}>
        <div className={styles.noDataText}>
          No flights available at this time.
        </div>
      </div>
    </>
  );
}
EmptyData.propTypes = {
  setIsReturn: PropTypes.func,
  setAPISearch: PropTypes.func,
  isReturn: PropTypes.bool,
  setHasUserSearched:PropTypes.func,
};
