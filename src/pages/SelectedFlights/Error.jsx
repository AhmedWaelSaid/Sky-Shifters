import MainHeader from "./MainHeader";
import styles from "./styles/container.module.css"
import PropTypes from "prop-types";
export default function Error({setIsReturn, setAPISearch,isReturn,setHasUserSearched}) {
    return (
        <>
        <MainHeader setAPISearch={setAPISearch} setIsReturn={setIsReturn} isReturn={isReturn} setHasUserSearched={setHasUserSearched}/>
        <div className={styles.containerError}>
            <div className={styles.error}>Network error detected!</div>
        </div>
        </>
    );
}
Error.propTypes = {
    setIsReturn: PropTypes.func,
    setAPISearch: PropTypes.func,
    isReturn: PropTypes.bool,
    setHasUserSearched: PropTypes.func,
}