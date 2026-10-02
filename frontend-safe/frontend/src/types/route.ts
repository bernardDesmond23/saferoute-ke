export type VehicleType = 'truck_4x4' | 'heavy_aid_truck' | 'light_van';

export interface LocationPoint {
  id: string;
  name: string;
  county: string;
  coordinates: [number, number]; // [lng, lat]
  description?: string;
  isDepot?: boolean;
}

export interface RiskBreakdown {
  staticRisk: number;   // 0.0 - 1.0 (historical flood washout records)
  dynamicRisk: number;  // 0.0 - 1.0 (real-time Open-Meteo rainfall & river basin forecasts)
  triggerRisk: number;  // 0.0 - 1.0+ or Infinity (volunteer reports on submerged bridges/mud)
  combinedFactor: number; // risk_factor multiplier used in Dijkstra: cost = distance * risk_factor
}

export interface RouteSegment {
  id: string;
  osmWayId?: string;
  name: string;
  distanceKm: number;
  risk: RiskBreakdown;
  isSubmerged: boolean;
  isImpassable: boolean;
  hazardDescription?: string;
  geometry: [number, number][]; // Line coordinates [lng, lat][]
}

export interface RouteResult {
  id: string;
  type: 'safest' | 'shortest';
  title: string;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  aggregateRiskScore: number; // 0 (safest) to 100+ (extreme hazard)
  riskLevel: 'low' | 'moderate' | 'high' | 'critical' | 'impassable';
  submergedBridgesEncountered: number;
  floodZonesAvoided: number;
  segments: RouteSegment[];
  coordinates: [number, number][]; // Flattened GeoJSON line coordinates
  bedrockExplanation?: string;
}

export interface RouteQuery {
  origin: LocationPoint;
  destination: LocationPoint;
  vehicleType: VehicleType;
  avoidImpassable: boolean;
}
