import type { FilterSpecification } from 'maplibre-gl'
import type { LayerProps } from 'react-map-gl/maplibre'

export const JOURNEY_SOURCE_ID = 'historical-journeys'
export const JOURNEY_CERTAIN_LAYER_ID = 'historical-journeys-documented-probable'
export const JOURNEY_UNCERTAIN_LAYER_ID = 'historical-journeys-schematic-uncertain'
export const JOURNEY_SELECTED_LAYER_ID = 'historical-journeys-selected'
export const JOURNEY_SELECTED_INACTIVE_LAYER_ID = 'historical-journeys-selected-inactive'

export const JOURNEY_LAYER_ORDER = [
  JOURNEY_CERTAIN_LAYER_ID,
  JOURNEY_UNCERTAIN_LAYER_ID,
  JOURNEY_SELECTED_LAYER_ID,
  JOURNEY_SELECTED_INACTIVE_LAYER_ID,
] as const

export const JOURNEY_INTERACTIVE_LAYER_IDS = [
  JOURNEY_SELECTED_INACTIVE_LAYER_ID,
  JOURNEY_SELECTED_LAYER_ID,
  JOURNEY_UNCERTAIN_LAYER_ID,
  JOURNEY_CERTAIN_LAYER_ID,
] as const

const UNSELECTED: FilterSpecification = ['==', ['get', 'selected'], false]
const SELECTED: FilterSpecification = ['==', ['get', 'selected'], true]

export const JOURNEY_CERTAIN_LAYER: LayerProps = {
  id: JOURNEY_CERTAIN_LAYER_ID,
  type: 'line',
  source: JOURNEY_SOURCE_ID,
  filter: ['all', UNSELECTED, ['in', ['get', 'certaintyGroup'], ['literal', ['documented', 'probable']]]],
  layout: { 'line-cap': 'round', 'line-join': 'round' },
  paint: {
    'line-color': '#315f68',
    'line-opacity': 0.78,
    'line-width': 4,
  },
}

export const JOURNEY_UNCERTAIN_LAYER: LayerProps = {
  id: JOURNEY_UNCERTAIN_LAYER_ID,
  type: 'line',
  source: JOURNEY_SOURCE_ID,
  filter: ['all', UNSELECTED, ['in', ['get', 'certaintyGroup'], ['literal', ['schematic', 'uncertain']]]],
  layout: { 'line-cap': 'butt', 'line-join': 'round' },
  paint: {
    'line-color': '#7a5d45',
    'line-opacity': 0.58,
    'line-width': 4,
    'line-dasharray': [2, 1.5],
  },
}

export const JOURNEY_SELECTED_LAYER: LayerProps = {
  id: JOURNEY_SELECTED_LAYER_ID,
  type: 'line',
  source: JOURNEY_SOURCE_ID,
  filter: ['all', SELECTED, ['==', ['get', 'active'], true]],
  layout: { 'line-cap': 'round', 'line-join': 'round' },
  paint: {
    'line-color': '#fff4cf',
    'line-opacity': 0.96,
    'line-width': 8,
  },
}

export const JOURNEY_SELECTED_INACTIVE_LAYER: LayerProps = {
  id: JOURNEY_SELECTED_INACTIVE_LAYER_ID,
  type: 'line',
  source: JOURNEY_SOURCE_ID,
  filter: ['all', SELECTED, ['==', ['get', 'active'], false]],
  layout: { 'line-cap': 'butt', 'line-join': 'round' },
  paint: {
    'line-color': '#d8d0bc',
    'line-opacity': 0.5,
    'line-width': 7,
    'line-dasharray': [1, 1.5],
  },
}
