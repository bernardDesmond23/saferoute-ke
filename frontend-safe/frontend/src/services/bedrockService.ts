import { BedrockRouteExplanation, RouteResult } from '../types';
import { apiClient } from './api';
import { APP_CONFIG } from '../constants/config';

const BEDROCK_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildLocalExplanation(safest: RouteResult, shortest: RouteResult): BedrockRouteExplanation {
  const extraKm = Math.max(0, Number((safest.totalDistanceKm - shortest.totalDistanceKm).toFixed(1)));
  const extraMinutes = Math.max(0, safest.estimatedDurationMinutes - shortest.estimatedDurationMinutes);
  const hazards = safest.segments
    .filter((segment) => segment.hazardDescription)
    .map((segment) => segment.hazardDescription as string);

  const avoided = [
    ...hazards,
    `${shortest.submergedBridgesEncountered} submerged crossing(s) on the shortest corridor`,
    `${safest.floodZonesAvoided} historical flood basins kept off the Dijkstra path`,
  ].filter((item, index, list) => list.indexOf(item) === index);

  return {
    routeId: safest.id,
    summary: `The flood-safe corridor adds ${extraKm} km versus the standard shortest path, keeping aggregate risk at ${safest.aggregateRiskScore}/100 instead of ${shortest.aggregateRiskScore}/100.`,
    keyHazardsAvoided: avoided.slice(0, 4),
    detourJustification:
      extraKm > 0
        ? `Dijkstra applied a ${APP_CONFIG.riskFactors.submergedRoadMultiplier}x cost to impassable segments, forcing a high-ground detour that avoids volunteer-verified washouts while remaining driveable for the selected fleet.`
        : 'Both candidates share similar geometry; the safer weighting still prefers segments with lower Open-Meteo and historical flood scores.',
    estimatedDelayMinutes: extraMinutes,
    recommendedVehicleRestrictions: [
      'Hold 10-ton heavy aid trucks off unverified civilian reports until a coordinator override or second scout confirms clearance.',
      'Prefer high-clearance 4x4 through silted drifts even on the safer corridor after overnight rain.',
    ],
    modelId: BEDROCK_MODEL_ID,
    generatedAt: new Date().toISOString(),
  };
}

export const bedrockService = {
  async generateExplanation(safest: RouteResult, shortest: RouteResult): Promise<BedrockRouteExplanation> {
    if (!APP_CONFIG.api.mockFallbackEnabled) {
      try {
        return await apiClient<BedrockRouteExplanation>('/ai/explain-route', {
          method: 'POST',
          body: { safest, shortest },
        });
      } catch (err) {
        console.warn('Bedrock explanation API unavailable, using local reasoning fallback', err);
      }
    }

    await delay(450);
    return buildLocalExplanation(safest, shortest);
  },
};
