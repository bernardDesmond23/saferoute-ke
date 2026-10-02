import React, { useState } from 'react';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { HazardType, IncidentSeverity, NewIncidentSubmission } from '../../types';
import { X, ShieldAlert, CheckCircle2, Phone, AlertTriangle } from 'lucide-react';
import './Incidents.css';

export const IncidentReportModal: React.FC = () => {
  const { isReportModalOpen, closeReportModal, submitVolunteerReport } = useSafeRoute();

  const [roadName, setRoadName] = useState('');
  const [county, setCounty] = useState('Garissa');
  const [hazardType, setHazardType] = useState<HazardType>('submerged_bridge');
  const [severity, setSeverity] = useState<IncidentSeverity>('impassable');
  const [reporterPhone, setReporterPhone] = useState('+254711122334');
  const [estimatedWaterDepthCm, setEstimatedWaterDepthCm] = useState<number>(65);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReportModalOpen) return null;

  const isRedCrossPhone = reporterPhone.replace(/\s+/g, '') === '+254711122334';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadName.trim()) return;

    setIsSubmitting(true);
    try {
      const submission: NewIncidentSubmission = {
        roadName,
        county,
        coordinates: [39.6402 + (Math.random() - 0.5) * 0.1, -0.4578 + (Math.random() - 0.5) * 0.1],
        hazardType,
        severity,
        reporterPhone,
        estimatedWaterDepthCm,
        notes,
      };

      await submitVolunteerReport(submission);
      closeReportModal();
    } catch (err) {
      console.error('Failed to submit volunteer report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeReportModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3>Field Hazard Report (WhatsApp / Scout Form)</h3>
              <p className="modal-sub">Direct input layer into DynamoDB & Dijkstra engine</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={closeReportModal}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Quick Preset Buttons for Testers */}
          <div className="preset-strip">
            <span className="preset-label">Test Layered Trust:</span>
            <button
              type="button"
              className={`preset-btn ${isRedCrossPhone ? 'active' : ''}`}
              onClick={() => {
                setReporterPhone('+254711122334');
                setRoadName('Madogo - Garissa Tana Crossing');
                setHazardType('submerged_bridge');
                setSeverity('impassable');
                setEstimatedWaterDepthCm(75);
              }}
            >
              <CheckCircle2 size={13} className="text-emerald" />
              <span>Red Cross Scout (Auto-Trusted)</span>
            </button>
            <button
              type="button"
              className={`preset-btn ${!isRedCrossPhone ? 'active' : ''}`}
              onClick={() => {
                setReporterPhone('+254799888777');
                setRoadName('Kisumu-Mamboleo Feeder Road');
                setHazardType('deep_mud');
                setSeverity('moderate');
                setEstimatedWaterDepthCm(25);
              }}
            >
              <AlertTriangle size={13} className="text-amber" />
              <span>Civilian (Needs Corroboration)</span>
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Road / Bridge Name</label>
              <input
                type="text"
                required
                className="text-input"
                placeholder="e.g. Garissa-Madogo Tana River Bridge"
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>County</label>
              <select
                className="text-input"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              >
                <option value="Garissa">Garissa</option>
                <option value="Tana River">Tana River</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Turkana">Turkana</option>
                <option value="Narok">Narok</option>
                <option value="Baringo">Baringo</option>
                <option value="Kilifi">Kilifi</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Hazard Type</label>
              <select
                className="text-input"
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value as HazardType)}
              >
                <option value="submerged_bridge">🌊 Submerged Bridge (Infinite Cost Avoid)</option>
                <option value="road_washout">🚧 Road Washout / Culvert Destroyed</option>
                <option value="river_overflow">🌊 River Basin Overflow</option>
                <option value="deep_mud">🚜 Deep Mud / Silted Drift</option>
                <option value="landslide">⛰️ Escarpment Landslide</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select
                className="text-input"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              >
                <option value="impassable">⛔ Impassable (Full Blockage)</option>
                <option value="severe">⚠️ Severe (High Clearance 4x4 Only)</option>
                <option value="moderate">🟡 Moderate (Passable with Caution)</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                <Phone size={13} />
                <span>Reporter Phone Number</span>
              </label>
              <input
                type="text"
                required
                className="text-input"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
              />
              <div className="field-hint">
                {isRedCrossPhone ? (
                  <span className="text-emerald">✓ Pre-registered Red Cross scout (auto-trusted)</span>
                ) : (
                  <span className="text-slate">Civilian report: sets segment warning (requires 2+ reports or override to block)</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Estimated Water Depth (cm)</label>
              <input
                type="number"
                min="0"
                max="300"
                className="text-input"
                value={estimatedWaterDepthCm}
                onChange={(e) => setEstimatedWaterDepthCm(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Field Notes / Ground Observations</label>
            <textarea
              rows={2}
              className="text-input textarea"
              placeholder="e.g. Fast current crossing concrete drift, two 2WD vehicles stuck, safe bypass via upper ridge recommended..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={closeReportModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Transmitting to DynamoDB...' : 'Broadcast Ground Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
