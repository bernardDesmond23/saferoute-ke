export interface BedrockRouteExplanation {
  routeId: string;
  summary: string;
  keyHazardsAvoided: string[];
  detourJustification: string;
  estimatedDelayMinutes: number;
  recommendedVehicleRestrictions: string[];
  modelId: string;
  generatedAt: string;
}
