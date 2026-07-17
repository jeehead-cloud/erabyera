import { describe, expect, it } from 'vitest'
import { entityIdSchema } from '../domain/entities'
import { historicalYearSchema } from '../domain/time'
import { INITIAL_MAP_VIEW, MAP_ZOOM_LIMITS } from '../map'
import {
  DEFAULT_ACTIVE_MAP_LAYERS,
  DEFAULT_MAP_URL_STATE,
  MAP_CANONICALIZATION_HISTORY_MODE,
  MAP_MOVEMENT_HISTORY_MODE,
  MAP_URL_LATITUDE_LIMIT,
  areMapUrlStatesEquivalent,
  areMapUrlViewportsEquivalent,
  canonicalizeMapSearch,
  createCanonicalMapUrl,
  normalizeMapUrlState,
  parseMapUrlState,
  serializeMapUrlState,
  shouldReplaceMapUrlHistory,
} from './mapUrlState'

function serialized(search: string): string {
  return serializeMapUrlState(parseMapUrlState(search), search).toString()
}

describe('map URL defaults and historical year', () => {
  it('returns the complete default state for an empty query', () => {
    expect(parseMapUrlState('')).toEqual(DEFAULT_MAP_URL_STATE)
  })

  it('accepts a valid BCE year', () => {
    expect(parseMapUrlState('?year=-44').year).toBe(-44)
  })

  it('accepts a valid CE year', () => {
    expect(parseMapUrlState('?year=476').year).toBe(476)
  })

  it('falls back for year zero', () => {
    expect(parseMapUrlState('?year=0').year).toBe(-334)
  })

  it('falls back for a fractional year', () => {
    expect(parseMapUrlState('?year=-44.5').year).toBe(-334)
  })

  it('falls back for a malformed year', () => {
    expect(parseMapUrlState('?year=44BCE').year).toBe(-334)
  })

  it('falls back for an unsafe integer year', () => {
    expect(parseMapUrlState('?year=9007199254740992').year).toBe(-334)
  })

  it('uses the centralized F2 year rules', () => {
    expect(historicalYearSchema.safeParse(parseMapUrlState('?year=-334').year).success).toBe(true)
    expect(historicalYearSchema.safeParse(0).success).toBe(false)
  })

  it('never serializes year zero', () => {
    expect(serializeMapUrlState({ year: 0 }).has('year')).toBe(false)
  })

  it('preserves negative BCE years during serialization', () => {
    expect(serializeMapUrlState({ year: -44 }).get('year')).toBe('-44')
  })
})

describe('map URL viewport validation', () => {
  it('parses valid latitude', () => {
    expect(parseMapUrlState('?lat=41.25').latitude).toBe(41.25)
  })

  it('parses valid longitude', () => {
    expect(parseMapUrlState('?lng=-73.75').longitude).toBe(-73.75)
  })

  it('parses valid zoom', () => {
    expect(parseMapUrlState('?zoom=5.25').zoom).toBe(5.25)
  })

  it('rejects malformed numeric tails', () => {
    const state = parseMapUrlState('?lat=3.5abc&lng=4x&zoom=2.5z')
    expect(state).toMatchObject({
      latitude: INITIAL_MAP_VIEW.latitude,
      longitude: INITIAL_MAP_VIEW.longitude,
      zoom: INITIAL_MAP_VIEW.zoom,
    })
  })

  it('rejects non-finite numeric values', () => {
    const state = parseMapUrlState('?lat=Infinity&lng=NaN&zoom=1e999')
    expect([state.latitude, state.longitude, state.zoom].every(Number.isFinite)).toBe(true)
  })

  it('clamps latitude to Web Mercator boundaries', () => {
    expect(parseMapUrlState('?lat=90').latitude).toBe(MAP_URL_LATITUDE_LIMIT)
    expect(parseMapUrlState('?lat=-90').latitude).toBe(-MAP_URL_LATITUDE_LIMIT)
  })

  it('clamps longitude to geographic boundaries', () => {
    expect(parseMapUrlState('?lng=181').longitude).toBe(180)
    expect(parseMapUrlState('?lng=-181').longitude).toBe(-180)
  })

  it('clamps zoom to the F5 map boundaries', () => {
    expect(parseMapUrlState('?zoom=99').zoom).toBe(MAP_ZOOM_LIMITS.maxZoom)
    expect(parseMapUrlState('?zoom=-2').zoom).toBe(MAP_ZOOM_LIMITS.minZoom)
  })

  it('normalizes negative zero coordinates', () => {
    const state = parseMapUrlState('?lat=-0&lng=-0')
    expect(Object.is(state.latitude, -0)).toBe(false)
    expect(Object.is(state.longitude, -0)).toBe(false)
  })

  it('serializes coordinates to six decimals and zoom to two', () => {
    expect(
      serializeMapUrlState({
        latitude: 12.123456789,
        longitude: -9.987654321,
        zoom: 4.567,
      }).toString(),
    ).toBe('lat=12.123457&lng=-9.987654&zoom=4.57')
  })

  it('matches URL defaults to centralized F5 viewport configuration', () => {
    expect(DEFAULT_MAP_URL_STATE).toMatchObject({
      latitude: INITIAL_MAP_VIEW.latitude,
      longitude: INITIAL_MAP_VIEW.longitude,
      zoom: INITIAL_MAP_VIEW.zoom,
    })
  })

  it('normalizes invalid programmatic viewport input safely', () => {
    expect(normalizeMapUrlState({ latitude: Number.NaN, longitude: Infinity, zoom: -Infinity }))
      .toMatchObject({
        latitude: INITIAL_MAP_VIEW.latitude,
        longitude: INITIAL_MAP_VIEW.longitude,
        zoom: INITIAL_MAP_VIEW.zoom,
      })
  })
})

describe('map layer URL contract', () => {
  it('parses valid layer identifiers', () => {
    expect(parseMapUrlState('?layers=places,journeys').activeLayers).toEqual(['places', 'journeys'])
  })

  it('ignores unknown layers', () => {
    expect(parseMapUrlState('?layers=places,weather,events').activeLayers).toEqual(['places', 'events'])
  })

  it('removes duplicate layers', () => {
    expect(parseMapUrlState('?layers=places,places,events').activeLayers).toEqual(['places', 'events'])
  })

  it('outputs layers in stable foundation order', () => {
    expect(parseMapUrlState('?layers=journeys,territories,people').activeLayers)
      .toEqual(['territories', 'people', 'journeys'])
  })

  it('uses the restrained default when layers is absent', () => {
    expect(parseMapUrlState('').activeLayers).toEqual(DEFAULT_ACTIVE_MAP_LAYERS)
  })

  it('preserves an explicitly empty layer set', () => {
    expect(parseMapUrlState('?layers=').activeLayers).toEqual([])
    expect(serializeMapUrlState({ activeLayers: [] }).toString()).toBe('layers=')
  })

  it('does not treat the physical basemap as a historical layer', () => {
    expect(parseMapUrlState('?layers=physical,places').activeLayers).toEqual(['places'])
  })
})

describe('entity and collection URL references', () => {
  it('parses a valid selected entity', () => {
    expect(parseMapUrlState('?entity=event:sample-event').selectedEntity)
      .toEqual({ type: 'event', id: 'sample-event' })
  })

  it('rejects a malformed selected-entity type', () => {
    expect(parseMapUrlState('?entity=territory:sample-event').selectedEntity).toBeNull()
  })

  it('rejects a malformed selected-entity ID', () => {
    expect(parseMapUrlState('?entity=event:Sample_Event').selectedEntity).toBeNull()
  })

  it('parses a valid collection ID', () => {
    expect(parseMapUrlState('?collection=sample-collection').collectionId).toBe('sample-collection')
  })

  it('rejects a malformed collection ID', () => {
    expect(parseMapUrlState('?collection=Sample Collection').collectionId).toBeNull()
  })

  it('treats empty entity and collection parameters as null', () => {
    expect(parseMapUrlState('?entity=&collection=')).toMatchObject({
      selectedEntity: null,
      collectionId: null,
    })
  })

  it('uses the centralized F3 ID convention', () => {
    const id = parseMapUrlState('?entity=person:alexander-3&collection=alexander-world')
    expect(entityIdSchema.safeParse(id.selectedEntity?.id).success).toBe(true)
    expect(entityIdSchema.safeParse(id.collectionId).success).toBe(true)
  })

  it('serializes a selected entity deterministically', () => {
    expect(serializeMapUrlState({ selectedEntity: { type: 'journey', id: 'route-1' } }).toString())
      .toBe('entity=journey%3Aroute-1')
  })
})

describe('canonical serialization and synchronization policies', () => {
  it('uses deterministic known-parameter ordering', () => {
    const state = parseMapUrlState(
      '?collection=sample&entity=place:pella&layers=events&zoom=4&lng=20&lat=30&year=-44',
    )
    expect(serializeMapUrlState(state).toString()).toBe(
      'year=-44&lat=30&lng=20&zoom=4&layers=events&entity=place%3Apella&collection=sample',
    )
  })

  it('has stable parse serialize parse behavior', () => {
    const first = parseMapUrlState('?zoom=4.567&layers=events,places,events&year=-44&lat=1.123456789')
    const second = parseMapUrlState(serializeMapUrlState(first))
    expect(areMapUrlStatesEquivalent(first, second)).toBe(true)
  })

  it('omits all default parameters', () => {
    expect(serializeMapUrlState(DEFAULT_MAP_URL_STATE).toString()).toBe('')
  })

  it('preserves and deterministically sorts unrelated query parameters', () => {
    expect(serialized('?z=2&year=-44&a=2&a=1')).toBe('year=-44&a=1&a=2&z=2')
  })

  it('removes invalid known values during canonicalization', () => {
    expect(canonicalizeMapSearch('?year=0&lat=NaN&entity=&collection=')).toBe('')
  })

  it('canonicalizes excessive precision and duplicate layers once', () => {
    const canonical = canonicalizeMapSearch('?lat=1.123456789&layers=events,events,unknown')
    expect(canonical).toBe('lat=1.123457&layers=events')
    expect(canonicalizeMapSearch(canonical)).toBe(canonical)
  })

  it('does not emit a default rounded from insignificant float noise', () => {
    expect(serializeMapUrlState({ latitude: 37.00000001, zoom: 3.5001 }).toString()).toBe('')
  })

  it('creates a canonical share URL while preserving unrelated parameters', () => {
    expect(createCanonicalMapUrl('https://example.test/map?campaign=x&year=-044')).toBe(
      'https://example.test/map?year=-44&campaign=x',
    )
  })

  it('detects equivalent viewport values at serialized precision', () => {
    expect(areMapUrlViewportsEquivalent(
      { latitude: 1.12345641, longitude: 2, zoom: 4.001 },
      { latitude: 1.1234564, longitude: 2.0000001, zoom: 4 },
    )).toBe(true)
  })

  it('detects real external viewport changes', () => {
    expect(areMapUrlViewportsEquivalent(
      { latitude: 1, longitude: 2, zoom: 4 },
      { latitude: 1.01, longitude: 2, zoom: 4 },
    )).toBe(false)
  })

  it('defines movement commits as history replacement', () => {
    expect(MAP_MOVEMENT_HISTORY_MODE).toBe('replace')
    expect(shouldReplaceMapUrlHistory(MAP_MOVEMENT_HISTORY_MODE)).toBe(true)
  })

  it('defines initialization canonicalization as history replacement', () => {
    expect(MAP_CANONICALIZATION_HISTORY_MODE).toBe('replace')
  })

  it('allows explicit actions to use push history through the public mode type', () => {
    const explicitHistoryMode: 'push' | 'replace' = 'push'
    expect(shouldReplaceMapUrlHistory(explicitHistoryMode)).toBe(false)
  })
})
