import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData } from '../../data'
import { syntheticRuntime } from '../../test/syntheticRuntime'
import type { Journey, SourceReference } from '../entities'
import {
  aggregateJourneySources,
  buildJourneyFeatureCollection,
  buildJourneyPresentation,
  buildJourneyPresentations,
  createJourneySelection,
  isJourneyActiveAtYear,
  journeyDirectionLabel,
  journeyTypeLabel,
  resolveJourneyStages,
  routeCertaintyLabel,
  selectedJourneyId,
  withSelectedJourney,
  withSelectedJourneyYear,
  withoutImplementedMapSelection,
} from '.'
import { DEFAULT_MAP_URL_STATE, type MapUrlState } from '../../url'

const data = syntheticRuntime(loadBundledRuntimeData())
const alpha = data.journeys.find((journey) => journey.id === 'synthetic-alpha-journey')!
const beta = data.journeys.find((journey) => journey.id === 'synthetic-beta-expedition')!
const gamma = data.journeys.find((journey) => journey.id === 'synthetic-gamma-journey')!

describe('journey activity and presentation', () => {
  it('is active at its inclusive start', () => expect(isJourneyActiveAtYear(alpha, -350)).toBe(true))
  it('is active at its inclusive end', () => expect(isJourneyActiveAtYear(alpha, -300)).toBe(true))
  it('is inactive before its period', () => expect(isJourneyActiveAtYear(alpha, -351)).toBe(false))
  it('is inactive after its period', () => expect(isJourneyActiveAtYear(alpha, -299)).toBe(false))
  it('keeps unknown ends inactive under the explicit F2 default policy', () => {
    const open = { ...alpha, period: { yearFrom: -350, yearTo: null } }
    expect(isJourneyActiveAtYear(open, -334)).toBe(false)
  })
  it('builds deterministic journey order', () => {
    const ids = buildJourneyPresentations(data, -334).map((journey) => journey.id)
    expect(ids).toEqual([...ids].sort())
  })
  it('keeps an inactive selected journey inspectable', () => {
    const presentation = buildJourneyPresentation(beta, data, data.geometry.journeys, -334)
    expect(presentation.active).toBe(false)
    expect(presentation.nearestActiveYear).toBe(-280)
  })
  it('separates active status from missing geometry', () => {
    const presentation = buildJourneyPresentation(gamma, data, data.geometry.journeys, -250)
    expect(presentation.active).toBe(true)
    expect(presentation.geometryAvailable).toBe(false)
    expect(presentation.nearestMappedYear).toBeNull()
  })
  it('provides first and nearest mapped years only for mapped journeys', () => {
    const presentation = buildJourneyPresentation(alpha, data, data.geometry.journeys, -200)
    expect(presentation.firstMappedYear).toBe(-350)
    expect(presentation.nearestMappedYear).toBe(-300)
  })
  it('retains explicit known and unknown direction', () => {
    expect(buildJourneyPresentation(alpha, data, data.geometry.journeys, -334).directionKnown).toBe(true)
    expect(buildJourneyPresentation(beta, data, data.geometry.journeys, -270).directionKnown).toBe(false)
  })
  it('retains canonical route certainty', () => {
    expect(buildJourneyPresentation(alpha, data, data.geometry.journeys, -334).routeCertainty).toBe('schematic')
    expect(buildJourneyPresentation(beta, data, data.geometry.journeys, -270).routeCertainty).toBe('probable')
  })
  it('uses honest type, certainty, and direction copy', () => {
    expect(journeyTypeLabel('campaign')).toBe('Campaign')
    expect(routeCertaintyLabel('uncertain')).toBe('Uncertain route')
    expect(journeyDirectionLabel(true)).toBe('Direction documented')
    expect(journeyDirectionLabel(false)).toBe('Direction not established')
  })
})

describe('route stages and relations', () => {
  it('retains authored stage order', () => expect(resolveJourneyStages(alpha, data, -334).map((stage) => stage.order)).toEqual([1, 2]))
  it('rejects duplicate stage order defensively', () => {
    const invalid = { ...alpha, stages: alpha.stages.map((stage) => ({ ...stage, order: 1 })) } as Journey
    expect(() => resolveJourneyStages(invalid, data, -334)).toThrow('invalid route-stage order')
  })
  it('resolves place and event stages', () => {
    const stage = resolveJourneyStages(alpha, data, -334)[0]
    expect(stage.place?.name).toBe('Synthetic Alpha Place')
    expect(stage.event?.name).toBe('Synthetic Alpha Event')
  })
  it('resolves a period-appropriate place name', () => {
    const custom = { ...alpha, stages: [{ ...alpha.stages[0], eventId: undefined, year: -450 }] } as Journey
    expect(resolveJourneyStages(custom, data, -334)[0].place?.name).toBe('Synthetic Alpha Old Name')
  })
  it('retains coordinate-only stages without inventing relations', () => {
    const stage = resolveJourneyStages(beta, data, -270)[1]
    expect(stage.coordinates).toEqual([29, 36])
    expect(stage.place).toBeNull()
    expect(stage.event).toBeNull()
  })
  it('fails safely for an unresolved stage relation', () => {
    const custom = { ...alpha, stages: [{ ...alpha.stages[0], placeId: 'missing-place', eventId: undefined }] } as Journey
    expect(resolveJourneyStages(custom, data, -334)[0].place).toEqual({ id: 'missing-place', name: null })
  })
  it('retains stage uncertainty', () => expect(resolveJourneyStages(alpha, data, -334)[1].uncertainty?.confidence).toBe('low'))
  it('resolves stage evidence without borrowing participant sources', () => {
    const stage = resolveJourneyStages(alpha, data, -334)[0]
    expect(stage.sources.resolved[0].source.title).toBe('Synthetic pipeline fixture source')
    expect(stage.sources.resolved[0].reference.locator).toBe('Synthetic campaign departure')
    expect(stage.sources.resolved.map(({ reference }) => reference.locator)).not.toContain('Synthetic alpha person')
  })
  it('does not invent intermediate stages', () => expect(resolveJourneyStages(alpha, data, -334)).toHaveLength(alpha.stages.length))
  it('resolves participant people and polities deterministically', () => {
    const presentation = buildJourneyPresentation(alpha, data, data.geometry.journeys, -334)
    expect(presentation.participantPeople.map((person) => person.id)).toEqual(['synthetic-alpha-person', 'synthetic-beta-person'])
    expect(presentation.participantPolities.map((polity) => polity.id)).toEqual(['synthetic-alpha-polity', 'synthetic-beta-polity'])
  })
  it('resolves only explicit related places and events', () => {
    const presentation = buildJourneyPresentation(alpha, data, data.geometry.journeys, -334)
    expect(presentation.relatedPlaces.map((place) => place.id)).toEqual(['synthetic-alpha-place', 'synthetic-beta-place'])
    expect(presentation.relatedEvents.map((event) => event.id)).toEqual(['synthetic-alpha-battle', 'synthetic-alpha-event'])
    expect(presentation.relatedEvents.map((event) => event.id)).not.toContain('synthetic-unknown-event')
  })
})

describe('journey evidence', () => {
  it('prioritizes journey references before stage references', () => {
    const result = aggregateJourneySources(alpha, data.sources)
    expect(result.resolved[0].reference.locator).toBe('Synthetic alpha campaign route')
    expect(result.resolved[1].reference.locator).toBe('Synthetic campaign departure')
  })
  it('deduplicates identical references', () => {
    const reference: SourceReference = { sourceId: 'synthetic-fixture-source', locator: 'Same locator' }
    const custom = { ...alpha, sourceRefs: [reference, reference], stages: alpha.stages.map((stage) => ({ ...stage, sourceRefs: [] })) }
    expect(aggregateJourneySources(custom, data.sources).resolved).toHaveLength(1)
  })
  it('retains locator-distinct references', () => {
    const custom = { ...alpha, sourceRefs: [
      { sourceId: 'synthetic-fixture-source', locator: 'One' },
      { sourceId: 'synthetic-fixture-source', locator: 'Two' },
    ], stages: alpha.stages.map((stage) => ({ ...stage, sourceRefs: [] })) }
    expect(aggregateJourneySources(custom, data.sources).resolved).toHaveLength(2)
  })
  it('does not include participant general sources', () => {
    const locators = aggregateJourneySources(alpha, data.sources).resolved.map(({ reference }) => reference.locator)
    expect(locators).not.toContain('Synthetic alpha person')
  })
  it('fails safely for an unresolved source', () => {
    const custom = { ...alpha, sourceRefs: [{ sourceId: 'missing-source' }], stages: alpha.stages.map((stage) => ({ ...stage, sourceRefs: [] })) } as Journey
    expect(aggregateJourneySources(custom, data.sources).unresolvedSourceIds).toEqual(['missing-source'])
  })
})

describe('journey GeoJSON and visibility', () => {
  const presentations = buildJourneyPresentations(data, -334)
  it('returns a valid FeatureCollection with stable IDs', () => {
    const result = buildJourneyFeatureCollection(presentations, data.geometry.journeys, true, null)
    expect(result.type).toBe('FeatureCollection')
    expect(result.features.map((feature) => feature.id)).toEqual(['synthetic-alpha-journey-feature'])
  })
  it('preserves canonical longitude-latitude coordinates', () => {
    const feature = buildJourneyFeatureCollection(presentations, data.geometry.journeys, true, null).features[0]
    expect(feature.geometry.coordinates[0]).toEqual([28, 37])
  })
  it('supports canonical MultiLineString geometry', () => {
    const betaPresentations = buildJourneyPresentations(data, -270)
    expect(buildJourneyFeatureCollection(betaPresentations, data.geometry.journeys, true, null).features[0].geometry.type).toBe('MultiLineString')
  })
  it('uses compact serializable properties', () => {
    const properties = buildJourneyFeatureCollection(presentations, data.geometry.journeys, true, null).features[0].properties
    expect(Object.keys(properties).sort()).toEqual(['active', 'certaintyGroup', 'directionKnown', 'displayName', 'entityType', 'journeyId', 'journeyType', 'selected'].sort())
    expect(JSON.stringify(properties)).not.toContain('stages')
    expect(JSON.stringify(properties)).not.toContain('sourceRefs')
  })
  it('hides normal routes when the layer is disabled', () => expect(buildJourneyFeatureCollection(presentations, data.geometry.journeys, false, null).features).toHaveLength(0))
  it('hides inactive normal routes', () => {
    const inactive = buildJourneyPresentations(data, -200)
    expect(buildJourneyFeatureCollection(inactive, data.geometry.journeys, true, null).features).toHaveLength(0)
  })
  it('keeps a selected inactive mapped route as an override', () => {
    const inactive = buildJourneyPresentations(data, -334)
    const result = buildJourneyFeatureCollection(inactive, data.geometry.journeys, true, beta.id)
    expect(result.features.find((feature) => feature.properties.journeyId === beta.id)?.properties.active).toBe(false)
  })
  it('keeps a selected mapped route when the layer is disabled', () => {
    const result = buildJourneyFeatureCollection(presentations, data.geometry.journeys, false, alpha.id)
    expect(result.features).toHaveLength(1)
    expect(result.features[0].properties.selected).toBe(true)
  })
  it('never invents a feature for an active unmapped journey', () => {
    const unmapped = buildJourneyPresentations(data, -250)
    expect(buildJourneyFeatureCollection(unmapped, data.geometry.journeys, true, gamma.id).features).toHaveLength(0)
  })
  it('orders multiple visible features deterministically', () => {
    const all = buildJourneyPresentations(data, -270)
    const result = buildJourneyFeatureCollection(all, data.geometry.journeys, true, alpha.id)
    expect(result.features.map((feature) => feature.id)).toEqual([...result.features.map((feature) => feature.id)].sort())
  })
})

describe('journey selection and temporal actions', () => {
  const state: MapUrlState = { ...DEFAULT_MAP_URL_STATE, activeLayers: ['places', 'journeys'], collectionId: 'synthetic-alpha-collection' }
  it('creates a typed journey selection', () => expect(createJourneySelection(alpha.id)).toEqual({ type: 'journey', id: alpha.id }))
  it('derives only journey IDs from URL selection', () => {
    expect(selectedJourneyId({ type: 'journey', id: alpha.id })).toBe(alpha.id)
    expect(selectedJourneyId({ type: 'event', id: 'synthetic-alpha-event' })).toBeNull()
  })
  it('preserves URL state while selecting', () => {
    const selected = withSelectedJourney(state, alpha.id)
    expect(selected).toEqual({ ...state, selectedEntity: { type: 'journey', id: alpha.id } })
  })
  it('preserves URL state while changing to a journey year', () => {
    const selected = withSelectedJourneyYear(withSelectedJourney(state, alpha.id), -350)
    expect(selected).toEqual({ ...state, year: -350, selectedEntity: { type: 'journey', id: alpha.id } })
  })
  it('clears every implemented map selection', () => {
    expect(withoutImplementedMapSelection(withSelectedJourney(state, alpha.id)).selectedEntity).toBeNull()
    expect(withoutImplementedMapSelection({ ...state, selectedEntity: { type: 'person', id: 'synthetic-alpha-person' } }).selectedEntity).toBeNull()
  })
})
