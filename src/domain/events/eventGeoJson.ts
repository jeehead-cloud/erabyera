import type { Feature, FeatureCollection, Point } from 'geojson'
import type { EventType, LocationAccuracy } from '../entities'
import type { EventPresentation } from './eventSelectors'

export interface EventFeatureProperties {
  entityType: 'event'
  eventId: string
  eventType: EventType
  displayName: string
  locationAccuracy: LocationAccuracy | null
  selected: boolean
  active: boolean
}

export type EventFeatureCollection = FeatureCollection<Point, EventFeatureProperties>

export function buildEventFeatureCollection(
  presentations: readonly EventPresentation[],
  eventsLayerActive: boolean,
  selectedEventId: string | null,
): EventFeatureCollection {
  const features: Feature<Point, EventFeatureProperties>[] = presentations
    .filter((event) => event.coordinates !== null)
    .filter((event) => event.id === selectedEventId || (eventsLayerActive && event.active))
    .map<Feature<Point, EventFeatureProperties>>((event) => ({
      type: 'Feature',
      id: event.id,
      geometry: { type: 'Point', coordinates: event.coordinates as [number, number] },
      properties: {
        entityType: 'event',
        eventId: event.id,
        eventType: event.type,
        displayName: event.displayName,
        locationAccuracy: event.locationAccuracy,
        selected: event.id === selectedEventId,
        active: event.active,
      },
    }))
    .sort((first, second) => String(first.id).localeCompare(String(second.id)))
  return { type: 'FeatureCollection', features }
}
