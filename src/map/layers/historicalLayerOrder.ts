import { EVENT_INTERACTIVE_LAYER_IDS } from './eventLayerStyle'
import { PLACE_INTERACTIVE_LAYER_IDS } from './placeLayerStyle'
import { TERRITORY_INTERACTIVE_LAYER_IDS } from './territoryLayerStyle'

export const HISTORICAL_LAYER_GROUP_ORDER = ['territories', 'events', 'places'] as const
export const HISTORICAL_INTERACTION_PRIORITY = ['places', 'events', 'territories'] as const

export interface HistoricalLayerAvailability {
  places: boolean
  events: boolean
  territories: boolean
}

export function getHistoricalInteractiveLayerIds(availability: HistoricalLayerAvailability): string[] {
  return [
    ...(availability.places ? PLACE_INTERACTIVE_LAYER_IDS : []),
    ...(availability.events ? EVENT_INTERACTIVE_LAYER_IDS : []),
    ...(availability.territories ? TERRITORY_INTERACTIVE_LAYER_IDS : []),
  ]
}
