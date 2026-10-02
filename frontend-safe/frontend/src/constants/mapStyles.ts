import { StyleSpecification } from 'maplibre-gl';

export const KENYA_CENTER: [number, number] = [37.8, 0.3]; // [lng, lat]
export const KENYA_DEFAULT_ZOOM = 6.8;

// Free, open-source OpenStreetMap raster tile source (No API key, No watermark)
export const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export const KENYA_BOUNDS: [[number, number], [number, number]] = [
  [33.9098, -4.7246], // Southwest
  [41.9069, 5.0334],  // Northeast
];
