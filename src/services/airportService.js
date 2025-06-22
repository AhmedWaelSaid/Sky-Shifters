let airportData = null;

async function loadAirportData() {
  if (airportData) {
    return airportData;
  }

  try {
    const response = await fetch('/airports.dat');
    const text = await response.text();
    const lines = text.split('\n');
    
    const data = new Map();
    for (const line of lines) {
      const parts = line.split(',').map(part => part.replace(/"/g, ''));
      if (parts.length > 7) {
        const iataCode = parts[4];
        const lat = parseFloat(parts[6]);
        const lon = parseFloat(parts[7]);

        if (iataCode && iataCode !== '\\N' && !isNaN(lat) && !isNaN(lon)) {
          data.set(iataCode, {
            name: parts[1],
            lat,
            lon,
            elevation: parts[8] ? parseFloat(parts[8]) : null,
          });
        }
      }
    }
    airportData = data;
    return airportData;
  } catch (error) {
    console.error('Failed to load airport data:', error);
    return new Map();
  }
}

export const getAirportDetails = async (iataCode) => {
  const data = await loadAirportData();
  return data.get(iataCode) || null;
};

export const getAirportCoordinates = async (iataCode) => {
  const details = await getAirportDetails(iataCode);
  return details ? [details.lon, details.lat] : null;
}; 