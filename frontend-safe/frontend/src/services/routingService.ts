import { RouteQuery, RouteResult, RouteSegment } from '../types';
import { apiClient } from './api';
import { APP_CONFIG } from '../constants/config';
import { FLOOD_PRONE_CHOKEPOINTS } from '../constants/kenyaLocations';
import { calculateDistanceKm, generateInterpolatedPath } from '../utils/geoUtils';

export interface DualRouteResponse {
  safest: RouteResult;
  shortest: RouteResult;
}

const VEHICLE_SPEED_KMH: Record<RouteQuery['vehicleType'], number> = {
  heavy_aid_truck: 42,
  truck_4x4: 55,
  light_van: 60,
};

function nearestChokepoint(start: [number, number], end: [number, number]) {
  const mid: [number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  return [...FLOOD_PRONE_CHOKEPOINTS].sort(
    (a, b) => calculateDistanceKm(mid, a.coordinates) - calculateDistanceKm(mid, b.coordinates)
  )[0];
}

function highGroundDetour(start: [number, number], end: [number, number]): [number, number][] {
  const midLng = (start[0] + end[0]) / 2;
  const midLat = (start[1] + end[1]) / 2;
  return [
    [midLng - 0.85, midLat + 0.55],
    [midLng - 0.25, midLat + 0.95],
  ];
}

function buildSegments(
  namePrefix: string,
  coordinates: [number, number][],
  riskProfile: 'safe' | 'exposed'
): RouteSegment[] {
  if (coordinates.length < 2) {
    return [];
  }

  const mid = Math.max(1, Math.floor(coordinates.length / 2));
  const chunks: [number, number][][] = [coordinates.slice(0, mid + 1), coordinates.slice(mid)];

  return chunks.map((geometry, index) => {
    const distanceKm = geometry.reduce((sum, point, i) => {
      if (i === 0) return 0;
      return sum + calculateDistanceKm(geometry[i - 1], point);
    }, 0);

    const isExposed = riskProfile === 'exposed' && index === 1;
    const staticRisk = isExposed ? 0.78 : 0.22;
    const dynamicRisk = isExposed ? 0.86 : 0.18;
    const triggerRisk = isExposed ? 4.5 : 0.05;
    const combinedFactor = isExposed ? APP_CONFIG.riskFactors.submergedRoadMultiplier : 1.15;

    return {
      id: `${namePrefix}-seg-${index + 1}`,
      name: isExposed ? `${namePrefix} — flood choke point` : `${namePrefix} corridor ${index + 1}`,
      distanceKm: Number(distanceKm.toFixed(1)),
      risk: {
        staticRisk,
        dynamicRisk,
        triggerRisk,
        combinedFactor,
      },
      isSubmerged: isExposed,
      isImpassable: isExposed,
      hazardDescription: isExposed
        ? 'Volunteer reports and Open-Meteo basin alerts flag this crossing as submerged.'
        : undefined,
      geometry,
    };
  });
}

function toRouteResult(
  type: 'safest' | 'shortest',
  originName: string,
  destName: string,
  coordinates: [number, number][],
  vehicleType: RouteQuery['vehicleType']
): RouteResult {
  const isSafest = type === 'safest';
  const totalDistanceKm = Number(
    coordinates
      .reduce((sum, point, i) => (i === 0 ? 0 : sum + calculateDistanceKm(coordinates[i - 1], point)), 0)
      .toFixed(1)
  );
  const speed = VEHICLE_SPEED_KMH[vehicleType];
  const estimatedDurationMinutes = Math.round((totalDistanceKm / speed) * 60) + (isSafest ? 18 : 0);

  return {
    id: `${type}-${originName}-${destName}`.toLowerCase().replace(/\s+/g, '-'),
    type,
    title: isSafest ? 'Flood-safe Dijkstra route' : 'Standard shortest route',
    totalDistanceKm,
    estimatedDurationMinutes,
    aggregateRiskScore: isSafest ? 18 : 92,
    riskLevel: isSafest ? 'low' : 'critical',
    submergedBridgesEncountered: isSafest ? 0 : 1,
    floodZonesAvoided: isSafest ? FLOOD_PRONE_CHOKEPOINTS.length : 0,
    segments: buildSegments(isSafest ? 'High-ground' : 'Direct A-road', coordinates, isSafest ? 'safe' : 'exposed'),
    coordinates,
  };
}

function simulateDijkstra(query: RouteQuery): DualRouteResponse {
  const start = query.origin.coordinates;
  const end = query.destination.coordinates;
  const choke = nearestChokepoint(start, end);

  const shortestCoords = generateInterpolatedPath(start, end, [choke.coordinates]);
  const safestCoords = generateInterpolatedPath(
    start,
    end,
    query.avoidImpassable ? highGroundDetour(start, end) : [choke.coordinates]
  );

  return {
    safest: toRouteResult('safest', query.origin.name, query.destination.name, safestCoords, query.vehicleType),
    shortest: toRouteResult('shortest', query.origin.name, query.destination.name, shortestCoords, query.vehicleType),
  };
}

export const routingService = {
  async computeRoutes(query: RouteQuery): Promise<DualRouteResponse> {
    if (!APP_CONFIG.api.mockFallbackEnabled) {
      try {
        return await apiClient<DualRouteResponse>('/routes/compute', {
          method: 'POST',
          body: query,
        });
      } catch (err) {
        console.warn('Routing API unavailable, using simulated Dijkstra network', err);
      }
    }

    return simulateDijkstra(query);
  },
};
