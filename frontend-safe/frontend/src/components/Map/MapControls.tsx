import React from 'react';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { CloudRain, Layers, AlertCircle, GitCompare } from 'lucide-react';

export const MapControls: React.FC = () => {
  const { layers, toggleLayer } = useSafeRoute();

  return (
    <div className="map-controls-panel">
      <div className="controls-title">Risk Layers</div>

      <button
        className={`control-toggle-btn ${layers.showWeather ? 'active' : ''}`}
        onClick={() => toggleLayer('showWeather')}
        title="Toggle real-time Open-Meteo precipitation signals"
      >
        <CloudRain size={16} />
        <span>Live Weather</span>
      </button>

      <button
        className={`control-toggle-btn ${layers.showIncidents ? 'active' : ''}`}
        onClick={() => toggleLayer('showIncidents')}
        title="Toggle volunteer reports & submerged bridge flags"
      >
        <AlertCircle size={16} />
        <span>Hazard Markers</span>
      </button>

      <button
        className={`control-toggle-btn ${layers.showShortestComparison ? 'active' : ''}`}
        onClick={() => toggleLayer('showShortestComparison')}
        title="Show or hide standard Google Maps shortest route comparison"
      >
        <GitCompare size={16} />
        <span>Compare Shortest</span>
      </button>

      <button
        className={`control-toggle-btn ${layers.showFloodZones ? 'active' : ''}`}
        onClick={() => toggleLayer('showFloodZones')}
        title="Toggle historical river basin floodplains"
      >
        <Layers size={16} />
        <span>Flood Basins</span>
      </button>
    </div>
  );
};
