import React, { useState } from 'react';
import { SafeRouteProvider } from './context/SafeRouteContext';
import { Header } from './components/Header/Header';
import { MapView } from './components/Map/MapView';
import { RoutePlanner } from './components/Routing/RoutePlanner';
import { RouteComparison } from './components/Routing/RouteComparison';
import { BedrockExplanation } from './components/Routing/BedrockExplanation';
import { WeatherStatusCard } from './components/Weather/WeatherStatusCard';
import { IncidentReportModal } from './components/Incidents/IncidentReportModal';
import { IncidentListDrawer } from './components/Incidents/IncidentListDrawer';
import { LandingPage } from './components/Landing/LandingPage';
import './App.css';

const MainLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        {/* Left Sidebar Control Panel */}
        <aside className="app-sidebar">
          <RoutePlanner />
          <RouteComparison />
          <BedrockExplanation />
          <WeatherStatusCard />
        </aside>

        {/* Center / Full Map Area */}
        <main className="app-main-map">
          <MapView />
        </main>
      </div>

      {/* Floating Overlays / Modals */}
      <IncidentReportModal />
      <IncidentListDrawer />
    </div>
  );
};

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return <LandingPage onLaunch={() => setShowDashboard(true)} />;
  }

  return (
    <SafeRouteProvider>
      <MainLayout />
    </SafeRouteProvider>
  );
}

export default App;