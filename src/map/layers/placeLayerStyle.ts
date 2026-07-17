import type { LayerProps } from 'react-map-gl/maplibre'
import { PLACE_IMPORTANCE_MIN_ZOOM } from '../../domain/places'

export const PLACE_SOURCE_ID = 'historical-places'
export const PLACE_SELECTED_LAYER_ID = 'historical-places-selected'

export const PLACE_IMPORTANCE_LAYER_IDS = Object.freeze({
  1: 'historical-places-importance-1',
  2: 'historical-places-importance-2',
  3: 'historical-places-importance-3',
  4: 'historical-places-importance-4',
  5: 'historical-places-importance-5',
})

export const PLACE_INTERACTIVE_LAYER_IDS = [
  ...Object.values(PLACE_IMPORTANCE_LAYER_IDS),
  PLACE_SELECTED_LAYER_ID,
]

export function createPlaceImportanceLayer(importance: 1 | 2 | 3 | 4 | 5): LayerProps {
  return {
    id: PLACE_IMPORTANCE_LAYER_IDS[importance],
    type: 'circle',
    source: PLACE_SOURCE_ID,
    minzoom: PLACE_IMPORTANCE_MIN_ZOOM[importance],
    filter: [
      'all',
      ['==', ['get', 'active'], true],
      ['==', ['get', 'selected'], false],
      ['==', ['get', 'importance'], importance],
    ],
    paint: {
      'circle-radius': 3.5 + importance * 0.8,
      'circle-color': '#d4a94a',
      'circle-opacity': 0.9,
      'circle-stroke-color': '#322722',
      'circle-stroke-width': [
        'case',
        ['==', ['get', 'locationAccuracy'], 'exact'],
        1.25,
        2.5,
      ],
    },
  }
}

export const PLACE_SELECTED_LAYER: LayerProps = {
  id: PLACE_SELECTED_LAYER_ID,
  type: 'circle',
  source: PLACE_SOURCE_ID,
  filter: ['==', ['get', 'selected'], true],
  paint: {
    'circle-radius': 10,
    'circle-color': '#f5ead2',
    'circle-opacity': ['case', ['==', ['get', 'active'], true], 0.95, 0.58],
    'circle-stroke-color': '#8f6620',
    'circle-stroke-width': 4,
  },
}
