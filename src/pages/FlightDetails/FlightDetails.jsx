import { useState, useEffect, useRef } from "react";
import PassengerDetailsForm from "./PassengerDetailsForm/PassengerDetailsForm";
import UpgradeExperience from "./UpgradeExperience/UpgradeExperience";
import FinalDetails from "./FinalDetails/FinalDetails";
import StepIndicator from "./StepIndicator/StepIndicator";
import "./FlightDetails.css";
import { useData } from "../../components/context/DataContext";

const Index = () => {
  const { sharedData, flight} = useData();
  const passengerRefs = useRef({}); // key: passengerId, value: form ref
  const [fareSelectionIndex, setFareSelectionIndex] = useState({
    depIndex: 0,
    retIndex: 0,
    class: "economy",
  });

  const getPassengerArr = () => {
    const passengerObj = sharedData?.passengerClass || {
      adults: 1,
      children: 0,
      infants: 0,
    };
    const passengerArr = [];
    let id = 1;
    for (let i = 0; i < passengerObj.adults; i++) {
      passengerArr.push({ type: "adult", id: id++,});
    }
    for (let i = 0; i < passengerObj.children; i++) {
      passengerArr.push({ type: "child", id: id++,});
    }
    for (let i = 0; i < passengerObj.infants; i++) {
      passengerArr.push({ type: "infant", id: id++, });
    }
    return passengerArr;
  };

  const [passengers, setPassengers] = useState(getPassengerArr());
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState({
    contactInfo: {},
    addOns: {},
    specialServices: {},
    priorityBoarding: false,
    baggageSelection: {},
    finalBookingData: null,
  });
  console.log(formData)
  console.log(passengers)
  const setPassengerRef = (id) => (el) => {
    if (el) {
      passengerRefs.current[id] = el;
    }
  };
  const updatePassengerDetails = (id, newDetails) => {
    setPassengers(
      passengers.map((passenger) =>
        passenger.id === id
          ? { ...passenger, details: { ...passenger.details, ...newDetails } }
          : passenger
      )
    );
  };

  const updateFormData = (section, data) => {
    setFormData((prev) => {
      const prevSection = prev[section];
  
      // If previous value is an object and new data is also an object, merge
      if (
        prevSection &&
        typeof prevSection === "object" &&
        !Array.isArray(prevSection) &&
        typeof data === "object" &&
        !Array.isArray(data)
      ) {
        return {
          ...prev,
          [section]: {
            ...prevSection,
            ...data,
          },
        };
      }
  
      // Otherwise, replace directly (for booleans, strings, etc.)
      return {
        ...prev,
        [section]: data,
      };
    });
  };
  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleContinue = () => {
    const allRefsSet = passengers.every(p => passengerRefs.current[p.id]);
  
    if (!allRefsSet) {
      console.error("Some form refs not set yet!");
      return;
    }
  
    // Validate all forms
    let allValid = true;
    passengers.forEach(passenger => {
      const form = passengerRefs.current[passenger.id];
      if (!form.checkValidity()) {
        allValid = false;
        form.reportValidity();
      }
    });
  
    if (!allValid) return;
      if (currentStep === 3) {
        const travellersInfoForApi = passengers.map((p) => {
          // معالجة تاريخ الميلاد
          let birthDate = p.details.dateOfBirth;
          if (!birthDate && p.details.day && p.details.month && p.details.year) {
            const monthIndex = {
              January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
            }[p.details.month];
            if (monthIndex !== undefined) {
              birthDate = `${p.details.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(p.details.day).padStart(2, '0')}`;
            }
          }
          return {
            firstName: p.details.firstName,
            lastName: p.details.lastName,
            birthDate: birthDate,
            travelerType: p.type,
            nationality: p.details.nationality,
            passportNumber: p.details.passportNumber,
            issuingCountry: p.details.issuingCountry,
            expiryDate: p.details.passportExpiry,
          };
        });

        const baggageDataFromState = formData.baggageSelection || {};
        let baggagePrice = 0;
        if (formData.baggageSelection) {
          if (
            formData.baggageSelection.departure ||
            formData.baggageSelection.return
          ) {
            baggagePrice += formData.baggageSelection.departure?.price || 0;
            baggagePrice += formData.baggageSelection.return?.price || 0;
          } else if (
            formData.baggageSelection.outbound ||
            formData.baggageSelection.inbound
          ) {
            baggagePrice += formData.baggageSelection.outbound?.price || 0;
            baggagePrice += formData.baggageSelection.inbound?.price || 0;
          } else {
            baggagePrice = formData.baggageSelection.price || 0;
          }
        }
        const baggageObjectForApi = {
          type: baggageDataFromState.type || "checked",
          weight: baggageDataFromState.weight || "23kg",
          price: baggagePrice,
        };

        const basePrice = passengers.reduce((total, passenger, index) => {
          const travelerPricing =
            flight?.departure?.data?.travelerPricings?.[index];
          if (travelerPricing?.price?.total) {
            total += Number(travelerPricing.price.total);
          }
          // Add return flight price if available
          const returnTravelerPricing =
            flight?.return?.data?.travelerPricings?.[index];
          if (returnTravelerPricing?.price?.total) {
            total += Number(returnTravelerPricing.price.total);
          }
          return total;
        }, 0);

        let addOnsPrice = 0;
        if (formData.addOns?.insurance) {
          addOnsPrice +=
            27 * passengers.filter((p) => p.type !== "infant").length;
        }
        if (formData.priorityBoarding) {
          addOnsPrice += 6.99 * passengers.length;
        }
        if (formData.addOns?.stayDiscount) {
          addOnsPrice += 5 * passengers.length;
        }

        const specialServicesPrice =
          (formData.specialServices?.childSeat ? 15.99 : 0) +
          (formData.specialServices?.childMeal
            ? 8.99 * passengers.filter((p) => p.type === "child").length
            : 0) +
          (formData.specialServices?.stroller ? 0 : 0);

        const finalTotalPrice =
          basePrice + baggagePrice + addOnsPrice + specialServicesPrice;

        const isRoundTrip = flight?.return?.data;

        let finalBookingData;

        if (isRoundTrip) {
          finalBookingData = {
            bookingType: "ROUND_TRIP",
            flightData: [
              {
                flightID: flight.departure.data.id,
                typeOfFlight: "GO",
                numberOfStops:
                  flight.departure.data.itineraries[0].segments.length - 1,
                originAirportCode: sharedData?.departure?.origin?.airport?.iata,
                destinationAirportCode:
                  sharedData?.departure?.dest?.airport?.iata,
                originCIty: sharedData?.departure?.origin?.airport?.city,
                destinationCIty: sharedData?.departure?.dest?.airport?.city,
                departureDate:
                  flight.departure.data.itineraries[0].segments[0].departure.at.split(
                    "T"
                  )[0],
                arrivalDate: flight.departure.data.itineraries[0].segments
                  .slice(-1)[0]
                  .arrival.at.split("T")[0],
                selectedBaggageOption: baggageObjectForApi,
              },
              {
                flightID: flight.return.data.id,
                typeOfFlight: "RETURN",
                numberOfStops:
                  flight.return.data.itineraries[0].segments.length - 1,
                originAirportCode: sharedData?.return?.origin?.airport?.iata,
                destinationAirportCode: sharedData?.return?.dest?.airport?.iata,
                originCIty: sharedData?.return?.origin?.airport?.city,
                destinationCIty: sharedData?.return?.dest?.airport?.city,
                departureDate:
                  flight.return.data.itineraries[0].segments[0].departure.at.split(
                    "T"
                  )[0],
                arrivalDate: flight.return.data.itineraries[0].segments
                  .slice(-1)[0]
                  .arrival.at.split("T")[0],
                selectedBaggageOption: baggageObjectForApi,
              },
            ],
            totalPrice: parseFloat(finalTotalPrice.toFixed(2)),
            currency: sharedData.currency || "USD",
            travellersInfo: travellersInfoForApi,
            contactDetails: {
              email: formData.contactInfo.email,
              phone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`,
            },
          };
        } else {
          finalBookingData = {
            bookingType: "ONE_WAY",
            flightID: flight?.departure?.data?.id || "FL123456",
            numberOfStops:
              flight?.departure?.data?.itineraries[0]?.segments.length - 1,
            originAirportCode: sharedData?.departure?.origin?.airport?.iata,
            destinationAirportCode: sharedData?.departure?.dest?.airport?.iata,
            originCIty: sharedData?.departure?.origin?.airport?.city,
            destinationCIty: sharedData?.departure?.dest?.airport?.city,
            departureDate:
              flight?.departure?.data?.itineraries[0]?.segments[0]?.departure?.at?.split(
                "T"
              )[0],
            arrivalDate: flight?.departure?.data?.itineraries[0]?.segments
              ?.slice(-1)[0]
              ?.arrival?.at?.split("T")[0],
            selectedBaggageOption: baggageObjectForApi,
            totalPrice: parseFloat(finalTotalPrice.toFixed(2)),
            currency: flight?.departure?.data?.price?.currency || "USD",
            travellersInfo: travellersInfoForApi,
            contactDetails: {
              email: formData.contactInfo.email,
              phone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`,
            },
          };
        }

        console.log(
          "FINAL BOOKING DATA (All fixes applied):",
          finalBookingData
        );
        setFormData((prev) => ({ ...prev, finalBookingData }));
      }
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
  };

  // إعادة حساب finalBookingData تلقائياً عند الدخول لخطوة الدفع
  useEffect(() => {
    if (currentStep === 4) {
      // إعادة بناء finalBookingData بنفس منطق handleContinue
      const travellersInfoForApi = passengers.map((p) => {
        let birthDate = p.details.dateOfBirth;
        if (!birthDate && p.details.day && p.details.month && p.details.year) {
          const monthIndex = {
            January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
          }[p.details.month];
          if (monthIndex !== undefined) {
            birthDate = `${p.details.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(p.details.day).padStart(2, '0')}`;
          }
        }
        return {
          firstName: p.details.firstName,
          lastName: p.details.lastName,
          birthDate: birthDate,
          travelerType: p.type,
          nationality: p.details.nationality,
          passportNumber: p.details.passportNumber,
          issuingCountry: p.details.issuingCountry,
          expiryDate: p.details.passportExpiry,
        };
      });
      const baggageDataFromState = formData.baggageSelection || {};
      let baggagePrice = 0;
      if (formData.baggageSelection) {
        if (
          formData.baggageSelection.departure ||
          formData.baggageSelection.return
        ) {
          baggagePrice += formData.baggageSelection.departure?.price || 0;
          baggagePrice += formData.baggageSelection.return?.price || 0;
        } else if (
          formData.baggageSelection.outbound ||
          formData.baggageSelection.inbound
        ) {
          baggagePrice += formData.baggageSelection.outbound?.price || 0;
          baggagePrice += formData.baggageSelection.inbound?.price || 0;
        } else {
          baggagePrice = formData.baggageSelection.price || 0;
        }
      }
      const baggageObjectForApi = {
        type: baggageDataFromState.type || "checked",
        weight: baggageDataFromState.weight || "23kg",
        price: baggagePrice,
      };

      const basePrice = passengers.reduce((total, passenger, index) => {
        const travelerPricing =
          flight?.departure?.data?.travelerPricings?.[index];
        if (travelerPricing?.price?.total) {
          total += Number(travelerPricing.price.total);
        }
        // Add return flight price if available
        const returnTravelerPricing =
          flight?.return?.data?.travelerPricings?.[index];
        if (returnTravelerPricing?.price?.total) {
          total += Number(returnTravelerPricing.price.total);
        }
        return total;
      }, 0);

      let addOnsPrice = 0;
      if (formData.addOns?.insurance) {
        addOnsPrice +=
          27 * passengers.filter((p) => p.type !== "infant").length;
      }
      if (formData.priorityBoarding) {
        addOnsPrice += 6.99 * passengers.length;
      }
      if (formData.addOns?.stayDiscount) {
        addOnsPrice += 5 * passengers.length;
      }

      const specialServicesPrice =
        (formData.specialServices?.childSeat ? 15.99 : 0) +
        (formData.specialServices?.childMeal
          ? 8.99 * passengers.filter((p) => p.type === "child").length
          : 0) +
        (formData.specialServices?.stroller ? 0 : 0);

      const finalTotalPrice =
        basePrice + baggagePrice + addOnsPrice + specialServicesPrice;

      const isRoundTrip = flight?.return?.data;
      let finalBookingData;

      if (isRoundTrip) {
        finalBookingData = {
          bookingType: "ROUND_TRIP",
          flightData: [
            {
              flightID: flight.departure.data.id,
              typeOfFlight: "GO",
              numberOfStops:
                flight.departure.data.itineraries[0].segments.length - 1,
              originAirportCode: sharedData?.departure?.origin?.airport?.iata,
              destinationAirportCode:
                sharedData?.departure?.dest?.airport?.iata,
              originCIty: sharedData?.departure?.origin?.airport?.city,
              destinationCIty: sharedData?.departure?.dest?.airport?.city,
              departureDate:
                flight.departure.data.itineraries[0].segments[0].departure.at.split(
                  "T"
                )[0],
              arrivalDate: flight.departure.data.itineraries[0].segments
                .slice(-1)[0]
                .arrival.at.split("T")[0],
              selectedBaggageOption: baggageObjectForApi,
            },
            {
              flightID: flight.return.data.id,
              typeOfFlight: "RETURN",
              numberOfStops:
                flight.return.data.itineraries[0].segments.length - 1,
              originAirportCode: sharedData?.return?.origin?.airport?.iata,
              destinationAirportCode: sharedData?.return?.dest?.airport?.iata,
              originCIty: sharedData?.return?.origin?.airport?.city,
              destinationCIty: sharedData?.return?.dest?.airport?.city,
              departureDate:
                flight.return.data.itineraries[0].segments[0].departure.at.split(
                  "T"
                )[0],
              arrivalDate: flight.return.data.itineraries[0].segments
                .slice(-1)[0]
                .arrival.at.split("T")[0],
              selectedBaggageOption: baggageObjectForApi,
            },
          ],
          totalPrice: parseFloat(finalTotalPrice.toFixed(2)),
          currency: flight.departure.data.price.currency || "USD",
          travellersInfo: travellersInfoForApi,
          contactDetails: {
            email: formData.contactInfo.email,
            phone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`,
          },
        };
      } else {
        finalBookingData = {
          bookingType: "ONE_WAY",
          flightID: flight?.departure?.data?.id || "FL123456",
          numberOfStops:
            flight?.departure?.data?.itineraries[0]?.segments.length - 1,
          originAirportCode: sharedData?.departure?.origin?.airport?.iata,
          destinationAirportCode: sharedData?.departure?.dest?.airport?.iata,
          originCIty: sharedData?.departure?.origin?.airport?.city,
          destinationCIty: sharedData?.departure?.dest?.airport?.city,
          departureDate:
            flight?.departure?.data?.itineraries[0]?.segments[0]?.departure?.at?.split(
              "T"
            )[0],
          arrivalDate: flight?.departure?.data?.itineraries[0]?.segments
            ?.slice(-1)[0]
            ?.arrival?.at?.split("T")[0],
          selectedBaggageOption: baggageObjectForApi,
          totalPrice: parseFloat(finalTotalPrice.toFixed(2)),
          currency: sharedData.currency || "USD",
          travellersInfo: travellersInfoForApi,
          contactDetails: {
            email: formData.contactInfo.email,
            phone: `${formData.contactInfo.code}${formData.contactInfo.mobile}`,
          },
        };
      }

      // إذا لم يكن finalBookingData موجود أو تغير السعر، حدثه
      if (
        !formData.finalBookingData ||
        formData.finalBookingData.totalPrice !== finalBookingData.totalPrice
      ) {
        setFormData((prev) => ({ ...prev, finalBookingData }));
      }
    }
  }, [currentStep, passengers, formData, flight, sharedData]);

  return (
    <div className="page-container">
      <div className="booking-container">
        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />
        {currentStep === 2 && (
          <PassengerDetailsForm
            passengers={passengers}
            onUpdatePassenger={updatePassengerDetails}
            onUpdateForm={updateFormData}
            formData={formData}
            onContinue={handleContinue}
            passengerRefs={passengerRefs}
            setPassengerRef={setPassengerRef}
            setFareSelectionIndex={setFareSelectionIndex}
            fareSelectionIndex= {fareSelectionIndex}
          />
        )}
        {currentStep === 3 && (
          <UpgradeExperience
            passengers={passengers}
            formData={formData}
            onUpdateForm={updateFormData}
            onContinue={handleContinue}
            onBack={handleBack}
            setFareSelectionIndex={setFareSelectionIndex}
            fareSelectionIndex={fareSelectionIndex}
          />
        )}
        {currentStep === 4 && (
          <FinalDetails
            passengers={passengers}
            formData={formData}
            onBack={handleBack}
            sharedData={sharedData}
            setFareSelectionIndex={setFareSelectionIndex}
            fareSelectionIndex={fareSelectionIndex}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
