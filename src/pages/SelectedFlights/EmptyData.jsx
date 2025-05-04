import MainHeader from "./MainHeader";
import styles from "./styles/container.module.css"

export default function EmptyData() {
    return (
        <div className={styles.containerNoData}>
            <MainHeader/>
            <div className={styles.noDataText}>No flights available at this time.</div>
        </div>
    );
}