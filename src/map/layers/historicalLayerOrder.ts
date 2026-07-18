import { EVENT_INTERACTIVE_LAYER_IDS } from './eventLayerStyle'
import { PLACE_INTERACTIVE_LAYER_IDS } from './placeLayerStyle'
import { TERRITORY_INTERACTIVE_LAYER_IDS } from './territoryLayerStyle'
import { PERSON_INTERACTIVE_LAYER_IDS } from './personLayerStyle'
import { JOURNEY_INTERACTIVE_LAYER_IDS } from './journeyLayerStyle'

export const HISTORICAL_LAYER_GROUP_ORDER = ['territories', 'journeys', 'events', 'people', 'places'] as const
export const HISTORICAL_INTERACTION_PRIORITY = ['places', 'people', 'events', 'journeys', 'territories'] as const

export interface HistoricalLayerAvailability {
  places: boolean
  events: boolean
  territories: boolean
  people?: boolean
  journeys?: boolean
}

export function getHistoricalInteractiveLayerIds(availability: HistoricalLayerAvailability): string[] {
  return [
    ...(availability.places ? PLACE_INTERACTIVE_LAYER_IDS : []),
    ...(availability.people ? PERSON_INTERACTIVE_LAYER_IDS : []),
    ...(availability.events ? EVENT_INTERACTIVE_LAYER_IDS : []),
    ...(availability.journeys ? JOURNEY_INTERACTIVE_LAYER_IDS : []),
    ...(availability.territories ? TERRITORY_INTERACTIVE_LAYER_IDS : []),
  ]
}

export interface HistoricalFeatureLike {
  properties?: Record<string, unknown> | null
}

export type HistoricalMapInteraction =
  | { type: 'place'; id: string }
  | { type: 'person'; id: string | null; placeId: string }
  | { type: 'event'; id: string }
  | { type: 'journey'; id: string }
  | { type: 'polity'; id: string }
  | null

export function pickHistoricalMapInteraction(
  features: readonly HistoricalFeatureLike[] | undefined,
): HistoricalMapInteraction {
  if (features === undefined) return null
  const place = features.find((feature) => feature.properties?.entityType === 'place' && typeof feature.properties.placeId === 'string')
  if (place !== undefined) return { type: 'place', id: place.properties!.placeId as string }
  const person = features.find((feature) => feature.properties?.entityType === 'person-location' && typeof feature.properties.placeId === 'string')
  if (person !== undefined) return {
    type: 'person',
    id: typeof person.properties!.personId === 'string' ? person.properties!.personId : null,
    placeId: person.properties!.placeId as string,
  }
  const event = features.find((feature) => feature.properties?.entityType === 'event' && typeof feature.properties.eventId === 'string')
  if (event !== undefined) return { type: 'event', id: event.properties!.eventId as string }
  const journey = features.find((feature) => feature.properties?.entityType === 'journey' && typeof feature.properties.journeyId === 'string')
  if (journey !== undefined) return { type: 'journey', id: journey.properties!.journeyId as string }
  const polity = features.find((feature) => typeof feature.properties?.polityId === 'string')
  return polity === undefined ? null : { type: 'polity', id: polity.properties!.polityId as string }
}
