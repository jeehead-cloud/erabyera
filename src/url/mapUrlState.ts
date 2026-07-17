import { entityIdSchema } from '../domain/entities'
import {
  historicalYearSchema,
  type HistoricalYear,
} from '../domain/time'
import { INITIAL_MAP_VIEW, MAP_ZOOM_LIMITS } from '../map/basemap'
import {
  MAP_LAYER_IDS,
  isMapLayerId,
  isSelectedEntityType,
  type MapLayerId,
  type SelectedEntityReference,
} from './mapUrlSchemas'

export const MAP_URL_PARAMETER_ORDER = [
  'year',
  'lat',
  'lng',
  'zoom',
  'layers',
  'entity',
  'collection',
] as const

export const MAP_URL_LATITUDE_LIMIT = 85.051129
export const MAP_URL_COORDINATE_PRECISION = 6
export const MAP_URL_ZOOM_PRECISION = 2

export const DEFAULT_ACTIVE_MAP_LAYERS: readonly MapLayerId[] = Object.freeze([
  'territories',
  'places',
  'events',
])

export interface MapUrlViewport {
  latitude: number
  longitude: number
  zoom: number
}

export interface MapUrlState extends MapUrlViewport {
  year: HistoricalYear
  activeLayers: readonly MapLayerId[]
  selectedEntity: SelectedEntityReference | null
  collectionId: string | null
}

export interface MapUrlStateInput {
  year?: unknown
  latitude?: unknown
  longitude?: unknown
  zoom?: unknown
  activeLayers?: unknown
  selectedEntity?: unknown
  collectionId?: unknown
}

export const DEFAULT_MAP_URL_STATE: Readonly<MapUrlState> = Object.freeze({
  year: -334,
  latitude: INITIAL_MAP_VIEW.latitude,
  longitude: INITIAL_MAP_VIEW.longitude,
  zoom: INITIAL_MAP_VIEW.zoom,
  activeLayers: DEFAULT_ACTIVE_MAP_LAYERS,
  selectedEntity: null,
  collectionId: null,
})

export const MAP_MOVEMENT_HISTORY_MODE = 'replace' as const
export const MAP_CANONICALIZATION_HISTORY_MODE = 'replace' as const
export type MapUrlHistoryMode = 'replace' | 'push'

export function shouldReplaceMapUrlHistory(mode: MapUrlHistoryMode): boolean {
  return mode === 'replace'
}

const strictFiniteNumberPattern =
  /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/
const strictIntegerPattern = /^[+-]?\d+$/
const knownParameterNames = new Set<string>(MAP_URL_PARAMETER_ORDER)

function ordinaryZero(value: number): number {
  return Object.is(value, -0) ? 0 : value
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function parseStrictFiniteNumber(value: string | null): number | null {
  if (value === null || !strictFiniteNumberPattern.test(value)) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? ordinaryZero(parsed) : null
}

function normalizeBoundedNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return ordinaryZero(clamp(value, minimum, maximum))
}

function parseBoundedNumber(
  value: string | null,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed = parseStrictFiniteNumber(value)
  return parsed === null ? fallback : ordinaryZero(clamp(parsed, minimum, maximum))
}

function normalizeYear(value: unknown): HistoricalYear {
  const result = historicalYearSchema.safeParse(value)
  return result.success ? result.data : DEFAULT_MAP_URL_STATE.year
}

function parseYear(value: string | null): HistoricalYear {
  if (value === null || !strictIntegerPattern.test(value)) {
    return DEFAULT_MAP_URL_STATE.year
  }

  return normalizeYear(Number(value))
}

function normalizeLayers(value: unknown): readonly MapLayerId[] {
  if (!Array.isArray(value)) {
    return DEFAULT_ACTIVE_MAP_LAYERS
  }

  const requested = new Set(value.filter(
    (layer): layer is MapLayerId => typeof layer === 'string' && isMapLayerId(layer),
  ))
  return MAP_LAYER_IDS.filter((layer) => requested.has(layer))
}

function parseLayers(
  value: string | null,
  isPresent: boolean,
): readonly MapLayerId[] {
  if (!isPresent) {
    return DEFAULT_ACTIVE_MAP_LAYERS
  }

  return normalizeLayers(value === null || value === '' ? [] : value.split(','))
}

function normalizeSelectedEntity(value: unknown): SelectedEntityReference | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const candidate = value as { type?: unknown; id?: unknown }
  if (
    typeof candidate.type !== 'string' ||
    !isSelectedEntityType(candidate.type) ||
    !entityIdSchema.safeParse(candidate.id).success
  ) {
    return null
  }

  return { type: candidate.type, id: candidate.id as string }
}

function parseSelectedEntity(value: string | null): SelectedEntityReference | null {
  if (value === null) {
    return null
  }

  const separator = value.indexOf(':')
  if (separator <= 0 || separator !== value.lastIndexOf(':')) {
    return null
  }

  return normalizeSelectedEntity({
    type: value.slice(0, separator),
    id: value.slice(separator + 1),
  })
}

function normalizeCollectionId(value: unknown): string | null {
  const result = entityIdSchema.safeParse(value)
  return result.success ? result.data : null
}

function queryParams(search: string | URLSearchParams): URLSearchParams {
  return typeof search === 'string' ? new URLSearchParams(search) : search
}

export function normalizeMapUrlState(input: MapUrlStateInput): MapUrlState {
  return {
    year: normalizeYear(input.year),
    latitude: normalizeBoundedNumber(
      input.latitude,
      DEFAULT_MAP_URL_STATE.latitude,
      -MAP_URL_LATITUDE_LIMIT,
      MAP_URL_LATITUDE_LIMIT,
    ),
    longitude: normalizeBoundedNumber(
      input.longitude,
      DEFAULT_MAP_URL_STATE.longitude,
      -180,
      180,
    ),
    zoom: normalizeBoundedNumber(
      input.zoom,
      DEFAULT_MAP_URL_STATE.zoom,
      MAP_ZOOM_LIMITS.minZoom,
      MAP_ZOOM_LIMITS.maxZoom,
    ),
    activeLayers: normalizeLayers(input.activeLayers),
    selectedEntity: normalizeSelectedEntity(input.selectedEntity),
    collectionId: normalizeCollectionId(input.collectionId),
  }
}

export function parseMapUrlState(search: string | URLSearchParams): MapUrlState {
  const params = queryParams(search)
  return {
    year: parseYear(params.get('year')),
    latitude: parseBoundedNumber(
      params.get('lat'),
      DEFAULT_MAP_URL_STATE.latitude,
      -MAP_URL_LATITUDE_LIMIT,
      MAP_URL_LATITUDE_LIMIT,
    ),
    longitude: parseBoundedNumber(
      params.get('lng'),
      DEFAULT_MAP_URL_STATE.longitude,
      -180,
      180,
    ),
    zoom: parseBoundedNumber(
      params.get('zoom'),
      DEFAULT_MAP_URL_STATE.zoom,
      MAP_ZOOM_LIMITS.minZoom,
      MAP_ZOOM_LIMITS.maxZoom,
    ),
    activeLayers: parseLayers(params.get('layers'), params.has('layers')),
    selectedEntity: parseSelectedEntity(params.get('entity')),
    collectionId: normalizeCollectionId(params.get('collection')),
  }
}

function roundForUrl(value: number, precision: number): number {
  return ordinaryZero(Number(value.toFixed(precision)))
}

function formatForUrl(value: number, precision: number): string {
  return String(roundForUrl(value, precision))
}

function sameLayers(
  first: readonly MapLayerId[],
  second: readonly MapLayerId[],
): boolean {
  return first.length === second.length && first.every((layer, index) => layer === second[index])
}

function appendKnownMapParameters(params: URLSearchParams, state: MapUrlState): void {
  if (state.year !== DEFAULT_MAP_URL_STATE.year) {
    params.append('year', String(state.year))
  }
  if (
    roundForUrl(state.latitude, MAP_URL_COORDINATE_PRECISION) !==
    DEFAULT_MAP_URL_STATE.latitude
  ) {
    params.append('lat', formatForUrl(state.latitude, MAP_URL_COORDINATE_PRECISION))
  }
  if (
    roundForUrl(state.longitude, MAP_URL_COORDINATE_PRECISION) !==
    DEFAULT_MAP_URL_STATE.longitude
  ) {
    params.append('lng', formatForUrl(state.longitude, MAP_URL_COORDINATE_PRECISION))
  }
  if (
    roundForUrl(state.zoom, MAP_URL_ZOOM_PRECISION) !==
    DEFAULT_MAP_URL_STATE.zoom
  ) {
    params.append('zoom', formatForUrl(state.zoom, MAP_URL_ZOOM_PRECISION))
  }
  if (!sameLayers(state.activeLayers, DEFAULT_ACTIVE_MAP_LAYERS)) {
    params.append('layers', state.activeLayers.join(','))
  }
  if (state.selectedEntity !== null) {
    params.append('entity', `${state.selectedEntity.type}:${state.selectedEntity.id}`)
  }
  if (state.collectionId !== null) {
    params.append('collection', state.collectionId)
  }
}

export function serializeMapUrlState(
  input: MapUrlStateInput,
  currentSearch: string | URLSearchParams = '',
): URLSearchParams {
  const state = normalizeMapUrlState(input)
  const result = new URLSearchParams()
  appendKnownMapParameters(result, state)

  const unrelated = [...queryParams(currentSearch).entries()]
    .filter(([key]) => !knownParameterNames.has(key))
    .sort(([firstKey, firstValue], [secondKey, secondValue]) =>
      firstKey.localeCompare(secondKey) || firstValue.localeCompare(secondValue),
    )
  for (const [key, value] of unrelated) {
    result.append(key, value)
  }

  return result
}

export function canonicalizeMapSearch(search: string | URLSearchParams): string {
  return serializeMapUrlState(parseMapUrlState(search), search).toString()
}

export function createCanonicalMapUrl(
  absoluteUrl: string | URL,
  input?: MapUrlStateInput,
): string {
  const url = new URL(absoluteUrl)
  const state = input === undefined ? parseMapUrlState(url.search) : normalizeMapUrlState(input)
  url.search = serializeMapUrlState(state, url.search).toString()
  return url.toString()
}

export function areMapUrlViewportsEquivalent(
  first: MapUrlViewport,
  second: MapUrlViewport,
): boolean {
  return (
    roundForUrl(first.latitude, MAP_URL_COORDINATE_PRECISION) ===
      roundForUrl(second.latitude, MAP_URL_COORDINATE_PRECISION) &&
    roundForUrl(first.longitude, MAP_URL_COORDINATE_PRECISION) ===
      roundForUrl(second.longitude, MAP_URL_COORDINATE_PRECISION) &&
    roundForUrl(first.zoom, MAP_URL_ZOOM_PRECISION) ===
      roundForUrl(second.zoom, MAP_URL_ZOOM_PRECISION)
  )
}

export function areMapUrlStatesEquivalent(
  first: MapUrlState,
  second: MapUrlState,
): boolean {
  return (
    first.year === second.year &&
    areMapUrlViewportsEquivalent(first, second) &&
    sameLayers(first.activeLayers, second.activeLayers) &&
    first.selectedEntity?.type === second.selectedEntity?.type &&
    first.selectedEntity?.id === second.selectedEntity?.id &&
    first.collectionId === second.collectionId
  )
}
