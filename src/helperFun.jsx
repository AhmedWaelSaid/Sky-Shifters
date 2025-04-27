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
        });
}