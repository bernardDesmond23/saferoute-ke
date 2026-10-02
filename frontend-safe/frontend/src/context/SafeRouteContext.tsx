import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  LocationPoint, 
  VehicleType, 
  RouteResult, 
  IncidentReport, 
  NewIncidentSubmission, 
  WeatherSyncState, 
  BedrockRouteExplanation 
} from '../types';
import { KENYA_RELIEF_HUBS } from '../constants/kenyaLocations';
import { routingService } from '../services/routingService';
import { incidentService } from '../services/incidentService';
import { weatherService } from '../services/weatherService';
import { bedrockService } from '../services/bedrockService';

export interface MapLayerVisibility {
  showWeather: boolean;
  showFloodZones: boolean;
  showIncidents: boolean;
  showShortestComparison: boolean;
}

interface SafeRouteContextType {
  origin: LocationPoint;
  destination: LocationPoint;
  vehicleType: VehicleType;
  safestRoute: RouteResult | null;
  shortestRoute: RouteResult | null;
  selectedRouteTab: 'safest' | 'shortest';
  isComputingRoute: boolean;
  incidents: IncidentReport[];
  weatherSync: WeatherSyncState | null;
  bedrockExplanation: BedrockRouteExplanation | null;
  isBedrockLoading: boolean;
  layers: MapLayerVisibility;
  isReportModalOpen: boolean;
  isIncidentDrawerOpen: boolean;
  setOrigin: (point: LocationPoint) => void;
  setDestination: (point: LocationPoint) => void;
  setVehicleType: (type: VehicleType) => void;
  setSelectedRouteTab: (tab: 'safest' | 'shortest') => void;
  toggleLayer: (layerKey: keyof MapLayerVisibility) => void;
  computeRoute: () => Promise<void>;
  submitVolunteerReport: (submission: NewIncidentSubmission) => Promise<void>;
  toggleCoordinatorOverride: (incidentId: string, impassable: boolean) => Promise<void>;
  openReportModal: () => void;
  closeReportModal: () => void;
  toggleIncidentDrawer: () => void;
}

const SafeRouteContext = createContext<SafeRouteContextType | undefined>(undefined);

export const SafeRouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [origin, setOrigin] = useState<LocationPoint>(KENYA_RELIEF_HUBS[0]);
  const [destination, setDestination] = useState<LocationPoint>(KENYA_RELIEF_HUBS[1]);
  const [vehicleType, setVehicleType] = useState<VehicleType>('heavy_aid_truck');
  
  const [safestRoute, setSafestRoute] = useState<RouteResult | null>(null);
  const [shortestRoute, setShortestRoute] = useState<RouteResult | null>(null);
  const [selectedRouteTab, setSelectedRouteTab] = useState<'safest' | 'shortest'>('safest');
  const [isComputingRoute, setIsComputingRoute] = useState(false);

  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [weatherSync, setWeatherSync] = useState<WeatherSyncState | null>(null);
  const [bedrockExplanation, setBedrockExplanation] = useState<BedrockRouteExplanation | null>(null);
  const [isBedrockLoading, setIsBedrockLoading] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isIncidentDrawerOpen, setIsIncidentDrawerOpen] = useState(false);

  const [layers, setLayers] = useState<MapLayerVisibility>({
    showWeather: true,
    showFloodZones: true,
    showIncidents: true,
    showShortestComparison: true,
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [loadedIncidents, loadedWeather] = await Promise.all([
          incidentService.getIncidents(),
          weatherService.getSyncState(),
        ]);
        setIncidents(loadedIncidents);
        setWeatherSync(loadedWeather);
      } catch (err) {
        console.error('Failed to load initial context data:', err);
      }
    }
    loadInitialData();
  }, []);

  const computeRoute = useCallback(async () => {
    setIsComputingRoute(true);
    setIsBedrockLoading(true);
    try {
      const response = await routingService.computeRoutes({
        origin,
        destination,
        vehicleType,
        avoidImpassable: true,
      });

      setSafestRoute(response.safest);
      setShortestRoute(response.shortest);
      setSelectedRouteTab('safest');

      const aiExplanation = await bedrockService.generateExplanation(
        response.safest,
        response.shortest
      );
      setBedrockExplanation(aiExplanation);
    } catch (err) {
      console.error('Error computing flood-safe route:', err);
    } finally {
      setIsComputingRoute(false);
      setIsBedrockLoading(false);
    }
  }, [origin, destination, vehicleType]);

  useEffect(() => {
    computeRoute();
  }, [computeRoute]);

  const submitVolunteerReport = async (submission: NewIncidentSubmission) => {
    const created = await incidentService.submitIncident(submission);
    setIncidents((prev) => [created, ...prev]);
    if (created.impassableForHeavyTrucks || created.hazardType === 'submerged_bridge') {
      await computeRoute();
    }
  };

  const toggleCoordinatorOverride = async (incidentId: string, impassable: boolean) => {
    const updated = await incidentService.toggleCoordinatorOverride(incidentId, impassable);
    if (updated) {
      setIncidents((prev) => prev.map((inc) => (inc.id === incidentId ? updated : inc)));
      await computeRoute();
    }
  };

  const toggleLayer = (layerKey: keyof MapLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <SafeRouteContext.Provider
      value={{
        origin,
        destination,
        vehicleType,
        safestRoute,
        shortestRoute,
        selectedRouteTab,
        isComputingRoute,
        incidents,
        weatherSync,
        bedrockExplanation,
        isBedrockLoading,
        layers,
        isReportModalOpen,
        isIncidentDrawerOpen,
        setOrigin,
        setDestination,
        setVehicleType,
        setSelectedRouteTab,
        toggleLayer,
        computeRoute,
        submitVolunteerReport,
        toggleCoordinatorOverride,
        openReportModal: () => setIsReportModalOpen(true),
        closeReportModal: () => setIsReportModalOpen(false),
        toggleIncidentDrawer: () => setIsIncidentDrawerOpen((prev) => !prev),
      }}
    >
      {children}
    </SafeRouteContext.Provider>
  );
};

export const useSafeRoute = () => {
  const context = useContext(SafeRouteContext);
  if (!context) {
    throw new Error('useSafeRoute must be used within a SafeRouteProvider');
  }
  return context;
};
