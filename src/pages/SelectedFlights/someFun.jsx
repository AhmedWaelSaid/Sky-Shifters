export function dealWithDuration(duration) {
  const hours = Number(duration.split("T")[1].split("H")[0]);
  let minutes = 0;
  if (duration.includes("M"))
    minutes = Number(duration.split("T")[1].split("H")[1].split("M")[0]);

  const timeInMinutes = hours * 60 + minutes;
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
