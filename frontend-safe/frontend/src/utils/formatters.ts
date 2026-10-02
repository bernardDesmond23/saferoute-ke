import { VerificationStatus } from '../types';

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) {
    return `${mins} min`;
  }
  return `${hrs}h ${mins}m`;
}

export function getRiskColor(level: 'low' | 'moderate' | 'high' | 'critical' | 'impassable'): string {
  switch (level) {
    case 'low':
      return '#10b981'; // Green
    case 'moderate':
      return '#f59e0b'; // Amber
    case 'high':
      return '#f97316'; // Orange
    case 'critical':
      return '#ef4444'; // Red
    case 'impassable':
      return '#991b1b'; // Dark Crimson / Blocked
    default:
      return '#64748b';
  }
}

export function getVerificationBadge(status: VerificationStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'verified':
      return {
        label: 'Red Cross Verified',
        color: '#dc2626',
        bg: '#fee2e2',
      };
    case 'coordinator_override':
      return {
        label: 'Coordinator Override',
        color: '#7c3aed',
        bg: '#ede9fe',
      };
    case 'corroborated':
      return {
        label: 'Corroborated (2+ Reports)',
        color: '#d97706',
        bg: '#fef3c7',
      };
    case 'unverified':
      return {
        label: 'Unverified (Civilian)',
        color: '#475569',
        bg: '#f1f5f9',
      };
    case 'cleared':
      return {
        label: 'Cleared / Passable',
        color: '#16a34a',
        bg: '#dcfce7',
      };
  }
}

export function getHazardDisplayName(type: string): string {
  const map: Record<string, string> = {
    submerged_bridge: 'Submerged Bridge',
    road_washout: 'Road Washout / Cut Off',
    deep_mud: 'Deep Mud / Silted Drift',
    river_overflow: 'River Flash Flood',
    landslide: 'Escarpment Landslide',
    debris_blockage: 'Debris / Fallen Tree',
  };
  return map[type] || type.replace('_', ' ');
}
