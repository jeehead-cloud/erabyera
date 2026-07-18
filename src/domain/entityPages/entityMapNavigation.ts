import { MAP_ZOOM_LIMITS } from '../../map'
import {
  DEFAULT_MAP_URL_STATE,
  MAP_LAYER_IDS,
  serializeMapUrlState,
  type MapLayerId,
  type MapUrlState,
  type SelectedEntityType,
} from '../../url'
import type { SearchIndex } from '../search'
import {
  getSearchEntryFocusCoordinates,
  getSearchEntryTargetYear,
  SEARCH_POINT_FOCUS_MIN_ZOOM,
} from '../search'
import { parseHistoricalYear } from '../time'

function addLayer(layers: readonly MapLayerId[], layer: MapLayerId): readonly MapLayerId[] {
  const requested = new Set([...layers, layer])
  return MAP_LAYER_IDS.filter((candidate) => requested.has(candidate))
}

export function createEntityMapHref(
  index: Readonly<SearchIndex>,
  type: SelectedEntityType,
  id: string,
  preferredYear?: number,
  baseState: MapUrlState = DEFAULT_MAP_URL_STATE,
): string | null {
  const entry = index.entries.find((candidate) => candidate.entityType === type && candidate.entityId === id)
  if (entry === undefined) return null
  const selectedYear = preferredYear === undefined ? baseState.year : parseHistoricalYear(preferredYear)
  const primary = entry.names.find((name) => name.kind === 'default') ?? entry.names[0]
  const year = getSearchEntryTargetYear(entry, primary, selectedYear)
  const coordinates = getSearchEntryFocusCoordinates(entry, year)
  const state: MapUrlState = {
    ...baseState,
    year,
    activeLayers: addLayer(baseState.activeLayers, entry.requiredLayer),
    selectedEntity: { type, id },
    ...(coordinates === null ? {} : {
      longitude: coordinates[0],
      latitude: coordinates[1],
      zoom: Math.min(MAP_ZOOM_LIMITS.maxZoom, Math.max(baseState.zoom, SEARCH_POINT_FOCUS_MIN_ZOOM)),
    }),
  }
  const search = serializeMapUrlState(state).toString()
  return search === '' ? '/map' : `/map?${search}`
}

