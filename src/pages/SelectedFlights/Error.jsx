import MainHeader from "./MainHeader";
import styles from "./styles/container.module.css"
export default function Error() {
    return (
        <div className={styles.containerError}>
            <MainHeader/>
            <div className={styles.error}>Network error detected!</div>
        </div>
    );
}