import React from 'react';
import { useSafeRoute } from '../../context/SafeRouteContext';
import { APP_CONFIG } from '../../constants/config';
import { ShieldAlert, ClipboardList, Phone, Radio } from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
  const { openReportModal, toggleIncidentDrawer, incidents, weatherSync } = useSafeRoute();
  const activeHazards = incidents.filter(
    (incident) => incident.status !== 'cleared' && incident.impassableForHeavyTrucks
  ).length;

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-crest">KRCS</div>
        <div>
          <h1 className="header-title">{APP_CONFIG.appName}</h1>
          <p className="header-subtitle">{APP_CONFIG.subTitle}</p>
        </div>
      </div>

      <div className="header-status">
        <span className="header-pill">
          <Radio size={13} />
          {weatherSync ? `${weatherSync.activeWarningCount} basin alerts` : 'Weather syncing'}
        </span>
        <span className="header-pill danger">{activeHazards} blocked segments</span>
      </div>

      <div className="header-actions">
        <a className="header-phone" href={`tel:${APP_CONFIG.emergencyContacts.tollFreeEmergency}`}>
          <Phone size={14} />
          Dispatch {APP_CONFIG.emergencyContacts.redCrossDispatchPhone}
        </a>
        <button className="header-btn ghost" onClick={toggleIncidentDrawer}>
          <ClipboardList size={16} />
          Coordinator Hub
        </button>
        <button className="header-btn primary" onClick={openReportModal}>
          <ShieldAlert size={16} />
          Report Hazard
        </button>
      </div>
    </header>
  );
};
