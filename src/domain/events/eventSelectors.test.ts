import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData } from '../../data'
import { syntheticRuntime } from '../../test/syntheticRuntime'
import type { Battle, HistoricalEvent, SourceReference } from '../entities'
import { eventSchema, historicalEventSchema } from '../entities'
import { parseMapUrlState, serializeMapUrlState } from '../../url'
import {
  aggregateEventSources,
  buildEventPresentation,
  buildEventPresentations,
  eventLocationLabel,
  eventTypeStyleGroup,
  isEventActiveAtYear,
  validateEventLocation,
} from './eventSelectors'
import { buildEventFeatureCollection } from './eventGeoJson'
import {
  EVENT_SELECTION_HISTORY_MODE,
  createEventSelection,
  selectedEventId,
  withSelectedEvent,
  withSelectedEventYear,
  withoutImplementedMapSelection,
} from './selection'

const dataset = syntheticRuntime(loadBundledRuntimeData())
const ordinary = dataset.events.find((event) => event.id === 'synthetic-alpha-event') as HistoricalEvent
const battle = dataset.events.find((event) => event.id === 'synthetic-alpha-battle') as Battle
const unknown = dataset.events.find((event) => event.id === 'synthetic-unknown-event') as HistoricalEvent
const at = (event: HistoricalEvent, year = -334) => buildEventPresentation(event, dataset, year)

describe('runtime events and temporal activity', () => {
  it('loads a generated generic event', () => expect(ordinary.type).toBe('political'))
  it('loads a generated specialized battle', () => expect(battle.type).toBe('battle'))
  it('is active at the inclusive start', () => expect(isEventActiveAtYear(ordinary, -334)).toBe(true))
  it('is active at the inclusive end', () => expect(isEventActiveAtYear(ordinary, -334)).toBe(true))
  it('is inactive before its period', () => expect(isEventActiveAtYear(ordinary, -335)).toBe(false))
  it('is inactive after its period', () => expect(isEventActiveAtYear(ordinary, -333)).toBe(false))
  it('keeps a single-year event active only in its year', () => {
    expect(isEventActiveAtYear(unknown, -250)).toBe(true)
    expect(isEventActiveAtYear(unknown, -249)).toBe(false)
  })
  it('does not treat an unknown end as ongoing', () => {
    const event = structuredClone(ordinary)
    event.period.yearTo = null
    expect(isEventActiveAtYear(event, -333)).toBe(false)
  })
  it('presents selected inactive status without changing year', () => expect(at(ordinary, -250)).toMatchObject({ active: false, firstActiveYear: -334, nearestActiveYear: -334 }))
  it('orders presentations deterministically', () => expect(buildEventPresentations(dataset, -334).map((event) => event.id)).toEqual(['synthetic-alpha-battle', 'synthetic-alpha-event', 'synthetic-unknown-event']))
})

describe('event location contract', () => {
  it('presents an exact mapped event', () => expect(at(ordinary)).toMatchObject({ coordinates: [28, 37], locationAccuracy: 'exact', locationAvailable: true }))
  it('presents an approximate mapped battle', () => expect(at(battle)).toMatchObject({ coordinates: [30.5, 36.5], locationAccuracy: 'approximate' }))
  it.each(['disputed', 'regional'] as const)('supports a %s representative point', (accuracy) => {
    const event = structuredClone(ordinary)
    event.locationAccuracy = accuracy
    expect(at(event).locationAccuracy).toBe(accuracy)
  })
  it('keeps unknown location unmapped', () => expect(at(unknown, -250)).toMatchObject({ coordinates: null, locationAvailable: false, locationAccuracy: 'unknown' }))
  it('never turns missing coordinates into zero', () => expect(JSON.stringify(at(unknown, -250))).not.toContain('[0,0]'))
  it('preserves longitude-latitude order', () => expect(at(battle).coordinates).toEqual([30.5, 36.5]))
  it('rejects non-unknown accuracy without coordinates safely', () => {
    const event = structuredClone(unknown)
    event.locationAccuracy = 'approximate'
    expect(() => validateEventLocation(event)).toThrow('without coordinates')
  })
  it('rejects unknown accuracy with coordinates safely', () => {
    const event = structuredClone(ordinary)
    event.locationAccuracy = 'unknown'
    expect(() => validateEventLocation(event)).toThrow('supplies coordinates')
  })
  it.each([
    ['exact', true, 'exact location'],
    ['approximate', true, 'approximate location'],
    ['regional', true, 'Regional representative point'],
    ['unknown', false, 'No reviewed map location'],
  ] as const)('formats %s location honestly', (accuracy, available, label) => expect(eventLocationLabel(accuracy, available)).toBe(label))
})

describe('event types and battle specialization', () => {
  it.each(['political', 'cultural', 'disaster', 'epidemic', 'other'] as const)('maps %s to ordinary styling', (type) => expect(eventTypeStyleGroup(type)).toBe('ordinary'))
  it('maps battle to battle styling', () => expect(eventTypeStyleGroup('battle')).toBe('battle'))
  it('keeps battle compatible with HistoricalEvent', () => expect(historicalEventSchema.parse(battle).type).toBe('battle'))
  it('rejects unsupported event types', () => expect(eventSchema.safeParse({ ...ordinary, type: 'coronation' }).success).toBe(false))
  it('builds two structured battle sides', () => {
    const presentation = at(battle)
    expect(presentation.kind === 'battle' && presentation.sides).toHaveLength(2)
  })
  it('resolves side polities, people, and commanders', () => {
    const presentation = at(battle)
    if (presentation.kind !== 'battle') throw new Error('Expected battle')
    expect(presentation.sides[0]).toMatchObject({ polities: [{ name: 'Synthetic Alpha Polity' }], people: [{ name: 'Synthetic Alpha Person' }], commanders: [{ name: 'Synthetic Alpha Person' }] })
    expect(presentation.sides[1].commanders[0]?.name).toBe('Synthetic Beta Person')
  })
  it('retains result and related campaign', () => {
    const presentation = at(battle)
    expect(presentation.kind === 'battle' && presentation).toMatchObject({ result: 'Synthetic fixture result', relatedJourney: { name: 'Synthetic Alpha Journey' } })
  })
  it('does not invent optional forces or losses', () => {
    const presentation = at(battle)
    expect(presentation.kind === 'battle' && presentation.forces).toBeUndefined()
    expect(presentation.kind === 'battle' && presentation.losses).toBeUndefined()
  })
  it('deduplicates repeated structured participants', () => {
    const event = structuredClone(battle)
    event.battle.sides[0].personIds.push('synthetic-alpha-person')
    const presentation = at(event)
    expect(presentation.kind === 'battle' && presentation.sides[0].people).toHaveLength(1)
  })
  it('preserves authored deterministic side order', () => {
    const presentation = at(battle)
    expect(presentation.kind === 'battle' && presentation.sides.map((side) => side.id)).toEqual(['synthetic-alpha-side', 'synthetic-beta-side'])
  })
  it('preserves disputed interpretation', () => {
    const presentation = at(battle)
    expect(presentation.kind === 'battle' && presentation.disputedNotes[0]).toContain('synthetic')
  })
})

describe('event relation resolution', () => {
  it('resolves participant polities and people', () => expect(at(ordinary)).toMatchObject({ participantPolities: [{ name: 'Synthetic Alpha Polity' }], participantPeople: [{ name: 'Synthetic Alpha Person' }] }))
  it('resolves related places with period-appropriate names', () => {
    const event = structuredClone(ordinary)
    event.period = { yearFrom: -450, yearTo: -450 }
    expect(at(event, -450).relatedPlaces[0]?.name).toBe('Synthetic Alpha Old Name')
  })
  it('fails unresolved relations to null labels without fabrication', () => {
    const presentation = buildEventPresentation(ordinary, { places: [], polities: [], people: [], journeys: [], sources: dataset.sources }, -334)
    expect(presentation.participantPolities[0]?.name).toBeNull()
    expect(presentation.participantPeople[0]?.name).toBeNull()
    expect(presentation.relatedPlaces[0]?.name).toBeNull()
  })
  it('does not expose relation navigation state', () => expect(at(ordinary).participantPolities[0]).toEqual({ id: 'synthetic-alpha-polity', name: 'Synthetic Alpha Polity' }))
})

describe('event GeoJSON visibility', () => {
  const presentations = buildEventPresentations(dataset, -334)
  it('emits a valid FeatureCollection', () => expect(buildEventFeatureCollection(presentations, true, null)).toMatchObject({ type: 'FeatureCollection', features: expect.any(Array) }))
  it('shows two active mapped events at the default year', () => expect(buildEventFeatureCollection(presentations, true, null).features).toHaveLength(2))
  it('omits inactive normal events', () => expect(buildEventFeatureCollection(presentations, true, null).features.some((feature) => feature.id === unknown.id)).toBe(false))
  it('hides normal events when the layer is disabled', () => expect(buildEventFeatureCollection(presentations, false, null).features).toEqual([]))
  it('keeps selected mapped event when disabled', () => expect(buildEventFeatureCollection(presentations, false, ordinary.id).features[0]?.id).toBe(ordinary.id))
  it('keeps selected inactive mapped event as an inactive override', () => expect(buildEventFeatureCollection(buildEventPresentations(dataset, -250), true, ordinary.id).features[0]?.properties).toMatchObject({ selected: true, active: false }))
  it('gives selected unknown-location event no feature', () => expect(buildEventFeatureCollection(buildEventPresentations(dataset, -250), true, unknown.id).features).toEqual([]))
  it('uses stable feature IDs and deterministic order', () => expect(buildEventFeatureCollection([...presentations].reverse(), true, null)).toEqual(buildEventFeatureCollection(presentations, true, null)))
  it('retains type, accuracy, active, and selected flags', () => expect(buildEventFeatureCollection(presentations, true, battle.id).features[0]?.properties).toMatchObject({ eventType: 'battle', locationAccuracy: 'approximate', active: true, selected: true }))
  it('keeps feature properties compact', () => {
    const properties = JSON.stringify(buildEventFeatureCollection(presentations, true, null).features[0]?.properties)
    expect(properties).not.toContain('sourceRefs')
    expect(properties).not.toContain('sides')
    expect(properties).not.toContain('result')
    expect(properties).not.toContain('summary')
  })
})

describe('event selection and temporal actions', () => {
  const state = parseMapUrlState('?year=-334&lat=37&lng=28&zoom=4&layers=territories,places,events&collection=synthetic-alpha-collection')
  const selected = withSelectedEvent(state, battle.id)
  it('creates a typed event selection', () => expect(createEventSelection(battle.id)).toEqual({ type: 'event', id: battle.id }))
  it('rejects malformed IDs', () => expect(() => createEventSelection('Bad Event')).toThrow())
  it('extracts only event IDs', () => {
    expect(selectedEventId(selected.selectedEntity)).toBe(battle.id)
    expect(selectedEventId({ type: 'place', id: 'synthetic-alpha-place' })).toBeNull()
  })
  it('preserves year, viewport, layers, and collection', () => expect(selected).toMatchObject({ year: -334, latitude: 37, longitude: 28, zoom: 4, activeLayers: ['territories', 'places', 'events'], collectionId: 'synthetic-alpha-collection' }))
  it('preserves unrelated query parameters', () => expect(serializeMapUrlState(selected, '?owner=check').get('owner')).toBe('check'))
  it('uses push history', () => expect(EVENT_SELECTION_HISTORY_MODE).toBe('push'))
  it.each(['place', 'polity', 'event'] as const)('clears implemented %s selection', (type) => expect(withoutImplementedMapSelection({ ...state, selectedEntity: { type, id: 'synthetic-selection' } }).selectedEntity).toBeNull())
  it.each(['person', 'journey'] as const)('preserves future %s selection', (type) => {
    const future = { ...state, selectedEntity: { type, id: 'synthetic-selection' } as const }
    expect(withoutImplementedMapSelection(future)).toBe(future)
  })
  it('restores selected event through URL derivation', () => expect(parseMapUrlState(serializeMapUrlState(selected)).selectedEntity).toEqual({ type: 'event', id: battle.id }))
  it('keeps unresolved event selection safe', () => expect(dataset.events.find((event) => event.id === selectedEventId(createEventSelection('synthetic-missing-event')))).toBeUndefined())
  it('changes year while preserving selection and viewport', () => expect(withSelectedEventYear(selected, -250)).toMatchObject({ year: -250, latitude: 37, longitude: 28, selectedEntity: { type: 'event', id: battle.id } }))
  it('rejects year zero', () => expect(() => withSelectedEventYear(selected, 0)).toThrow())
})

describe('event evidence and synthetic identity', () => {
  it('resolves event-level source and safe external URL data', () => expect(at(ordinary).sources.resolved[0]).toMatchObject({ source: { title: 'Synthetic pipeline fixture source', url: 'https://example.com/erabyera-synthetic-fixture' } }))
  it('resolves battle-level evidence', () => expect(at(battle).sources.resolved[0]?.reference.locator).toBe('Synthetic battle'))
  it('deduplicates identical references', () => {
    const event = structuredClone(ordinary)
    event.sourceRefs.push(structuredClone(event.sourceRefs[0]))
    expect(aggregateEventSources(event, dataset.sources).resolved).toHaveLength(1)
  })
  it('retains locator-distinct references', () => {
    const event = structuredClone(ordinary)
    const distinct: SourceReference = { sourceId: event.sourceRefs[0].sourceId, locator: 'Distinct synthetic event locator' }
    event.sourceRefs.push(distinct)
    expect(aggregateEventSources(event, dataset.sources).resolved).toHaveLength(2)
  })
  it('does not add participant general sources', () => expect(at(ordinary).sources.resolved).toHaveLength(1))
  it('preserves source order deterministically', () => expect(at(ordinary).sources.resolved[0]?.reference.locator).toBe('Synthetic exact event'))
  it('reports unresolved sources safely', () => expect(aggregateEventSources(ordinary, [])).toEqual({ resolved: [], unresolvedSourceIds: ['synthetic-fixture-source'] }))
  it('keeps all event fixtures unmistakably synthetic', () => expect(dataset.events.every((event) => event.id.startsWith('synthetic-') && `${event.defaultName} ${event.summary ?? ''}`.toLowerCase().includes('synthetic'))).toBe(true))
})
