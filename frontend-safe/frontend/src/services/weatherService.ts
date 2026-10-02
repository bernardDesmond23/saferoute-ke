import { WeatherSyncState } from '../types';
import { apiClient } from './api';
import { APP_CONFIG } from '../constants/config';

export const weatherService = {
  async getSyncState(): Promise<WeatherSyncState> {
    if (!APP_CONFIG.api.mockFallbackEnabled) {
      try {
        return await apiClient<WeatherSyncState>('/weather/status');
      } catch (err) {
        console.warn('Backend unavailable, using simulated Open-Meteo state');
      }
    }

    const now = new Date();
    const nextSync = new Date(now.getTime() + 18 * 60 * 1000);

    return {
      lastSyncTime: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
      nextSyncDue: nextSync.toISOString(),
      provider: 'Open-Meteo API (AWS EventBridge 30m Poll)',
      activeWarningCount: 3,
      basins: [
        {
          basinName: 'Lower Tana River Catchment',
          county: 'Garissa & Tana River',
          coordinates: [39.6460, -0.4532],
          currentPrecipitationMm: 48.5,
          forecast24hPrecipitationMm: 112.0,
          flashFloodAlert: true,
          riverStage: 'overflow',
          updatedAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        },
        {
          basinName: 'Nyando River Basin',
          county: 'Kisumu',
          coordinates: [34.9197, -0.1742],
          currentPrecipitationMm: 36.2,
          forecast24hPrecipitationMm: 85.0,
          flashFloodAlert: true,
          riverStage: 'danger',
          updatedAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        },
        {
          basinName: 'Athi - Galana - Sabaki Basin',
          county: 'Machakos & Kilifi',
          coordinates: [37.2634, -1.5177],
          currentPrecipitationMm: 18.0,
          forecast24hPrecipitationMm: 42.5,
          flashFloodAlert: false,
          riverStage: 'alert',
          updatedAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        },
        {
          basinName: 'Turkwel & Kerio Valleys',
          county: 'Turkana & Baringo',
          coordinates: [35.5973, 2.5000],
          currentPrecipitationMm: 29.8,
          forecast24hPrecipitationMm: 68.0,
          flashFloodAlert: true,
          riverStage: 'alert',
          updatedAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        },
      ],
    };
  },
};
