import MainHeader from "./MainHeader";
import styles from "./styles/container.module.css";
function SideBarLoading() {
  return (
    <div className={styles.sidebarBase}>
      <div className={`${styles.loading} ${styles.sidebarLoading}`}></div>
      <div className={`${styles.loading} ${styles.sidebarLoading}`}></div>
    </div>
  );
}
function MainLoading() {
  return (
    <div className={styles.mainBase}>
      <div className={`${styles.loading} ${styles.mainLoading}`}></div>
      <div className={`${styles.loading} ${styles.mainLoading}`}></div>
      <div className={`${styles.loading} ${styles.mainLoading}`}></div>
      <div className={`${styles.loading} ${styles.mainLoading}`}></div>
    </div>
  );
}
export default function Loading() {
  return (
    <div className={styles.container}>
      <MainHeader />
      <div className={styles.bodyContainerLoading}>
        <SideBarLoading />
        <MainLoading />
      </div>
    </div>
  );
}
