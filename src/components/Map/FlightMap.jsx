import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const FlightMap = ({ originAirport, destinationAirport }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/ahmedwael315/cm9sv08xa00js01sb9wd35jsx',
      projection: 'globe',
      zoom: 1,
      center: [0, 20]
    });

    map.current.on('style.load', () => {
      map.current.setFog({
        color: 'rgb(30, 41, 59)', // Dark blue-gray
        'high-color': 'rgb(30, 64, 175)', // Deeper blue
        'horizon-blend': 0.02,
        'space-color': 'rgb(15, 23, 42)', // Almost black
        'star-intensity': 0.6
      });

      // Add 3D terrain
      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
    });
  }, []);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !originAirport || !destinationAirport) return;

    const originCoords = [originAirport.lon, originAirport.lat];
    const destinationCoords = [destinationAirport.lon, destinationAirport.lat];

    // Clear previous markers and route
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getSource('route')) map.current.removeSource('route');
    
    // Create Popups
    const originPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${originAirport.name}</h3><p>Elevation: ${originAirport.elevation || 'N/A'} ft</p>`
    );
    const destinationPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${destinationAirport.name}</h3><p>Elevation: ${destinationAirport.elevation || 'N/A'} ft</p>`
    );

    // Create Markers
    const originMarker = new mapboxgl.Marker({ color: '#FFD700' }) // Gold color for origin
      .setLngLat(originCoords)
      .setPopup(originPopup)
      .addTo(map.current);

    const destinationMarker = new mapboxgl.Marker({ color: '#FF6347' }) // Tomato color for destination
      .setLngLat(destinationCoords)
      .setPopup(destinationPopup)
      .addTo(map.current);
      
    markersRef.current = [originMarker, destinationMarker];

    const route = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [originCoords, destinationCoords]
      }
    };

    // Add new source and layer for the route
    map.current.addSource('route', {
      type: 'geojson',
      data: route
    });

    map.current.addLayer({
      id: 'route',
      source: 'route',
      type: 'line',
      paint: {
        'line-width': 2.5,
        'line-color': '#007cbf',
        'line-dasharray': [2, 2] // Dashed line
      }
    });

    // Fit map to bounds
    const bounds = new mapboxgl.LngLatBounds(originCoords, destinationCoords);
    map.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 100, right: 100 },
      maxZoom: 10,
      duration: 2000
    });

  }, [originAirport, destinationAirport]);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px', borderRadius: '15px' }} />;
};

export default FlightMap; 