import MainHeader from "./MainHeader";
import styles from "./styles/container.module.css"

export default function EmptyData({isReturn, setAPISearch}) {
    return (
        <div className={styles.containerNoData}>
            <MainHeader setIsReturn={setIsReturn} setAPISearch={setAPISearch}/>
            <div className={styles.noDataText}>No flights available at this time.</div>
        </div>
    );
}