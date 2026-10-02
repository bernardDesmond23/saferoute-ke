import { LocationPoint } from '../types';

export const KENYA_RELIEF_HUBS: LocationPoint[] = [
  {
    id: 'nairobi_kr_hq',
    name: 'Nairobi Central Red Cross Logistics Hub',
    county: 'Nairobi',
    coordinates: [36.8172, -1.2864],
    description: 'Primary National Relief Warehouse & Fleet Dispatch',
    isDepot: true,
  },
  {
    id: 'garissa_depot',
    name: 'Garissa Emergency Operations Centre',
    county: 'Garissa',
    coordinates: [39.6460, -0.4532],
    description: 'Critical hub for Northern & Eastern flood response along Tana River',
    isDepot: true,
  },
  {
    id: 'kisumu_logistics',
    name: 'Kisumu Western Regional Hub',
    county: 'Kisumu',
    coordinates: [34.7680, -0.0917],
    description: 'Nyando Basin and Lake Victoria flood relief staging area',
    isDepot: true,
  },
  {
    id: 'dadaab_refugee_camp',
    name: 'Dadaab Humanitarian Aid Compound',
    county: 'Garissa',
    coordinates: [40.3015, 0.0543],
    description: 'UNHCR / KRCS distribution post for refugee settlements',
    isDepot: true,
  },
  {
    id: 'mombasa_port',
    name: 'Mombasa Port Relief Grain Depot',
    county: 'Mombasa',
    coordinates: [39.6682, -4.0435],
    description: 'Maritime aid inbound reception & coastal logistics',
    isDepot: true,
  },
  {
    id: 'lodwar_hub',
    name: 'Lodwar Turkana Relief Sub-Base',
    county: 'Turkana',
    coordinates: [35.5973, 3.1191],
    description: 'North-Western emergency food and medical store',
    isDepot: true,
  },
  {
    id: 'isiolo_transit',
    name: 'Isiolo Gateway Transit Post',
    county: 'Isiolo',
    coordinates: [37.5822, 0.3546],
    description: 'Transit hub connecting Central Kenya to Northern Corridors',
    isDepot: true,
  },
];

export const FLOOD_PRONE_CHOKEPOINTS = [
  {
    id: 'mororo_bridge',
    name: 'Mororo / Garissa Tana Bridge',
    county: 'Tana River / Garissa',
    coordinates: [39.6402, -0.4578] as [number, number],
    type: 'bridge',
    vulnerabilityNote: 'Tana river overflows annually, cutting off Garissa-Madogo highway',
  },
  {
    id: 'ahero_nyando_bridge',
    name: 'Ahero Nyando River Crossing',
    county: 'Kisumu',
    coordinates: [34.9197, -0.1742] as [number, number],
    type: 'bridge',
    vulnerabilityNote: 'Severe backflow from Lake Victoria submerging the main Kisumu-Nairobi A104 branch',
  },
  {
    id: 'suswa_gully',
    name: 'Mai Mahiu - Suswa Faultline Gully',
    county: 'Narok',
    coordinates: [36.4255, -0.9984] as [number, number],
    type: 'roadway',
    vulnerabilityNote: 'Flash floods rapidly tear volcanic soil silt fissures across tarmac',
  },
  {
    id: 'mwatate_culvert',
    name: 'Mwatate Voi Dry River Culvert',
    county: 'Taita Taveta',
    coordinates: [38.3752, -3.5042] as [number, number],
    type: 'culvert',
    vulnerabilityNote: 'Heavy downpours in Taita hills cause torrential mud surges over low-level drifts',
  },
];

