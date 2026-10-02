import React from 'react';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { CloudRain, Radio, Droplets, AlertTriangle } from 'lucide-react';
import './Weather.css';

export const WeatherStatusCard: React.FC = () => {
  const { weatherSync } = useSafeRoute();

  if (!weatherSync) return null;

  const lastSyncDate = new Date(weatherSync.lastSyncTime);

  return (
    <div className="weather-status-card">
      <div className="weather-header">
        <div className="weather-title-row">
          <CloudRain className="weather-icon" size={17} />
          <div>
            <h3 className="weather-title">Open-Meteo Dynamic Weather</h3>
            <span className="sync-provider">AWS EventBridge 30m Cron Poll</span>
          </div>
        </div>
        <div className="live-sync-indicator" title="Connected to Open-Meteo via AWS EventBridge">
          <Radio size={12} className="pulse-radio" />
          <span>Synced {lastSyncDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="basin-grid">
        {weatherSync.basins.map((basin) => (
          <div
            key={basin.basinName}
            className={`basin-chip ${basin.flashFloodAlert ? 'alert-active' : ''}`}
          >
            <div className="basin-name-row">
              <span className="basin-name">{basin.basinName}</span>
              {basin.flashFloodAlert && (
                <span className="alert-badge">
                  <AlertTriangle size={11} />
                  <span>ALERT</span>
                </span>
              )}
            </div>

            <div className="basin-metrics">
              <div className="precip-stat">
                <Droplets size={12} className="droplet-icon" />
                <span>{basin.currentPrecipitationMm} mm rain</span>
              </div>
              <span className={`stage-tag ${basin.riverStage}`}>{basin.riverStage.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
