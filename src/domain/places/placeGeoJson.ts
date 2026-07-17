import type { Feature, FeatureCollection, Point } from 'geojson'
import type { LocationAccuracy } from '../entities'
import type { PlacePresentation } from './placeSelectors'

export interface PlaceFeatureProperties {
  entityType: 'place'
  placeId: string
  displayName: string
  importance: number | null
  minZoom: number | null
  selected: boolean
  active: boolean
  locationAccuracy: LocationAccuracy | null
}

export type PlaceFeatureCollection = FeatureCollection<Point, PlaceFeatureProperties>

export function buildPlaceFeatureCollection(
  presentations: readonly PlacePresentation[],
  placesLayerActive: boolean,
  selectedPlaceId: string | null,
): PlaceFeatureCollection {
  const features: Feature<Point, PlaceFeatureProperties>[] = presentations
    .filter((place) => place.coordinates !== undefined)
    .filter((place) =>
      place.id === selectedPlaceId ||
      (placesLayerActive && place.active && place.importance !== null),
    )
    .map((place) => ({
      type: 'Feature',
      id: place.id,
      geometry: { type: 'Point', coordinates: place.coordinates as [number, number] },
      properties: {
        entityType: 'place',
        placeId: place.id,
        displayName: place.displayName,
        importance: place.importance,
        minZoom: place.minZoom,
        selected: place.id === selectedPlaceId,
        active: place.active,
        locationAccuracy: place.uncertainty?.locationAccuracy ?? null,
      },
    }))

  return { type: 'FeatureCollection', features }
}
