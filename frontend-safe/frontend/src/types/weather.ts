export interface RiverBasinWeather {
  basinName: string;
  county: string;
  coordinates: [number, number];
  currentPrecipitationMm: number;
  forecast24hPrecipitationMm: number;
  flashFloodAlert: boolean;
  riverStage: 'normal' | 'alert' | 'danger' | 'overflow';
  updatedAt: string;
}

export interface WeatherSyncState {
  lastSyncTime: string;
  nextSyncDue: string;
  provider: string;
  activeWarningCount: number;
  basins: RiverBasinWeather[];
}
