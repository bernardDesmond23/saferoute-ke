import React from 'react';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { KENYA_RELIEF_HUBS } from '../../constants/kenyaLocations';
import { VehicleType } from '../../types';
import { ArrowUpDown, Info, Navigation } from 'lucide-react';
import './Routing.css';

const VEHICLES: Array<{ type: VehicleType; name: string; desc: string }> = [
  { type: 'heavy_aid_truck', name: 'Heavy aid', desc: '10-ton, low clearance' },
  { type: 'truck_4x4', name: '4x4 truck', desc: 'High clearance' },
  { type: 'light_van', name: 'Light van', desc: 'Scout / medical' },
];

export const RoutePlanner: React.FC = () => {
  const {
    origin,
    destination,
    vehicleType,
    isComputingRoute,
    setOrigin,
    setDestination,
    setVehicleType,
    computeRoute,
  } = useSafeRoute();

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <section className="route-planner-card">
      <div className="planner-header">
        <h2 className="planner-title">Mission routing</h2>
        <span className="dijkstra-tag">Dijkstra × risk_factor</span>
      </div>

      <form
        className="planner-form"
        onSubmit={(event) => {
          event.preventDefault();
          void computeRoute();
        }}
      >
        <div className="input-group">
          <label className="input-label">
            <span className="dot origin-dot" />
            Origin logistics hub
          </label>
          <select
            className="select-input"
            value={origin.id}
            onChange={(event) => {
              const next = KENYA_RELIEF_HUBS.find((hub) => hub.id === event.target.value);
              if (next) setOrigin(next);
            }}
          >
            {KENYA_RELIEF_HUBS.map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="swap-row">
          <button type="button" className="swap-btn" onClick={handleSwap} title="Swap origin and destination">
            <ArrowUpDown size={14} />
          </button>
        </div>

        <div className="input-group">
          <label className="input-label">
            <span className="dot dest-dot" />
            Destination
          </label>
          <select
            className="select-input"
            value={destination.id}
            onChange={(event) => {
              const next = KENYA_RELIEF_HUBS.find((hub) => hub.id === event.target.value);
              if (next) setDestination(next);
            }}
          >
            {KENYA_RELIEF_HUBS.map((hub) => (
              <option key={`dest-${hub.id}`} value={hub.id}>
                {hub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="vehicle-section">
          <span className="input-label">Fleet profile</span>
          <div className="vehicle-chips">
            {VEHICLES.map((vehicle) => (
              <button
                key={vehicle.type}
                type="button"
                className={`vehicle-chip ${vehicleType === vehicle.type ? 'active' : ''}`}
                onClick={() => setVehicleType(vehicle.type)}
              >
                <div className="chip-name">{vehicle.name}</div>
                <div className="chip-desc">{vehicle.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-compute-route" disabled={isComputingRoute}>
          {isComputingRoute ? <span className="spinner" /> : <Navigation size={16} />}
          {isComputingRoute ? 'Computing flood-safe path…' : 'Compute flood-safe route'}
        </button>
      </form>

      <p className="planner-footer-tip">
        <Info size={13} className="tip-icon" />
        Impassable volunteer-verified segments receive infinite Dijkstra cost and are auto-bypassed.
      </p>
    </section>
  );
};
