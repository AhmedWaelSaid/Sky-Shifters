export function dealWithDuration(duration) {
  let hours = 0;
  let timeInMinutes;
  if (duration.includes("H")){
   hours = Number(duration.split("T")[1].split("H")[0]);
  let minutes = 0;
  if (duration.includes("M"))
    minutes = Number(duration.split("T")[1].split("H")[1].split("M")[0]);
   timeInMinutes = hours * 60 + minutes;
  }
  if (duration.includes("M") && !duration.includes("H"))
    timeInMinutes = Number(duration.split("T")[1].split("M")[0]);
  return timeInMinutes;
}
export function getDurationAndPrice(data) {
  let lowestPrice;
  let highestPrice;
  let lowestFlightDuration;
  let highestFlightDuration;

  [lowestPrice, highestPrice] = data.reduce(
    (acc, data) => {
      const price = Number(data.price.total);
      if (acc[0] > price) acc[0] = price;
      if (acc[1] < price) acc[1] = price;
      return acc;
    },
    [Infinity, 0]
  );

  [lowestFlightDuration, highestFlightDuration] = data.reduce(
    (acc, data) => {
      const duration = dealWithDuration(data.itineraries[0].duration);
      if (acc[0] > duration) acc[0] = duration;
      if (acc[1] < duration) acc[1] = duration;
      return acc;
    },
    [Infinity, 0]
  );

  return {
    lowestPrice,
    highestPrice,
    lowestFlightDuration,
    highestFlightDuration,
  };
}
export const formatDuration = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;

  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";

  return [hours, minutes].filter(Boolean).join(" ");
};
export function dayDifference(flight) {
  if (!flight) return"";
  let arrival, departure;
  if (flight.itineraries[0].segments.length == 1) {
    //direct flight
    arrival = new Date(flight.itineraries[0].segments[0].arrival.at);
  }
  if (flight.itineraries[0].segments.length == 2) {
    //1 stop flight
    arrival = new Date(flight.itineraries[0].segments[1].arrival.at);
  }
  if (flight.itineraries[0].segments.length == 3) {
    //2 stop flight
    arrival = new Date(flight.itineraries[0].segments[2].arrival.at);
  }
  departure = new Date(flight.itineraries[0].segments[0].departure.at);
  const arrivalDay = arrival.toDateString();
  const departureDay = departure.toDateString();
  if (arrivalDay != departureDay) {
    const diffInDays = Math.floor(
      (arrival.setHours(0, 0, 0, 0) - departure.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    );
    return `+${diffInDays}`;
  }
  return "";
}