import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData, loadBundledSearchIndex } from '../../data'
import { parseMapUrlState } from '../../url'
import { createEntityMapHref } from '../entityPages'
import {
  buildExploreCatalog,
  buildExploreLandingCounts,
  catalogTypeFromSlug,
  EXPLORE_CATALOGS,
  parseCatalogQuery,
  serializeCatalogQuery,
  type ExploreCatalogType,
} from './catalog'

const dataset = loadBundledRuntimeData()
const index = loadBundledSearchIndex()
const expectedCurrent: Record<ExploreCatalogType, number> = {
  place: 2, polity: 2, person: 3, event: 2, journey: 1,
}
const expectedAll: Record<ExploreCatalogType, number> = {
  place: 3, polity: 2, person: 3, event: 3, journey: 3,
}

function state(type: ExploreCatalogType, period: 'current' | 'all' = 'current') {
  return parseCatalogQuery(`period=${period}&year=-334`, type)
}

describe('F15 Explore catalogs', () => {
  it('declares exactly five functional catalogs and no Sources catalog', () => {
    expect(EXPLORE_CATALOGS.map((item) => item.slug)).toEqual(['places', 'polities', 'people', 'events', 'journeys'])
    expect(EXPLORE_CATALOGS.every((item) => item.description.length > 0)).toBe(true)
  })

  for (const catalog of EXPLORE_CATALOGS) {
    it(`resolves the ${catalog.slug} route contract`, () => {
      expect(catalogTypeFromSlug(catalog.slug)).toBe(catalog.type)
    })

    it(`applies ${catalog.label} current-year activity semantics`, () => {
      const model = buildExploreCatalog(dataset, index, catalog.type, state(catalog.type))
      expect(model.items).toHaveLength(expectedCurrent[catalog.type])
      expect(model.items.every((item) => item.active)).toBe(true)
    })

    it(`includes every published ${catalog.label} record in all-period mode`, () => {
      const model = buildExploreCatalog(dataset, index, catalog.type, state(catalog.type, 'all'))
      expect(model.items).toHaveLength(expectedAll[catalog.type])
    })
  }

  it('includes alive-unmapped People in current-year mode', () => {
    const model = buildExploreCatalog(dataset, index, 'person', state('person'))
    const gamma = model.items.find((item) => item.model.id === 'synthetic-gamma-person')
    expect(gamma?.active).toBe(true)
    expect(gamma?.mapped).toBe(false)
  })

  it('uses whole-record map availability in all-period mode', () => {
    const people = buildExploreCatalog(dataset, index, 'person', state('person', 'all'))
    const polities = buildExploreCatalog(dataset, index, 'polity', parseCatalogQuery('period=all&year=-250', 'polity'))
    expect(people.items.find((item) => item.model.id === 'synthetic-gamma-person')?.mapped).toBe(true)
    expect(polities.items.find((item) => item.model.id === 'synthetic-beta-polity')?.mapped).toBe(true)
  })

  it('uses the F14 index for historical Place-name matches and retains context', () => {
    const query = parseCatalogQuery('period=all&year=-334&q=old+name', 'place')
    const model = buildExploreCatalog(dataset, index, 'place', query)
    expect(model.items).toHaveLength(1)
    expect(model.items[0].model.id).toBe('synthetic-alpha-place')
    expect(model.items[0].match?.matchedName).toBe('Synthetic Alpha Old Name')
    const href = createEntityMapHref(index, 'place', model.items[0].model.id, model.items[0].match?.targetYear)
    expect(parseMapUrlState(href?.split('?')[1] ?? '').year).toBe(-500)
  })

  it('constrains F14 matches to the catalog entity type', () => {
    const query = parseCatalogQuery('period=all&q=synthetic', 'event')
    const model = buildExploreCatalog(dataset, index, 'event', query)
    expect(model.items.every((item) => item.model.entityType === 'event')).toBe(true)
  })

  it('keeps unfiltered browsing usable when search is unavailable', () => {
    const model = buildExploreCatalog(dataset, null, 'place', parseCatalogQuery('period=all&q=alpha', 'place'))
    expect(model.searchUnavailable).toBe(true)
    expect(model.items).toHaveLength(3)
  })

  it('sorts by name with a stable ID tie-break', () => {
    const model = buildExploreCatalog(dataset, index, 'journey', parseCatalogQuery('period=all&sort=name', 'journey'))
    expect(model.items.map((item) => item.model.name)).toEqual([
      'Synthetic Alpha Journey', 'Synthetic Beta Expedition', 'Synthetic Gamma Journey',
    ])
  })

  it('supports period, importance, and type sorting only where valid', () => {
    expect(buildExploreCatalog(dataset, index, 'place', parseCatalogQuery('period=all&sort=importance', 'place')).items[0].model.id).toBe('synthetic-alpha-place')
    expect(parseCatalogQuery('sort=importance', 'polity').sort).toBe('name')
    expect(buildExploreCatalog(dataset, index, 'event', parseCatalogQuery('period=all&sort=type', 'event')).items).toHaveLength(3)
  })

  it('canonicalizes malformed query values and rejects year zero', () => {
    expect(parseCatalogQuery('period=invalid&year=0&sort=area', 'place')).toEqual({ period: 'current', year: -334, query: '', sort: 'name' })
  })

  it('serializes reproducible state and preserves unrelated parameters', () => {
    const params = serializeCatalogQuery({ period: 'all', year: -250, query: 'gamma', sort: 'period' }, 'journey', 'utm=x')
    expect(params.toString()).toBe('period=all&year=-250&q=gamma&sort=period&utm=x')
    expect(parseCatalogQuery(params, 'journey')).toEqual({ period: 'all', year: -250, query: 'gamma', sort: 'period' })
  })

  it('reports correct landing counts', () => {
    const counts = buildExploreLandingCounts(dataset, -334)
    expect(Object.fromEntries(counts.map((item) => [item.type, item.activeCount]))).toEqual(expectedCurrent)
    expect(Object.fromEntries(counts.map((item) => [item.type, item.publishedCount]))).toEqual(expectedAll)
  })

  for (const catalog of EXPLORE_CATALOGS) {
    it(`creates a typed ${catalog.label} View-on-map URL`, () => {
      const id = (catalog.type === 'place' ? dataset.places
        : catalog.type === 'polity' ? dataset.polities
          : catalog.type === 'person' ? dataset.people
            : catalog.type === 'event' ? dataset.events
              : dataset.journeys)[0].id
      const href = createEntityMapHref(index, catalog.type, id, -334)
      expect(href?.startsWith('/map')).toBe(true)
      const parsed = parseMapUrlState(href?.split('?')[1] ?? '')
      expect(parsed.selectedEntity).toEqual({ type: catalog.type, id })
      expect(parsed.year).not.toBe(0)
    })
  }

  it('focuses only deterministic point entities', () => {
    const place = parseMapUrlState(createEntityMapHref(index, 'place', 'synthetic-alpha-place', -334)?.split('?')[1] ?? '')
    const polity = parseMapUrlState(createEntityMapHref(index, 'polity', 'synthetic-alpha-polity', -334)?.split('?')[1] ?? '')
    const journey = parseMapUrlState(createEntityMapHref(index, 'journey', 'synthetic-alpha-journey', -334)?.split('?')[1] ?? '')
    expect([place.longitude, place.latitude, place.zoom]).toEqual([28, 37, 5.5])
    expect([polity.longitude, polity.latitude, polity.zoom]).toEqual([28, 37, 3.5])
    expect([journey.longitude, journey.latitude, journey.zoom]).toEqual([28, 37, 3.5])
  })

  it('keeps unmapped entity navigation at the default viewport', () => {
    const href = createEntityMapHref(index, 'event', 'synthetic-unknown-event', -334)
    const parsed = parseMapUrlState(href?.split('?')[1] ?? '')
    expect(parsed.year).toBe(-250)
    expect([parsed.longitude, parsed.latitude, parsed.zoom]).toEqual([28, 37, 3.5])
  })
})
