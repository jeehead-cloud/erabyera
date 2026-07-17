import type { LayerProps } from 'react-map-gl/maplibre'
import type { FilterSpecification } from 'maplibre-gl'

export const EVENT_SOURCE_ID = 'historical-events'
export const EVENT_ORDINARY_LAYER_ID = 'historical-events-ordinary'
export const EVENT_UNCERTAIN_LAYER_ID = 'historical-events-uncertain'
export const EVENT_BATTLE_LAYER_ID = 'historical-events-battle'
export const EVENT_SELECTED_LAYER_ID = 'historical-events-selected'

export const EVENT_LAYER_ORDER = [
  EVENT_ORDINARY_LAYER_ID,
  EVENT_UNCERTAIN_LAYER_ID,
  EVENT_BATTLE_LAYER_ID,
  EVENT_SELECTED_LAYER_ID,
] as const

export const EVENT_INTERACTIVE_LAYER_IDS = [
  EVENT_SELECTED_LAYER_ID,
  EVENT_BATTLE_LAYER_ID,
  EVENT_UNCERTAIN_LAYER_ID,
  EVENT_ORDINARY_LAYER_ID,
] as const

const UNSELECTED: FilterSpecification = ['==', ['get', 'selected'], false]
const NON_BATTLE: FilterSpecification = ['!=', ['get', 'eventType'], 'battle']

export const EVENT_ORDINARY_LAYER: LayerProps = {
  id: EVENT_ORDINARY_LAYER_ID,
  type: 'circle',
  source: EVENT_SOURCE_ID,
  filter: ['all', UNSELECTED, NON_BATTLE, ['==', ['get', 'locationAccuracy'], 'exact']],
  paint: {
    'circle-radius': 6,
    'circle-color': '#d4a94a',
    'circle-opacity': 0.92,
    'circle-stroke-color': '#322722',
    'circle-stroke-width': 1.5,
  },
}

export const EVENT_UNCERTAIN_LAYER: LayerProps = {
  id: EVENT_UNCERTAIN_LAYER_ID,
  type: 'circle',
  source: EVENT_SOURCE_ID,
  filter: ['all', UNSELECTED, NON_BATTLE, ['!=', ['get', 'locationAccuracy'], 'exact']],
  paint: {
    'circle-radius': 8,
    'circle-color': '#d4a94a',
    'circle-opacity': 0.48,
    'circle-stroke-color': '#322722',
    'circle-stroke-opacity': 0.9,
    'circle-stroke-width': 3,
  },
}

export const EVENT_BATTLE_LAYER: LayerProps = {
  id: EVENT_BATTLE_LAYER_ID,
  type: 'circle',
  source: EVENT_SOURCE_ID,
  filter: ['all', UNSELECTED, ['==', ['get', 'eventType'], 'battle']],
  paint: {
    'circle-radius': 9,
    'circle-color': '#8f4b3e',
    'circle-opacity': ['case', ['==', ['get', 'locationAccuracy'], 'exact'], 0.92, 0.58],
    'circle-stroke-color': '#f5ead2',
    'circle-stroke-width': ['case', ['==', ['get', 'locationAccuracy'], 'exact'], 2, 4],
  },
}

export const EVENT_SELECTED_LAYER: LayerProps = {
  id: EVENT_SELECTED_LAYER_ID,
  type: 'circle',
  source: EVENT_SOURCE_ID,
  filter: ['==', ['get', 'selected'], true],
  paint: {
    'circle-radius': 13,
    'circle-color': ['case', ['==', ['get', 'eventType'], 'battle'], '#8f4b3e', '#d4a94a'],
    'circle-opacity': ['case', ['==', ['get', 'active'], true], 0.9, 0.48],
    'circle-stroke-color': '#fff4cf',
    'circle-stroke-width': 5,
  },
}
