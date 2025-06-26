import MainHeader from "./MainHeader";
import styles from "./styles/container.module.css"
import PropTypes from "prop-types";

export default function EmptyData({setIsReturn, setAPISearch}) {
    return (
        <div className={styles.containerNoData}>
            <MainHeader setIsReturn={setIsReturn} setAPISearch={setAPISearch}/>
            <div className={styles.noDataText}>No flights available at this time.</div>
        </div>
    );
}
EmptyData.propTypes = {
    setIsReturn: PropTypes.func,
    setAPISearch: PropTypes.func,
}