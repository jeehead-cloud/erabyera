import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData } from '../../data'
import { contentCollectionSchema } from '../entities'
import { sampleCollection } from '../entities/fixtures'
import { parseMapUrlState, serializeMapUrlState } from '../../url'
import {
  buildActiveCollectionPresentation,
  classifyCollectionViewport,
  collectionRecommendedMapState,
  createCollectionRecommendedMapHref,
  getCollectionById,
  getCollectionCounts,
  getCollectionMembers,
  getCollectionsForEntity,
  getPublicCollections,
  groupCollectionMembers,
  leaveCollectionUpdate,
} from '.'

const dataset = loadBundledRuntimeData()
const collection = getCollectionById(dataset, 'alexanders-world')!

describe('F16 collection runtime contract', () => {
  it('publishes the stable Alexander collection shell', () => {
    expect(collection).toMatchObject({
      id: 'alexanders-world', defaultName: 'Alexander’s World',
      timeRange: { yearFrom: -360, yearTo: -300 }, recommendedStartYear: -334,
      visibility: 'public', completeness: 'foundation-preview', membershipKind: 'synthetic-demonstration',
    })
  })

  it('uses the reviewed product viewport and canonical layers', () => {
    expect(collection.recommendedViewport).toEqual({ longitude: 28, latitude: 37, zoom: 3.5 })
    expect(collection.recommendedLayers).toEqual(['territories', 'places', 'people', 'events', 'journeys'])
  })

  it('keeps detailed and partial geography explicit', () => {
    expect(collection.coverage.detailedRegions).toContain('Macedonia')
    expect(collection.coverage.partialRegions).toContain('the Indus Valley')
  })

  it('rejects duplicate or noncanonical recommended layers', () => {
    expect(contentCollectionSchema.safeParse({ ...sampleCollection, recommendedLayers: ['places', 'territories'] }).success).toBe(false)
    expect(contentCollectionSchema.safeParse({ ...sampleCollection, recommendedLayers: ['places', 'places'] }).success).toBe(false)
  })

  it('rejects duplicate coverage regions and membership', () => {
    expect(contentCollectionSchema.safeParse({ ...sampleCollection, coverage: { ...sampleCollection.coverage, partialRegions: ['Synthetic detailed region'] } }).success).toBe(false)
    expect(contentCollectionSchema.safeParse({ ...sampleCollection, linkedEntities: { ...sampleCollection.linkedEntities, placeIds: ['sample-place', 'sample-place'] } }).success).toBe(false)
  })

  it('rejects an out-of-range recommended year and malformed focus bounds', () => {
    expect(contentCollectionSchema.safeParse({ ...sampleCollection, recommendedStartYear: 11 }).success).toBe(false)
    expect(contentCollectionSchema.safeParse({ ...sampleCollection, focusBounds: { west: 40, south: 35, east: 20, north: 55 } }).success).toBe(false)
  })

  it('rejects a coverage period that diverges from the collection period', () => {
    expect(contentCollectionSchema.safeParse({
      ...sampleCollection,
      coverage: { ...sampleCollection.coverage, timeRange: { yearFrom: -9, yearTo: 10 } },
    }).success).toBe(false)
  })
})

describe('F16 collection selectors and counts', () => {
  const members = getCollectionMembers(dataset, collection)

  it('excludes the internal compatibility fixture from the public list', () => {
    expect(getPublicCollections(dataset).map((item) => item.id)).toEqual(['alexanders-world'])
  })

  it('resolves missing collections safely', () => expect(getCollectionById(dataset, 'missing')).toBeNull())

  it('uses explicit membership with deterministic grouping', () => {
    expect(members).toHaveLength(11)
    expect(groupCollectionMembers(members).place.map((item) => item.id)).toEqual(['synthetic-alpha-place', 'synthetic-beta-place'])
    expect(members.every((item) => item.syntheticDemonstration)).toBe(true)
  })

  it('derives published, active, mapped, and type counts from linked members only', () => {
    expect(getCollectionCounts(members)).toEqual({
      total: 11,
      byType: { place: 2, polity: 2, person: 3, event: 3, journey: 1 },
      active: 10,
      activeMapped: 9,
      activeUnmapped: 1,
      mapped: 10,
      unmapped: 1,
    })
  })

  it('derives inverse membership without inference', () => {
    expect(getCollectionsForEntity(dataset, 'place', 'synthetic-alpha-place').map((item) => item.id)).toEqual(['alexanders-world', 'synthetic-alpha-collection'])
    expect(getCollectionsForEntity(dataset, 'place', 'synthetic-gamma-place')).toEqual([])
  })
})

describe('F16 period and viewport coverage', () => {
  it.each([[-360, 'inside'], [-334, 'inside'], [-300, 'inside'], [-361, 'outside'], [-299, 'outside']] as const)(
    'classifies year %s as %s',
    (year, expected) => expect(buildActiveCollectionPresentation(dataset, collection.id, year, collection.recommendedViewport)).toMatchObject({ periodState: expected }),
  )

  it('classifies the product focus extent without creating polygon geometry', () => {
    expect(classifyCollectionViewport(collection, collection.recommendedViewport)).toBe('recommended-focus')
    expect(classifyCollectionViewport(collection, { longitude: -100, latitude: 60, zoom: 3.5 })).toBe('outside-focus')
    expect(collection).not.toHaveProperty('geometry')
  })

  it('returns deterministic range, focus, sparse, and preview messaging', () => {
    const presentation = buildActiveCollectionPresentation(dataset, collection.id, -200, { longitude: -100, latitude: 60, zoom: 3.5 })
    expect(presentation.messages.join(' ')).toContain("outside this collection's documented time range")
    expect(presentation.messages.join(' ')).toContain("outside the collection's authored product focus")
    expect(presentation.messages.join(' ')).toContain('not historical borders')
    expect(presentation.messages.join(' ')).toContain('should not be interpreted as historically inactive')
    expect(presentation.messages.join(' ')).toContain('next content milestone')
    expect(presentation.messages.join(' ')).toContain('does not filter the other global Map data')
  })

  it('distinguishes no-active-member coverage without implying historical inactivity', () => {
    const presentation = buildActiveCollectionPresentation(dataset, collection.id, 1000, collection.recommendedViewport)
    expect(presentation).toMatchObject({ state: 'resolved', counts: { active: 0, activeMapped: 0, activeUnmapped: 0 } })
    expect(presentation.messages.join(' ')).toContain('dataset-coverage gap')
    expect(presentation.messages.join(' ')).toContain('not evidence that no historical activity occurred')
  })

  it('preserves an unresolved collection ID for explicit clearing', () => {
    expect(buildActiveCollectionPresentation(dataset, 'missing-collection', -334, collection.recommendedViewport)).toMatchObject({ state: 'unresolved', collectionId: 'missing-collection' })
  })
})

describe('F16 collection navigation', () => {
  it('creates one explicit recommended Map URL state', () => {
    const href = createCollectionRecommendedMapHref(collection)
    expect(href).toBe('/map?year=-334&lat=37&lng=28&zoom=3.5&layers=territories%2Cplaces%2Cpeople%2Cevents%2Cjourneys&collection=alexanders-world')
    expect(parseMapUrlState(href.split('?')[1])).toEqual(collectionRecommendedMapState(collection))
  })

  it('clears an unrelated selection in recommended state', () => {
    expect(collectionRecommendedMapState(collection).selectedEntity).toBeNull()
  })

  it('leave removes only collection while preserving all other and unknown state', () => {
    const current = parseMapUrlState('?year=-320&lat=41&lng=50&zoom=5&layers=places&entity=place%3Asynthetic-alpha-place&collection=alexanders-world')
    const next = serializeMapUrlState({ ...current, ...leaveCollectionUpdate() }, '?campaign=keep').toString()
    expect(next).toBe('year=-320&lat=41&lng=50&zoom=5&layers=places&entity=place%3Asynthetic-alpha-place&campaign=keep')
  })
})
