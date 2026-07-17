import type { StyleSpecification } from 'maplibre-gl'

export const INITIAL_MAP_VIEW = Object.freeze({
  longitude: 28,
  latitude: 37,
  zoom: 3.5,
  bearing: 0,
  pitch: 0,
})

export const MAP_ZOOM_LIMITS = Object.freeze({ minZoom: 1.5, maxZoom: 7 })

export const MAPLIBRE_ATTRIBUTION =
  '<a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre</a>'

export const NATURAL_EARTH_ATTRIBUTION =
  '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Made with Natural Earth</a>'

const naturalEarthSource = (data: string) => ({
  type: 'geojson' as const,
  data,
  attribution: NATURAL_EARTH_ATTRIBUTION,
  maxzoom: 7,
})

export const PHYSICAL_BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'EraByEra Natural Earth Physical',
  metadata: {
    'erabyera:purpose': 'physical-only',
    'erabyera:data-source': 'Natural Earth 1:110m physical vectors',
    'erabyera:excluded': [
      'administrative-boundaries',
      'political-boundaries',
      'settlement-labels',
      'transport-labels',
    ],
  },
  sources: {
    'natural-earth-land': naturalEarthSource(
      '/map-data/ne_110m_land.geojson',
    ),
    'natural-earth-lakes': naturalEarthSource(
      '/map-data/ne_110m_lakes.geojson',
    ),
    'natural-earth-rivers': naturalEarthSource(
      '/map-data/ne_110m_rivers_lake_centerlines.geojson',
    ),
    'natural-earth-coastline': naturalEarthSource(
      '/map-data/ne_110m_coastline.geojson',
    ),
  },
  layers: [
    {
      id: 'physical-ocean-background',
      type: 'background',
      paint: { 'background-color': '#8fa8ad' },
    },
    {
      id: 'physical-land',
      type: 'fill',
      source: 'natural-earth-land',
      paint: { 'fill-color': '#d8cfb2' },
    },
    {
      id: 'physical-lakes',
      type: 'fill',
      source: 'natural-earth-lakes',
      paint: {
        'fill-color': '#95afb4',
        'fill-outline-color': '#758f94',
      },
    },
    {
      id: 'physical-rivers',
      type: 'line',
      source: 'natural-earth-rivers',
      paint: {
        'line-color': '#78999f',
        'line-opacity': 0.8,
        'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.45, 7, 1.4],
      },
    },
    {
      id: 'physical-coastline',
      type: 'line',
      source: 'natural-earth-coastline',
      paint: {
        'line-color': '#5f746f',
        'line-opacity': 0.85,
        'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.55, 7, 1.5],
      },
    },
  ],
}
