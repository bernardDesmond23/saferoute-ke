import React from 'react';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { formatDistance, formatDuration, getRiskColor } from '../../utils/formatters';
import { AlertTriangle, CheckCircle2, Clock, Route, Shield } from 'lucide-react';
import './Routing.css';

export const RouteComparison: React.FC = () => {
  const { safestRoute, shortestRoute, selectedRouteTab, setSelectedRouteTab, isComputingRoute } = useSafeRoute();
  const active = selectedRouteTab === 'safest' ? safestRoute : shortestRoute;

  if (!safestRoute && !shortestRoute) {
    return (
      <section className="route-comparison-card">
        <div className="route-active-details">
          <p className="hazard-caption">
            {isComputingRoute ? 'Scoring Kenyan corridors…' : 'Compute a route to compare flood-safe vs shortest path.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="route-comparison-card">
      <div className="route-tabs">
        <button
          className={`route-tab safest ${selectedRouteTab === 'safest' ? 'active' : ''}`}
          onClick={() => setSelectedRouteTab('safest')}
        >
          <span className="tab-title-row">
            <Shield size={14} />
            Flood-safe
          </span>
          <span className="tab-badge-safest">Recommended</span>
        </button>
        <button
          className={`route-tab shortest ${selectedRouteTab === 'shortest' ? 'active' : ''}`}
          onClick={() => setSelectedRouteTab('shortest')}
        >
          <span className="tab-title-row">
            <Route size={14} />
            Shortest
          </span>
          <span className="tab-badge-danger">Hazard exposed</span>
        </button>
      </div>

      {active && (
        <div className="route-active-details">
          <div className="metric-row">
            <div className="metric-box">
              <div className="metric-label">Distance</div>
              <div className="metric-value">{formatDistance(active.totalDistanceKm)}</div>
              <div className="metric-sub">{active.floodZonesAvoided} basins avoided</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">
                <Clock size={12} />
                ETA
              </div>
              <div className="metric-value">{formatDuration(active.estimatedDurationMinutes)}</div>
              <div className="metric-sub">Includes weather buffer</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Risk</div>
              <div className="metric-value" style={{ color: getRiskColor(active.riskLevel) }}>
                {active.aggregateRiskScore}
              </div>
              <div className="metric-sub text-amber">{active.riskLevel}</div>
            </div>
          </div>

          <div className="hazard-breakdown-box">
            <div className="hazard-indicator">
              {active.type === 'safest' ? (
                <CheckCircle2 size={16} className="status-icon success" />
              ) : (
                <AlertTriangle size={16} className="status-icon danger" />
              )}
              <div>
                <div className="hazard-title">
                  {active.type === 'safest'
                    ? 'Submerged bridges bypassed'
                    : `${active.submergedBridgesEncountered} submerged crossing(s) on path`}
                </div>
                <div className="hazard-caption">
                  {active.title}. Combined Dijkstra cost uses static, Open-Meteo, and volunteer trigger risk.
                </div>
              </div>
            </div>
          </div>

          {active.type === 'shortest' && (
            <div className="standard-route-warning">
              <AlertTriangle size={15} className="warning-icon" />
              Standard shortest routing would send a heavy aid truck through a verified impassable segment.
            </div>
          )}
        </div>
      )}
    </section>
  );
};
