import MainHeader from "./MainHeader";
import styles from "./styles/container.module.css"
import PropTypes from "prop-types";
export default function Error({setIsReturn, setAPISearch,isReturn}) {
    return (
        <div className={styles.containerError}>
            <MainHeader setAPISearch={setAPISearch} setIsReturn={setIsReturn} isReturn={isReturn}/>
            <div className={styles.error}>Network error detected!</div>
        </div>
    );
}
Error.propTypes = {
    setIsReturn: PropTypes.func,
    setAPISearch: PropTypes.func,
    isReturn: PropTypes.bool,
}