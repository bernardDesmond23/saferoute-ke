import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { KENYA_BOUNDS, KENYA_CENTER, KENYA_DEFAULT_ZOOM, OSM_STYLE } from '../../constants/mapStyles';
import { FLOOD_PRONE_CHOKEPOINTS } from '../../constants/kenyaLocations';
import { getBoundsFromCoordinates } from '../../utils/geoUtils';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapView.css';

const emptyCollection = (): FeatureCollection => ({ type: 'FeatureCollection', features: [] });

function lineCollection(id: string, coordinates: [number, number][]): FeatureCollection {
  if (coordinates.length < 2) return emptyCollection();
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id,
        properties: { id },
        geometry: { type: 'LineString', coordinates },
      },
    ],
  };
}

function pointCollection(
  points: Array<{ id: string; coordinates: [number, number]; properties?: Record<string, string | number | boolean> }>
): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      id: point.id,
      properties: point.properties ?? {},
      geometry: { type: 'Point', coordinates: point.coordinates },
    })),
  };
}

function upsertSource(map: MapLibreMap, id: string, data: FeatureCollection) {
  const existing = map.getSource(id) as GeoJSONSource | undefined;
  if (existing) {
    existing.setData(data);
    return;
  }
  map.addSource(id, { type: 'geojson', data });
}

export const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const {
    origin,
    destination,
    safestRoute,
    shortestRoute,
    selectedRouteTab,
    incidents,
    weatherSync,
    layers,
  } = useSafeRoute();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_STYLE,
      center: KENYA_CENTER,
      zoom: KENYA_DEFAULT_ZOOM,
      maxBounds: KENYA_BOUNDS,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    mapRef.current = map;

    map.on('load', () => {
      upsertSource(map, 'shortest-route', emptyCollection());
      upsertSource(map, 'safest-route', emptyCollection());
      upsertSource(map, 'flood-zones', emptyCollection());
      upsertSource(map, 'weather-basins', emptyCollection());
      upsertSource(map, 'incidents', emptyCollection());

      map.addLayer({
        id: 'flood-zones-fill',
        type: 'circle',
        source: 'flood-zones',
        paint: {
          'circle-radius': 28,
          'circle-color': '#f59e0b',
          'circle-opacity': 0.22,
          'circle-stroke-color': '#fbbf24',
          'circle-stroke-width': 1,
        },
      });

      map.addLayer({
        id: 'weather-basins-fill',
        type: 'circle',
        source: 'weather-basins',
        paint: {
          'circle-radius': 22,
          'circle-color': '#38bdf8',
          'circle-opacity': 0.2,
        },
      });

      map.addLayer({
        id: 'shortest-route-line',
        type: 'line',
        source: 'shortest-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ef4444',
          'line-width': 4,
          'line-dasharray': [2, 1.4],
          'line-opacity': 0.85,
        },
      });

      map.addLayer({
        id: 'safest-route-line',
        type: 'line',
        source: 'safest-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#10b981',
          'line-width': 5,
          'line-opacity': 0.95,
        },
      });

      map.addLayer({
        id: 'incidents-dots',
        type: 'circle',
        source: 'incidents',
        paint: {
          'circle-radius': 7,
          'circle-color': '#dc2626',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fee2e2',
        },
      });
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const showShortest = layers.showShortestComparison && Boolean(shortestRoute);
      upsertSource(map, 'shortest-route', showShortest ? lineCollection('shortest', shortestRoute!.coordinates) : emptyCollection());
      upsertSource(map, 'safest-route', safestRoute ? lineCollection('safest', safestRoute.coordinates) : emptyCollection());

      upsertSource(
        map,
        'flood-zones',
        layers.showFloodZones
          ? pointCollection(FLOOD_PRONE_CHOKEPOINTS.map((zone) => ({ id: zone.id, coordinates: zone.coordinates })))
          : emptyCollection()
      );

      upsertSource(
        map,
        'weather-basins',
        layers.showWeather && weatherSync
          ? pointCollection(
              weatherSync.basins.map((basin) => ({
                id: basin.basinName,
                coordinates: basin.coordinates,
              }))
            )
          : emptyCollection()
      );

      upsertSource(
        map,
        'incidents',
        layers.showIncidents
          ? pointCollection(
              incidents.map((incident) => ({
                id: incident.id,
                coordinates: incident.coordinates,
                properties: { name: incident.roadName },
              }))
            )
          : emptyCollection()
      );

      if (map.getLayer('safest-route-line')) {
        map.setPaintProperty('safest-route-line', 'line-width', selectedRouteTab === 'safest' ? 6 : 4);
        map.setPaintProperty('shortest-route-line', 'line-width', selectedRouteTab === 'shortest' ? 6 : 3);
      }

      const fitCoords =
        selectedRouteTab === 'shortest' && shortestRoute
          ? shortestRoute.coordinates
          : safestRoute?.coordinates;
      if (fitCoords && fitCoords.length > 1) {
        map.fitBounds(getBoundsFromCoordinates(fitCoords), { padding: 64, duration: 800 });
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const originEl = document.createElement('div');
      originEl.className = 'hub-marker origin';
      originEl.title = origin.name;
      const destEl = document.createElement('div');
      destEl.className = 'hub-marker dest';
      destEl.title = destination.name;

      markersRef.current.push(
        new maplibregl.Marker({ element: originEl }).setLngLat(origin.coordinates).addTo(map),
        new maplibregl.Marker({ element: destEl }).setLngLat(destination.coordinates).addTo(map)
      );
    };

    if (map.loaded()) {
      apply();
    } else {
      map.once('load', apply);
    }
  }, [
    origin,
    destination,
    safestRoute,
    shortestRoute,
    selectedRouteTab,
    incidents,
    weatherSync,
    layers,
  ]);

  return (
    <div className="map-view-container">
      <div ref={mapContainerRef} className="map-canvas" />
      <div className="map-overlay-top-right">
        <MapControls />
        <MapLegend />
      </div>
    </div>
  );
};
