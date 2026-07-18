import { MAP_ZOOM_LIMITS } from '../../map/basemap'
import {
  MAP_LAYER_IDS,
  type MapLayerId,
  type MapUrlState,
  type MapUrlStateInput,
} from '../../url'
import type { SearchResult } from './searchService'

export const SEARCH_SELECTION_HISTORY_MODE = 'push' as const
export const SEARCH_POINT_FOCUS_MIN_ZOOM = 5.5

function addRequiredLayer(
  activeLayers: readonly MapLayerId[],
  requiredLayer: MapLayerId,
): readonly MapLayerId[] {
  const requested = new Set([...activeLayers, requiredLayer])
  return MAP_LAYER_IDS.filter((layer) => requested.has(layer))
}

export function createSearchNavigationUpdate(
  state: MapUrlState,
  result: SearchResult,
): Partial<MapUrlStateInput> {
  const update: Partial<MapUrlStateInput> = {
    year: result.targetYear,
    activeLayers: addRequiredLayer(state.activeLayers, result.requiredLayer),
    selectedEntity: { type: result.entityType, id: result.entityId },
  }
  if (result.focusCoordinates !== null) {
    update.longitude = result.focusCoordinates[0]
    update.latitude = result.focusCoordinates[1]
    update.zoom = Math.min(
      MAP_ZOOM_LIMITS.maxZoom,
      Math.max(state.zoom, SEARCH_POINT_FOCUS_MIN_ZOOM),
    )
  }
  return update
}
