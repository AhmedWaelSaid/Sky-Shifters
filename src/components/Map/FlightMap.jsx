import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const FlightMap = ({ origin, destination }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

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
    });
  }, []);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !origin || !destination) return;

    const route = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [origin, destination]
          }
        }
      ]
    };

    const point = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: origin
          }
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: destination
          }
        }
      ]
    };

    // Remove old layers and sources if they exist
    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getLayer('points')) map.current.removeLayer('points');
    if (map.current.getSource('route')) map.current.removeSource('route');
    if (map.current.getSource('points')) map.current.removeSource('points');

    // Add new source and layer for the route
    map.current.addSource('route', {
      type: 'geojson',
      data: route
    });

    map.current.addSource('points', {
      type: 'geojson',
      data: point
    });

    map.current.addLayer({
      id: 'route',
      source: 'route',
      type: 'line',
      paint: {
        'line-width': 2.5,
        'line-color': '#007cbf'
      }
    });

    map.current.addLayer({
      id: 'points',
      source: 'points',
      type: 'circle',
      paint: {
        'circle-radius': 6,
        'circle-color': '#FFFFFF',
        'circle-stroke-color': '#007cbf',
        'circle-stroke-width': 2
      }
    });
    
    // Fit map to bounds
    const bounds = new mapboxgl.LngLatBounds(origin, destination);
    map.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 100, right: 100 },
      maxZoom: 10,
      duration: 2000
    });

  }, [origin, destination]);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px', borderRadius: '15px' }} />;
};

export default FlightMap; 