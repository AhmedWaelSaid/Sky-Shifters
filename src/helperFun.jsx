export function csvToJson(csvText) {
    const columns = [
        "id", "name", "city", "country", "iata", "icao",
        "latitude", "longitude", "altitude", "timezone",
        "dst", "tz_database", "type", "source"
      ];

      const rows = csvText.trim().split('\n');
      return rows.map(row => {
        const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
          .map(value => {
            if (value === '\\N') return null;
            if (value.startsWith('"') && value.endsWith('"')) {
              return value.slice(1, -1);
            }
            return value;
          });
          const airport = {};
          columns.forEach((col, i) => {
            airport[col] = values[i];
          });
          return airport;
        }).filter(airport=> airport.iata !== null)
}
let amadeusTokenCache = {
  accessToken: null,
  expirationTime: 0, // timestamp in ms
};

export async function getAmadeusAccessToken(clientId, clientSecret) {
  const now = Date.now();

  if (amadeusTokenCache.accessToken && now < amadeusTokenCache.expirationTime) {
    return amadeusTokenCache.accessToken;
  }

  const response = await fetch("https://api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch token: ${error.error_description || response.statusText}`);
  }

  const data = await response.json();

  amadeusTokenCache = {
    accessToken: data.access_token,
    expirationTime: now + data.expires_in * 1000 - 5000,
  };

  return data.access_token;
}
