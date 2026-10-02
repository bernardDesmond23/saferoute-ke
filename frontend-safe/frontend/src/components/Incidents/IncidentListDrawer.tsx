import React from 'react';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { getVerificationBadge, getHazardDisplayName } from '../../utils/formatters';
import { X, ShieldCheck, ShieldAlert, Check, UserCheck, AlertTriangle } from 'lucide-react';
import './Incidents.css';

export const IncidentListDrawer: React.FC = () => {
  const {
    incidents,
    isIncidentDrawerOpen,
    toggleIncidentDrawer,
    toggleCoordinatorOverride,
  } = useSafeRoute();

  if (!isIncidentDrawerOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={toggleIncidentDrawer}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-row">
            <div className="drawer-icon-wrap">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3>Coordinator Verification Hub</h3>
              <p className="drawer-sub">Layered verification & manual road overrides</p>
            </div>
          </div>
          <button className="btn-close-drawer" onClick={toggleIncidentDrawer}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-banner">
          <AlertTriangle size={15} className="banner-icon" />
          <span>
            Only corroborated reports (2+) or coordinator overrides assign infinite Dijkstra cost to
            civilian-reported road segments.
          </span>
        </div>

        <div className="incident-feed">
          {incidents.length === 0 ? (
            <p className="empty-state">No hazard reports filed in the system.</p>
          ) : (
            incidents.map((incident) => {
              const badge = getVerificationBadge(incident.status);
              const isBlocked =
                incident.status === 'verified' ||
                incident.status === 'coordinator_override' ||
                incident.impassableForHeavyTrucks;

              return (
                <div
                  key={incident.id}
                  className={`incident-item-card ${isBlocked ? 'border-critical' : 'border-warning'}`}
                >
                  <div className="incident-card-top">
                    <div className="incident-road-info">
                      <span className="road-title">{incident.roadName}</span>
                      <span className="county-label">{incident.county} County</span>
                    </div>
                    <span
                      className="status-pill-badge"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="incident-meta-row">
                    <span className="hazard-type-tag">
                      {getHazardDisplayName(incident.hazardType)}
                    </span>
                    {incident.estimatedWaterDepthCm && (
                      <span className="water-depth-tag">
                        Depth: {incident.estimatedWaterDepthCm} cm
                      </span>
                    )}
                    <span className="corroboration-tag">
                      <UserCheck size={12} />
                      <span>{incident.corroborationCount} corroborations</span>
                    </span>
                  </div>

                  {incident.notes && <p className="incident-notes">"{incident.notes}"</p>}

                  <div className="incident-footer-row">
                    <span className="incident-timestamp">
                      Reported {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="override-action-group">
                      {isBlocked ? (
                        <button
                          className="btn-action-sm clear"
                          onClick={() => toggleCoordinatorOverride(incident.id, false)}
                          title="Override as passable: reduces segment penalty"
                        >
                          <Check size={13} />
                          <span>Clear / Passable</span>
                        </button>
                      ) : (
                        <button
                          className="btn-action-sm block"
                          onClick={() => toggleCoordinatorOverride(incident.id, true)}
                          title="Coordinator override: immediately sets segment cost to infinite"
                        >
                          <ShieldAlert size={13} />
                          <span>Set Impassable</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};
