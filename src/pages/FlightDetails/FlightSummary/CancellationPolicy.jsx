import styles from "./FlightSummary.module.css";
import PropTypes from "prop-types";
import { useData } from "../../../components/context/DataContext";

const CancellationPolicy = ({ onDetailsClick }) => {
  const { sharedData, flight } = useData();
  const depAmenities = flight.departure
    ? flight.departure.data.travelerPricings[0].fareDetailsBySegment[0]
        .amenities
    : null;
  const depIsRefundable = depAmenities
    ? depAmenities.find(
        (item) => item.description.toLowerCase() === "refundable ticket"
      )
    : null;
  const depIsChangeable = depAmenities
    ? depAmenities.find(
        (item) => item.description.toLowerCase() === "changeable ticket"
      )
    : null;
    const retAmenities = flight.return
    ? flight.return.data.travelerPricings[0].fareDetailsBySegment[0]
        .amenities
    : null;
  const retIsRefundable = retAmenities
    ? retAmenities.find(
        (item) => item.description.toLowerCase() === "refundable ticket"
      )
    : null;
  const retIsChangeable = retAmenities
    ? retAmenities.find(
        (item) => item.description.toLowerCase() === "changeable ticket"
      )
    : null;
  return (
    <>
      {sharedData &&
        (flight.departure.data.travelerPricings[0].fareDetailsBySegment[0]
          .amenities ||
          (flight.return && flight.return.data.travelerPricings[0].fareDetailsBySegment[0]
            .amenities)) && (
          <div className={styles.cancellationSection}>
            <div className={styles.cancelHeader}>
              <span>Cancel & date change</span>
              <button className={styles.detailsButton} onClick={onDetailsClick}>
                Details
              </button>
            </div>

            {flight.departure.data.travelerPricings[0].fareDetailsBySegment[0]
              .amenities && (
              <div className={styles.cancelInfo}>
                {" "}
                {/*departure*/}
                {flight.return &&<div className={styles.headerSegment}>
                  {sharedData.departure.origin.airport.city +
                    " To " +
                    sharedData.departure.dest.airport.city +
                    " - " +
                    "(" +
                    flight.carriers[flight.departure.data.itineraries[0].segments[0].carrierCode].toLowerCase() +
                    ")"}
                </div>}
                <div className={styles.infoItem}>
                  {depIsRefundable ? (
                    <div className={styles.infoLabelGreen}>
                      {depIsRefundable.isChargeable
                        ? "Refundable but with fees"
                        : "Fully refundable"}
                    </div>
                  ) : (
                    <div className={styles.infoLabelRed}>Non-refundable</div>
                  )}
                </div>
                <div className={styles.infoItem}>
                  {depIsChangeable ? (
                    <div className={styles.infoLabelGreen}>
                      {depIsChangeable.isChargeable
                        ? "Changeable but with fees"
                        : "Changeable no fees"}
                    </div>
                  ) : (
                    <div className={styles.infoLabelRed}>Non-changeable</div>
                  )}
                </div>
              </div>
            )}
            {flight.return &&flight.return.data.travelerPricings[0].fareDetailsBySegment[0]
          .amenities && <div className={styles.cancelInfo}>
              {/*return*/}
              <div className={styles.headerSegment}>
                {sharedData.return.origin.airport.city +
                  " To " +
                  sharedData.return.dest.airport.city +
                  " - " +
                  "(" +
                  flight.carriers[flight.return.data.itineraries[0].segments[0].carrierCode].toLowerCase() +
                  ")"}
              </div>
              <div className={styles.infoItem}>
                {retIsRefundable ? (
                  <div className={styles.infoLabelGreen}>
                    {retIsRefundable.isChargeable
                      ? "Refundable but with fees"
                      : "Fully refundable"}
                  </div>
                ) : (
                  <div className={styles.infoLabelRed}>Non-refundable</div>
                )}
              </div>
              <div className={styles.infoItem}>
                {retIsChangeable ? (
                  <div className={styles.infoLabelGreen}>
                    {retIsChangeable.isChargeable
                      ? "Changeable but with fees"
                      : "Changeable no fees"}
                  </div>
                ) : (
                  <div className={styles.infoLabelRed}>Non-changeable</div>
                )}
              </div>
            </div>}
          </div>
        )}
    </>
  );
};
CancellationPolicy.propTypes = {
  onDetailsClick: PropTypes.func,
};
export default CancellationPolicy;
