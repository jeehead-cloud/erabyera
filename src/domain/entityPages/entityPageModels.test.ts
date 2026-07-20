import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData } from '../../data'
import { syntheticRuntime } from '../../test/syntheticRuntime'
import type { RuntimeDataset } from '../../data'
import { buildEntityPageModel } from './entityPageModels'
import { entityPagePath } from './entityRoutes'
import type { SelectedEntityType } from '../../url'

const dataset = syntheticRuntime(loadBundledRuntimeData())
const records: Record<SelectedEntityType, readonly string[]> = {
  place: dataset.places.map((item) => item.id),
  polity: dataset.polities.map((item) => item.id),
  person: dataset.people.map((item) => item.id),
  event: dataset.events.map((item) => item.id),
  journey: dataset.journeys.map((item) => item.id),
}

describe('F15 entity-page models', () => {
  for (const type of Object.keys(records) as SelectedEntityType[]) {
    it(`builds every published ${type} page`, () => {
      for (const id of records[type]) {
        const model = buildEntityPageModel(dataset, type, id, -334)
        expect(model?.id).toBe(id)
        expect(model?.entityType).toBe(type)
        expect(model?.sources.resolved.length).toBeGreaterThan(0)
      }
    })

    it(`returns null for a missing ${type}`, () => {
      expect(buildEntityPageModel(dataset, type, 'synthetic-missing', -334)).toBeNull()
    })
  }

  it('retains full Place chronology and all locator-distinct evidence', () => {
    const model = buildEntityPageModel(dataset, 'place', 'synthetic-alpha-place', -334)
    expect(model?.entityType).toBe('place')
    if (model?.entityType !== 'place') return
    expect(model.record.names.map((item) => item.name)).toEqual([
      'Synthetic Alpha Old Name', 'Synthetic Alpha Place',
    ])
    expect(model.sources.resolved.map((item) => item.reference.locator)).toEqual([
      'Synthetic early name', 'Synthetic importance', 'Synthetic later name',
      'Synthetic ownership', 'Synthetic place',
    ])
    expect(model.record.coordinates).toEqual([28, 37])
  })

  it('deduplicates exact evidence while retaining locator-distinct references', () => {
    const clone = structuredClone(dataset) as RuntimeDataset
    clone.places[0].sourceRefs.push(clone.places[0].sourceRefs[0])
    clone.places[0].sourceRefs.push({ sourceId: 'synthetic-fixture-source', locator: 'Distinct locator' })
    const model = buildEntityPageModel(clone, 'place', 'synthetic-alpha-place', -334)
    expect(model?.sources.resolved.filter((item) => item.reference.locator === undefined)).toHaveLength(0)
    expect(model?.sources.resolved.some((item) => item.reference.locator === 'Distinct locator')).toBe(true)
  })

  it('isolates unresolved sources', () => {
    const clone = structuredClone(dataset) as RuntimeDataset
    clone.events[0].sourceRefs.push({ sourceId: 'synthetic-unresolved-source' })
    const model = buildEntityPageModel(clone, 'event', clone.events[0].id, -334)
    expect(model?.sources.unresolvedSourceIds).toEqual(['synthetic-unresolved-source'])
    expect(model?.sources.resolved).not.toHaveLength(0)
  })

  it('shows Polity territory categories without deriving importance from geometry', () => {
    const model = buildEntityPageModel(dataset, 'polity', 'synthetic-alpha-polity', -334)
    expect(model?.entityType).toBe('polity')
    if (model?.entityType !== 'polity') return
    expect(model.territoryPeriods.map((item) => item.controlCategory)).toEqual(['direct', 'approximate'])
    expect(model.mapped).toBe(true)
  })

  it('retains bounded Person chronology and mapped/unmapped status', () => {
    const model = buildEntityPageModel(dataset, 'person', 'synthetic-alpha-person', -334)
    expect(model?.entityType).toBe('person')
    if (model?.entityType !== 'person') return
    expect(model.chronology[0].relationship.relationType).toBe('birth')
    expect(model.chronology[0].relationship.period).toEqual({ yearFrom: -500, yearTo: -500 })
    expect(model.chronology.every((item) => item.mapped)).toBe(true)
  })

  it('keeps an alive-unmapped Person useful', () => {
    const model = buildEntityPageModel(dataset, 'person', 'synthetic-gamma-person', -334)
    expect(model?.entityType).toBe('person')
    if (model?.entityType !== 'person') return
    expect(model.presentation.alive).toBe(true)
    expect(model.presentation.mapped).toBe(false)
    expect(model.chronology).toHaveLength(1)
  })

  it('preserves Battle specialization and authored side order', () => {
    const model = buildEntityPageModel(dataset, 'event', 'synthetic-alpha-battle', -334)
    expect(model?.entityType).toBe('event')
    if (model?.entityType !== 'event' || model.presentation.kind !== 'battle') return
    expect(model.presentation.sides.map((side) => side.label)).toEqual(['Synthetic Alpha Side', 'Synthetic Beta Side'])
    expect(model.presentation.result).toBe('Synthetic fixture result')
    expect(model.presentation.forces).toBeUndefined()
    expect(model.presentation.losses).toBeUndefined()
  })

  it('keeps unknown-location Events unmapped without failing', () => {
    const model = buildEntityPageModel(dataset, 'event', 'synthetic-unknown-event', -250)
    expect(model?.entityType).toBe('event')
    if (model?.entityType !== 'event') return
    expect(model.mapped).toBe(false)
    expect(model.presentation.locationAvailable).toBe(false)
  })

  it('preserves Journey stage order, stage evidence, and unmapped behavior', () => {
    const mapped = buildEntityPageModel(dataset, 'journey', 'synthetic-alpha-journey', -334)
    const unmapped = buildEntityPageModel(dataset, 'journey', 'synthetic-gamma-journey', -250)
    expect(mapped?.entityType).toBe('journey')
    expect(unmapped?.entityType).toBe('journey')
    if (mapped?.entityType !== 'journey' || unmapped?.entityType !== 'journey') return
    expect(mapped.presentation.stages.map((stage) => stage.order)).toEqual([1, 2])
    expect(mapped.presentation.stages.every((stage) => stage.sources.resolved.length === 1)).toBe(true)
    expect(unmapped.presentation.active).toBe(true)
    expect(unmapped.presentation.geometryAvailable).toBe(false)
  })

  it('creates stable routes for every entity type', () => {
    expect(entityPagePath('place', 'synthetic-alpha-place')).toBe('/place/synthetic-alpha-place')
    expect(entityPagePath('polity', 'synthetic-alpha-polity')).toBe('/polity/synthetic-alpha-polity')
    expect(entityPagePath('person', 'synthetic-alpha-person')).toBe('/person/synthetic-alpha-person')
    expect(entityPagePath('event', 'synthetic-alpha-event')).toBe('/event/synthetic-alpha-event')
    expect(entityPagePath('journey', 'synthetic-alpha-journey')).toBe('/journey/synthetic-alpha-journey')
  })

  it('uses only explicit relations with deterministic ordering and page routes', () => {
    const first = buildEntityPageModel(dataset, 'place', 'synthetic-alpha-place', -334)
    const second = buildEntityPageModel(dataset, 'place', 'synthetic-alpha-place', -334)
    expect(first?.relations).toEqual(second?.relations)
    expect(first?.relations.some((relation) => relation.entityType === 'person')).toBe(true)
    expect(first?.relations.every((relation) => entityPagePath(relation.entityType, relation.id).startsWith('/'))).toBe(true)
  })

  it('does not mutate canonical runtime records', () => {
    const before = JSON.stringify(dataset)
    for (const type of Object.keys(records) as SelectedEntityType[]) {
      for (const id of records[type]) buildEntityPageModel(dataset, type, id, -334)
    }
    expect(JSON.stringify(dataset)).toBe(before)
    expect(Object.isFrozen(dataset)).toBe(true)
  })
})
