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
          data.set(iataCode, { lat, lon });
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

export const getAirportCoordinates = async (iataCode) => {
  const data = await loadAirportData();
  const coords = data.get(iataCode);
  return coords ? [coords.lon, coords.lat] : null;
}; 