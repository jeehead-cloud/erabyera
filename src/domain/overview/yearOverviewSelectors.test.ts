import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData, type RuntimeDataset } from '../../data'
import { buildEventPresentations } from '../events'
import { buildJourneyPresentations } from '../journeys'
import { buildPersonPresentations } from '../people'
import { buildPlacePresentations } from '../places'
import { buildPolityPresentations } from '../polities'
import { HISTORICAL_LAYER_GROUP_ORDER } from '../../map/layers'
import {
  DEFAULT_MAP_URL_STATE,
  serializeMapUrlState,
} from '../../url'
import {
  YEAR_OVERVIEW_LIMITS,
  YEAR_OVERVIEW_SELECTION_HISTORY_MODE,
  buildYearOverview,
  createYearOverviewSelection,
  getYearOverviewSelectionState,
  rankOverviewEvents,
  rankOverviewJourneys,
  rankOverviewPeople,
  rankOverviewPlaces,
  rankOverviewPolities,
  withYearOverviewSelection,
} from '.'

const data = loadBundledRuntimeData()
const allLayers = DEFAULT_MAP_URL_STATE.activeLayers

describe('year overview visibility and selected-year model', () => {
  it('shows the overview only for a null selection', () => {
    expect(getYearOverviewSelectionState(data, null)).toBe('overview')
  })

  it.each([
    ['place', 'synthetic-alpha-place'],
    ['polity', 'synthetic-alpha-polity'],
    ['event', 'synthetic-alpha-event'],
    ['person', 'synthetic-alpha-person'],
    ['journey', 'synthetic-alpha-journey'],
  ] as const)('hides the overview for a selected %s', (type, id) => {
    expect(getYearOverviewSelectionState(data, { type, id })).toBe('entity-selection')
  })

  it('keeps an unresolved typed selection distinct from the overview', () => {
    expect(getYearOverviewSelectionState(data, { type: 'event', id: 'missing-event' })).toBe('unresolved-selection')
  })

  it('uses the F2 selected year and formatter', () => {
    const overview = buildYearOverview(data, -334, allLayers, null)
    expect(overview.selectedYear).toBe(-334)
    expect(overview.formattedYear).toBe('334 BCE')
  })

  it('updates immediately for another selected year', () => {
    expect(buildYearOverview(data, -250, allLayers, null).events.map((item) => item.id)).toEqual(['synthetic-unknown-event'])
  })

  it('produces deterministic model output without mutating canonical records', () => {
    const before = JSON.stringify(data)
    const first = buildYearOverview(data, -334, allLayers, null)
    const second = buildYearOverview(data, -334, allLayers, null)
    expect(second).toEqual(first)
    expect(JSON.stringify(data)).toBe(before)
  })
})

describe('event overview eligibility and ranking', () => {
  const presentations = buildEventPresentations(data, -334)

  it('includes only active events, including single-year records', () => {
    expect(rankOverviewEvents(presentations).map((event) => event.id)).toEqual(['synthetic-alpha-battle', 'synthetic-alpha-event'])
  })

  it('excludes inactive events', () => expect(rankOverviewEvents(presentations).some((event) => event.id === 'synthetic-unknown-event')).toBe(false))

  it('keeps an active unknown-location event eligible and explicitly unmapped', () => {
    const item = buildYearOverview(data, -250, allLayers, null).events[0]
    expect(item.id).toBe('synthetic-unknown-event')
    expect(item.mapped).toBe(false)
    expect(item.context).toBe('No reviewed map location')
  })

  it('uses documented type order rather than geometry as importance', () => {
    const [battle, event] = presentations
    const ordered = rankOverviewEvents([
      { ...event, type: 'political', kind: 'event', displayName: 'A mapped ordinary event', locationAvailable: true },
      { ...battle, displayName: 'Z unmapped battle', coordinates: null, locationAvailable: false },
    ])
    expect(ordered[0].type).toBe('battle')
  })

  it('ties by display name then stable ID and enforces the limit', () => {
    const base = presentations.find((event) => event.type !== 'battle')!
    const many = Array.from({ length: 7 }, (_, index) => ({ ...base, id: `event-${index}`, displayName: index < 2 ? 'Same' : `Event ${index}`, active: true }))
    const ranked = rankOverviewEvents(many)
    expect(ranked).toHaveLength(YEAR_OVERVIEW_LIMITS.events)
    expect(rankOverviewEvents(many.slice(0, 2)).map((event) => event.id)).toEqual(['event-0', 'event-1'])
  })

  it('uses no random or synthetic combined score', () => {
    expect(rankOverviewEvents.toString()).not.toMatch(/Math\.random|score|coordinates\.length/)
  })
})

describe('polity overview eligibility and ranking', () => {
  const presentations = buildPolityPresentations(data, -334)

  it('includes active polities and excludes inactive ones', () => {
    expect(rankOverviewPolities(presentations).map((polity) => polity.id)).toEqual(['synthetic-alpha-polity', 'synthetic-beta-polity'])
    expect(rankOverviewPolities(buildPolityPresentations(data, 1000))).toHaveLength(0)
  })

  it('keeps active-but-unmapped polities eligible', () => {
    const item = buildYearOverview(data, -250, allLayers, null).polities.find((polity) => polity.id === 'synthetic-beta-polity')!
    expect(item.mapped).toBe(false)
    expect(item.context).toBe('No active reviewed territory')
  })

  it('uses mapped availability only as a map-context signal before name and ID', () => {
    const [first, second] = presentations
    const ranked = rankOverviewPolities([
      { ...first, id: 'z-unmapped', displayName: 'A polity', hasActiveGeometry: false },
      { ...second, id: 'a-mapped', displayName: 'Z polity', hasActiveGeometry: true },
    ])
    expect(ranked[0].id).toBe('a-mapped')
  })

  it('enforces the polity limit without polygon-area ranking', () => {
    const many = Array.from({ length: 7 }, (_, index) => ({ ...presentations[0], id: `polity-${index}`, displayName: `Polity ${index}` }))
    expect(rankOverviewPolities(many)).toHaveLength(YEAR_OVERVIEW_LIMITS.polities)
    expect(rankOverviewPolities.toString()).not.toMatch(/area|coordinates/)
  })
})

describe('place overview eligibility and ranking', () => {
  it('includes active places with active importance and excludes inactive places', () => {
    expect(buildYearOverview(data, -334, allLayers, null).places.map((place) => place.id)).toEqual(['synthetic-alpha-place', 'synthetic-beta-place'])
    expect(buildYearOverview(data, -334, allLayers, null).places.some((place) => place.id === 'synthetic-gamma-place')).toBe(false)
  })

  it('orders by active importance descending', () => {
    expect(buildYearOverview(data, -334, allLayers, null).places.map((place) => place.name)).toEqual(['Synthetic Alpha Place', 'Synthetic Beta Outpost'])
  })

  it('reuses the selected-year historical name', () => {
    expect(buildYearOverview(data, -450, allLayers, null).places[0].name).toBe('Synthetic Alpha Old Name')
  })

  it('does not promote an active place without active importance', () => {
    const presentation = buildPlacePresentations(data, -334)[0]
    expect(rankOverviewPlaces([{ ...presentation, importance: null }])).toHaveLength(0)
  })

  it('ties by name then ID and enforces the place limit', () => {
    const base = buildPlacePresentations(data, -334)[0]
    const many = Array.from({ length: 7 }, (_, index) => ({ ...base, id: `place-${index}`, displayName: index < 2 ? 'Same' : `Place ${index}`, importance: 3 }))
    const ranked = rankOverviewPlaces(many)
    expect(ranked).toHaveLength(YEAR_OVERVIEW_LIMITS.places)
    expect(rankOverviewPlaces(many.slice(0, 2)).map((place) => place.id)).toEqual(['place-0', 'place-1'])
  })
})

describe('people overview eligibility and ranking', () => {
  const presentations = buildPersonPresentations(data, -334)

  it('lists only alive people with active mapped relationships', () => {
    expect(rankOverviewPeople(presentations).map((person) => person.id)).toEqual(['synthetic-alpha-person', 'synthetic-beta-person'])
  })

  it('counts alive-unmapped people separately', () => {
    expect(buildYearOverview(data, -334, allLayers, null).coverage.entities.people).toEqual({ published: 3, active: 3, mapped: 2, unmapped: 1 })
  })

  it('excludes people outside life and never treats inactive birthplace as current', () => {
    expect(rankOverviewPeople(buildPersonPresentations(data, 100))).toHaveLength(0)
    const alpha = presentations.find((person) => person.id === 'synthetic-alpha-person')!
    expect(alpha.primaryLocation?.relationType).toBe('campaign')
  })

  it('orders by importance then active relationship priority then name and ID', () => {
    const [alpha, beta] = presentations.filter((person) => person.mapped)
    const tied = rankOverviewPeople([
      { ...alpha, id: 'rule-person', displayName: 'A', importance: 3, primaryLocation: { ...alpha.primaryLocation!, relationType: 'rule' } },
      { ...beta, id: 'campaign-b', displayName: 'Same', importance: 3, primaryLocation: { ...beta.primaryLocation!, relationType: 'campaign' } },
      { ...beta, id: 'campaign-a', displayName: 'Same', importance: 3, primaryLocation: { ...beta.primaryLocation!, relationType: 'campaign' } },
    ])
    expect(tied.map((person) => person.id)).toEqual(['campaign-a', 'campaign-b', 'rule-person'])
  })

  it('enforces the people limit', () => {
    const base = presentations.find((person) => person.mapped)!
    const many = Array.from({ length: 7 }, (_, index) => ({ ...base, id: `person-${index}`, displayName: `Person ${index}` }))
    expect(rankOverviewPeople(many)).toHaveLength(YEAR_OVERVIEW_LIMITS.people)
  })
})

describe('journey overview eligibility and ranking', () => {
  it('includes active mapped journeys and excludes inactive journeys', () => {
    expect(buildYearOverview(data, -334, allLayers, null).journeys.map((journey) => journey.id)).toEqual(['synthetic-alpha-journey'])
  })

  it('keeps active-unmapped journeys eligible and retains certainty', () => {
    const item = buildYearOverview(data, -250, allLayers, null).journeys[0]
    expect(item.id).toBe('synthetic-gamma-journey')
    expect(item.mapped).toBe(false)
    expect(item.context).toContain('Uncertain route')
  })

  it('uses mapped status before stable name and ID and enforces the limit', () => {
    const [base] = buildJourneyPresentations(data, -334)
    const many = Array.from({ length: 6 }, (_, index) => ({ ...base, id: `journey-${index}`, displayName: index < 2 ? 'Same' : `Journey ${index}`, active: true, geometryAvailable: index !== 0 }))
    const ranked = rankOverviewJourneys(many)
    expect(ranked).toHaveLength(YEAR_OVERVIEW_LIMITS.journeys)
    expect(ranked.some((journey) => journey.id === 'journey-0')).toBe(false)
  })
})

describe('coverage, collection, and empty-state taxonomy', () => {
  it('reports exact published, active, mapped, unmapped, and territory counts', () => {
    const coverage = buildYearOverview(data, -334, allLayers, null).coverage
    expect(coverage.totalPublishedRecords).toBe(20)
    expect(coverage.entities.events).toEqual({ published: 3, active: 2, mapped: 2, unmapped: 0 })
    expect(coverage.activeTerritories).toBe(2)
  })

  it('retains dataset identity and the synthetic sparse-coverage warning', () => {
    const overview = buildYearOverview(data, -334, allLayers, null)
    expect(overview.datasetVersion).toBe('foundation-fixture-0.1.0')
    expect(overview.coverage.syntheticFixture).toBe(true)
    expect(overview.coverage.fixtureWarning).toContain('does not represent the absence of historical activity')
  })

  it('resolves collection coverage without changing year or viewport', () => {
    const global = buildYearOverview(data, -334, allLayers, null)
    const overview = buildYearOverview(data, -334, allLayers, 'alexanders-world')
    expect(overview.collection).toMatchObject({
      state: 'resolved', name: 'Alexander’s World', inSelectedYear: true,
      completeness: 'foundation-preview', membershipKind: 'synthetic-demonstration', linkedTotal: 11, linkedActive: 10,
    })
    expect(overview.collection.detailedRegions).toContain('Macedonia')
    expect(overview.events).toEqual(global.events)
    expect(overview.polities).toEqual(global.polities)
    expect(overview.places).toEqual(global.places)
    expect(overview.people).toEqual(global.people)
    expect(overview.journeys).toEqual(global.journeys)
  })

  it('handles an unresolved collection safely', () => {
    expect(buildYearOverview(data, -334, allLayers, 'missing-collection').collection).toMatchObject({ state: 'unresolved', id: 'missing-collection' })
  })

  it('marks a selected year outside collection coverage', () => {
    expect(buildYearOverview(data, 1000, allLayers, 'synthetic-alpha-collection').collection.inSelectedYear).toBe(false)
  })

  it('distinguishes normal content from no active published records', () => {
    expect(buildYearOverview(data, -334, allLayers, null).emptyState).toBe('content')
    const empty = buildYearOverview(data, 1000, allLayers, null)
    expect(empty.emptyState).toBe('no-active-records')
    expect(empty.coverage.message).not.toMatch(/nothing happened|no history/i)
  })

  it('distinguishes active-but-unmapped coverage', () => {
    const unmapped = structuredClone(data) as RuntimeDataset
    unmapped.geometry.territories.features = []
    unmapped.geometry.journeys.features = []
    for (const place of unmapped.places) delete place.coordinates
    const overview = buildYearOverview(unmapped, -250, allLayers, null)
    expect(overview.emptyState).toBe('active-but-unmapped')
    expect(overview.coverage.message).toContain('none has reviewed map geometry')
  })

  it('keeps overview eligibility independent from layer filters', () => {
    const overview = buildYearOverview(data, -334, [], null)
    expect(overview.events).not.toHaveLength(0)
    expect(overview.events.every((item) => !item.layerActive)).toBe(true)
    expect(overview.coverage.layerFiltersHideActiveContent).toBe(true)
  })

  it('omits empty item sections consistently from the model', () => {
    const overview = buildYearOverview(data, 1000, allLayers, null)
    expect([overview.events, overview.polities, overview.places, overview.people, overview.journeys].every((items) => items.length === 0)).toBe(true)
  })
})

describe('overview item selection and URL preservation', () => {
  it.each([
    ['place', 'synthetic-alpha-place'],
    ['polity', 'synthetic-alpha-polity'],
    ['event', 'synthetic-alpha-event'],
    ['person', 'synthetic-alpha-person'],
    ['journey', 'synthetic-alpha-journey'],
  ] as const)('creates an existing typed %s selection', (type, id) => {
    expect(createYearOverviewSelection(type, id)).toEqual({ type, id })
  })

  it('uses push history for explicit selection', () => expect(YEAR_OVERVIEW_SELECTION_HISTORY_MODE).toBe('push'))

  it('preserves year, viewport, layers, and collection without enabling a layer or focusing', () => {
    const state = {
      ...DEFAULT_MAP_URL_STATE,
      year: -250 as const,
      latitude: 12,
      longitude: 34,
      zoom: 6,
      activeLayers: ['places'] as const,
      collectionId: 'synthetic-alpha-collection',
    }
    const selected = withYearOverviewSelection(state, 'journey', 'synthetic-gamma-journey')
    expect(selected).toEqual({ ...state, selectedEntity: { type: 'journey', id: 'synthetic-gamma-journey' } })
  })

  it('preserves unknown URL parameters through the F6 serializer', () => {
    const selected = withYearOverviewSelection(DEFAULT_MAP_URL_STATE, 'event', 'synthetic-alpha-event')
    expect(serializeMapUrlState(selected, '?future=keep').get('future')).toBe('keep')
  })

  it('delegates layer override behavior to existing entity flows', () => {
    const state = { ...DEFAULT_MAP_URL_STATE, activeLayers: [] as const }
    expect(withYearOverviewSelection(state, 'place', 'synthetic-alpha-place').activeLayers).toEqual([])
  })
})

describe('F8-F12 integration regressions', () => {
  it('leaves historical map layer ordering unchanged', () => {
    expect(HISTORICAL_LAYER_GROUP_ORDER).toEqual(['territories', 'journeys', 'events', 'people', 'places'])
  })

  it('retains valid Place, Polity, Event, Person, and Journey detail derivation', () => {
    expect(buildPlacePresentations(data, -334)).toHaveLength(3)
    expect(buildPolityPresentations(data, -334)).toHaveLength(2)
    expect(buildEventPresentations(data, -334)).toHaveLength(3)
    expect(buildPersonPresentations(data, -334)).toHaveLength(3)
    expect(buildJourneyPresentations(data, -334)).toHaveLength(3)
  })

  it('retains item type, context, mapped state, and uncertainty without mutable records', () => {
    const items = buildYearOverview(data, -334, allLayers, null).events
    expect(items[0]).toMatchObject({ entityType: 'event', entityLabel: 'Battle', mapped: true, confidence: 'low' })
    expect(items[0]).not.toHaveProperty('score')
    expect(items[0]).not.toHaveProperty('record')
  })

  it('introduces no AI-generated summary or ranking field', () => {
    const overview = JSON.stringify(buildYearOverview(data, -334, allLayers, null))
    expect(overview).not.toMatch(/aiSummary|rankingScore|generatedNarrative/)
  })
})
