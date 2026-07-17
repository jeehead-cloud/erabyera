import { EVENT_INTERACTIVE_LAYER_IDS } from './eventLayerStyle'
import { PLACE_INTERACTIVE_LAYER_IDS } from './placeLayerStyle'
import { TERRITORY_INTERACTIVE_LAYER_IDS } from './territoryLayerStyle'
import { PERSON_INTERACTIVE_LAYER_IDS } from './personLayerStyle'

export const HISTORICAL_LAYER_GROUP_ORDER = ['territories', 'events', 'people', 'places'] as const
export const HISTORICAL_INTERACTION_PRIORITY = ['places', 'people', 'events', 'territories'] as const

export interface HistoricalLayerAvailability {
  places: boolean
  events: boolean
  territories: boolean
  people?: boolean
}

export function getHistoricalInteractiveLayerIds(availability: HistoricalLayerAvailability): string[] {
  return [
    ...(availability.places ? PLACE_INTERACTIVE_LAYER_IDS : []),
    ...(availability.people ? PERSON_INTERACTIVE_LAYER_IDS : []),
    ...(availability.events ? EVENT_INTERACTIVE_LAYER_IDS : []),
    ...(availability.territories ? TERRITORY_INTERACTIVE_LAYER_IDS : []),
  ]
}
