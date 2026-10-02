export type HazardType = 
  | 'submerged_bridge' 
  | 'road_washout' 
  | 'deep_mud' 
  | 'river_overflow' 
  | 'landslide' 
  | 'debris_blockage';

export type IncidentSeverity = 'moderate' | 'severe' | 'impassable';

export type VerificationStatus = 
  | 'unverified'   // Single civilian report (elevates risk slightly, doesn't close road)
  | 'corroborated' // Multiple independent reports (sets risk very high)
  | 'verified'     // Auto-trusted pre-registered Red Cross volunteer (sets segment impassable)
  | 'coordinator_override' // Explicit manual override by Red Cross logistics coordinator
  | 'cleared';     // Resolved / passable again

export interface IncidentReport {
  id: string;
  roadName: string;
  county: string;
  coordinates: [number, number]; // [lng, lat]
  hazardType: HazardType;
  severity: IncidentSeverity;
  status: VerificationStatus;
  reporterPhone: string;
  isRedCrossRegistered: boolean;
  corroborationCount: number;
  reportedAt: string; // ISO timestamp
  notes?: string;
  estimatedWaterDepthCm?: number;
  impassableForHeavyTrucks: boolean;
}

export interface NewIncidentSubmission {
  roadName: string;
  county: string;
  coordinates: [number, number];
  hazardType: HazardType;
  severity: IncidentSeverity;
  reporterPhone: string;
  notes?: string;
  estimatedWaterDepthCm?: number;
}
