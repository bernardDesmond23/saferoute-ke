import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="map-legend">
      <div className="legend-title">Map legend</div>
      <div className="legend-item">
        <span className="legend-line safest" />
        <span>Flood-safe Dijkstra</span>
      </div>
      <div className="legend-item">
        <span className="legend-line shortest" />
        <span>Shortest (hazard exposed)</span>
      </div>
      <div className="legend-item">
        <span className="legend-swatch flood" />
        <span>River basin / floodplain</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot origin" />
        <span>Origin hub</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot dest" />
        <span>Destination hub</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot hazard" />
        <span>Volunteer / scout hazard</span>
      </div>
    </div>
  );
};
