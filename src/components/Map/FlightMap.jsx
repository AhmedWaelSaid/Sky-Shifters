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

const FlightMap = ({ flight }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationFrameId = useRef(null);

  const {
    originAirport,
    destinationAirport,
    duration,
    departure,
    arrival,
  } = flight || {};

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
      
      // Add country boundaries for location tracking
      map.current.addSource('country-boundaries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
      });
    });
    
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !originAirport || !destinationAirport || !departure?.at || !arrival?.at) return;
    
    // Clear previous layers and markers if they exist
    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getSource('route')) map.current.removeSource('route');
    if (map.current.getLayer('plane')) map.current.removeLayer('plane');
    if (map.current.getSource('plane')) map.current.removeSource('plane');
    
    const originCoords = [originAirport.lon, originAirport.lat];
    const destinationCoords = [destinationAirport.lon, destinationAirport.lat];

    const originMarker = new mapboxgl.Marker({ color: '#FFD700' }).setLngLat(originCoords).addTo(map.current);
    const destinationMarker = new mapboxgl.Marker({ color: '#FF6347' }).setLngLat(destinationCoords).addTo(map.current);

    const route = turf.greatCircle(turf.point(originCoords), turf.point(destinationCoords), { npoints: 500 });
    const routeDistance = turf.length(route);

    map.current.addSource('route', { type: 'geojson', data: route });
    map.current.addLayer({ id: 'route', source: 'route', type: 'line', paint: { 'line-width': 2.5, 'line-color': '#FF8C00' } });

    const planePoint = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: originCoords }}]};
    map.current.addSource('plane', { type: 'geojson', data: planePoint });
    map.current.addLayer({
        id: 'plane',
        source: 'plane',
        type: 'symbol',
        layout: {
            'icon-image': 'airport-15',
            'icon-size': 1.2,
            'icon-rotate': ['get', 'bearing'],
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
        },
        paint: {
            "icon-color": "#FFD700"
        }
    });

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 25 });

    const bounds = new mapboxgl.LngLatBounds(originCoords, destinationCoords);
    map.current.fitBounds(bounds, { padding: 100, maxZoom: 10, duration: 2000 });

    const departureTimeMs = new Date(departure.at).getTime();
    const arrivalTimeMs = new Date(arrival.at).getTime();
    const totalFlightDurationMs = arrivalTimeMs - departureTimeMs;

    const animate = () => {
        const now = Date.now();
        const timeElapsed = now - departureTimeMs;

        let currentCoords = originCoords;
        let htmlContent = '';

        if (now < departureTimeMs) {
            const timeToDeparture = departureTimeMs - now;
            htmlContent = `<h4>Departs in</h4><p>${formatRemainingTime(timeToDeparture)}</p>`;
        } else if (now > arrivalTimeMs) {
            currentCoords = destinationCoords;
            htmlContent = `<h4>Flight Arrived</h4><p>Duration: ${formatDuration(duration)}</p>`;
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        } else {
            const progress = Math.min(timeElapsed / totalFlightDurationMs, 1);
            const currentPoint = turf.along(route, routeDistance * progress);
            currentCoords = currentPoint.geometry.coordinates;

            const nextPoint = turf.along(route, routeDistance * Math.min(progress + 0.001, 1));
            const bearing = turf.bearing(currentPoint, nextPoint);
            planePoint.features[0].properties.bearing = bearing;
            
            const features = map.current.queryRenderedFeatures(map.current.project(currentCoords), {
                layers: ['country-boundaries']
            });
            const country = features.length > 0 && features[0].properties ? features[0].properties.name_en : 'Over an ocean';

            const remainingTime = arrivalTimeMs - now;
            htmlContent = `
              <div style="text-align:left;">
                <strong>Remaining:</strong> ${formatRemainingTime(remainingTime)}<br/>
                <strong>Over:</strong> ${country}<br/>
                <strong>Duration:</strong> ${formatDuration(duration)}
              </div>
            `;
        }

        planePoint.features[0].geometry.coordinates = currentCoords;
        map.current.getSource('plane').setData(planePoint);
        popup.setLngLat(currentCoords).setHTML(htmlContent).addTo(map.current);
        
        if (now < arrivalTimeMs) {
            animationFrameId.current = requestAnimationFrame(animate);
        }
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if(popup) popup.remove();
      originMarker.remove();
      destinationMarker.remove();
    };
  }, [flight, originAirport, destinationAirport, departure, arrival, duration]);

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