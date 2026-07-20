import { describe, expect, it } from 'vitest'
import { loadBundledSearchIndex } from '../../data'
import { MAP_ZOOM_LIMITS } from '../../map'
import { parseMapUrlState, serializeMapUrlState } from '../../url'
import {
  SEARCH_POINT_FOCUS_MIN_ZOOM,
  SEARCH_RESULT_LIMIT,
  SEARCH_SELECTION_HISTORY_MODE,
  createSearchNavigationUpdate,
  loadSearchIndex,
  normalizeSearchText,
  searchEntities,
  searchIndexSchema,
  searchResultMapLabel,
  type SearchIndex,
} from '.'

const index = loadBundledSearchIndex()

function customIndex(entries: SearchIndex['entries']): SearchIndex {
  return searchIndexSchema.parse({
    schemaVersion: 1,
    searchIndexVersion: 1,
    datasetVersion: 'foundation-fixture-0.1.0',
    entries,
  })
}

const baseEntry: SearchIndex['entries'][number] = {
  entityType: 'place',
  entityId: 'test-place',
  contentClassification: 'synthetic-fixture',
  primaryName: 'Alpha Harbor',
  names: [{ value: 'Alpha Harbor', normalizedValue: 'alpha harbor', kind: 'default' }],
  period: { yearFrom: -10, yearTo: 10 },
  context: 'synthetic port',
  requiredLayer: 'places',
  subtype: 'port',
  mapped: false,
  mapPeriods: [],
}

describe('search normalization', () => {
  it('uses Unicode NFKC and locale-neutral lowercase', () => expect(normalizeSearchText('  ＡLPHA  ')).toBe('alpha'))
  it('collapses whitespace and trims', () => expect(normalizeSearchText('  alpha\n\t beta  ')).toBe('alpha beta'))
  it('normalizes punctuation to spaces', () => expect(normalizeSearchText('Alpha—Beta:Gamma')).toBe('alpha beta gamma'))
  it('retains non-Latin characters', () => expect(normalizeSearchText('  АЛЬФА  ')).toBe('альфа'))
  it('retains meaningful digits', () => expect(normalizeSearchText('Route 334')).toBe('route 334'))
  it('handles empty input', () => expect(normalizeSearchText('')).toBe(''))
  it('normalizes equivalent inputs identically', () => expect(normalizeSearchText('Alpha-Beta')).toBe(normalizeSearchText(' alpha  beta ')))
})

describe('matching, ranking, grouping, and limits', () => {
  it('requires two normalized characters', () => expect(searchEntities(index, 's', -334).state).toBe('below-minimum'))
  it('matches exact primary names', () => expect(searchEntities(index, 'Synthetic Alpha Place', -334).results[0]).toMatchObject({ entityId: 'synthetic-alpha-place', matchCategory: 'exact-primary' }))
  it('matches exact historical names', () => expect(searchEntities(index, 'Synthetic Alpha Old Name', -334).results[0]).toMatchObject({ entityId: 'synthetic-alpha-place', matchCategory: 'exact-variant', matchKind: 'historical' }))
  it('matches primary prefixes', () => expect(searchEntities(index, 'Synthetic Gamma P', -334).results[0]).toMatchObject({ entityId: 'synthetic-gamma-person', matchCategory: 'primary-prefix' }))
  it('matches historical prefixes', () => expect(searchEntities(index, 'Synthetic Alpha Old', -334).results[0]).toMatchObject({ matchCategory: 'variant-prefix' }))
  it('matches token prefixes', () => expect(searchEntities(index, 'syn out', -334).results[0]).toMatchObject({ entityId: 'synthetic-beta-place', matchCategory: 'token-prefix' }))
  it('matches substrings', () => expect(searchEntities(index, 'known-location', -334).results[0]).toMatchObject({ entityId: 'synthetic-unknown-event', matchCategory: 'substring' }))
  it('ranks exact over prefix and prefix over substring', () => {
    const entries = [
      { ...baseEntry, entityId: 'exact', primaryName: 'Alpha', names: [{ value: 'Alpha', normalizedValue: 'alpha', kind: 'default' as const }] },
      { ...baseEntry, entityId: 'prefix', primaryName: 'Alphabet', names: [{ value: 'Alphabet', normalizedValue: 'alphabet', kind: 'default' as const }] },
      { ...baseEntry, entityId: 'substring', primaryName: 'Zalpha', names: [{ value: 'Zalpha', normalizedValue: 'zalpha', kind: 'default' as const }] },
    ]
    expect(searchEntities(customIndex(entries), 'alpha', -5).results.map((result) => result.entityId)).toEqual(['exact', 'prefix', 'substring'])
  })
  it('keeps strong historical matches ahead of current-year weak matches', () => {
    const historical = { ...baseEntry, entityId: 'historical', period: { yearFrom: -20, yearTo: -10 }, names: [{ value: 'Old Alpha', normalizedValue: 'old alpha', kind: 'historical' as const, period: { yearFrom: -20, yearTo: -10 }, relevantYear: -20 }] }
    const current = { ...baseEntry, entityId: 'current', primaryName: 'Old Alphabet', names: [{ value: 'Old Alphabet', normalizedValue: 'old alphabet', kind: 'default' as const }] }
    expect(searchEntities(customIndex([current, historical]), 'old alpha', 1).results[0]?.entityId).toBe('historical')
  })
  it('uses current-year relevance only as a same-match tie break', () => {
    const inactive = { ...baseEntry, entityId: 'a-inactive', period: { yearFrom: -20, yearTo: -10 } }
    const active = { ...baseEntry, entityId: 'z-active' }
    expect(searchEntities(customIndex([inactive, active]), 'alpha', 1).results[0]?.entityId).toBe('z-active')
  })
  it('uses stable type, name, and ID tie breaks without randomness', () => {
    const polity = { ...baseEntry, entityType: 'polity' as const, entityId: 'z-polity', requiredLayer: 'territories' as const }
    const placeB = { ...baseEntry, entityId: 'b-place' }
    const placeA = { ...baseEntry, entityId: 'a-place' }
    const first = searchEntities(customIndex([polity, placeB, placeA]), 'alpha', 1)
    const second = searchEntities(customIndex([placeA, polity, placeB]), 'alpha', 1)
    expect(first.results.map((result) => result.entityId)).toEqual(['a-place', 'b-place', 'z-polity'])
    expect(second).toEqual(first)
  })
  it('keeps duplicate-name entities separate but duplicate variants produce one result', () => {
    const first = { ...baseEntry, entityId: 'first', names: [...baseEntry.names, ...baseEntry.names] }
    const second = { ...baseEntry, entityId: 'second' }
    expect(searchEntities(customIndex([first, second]), 'alpha harbor', -5).results.map((result) => result.entityId)).toEqual(['first', 'second'])
  })
  it('caps visible results at twenty', () => {
    const entries = Array.from({ length: 25 }, (_, position) => ({ ...baseEntry, entityId: `place-${position + 1}` }))
    expect(searchEntities(customIndex(entries), 'alpha', -5).results).toHaveLength(SEARCH_RESULT_LIMIT)
  })
  it('groups by the stable five-type order and keeps Battle under Events', () => {
    const response = searchEntities(index, 'synthetic', -334)
    expect(response.groups.map((group) => group.entityType)).toEqual(['place', 'polity', 'person', 'event', 'journey'])
    expect(response.groups.find((group) => group.entityType === 'event')?.results.some((result) => result.subtype === 'battle')).toBe(true)
  })
  it('returns an honest no-result state', () => expect(searchEntities(index, 'definitely absent', -334)).toMatchObject({ state: 'no-results', total: 0 }))
})

describe('relevant years and map context', () => {
  it('uses the historical Place-name period and point focus', () => expect(searchEntities(index, 'Synthetic Alpha Old Name', -334).results[0]).toMatchObject({ targetYear: -500, focusCoordinates: [28, 37] }))
  it('keeps an active Place at the selected year', () => expect(searchEntities(index, 'Synthetic Alpha Place', -334).results[0]?.targetYear).toBe(-334))
  it('uses the nearest inactive Place year', () => expect(searchEntities(index, 'Synthetic Gamma Haven', -334).results[0]?.targetYear).toBe(-100))
  it('keeps an active Polity year and selects a deterministic inactive year', () => {
    expect(searchEntities(index, 'Synthetic Alpha Polity', -334).results[0]?.targetYear).toBe(-334)
    expect(searchEntities(index, 'Synthetic Beta Polity', -500).results[0]?.targetYear).toBe(-400)
  })
  it('uses an active mapped Person year', () => expect(searchEntities(index, 'Synthetic Alpha Person', -334).results[0]).toMatchObject({ targetYear: -334, focusCoordinates: [28, 37] }))
  it('uses the nearest mapped year for an alive but currently unmapped Person', () => expect(searchEntities(index, 'Synthetic Gamma Person', -334).results[0]).toMatchObject({ targetYear: -280, focusCoordinates: [30, 35] }))
  it('uses life range for a Person without any mapped year', () => {
    const person = { ...baseEntry, entityType: 'person' as const, entityId: 'unmapped-person', requiredLayer: 'people' as const, subtype: 'person', period: { yearFrom: -20, yearTo: -10 } }
    expect(searchEntities(customIndex([person]), 'alpha', -5).results[0]).toMatchObject({ targetYear: -10, focusCoordinates: null })
  })
  it('uses a single Event year and focuses only a mapped event', () => {
    expect(searchEntities(index, 'Synthetic Unknown-Location Event', -334).results[0]).toMatchObject({ targetYear: -250, focusCoordinates: null, mapped: false })
    expect(searchEntities(index, 'Synthetic Alpha Event', -400).results[0]).toMatchObject({ targetYear: -334, focusCoordinates: [28, 37] })
  })
  it('keeps an active Journey year and chooses a deterministic inactive year', () => {
    expect(searchEntities(index, 'Synthetic Alpha Journey', -334).results[0]?.targetYear).toBe(-334)
    expect(searchEntities(index, 'Synthetic Beta Expedition', -334).results[0]?.targetYear).toBe(-280)
  })
  it('never returns year zero across a BCE/CE range', () => {
    const crossing = { ...baseEntry, period: { yearFrom: -1, yearTo: 1 } }
    expect(searchEntities(customIndex([crossing]), 'alpha', -1).results[0]?.targetYear).toBe(-1)
    expect(searchEntities(customIndex([crossing]), 'alpha', 1).results[0]?.targetYear).toBe(1)
  })
  it('states unmapped status in text', () => expect(searchResultMapLabel(searchEntities(index, 'Synthetic Gamma Journey', -334).results[0]!)).toBe('No reviewed map location'))
})

describe('result-to-map navigation', () => {
  const state = parseMapUrlState('?year=-334&lat=10&lng=20&zoom=4&layers=territories&collection=synthetic-alpha-collection')
  it.each([
    ['Synthetic Alpha Place', 'place', 'places'],
    ['Synthetic Alpha Polity', 'polity', 'territories'],
    ['Synthetic Alpha Person', 'person', 'people'],
    ['Synthetic Alpha Event', 'event', 'events'],
    ['Synthetic Alpha Journey', 'journey', 'journeys'],
  ] as const)('selects typed %s and enables only its required layer', (query, type, layer) => {
    const result = searchEntities(index, query, -334).results[0]!
    const update = createSearchNavigationUpdate(state, result)
    expect(update.selectedEntity).toEqual({ type, id: result.entityId })
    expect(update.activeLayers).toContain(layer)
    expect(update.activeLayers).toContain('territories')
  })
  it('preserves canonical layer order without duplicates', () => {
    const result = searchEntities(index, 'Synthetic Alpha Person', -334).results[0]!
    expect(createSearchNavigationUpdate({ ...state, activeLayers: ['journeys', 'people', 'people'] }, result).activeLayers).toEqual(['people', 'journeys'])
  })
  it('focuses point results at a restrained zoom and preserves closer zoom', () => {
    const result = searchEntities(index, 'Synthetic Alpha Place', -334).results[0]!
    expect(createSearchNavigationUpdate(state, result)).toMatchObject({ longitude: 28, latitude: 37, zoom: SEARCH_POINT_FOCUS_MIN_ZOOM })
    expect(createSearchNavigationUpdate({ ...state, zoom: 6.5 }, result).zoom).toBe(6.5)
    expect(createSearchNavigationUpdate({ ...state, zoom: 99 }, result).zoom).toBe(MAP_ZOOM_LIMITS.maxZoom)
  })
  it('preserves viewport for unmapped, polity, and Journey results', () => {
    for (const query of ['Synthetic Unknown-Location Event', 'Synthetic Alpha Polity', 'Synthetic Alpha Journey']) {
      const update = createSearchNavigationUpdate(state, searchEntities(index, query, -334).results[0]!)
      expect(update).not.toHaveProperty('longitude')
      expect(update).not.toHaveProperty('latitude')
      expect(update).not.toHaveProperty('zoom')
    }
  })
  it('preserves collection and unknown URL parameters when merged through F6', () => {
    const result = searchEntities(index, 'Synthetic Alpha Place', -334).results[0]!
    const merged = { ...state, ...createSearchNavigationUpdate(state, result) }
    const params = serializeMapUrlState(merged, '?owner=check')
    expect(params.get('collection')).toBe('synthetic-alpha-collection')
    expect(params.get('owner')).toBe('check')
  })
  it('applies target year in the same coherent update and uses push history', () => {
    const result = searchEntities(index, 'Synthetic Unknown-Location Event', -334).results[0]!
    expect(createSearchNavigationUpdate(state, result).year).toBe(-250)
    expect(SEARCH_SELECTION_HISTORY_MODE).toBe('push')
  })
  it('keeps compatible search data immutable through queries', () => {
    const loaded = loadSearchIndex(structuredClone(index), index.datasetVersion)
    const before = JSON.stringify(loaded)
    searchEntities(loaded, 'synthetic', -334)
    expect(JSON.stringify(loaded)).toBe(before)
    expect(Object.isFrozen(loaded.entries)).toBe(true)
  })
})
