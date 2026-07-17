import type { LayerProps } from 'react-map-gl/maplibre'
import type { FilterSpecification } from 'maplibre-gl'
import type { TerritoryControl } from '../../domain/entities'

export const TERRITORY_SOURCE_ID = 'historical-territories'
export const TERRITORY_FILL_LAYER_ID = 'historical-territories-fill'
export const TERRITORY_SOLID_BOUNDARY_LAYER_ID = 'historical-territories-boundary-solid'
export const TERRITORY_UNCERTAIN_BOUNDARY_LAYER_ID = 'historical-territories-boundary-uncertain'
export const TERRITORY_SELECTED_FILL_LAYER_ID = 'historical-territories-selected-fill'
export const TERRITORY_SELECTED_BOUNDARY_LAYER_ID = 'historical-territories-selected-boundary'

export const TERRITORY_LAYER_ORDER = [
  TERRITORY_FILL_LAYER_ID,
  TERRITORY_SOLID_BOUNDARY_LAYER_ID,
  TERRITORY_UNCERTAIN_BOUNDARY_LAYER_ID,
  TERRITORY_SELECTED_FILL_LAYER_ID,
  TERRITORY_SELECTED_BOUNDARY_LAYER_ID,
] as const

export const TERRITORY_INTERACTIVE_LAYER_IDS = [
  TERRITORY_SELECTED_FILL_LAYER_ID,
  TERRITORY_FILL_LAYER_ID,
] as const

export type TerritoryStyleGroup = 'strong' | 'reduced' | 'claim' | 'uncertain'

export function territoryStyleGroup(control: TerritoryControl): TerritoryStyleGroup {
  if (control === 'core' || control === 'direct') return 'strong'
  if (control === 'tributary' || control === 'dependent') return 'reduced'
  if (control === 'claimed' || control === 'sphere-of-influence') return 'claim'
  return 'uncertain'
}

const NORMAL_FILTER: FilterSpecification = ['==', ['get', 'selected'], false]
const SELECTED_FILTER: FilterSpecification = ['==', ['get', 'selected'], true]
const UNCERTAIN_CONTROLS = ['claimed', 'sphere-of-influence', 'disputed', 'approximate']

export const TERRITORY_FILL_LAYER: LayerProps = {
  id: TERRITORY_FILL_LAYER_ID,
  type: 'fill',
  source: TERRITORY_SOURCE_ID,
  filter: NORMAL_FILTER,
  paint: {
    'fill-color': ['get', 'color'],
    'fill-opacity': [
      'match', ['get', 'controlCategory'],
      ['core', 'direct'], 0.28,
      ['tributary', 'dependent'], 0.2,
      ['claimed', 'sphere-of-influence'], 0.14,
      0.1,
    ],
  },
}

export const TERRITORY_SOLID_BOUNDARY_LAYER: LayerProps = {
  id: TERRITORY_SOLID_BOUNDARY_LAYER_ID,
  type: 'line',
  source: TERRITORY_SOURCE_ID,
  filter: ['all', NORMAL_FILTER, ['!', ['in', ['get', 'controlCategory'], ['literal', UNCERTAIN_CONTROLS]]]],
  paint: { 'line-color': ['get', 'color'], 'line-opacity': 0.9, 'line-width': 1.5 },
}

export const TERRITORY_UNCERTAIN_BOUNDARY_LAYER: LayerProps = {
  id: TERRITORY_UNCERTAIN_BOUNDARY_LAYER_ID,
  type: 'line',
  source: TERRITORY_SOURCE_ID,
  filter: ['all', NORMAL_FILTER, ['in', ['get', 'controlCategory'], ['literal', UNCERTAIN_CONTROLS]]],
  paint: {
    'line-color': ['get', 'color'],
    'line-opacity': 0.95,
    'line-width': 2,
    'line-dasharray': [2, 2],
  },
}

export const TERRITORY_SELECTED_FILL_LAYER: LayerProps = {
  id: TERRITORY_SELECTED_FILL_LAYER_ID,
  type: 'fill',
  source: TERRITORY_SOURCE_ID,
  filter: SELECTED_FILTER,
  paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.32 },
}

export const TERRITORY_SELECTED_BOUNDARY_LAYER: LayerProps = {
  id: TERRITORY_SELECTED_BOUNDARY_LAYER_ID,
  type: 'line',
  source: TERRITORY_SOURCE_ID,
  filter: SELECTED_FILTER,
  paint: {
    'line-color': '#fff4cf',
    'line-opacity': 1,
    'line-width': 4,
  },
}
