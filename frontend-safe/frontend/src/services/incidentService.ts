import { IncidentReport, NewIncidentSubmission } from '../types';
import { apiClient } from './api';
import { APP_CONFIG } from '../constants/config';

const RED_CROSS_SCOUT_PHONE = '+254711122334';

const seedIncidents: IncidentReport[] = [
  {
    id: 'inc-tana-bridge',
    roadName: 'Madogo - Garissa Tana Crossing',
    county: 'Garissa',
    coordinates: [39.6402, -0.4578],
    hazardType: 'submerged_bridge',
    severity: 'impassable',
    status: 'verified',
    reporterPhone: RED_CROSS_SCOUT_PHONE,
    isRedCrossRegistered: true,
    corroborationCount: 4,
    reportedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    notes: 'Fast current over deck; two 2WD vehicles stranded on the far bank.',
    estimatedWaterDepthCm: 75,
    impassableForHeavyTrucks: true,
  },
  {
    id: 'inc-ahero',
    roadName: 'Ahero Nyando River Crossing',
    county: 'Kisumu',
    coordinates: [34.9197, -0.1742],
    hazardType: 'river_overflow',
    severity: 'severe',
    status: 'corroborated',
    reporterPhone: '+254722334455',
    isRedCrossRegistered: false,
    corroborationCount: 3,
    reportedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    notes: 'Lake Victoria backflow covering both lanes of the Kisumu feeder.',
    estimatedWaterDepthCm: 48,
    impassableForHeavyTrucks: true,
  },
  {
    id: 'inc-suswa',
    roadName: 'Mai Mahiu - Suswa Faultline',
    county: 'Narok',
    coordinates: [36.4255, -0.9984],
    hazardType: 'road_washout',
    severity: 'severe',
    status: 'unverified',
    reporterPhone: '+254799888777',
    isRedCrossRegistered: false,
    corroborationCount: 1,
    reportedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    notes: 'Fresh silt fissure across tarmac; civilian report only.',
    estimatedWaterDepthCm: 20,
    impassableForHeavyTrucks: false,
  },
  {
    id: 'inc-turkana',
    roadName: 'Lodwar - Kalokol feeder drift',
    county: 'Turkana',
    coordinates: [35.62, 3.18],
    hazardType: 'deep_mud',
    severity: 'moderate',
    status: 'cleared',
    reporterPhone: RED_CROSS_SCOUT_PHONE,
    isRedCrossRegistered: true,
    corroborationCount: 2,
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    notes: 'Coordinator confirmed passable after overnight drop in river stage.',
    estimatedWaterDepthCm: 12,
    impassableForHeavyTrucks: false,
  },
];

let localIncidents: IncidentReport[] = [...seedIncidents];

function classifySubmission(submission: NewIncidentSubmission): Pick<
  IncidentReport,
  'status' | 'isRedCrossRegistered' | 'impassableForHeavyTrucks' | 'corroborationCount'
> {
  const normalized = submission.reporterPhone.replace(/\s+/g, '');
  const isRedCrossRegistered = normalized === RED_CROSS_SCOUT_PHONE;
  const blocksRoad =
    isRedCrossRegistered &&
    (submission.severity === 'impassable' || submission.hazardType === 'submerged_bridge');

  return {
    status: isRedCrossRegistered ? 'verified' : 'unverified',
    isRedCrossRegistered,
    impassableForHeavyTrucks: blocksRoad,
    corroborationCount: isRedCrossRegistered ? 1 : 1,
  };
}

export const incidentService = {
  async getIncidents(): Promise<IncidentReport[]> {
    if (!APP_CONFIG.api.mockFallbackEnabled) {
      try {
        return await apiClient<IncidentReport[]>('/incidents');
      } catch (err) {
        console.warn('Incident API unavailable, using local hazard cache', err);
      }
    }
    return [...localIncidents];
  },

  async submitIncident(submission: NewIncidentSubmission): Promise<IncidentReport> {
    if (!APP_CONFIG.api.mockFallbackEnabled) {
      try {
        return await apiClient<IncidentReport>('/incidents', {
          method: 'POST',
          body: submission,
        });
      } catch (err) {
        console.warn('Incident submit failed, writing to local cache', err);
      }
    }

    const created: IncidentReport = {
      id: `inc-${Date.now()}`,
      ...submission,
      ...classifySubmission(submission),
      reportedAt: new Date().toISOString(),
    };

    localIncidents = [created, ...localIncidents];
    return created;
  },

  async toggleCoordinatorOverride(incidentId: string, impassable: boolean): Promise<IncidentReport | null> {
    if (!APP_CONFIG.api.mockFallbackEnabled) {
      try {
        return await apiClient<IncidentReport>(`/incidents/${incidentId}/override`, {
          method: 'PATCH',
          body: { impassable },
        });
      } catch (err) {
        console.warn('Override API unavailable, applying local coordinator action', err);
      }
    }

    const existing = localIncidents.find((incident) => incident.id === incidentId);
    if (!existing) return null;

    const updated: IncidentReport = {
      ...existing,
      status: impassable ? 'coordinator_override' : 'cleared',
      impassableForHeavyTrucks: impassable,
    };

    localIncidents = localIncidents.map((incident) => (incident.id === incidentId ? updated : incident));
    return updated;
  },
};
