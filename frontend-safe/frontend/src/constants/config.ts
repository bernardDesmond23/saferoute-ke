export const APP_CONFIG = {
  appName: 'SafeRoute KE',
  subTitle: 'Humanitarian Flood-Aware Routing Engine',
  version: '1.0.0',
  api: {
    // AWS API Gateway endpoint routing to Python Lambda microservice
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.saferoute-ke.emergency.kenya/v1',
    mockFallbackEnabled: true, // Seamlessly falls back to simulated Dijkstra network when offline or developing
    timeoutMs: 15000,
  },
  weatherSyncIntervalMs: 30 * 60 * 1000, // 30 minutes (matches EventBridge cron)
  riskFactors: {
    staticWeight: 0.35,  // Historical washout weight
    dynamicWeight: 0.40, // Live Open-Meteo precipitation weight
    triggerWeight: 0.25, // Corroborated field volunteer reports
    submergedRoadMultiplier: 9999.0, // Infinite Dijkstra cost penalty to trigger automatic bypass
  },
  emergencyContacts: {
    redCrossDispatchPhone: '+254 700 000 000',
    tollFreeEmergency: '1199',
  }
};
