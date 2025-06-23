import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import styles from './FlightMap.module.css'; // Import a CSS module for styling

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Helper to format duration from ISO string (e.g., PT5H30M)
const formatDuration = (isoDuration) => {
  if (!isoDuration || typeof isoDuration !== 'string') return '--';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return '--';
  
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return '--';
};

// Helper to format milliseconds into HH:MM:SS
const formatRemainingTime = (ms) => {
    if (ms < 0) return 'Arrived';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Helper to convert milliseconds to a duration string that formatDuration can use
const msToISODuration = (ms) => {
  if (ms <= 0) return 'PT0M';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `PT${hours}H${minutes}M`;
};

// Helper to convert ISO 8601 duration string to milliseconds
const isoDurationToMs = (isoDuration) => {
  if (!isoDuration || typeof isoDuration !== 'string') return 0;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  
  return (hours * 3600 * 1000) + (minutes * 60 * 1000);
};

const FlightMap = ({ flight }) => {
  console.log('%c[FlightMap] Received flight prop:', 'color: #22c55e; font-weight: bold;', flight);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationFrameId = useRef(null);
  const markersRef = useRef([]);
  const popupRef = useRef(null);

  const {
    originAirport,
    destinationAirport,
    duration, // Rely on this as the source of truth for duration
    departure,
    // No longer using arrival timestamp for calculations
  } = flight || {};

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/ahmedwael315/cm9sv08xa00js01sb9wd35jsx',
      projection: 'globe',
      zoom: 1,
      center: [0, 20]
    });

    map.current.on('style.load', () => {
      map.current.setFog({
        color: 'rgb(30, 41, 59)',
        'high-color': 'rgb(30, 64, 175)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(15, 23, 42)',
        'star-intensity': 0.6
      });

      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      
      map.current.addSource('country-boundaries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
      });
    });
    
    return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
    };
  }, []);

  useEffect(() => {
    // Ensure we have the necessary data, including the trusted duration string
    if (!map.current || !map.current.isStyleLoaded() || !originAirport || !destinationAirport || !departure?.at || !duration) return;

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (popupRef.current) popupRef.current.remove();
    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getSource('route')) map.current.removeSource('route');
    if (map.current.getLayer('plane')) map.current.removeLayer('plane');
    if (map.current.getSource('plane')) map.current.removeSource('plane');
    
    const originCoords = [originAirport.lon, originAirport.lat];
    const destinationCoords = [destinationAirport.lon, destinationAirport.lat];

    const originMarker = new mapboxgl.Marker({ color: '#22c55e' }).setLngLat(originCoords).addTo(map.current);
    const destinationMarker = new mapboxgl.Marker({ color: '#ef4444' }).setLngLat(destinationCoords).addTo(map.current);
    markersRef.current = [originMarker, destinationMarker];

    const route = turf.greatCircle(turf.point(originCoords), turf.point(destinationCoords), { npoints: 500 });
    const routeDistance = turf.length(route);

    map.current.addSource('route', { type: 'geojson', data: route });
    map.current.addLayer({ id: 'route', source: 'route', type: 'line', paint: { 'line-width': 2, 'line-color': '#e2e8f0' } });

    const planeGeoJSON = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: originCoords }}]};
    if (!map.current.getSource('plane')) {
      map.current.addSource('plane', { type: 'geojson', data: planeGeoJSON });
    }
    
    if (!map.current.getLayer('plane')) {
      map.current.addLayer({
          id: 'plane',
          source: 'plane',
          type: 'symbol',
          layout: { 'icon-image': 'airport-15', 'icon-size': 1.5, 'icon-rotate': ['get', 'bearing'], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true },
          paint: { "icon-color": "#FFD700" }
      });
    }

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 25, className: 'mapbox-popup' });
    popupRef.current = popup;

    const bounds = new mapboxgl.LngLatBounds(originCoords, destinationCoords);
    map.current.fitBounds(bounds, { padding: 100, maxZoom: 10, duration: 2000 });

    const departureTimeMs = new Date(departure.at).getTime();
    
    // Calculate total duration and arrival time from the trusted 'duration' prop
    const totalFlightDurationMs = isoDurationToMs(duration);
    const arrivalTimeMs = departureTimeMs + totalFlightDurationMs;

    const animate = () => {
        const now = Date.now();
        let currentCoords, htmlContent;

        if (now < departureTimeMs) {
            currentCoords = originCoords;
            const timeToDeparture = departureTimeMs - now;
            htmlContent = `<div style="text-align:center;color:white;"><h4>Departs in</h4><p style="font-size:1.2rem; margin:0;">${formatRemainingTime(timeToDeparture)}</p></div>`;
        } else if (now >= arrivalTimeMs) {
            currentCoords = destinationCoords;
            htmlContent = `<div style="text-align:center;color:white;"><h4>Flight Arrived</h4><p style="font-size:1.1rem; margin:0;">Total Duration: ${formatDuration(duration)}</p></div>`;
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        } else {
            const progress = totalFlightDurationMs > 0 ? Math.min((now - departureTimeMs) / totalFlightDurationMs, 1) : 1;
            const currentPoint = turf.along(route, routeDistance * progress);
            currentCoords = currentPoint.geometry.coordinates;

            const nextPoint = turf.along(route, routeDistance * Math.min(progress + 0.001, 1));
            const bearing = turf.bearing(currentPoint, nextPoint);
            
            planeGeoJSON.features[0].geometry.coordinates = currentCoords;
            planeGeoJSON.features[0].properties.bearing = bearing;
            map.current.getSource('plane').setData(planeGeoJSON);
            
            const features = map.current.queryRenderedFeatures(map.current.project(currentCoords), { layers: ['country-boundaries'] });
            const country = features.length > 0 && features[0].properties ? features[0].properties.name_en : 'Over an ocean';
            const remainingTime = arrivalTimeMs - now;
            
            htmlContent = `
              <div style="text-align:left;color:white;min-width:180px;">
                <div style="font-weight:bold;font-size:1rem;">Remaining: ${formatRemainingTime(remainingTime)}</div>
                <div style="font-size:0.9rem;"><strong>Over:</strong> ${country}</div>
                <div style="font-size:0.9rem;"><strong>Duration:</strong> ${formatDuration(duration)}</div>
              </div>`;
        }
        
        popup.setLngLat(currentCoords).setHTML(htmlContent).addTo(map.current);
        
        if (now < arrivalTimeMs) {
            animationFrameId.current = requestAnimationFrame(animate);
        }
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [flight, originAirport, destinationAirport, departure, duration]);

  if (!flight) {
    return <div className={styles.mapContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map data...</div>;
  }
  
  return (
    <div className={styles.mapWrapper}>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  );
};

export default FlightMap; 