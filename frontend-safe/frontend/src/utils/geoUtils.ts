import { LngLatBoundsLike } from 'maplibre-gl';

/**
 * Calculates Haversine distance in kilometers between two coordinates [lng, lat]
 */
export function calculateDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Computes bounding box enclosing all coordinates in a route for MapLibre map.fitBounds
 */
export function getBoundsFromCoordinates(coordinates: [number, number][]): LngLatBoundsLike {
  if (!coordinates || coordinates.length === 0) {
    return [
      [33.9098, -4.7246],
      [41.9069, 5.0334],
    ];
  }

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coordinates) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  // Add small margin so points aren't at the very edge of the map
  const paddingLng = Math.max(0.2, (maxLng - minLng) * 0.1);
  const paddingLat = Math.max(0.2, (maxLat - minLat) * 0.1);

  return [
    [minLng - paddingLng, minLat - paddingLat],
    [maxLng + paddingLng, maxLat + paddingLat],
  ];
}

/**
 * Generates an interpolated line connecting waypoints for smooth map rendering
 */
export function generateInterpolatedPath(
  start: [number, number],
  end: [number, number],
  detourPoints: [number, number][] = []
): [number, number][] {
  const points = [start, ...detourPoints, end];
  const fullPath: [number, number][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const steps = 20;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      // Gentle natural curvature
      const jitterLat = Math.sin(t * Math.PI) * 0.03 * (i % 2 === 0 ? 1 : -1);
      const jitterLng = Math.sin(t * Math.PI) * 0.02 * (i % 2 === 0 ? -1 : 1);
      
      const lng = p1[0] + (p2[0] - p1[0]) * t + jitterLng;
      const lat = p1[1] + (p2[1] - p1[1]) * t + jitterLat;
      fullPath.push([Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
    }
  }

  return fullPath;
}
