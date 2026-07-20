import type { ContentCollection } from '../entities'
import { DEFAULT_MAP_URL_STATE, serializeMapUrlState, type MapUrlState, type MapUrlStateInput } from '../../url'

export const COLLECTION_NAVIGATION_HISTORY_MODE = 'push' as const

export function collectionRecommendedMapState(collection: ContentCollection): MapUrlState {
  return {
    ...DEFAULT_MAP_URL_STATE,
    year: collection.recommendedStartYear,
    longitude: collection.recommendedViewport.longitude,
    latitude: collection.recommendedViewport.latitude,
    zoom: collection.recommendedViewport.zoom,
    activeLayers: collection.recommendedLayers,
    selectedEntity: null,
    collectionId: collection.id,
  }
}

export function collectionRecommendedMapUpdate(collection: ContentCollection): Partial<MapUrlStateInput> {
  return collectionRecommendedMapState(collection)
}

export function createCollectionRecommendedMapHref(collection: ContentCollection): string {
  const search = serializeMapUrlState(collectionRecommendedMapState(collection)).toString()
  return search === '' ? '/map' : `/map?${search}`
}

export function leaveCollectionUpdate(): Partial<MapUrlStateInput> {
  return { collectionId: null }
}
