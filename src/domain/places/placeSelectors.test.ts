import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData, type RuntimeDataset } from '../../data'
import { syntheticRuntime } from '../../test/syntheticRuntime'
import type { Place, SourceReference } from '../entities'
import { formatHistoricalYearRange } from '../time'
import { buildPlaceFeatureCollection } from './placeGeoJson'
import {
  PLACE_IMPORTANCE_MIN_ZOOM,
  aggregatePlaceSources,
  buildPlacePresentation,
  buildPlacePresentations,
  getPlaceImportanceAtYear,
  getPlaceMinZoom,
  getPlaceNameAtYear,
  getPlaceNamePeriodAtYear,
  getPlaceOwnershipAtYear,
  isPlaceActiveAtYear,
  isPlaceNormallyVisible,
  isPlaceVisible,
} from './placeSelectors'
import {
  PLACE_SELECTION_HISTORY_MODE,
  createPlaceSelection,
  selectedPlaceId,
  withSelectedPlace,
  withSelectedPlaceYear,
  withoutSelectedPlace,
} from './selection'
import { parseMapUrlState, serializeMapUrlState } from '../../url'

const dataset = syntheticRuntime(loadBundledRuntimeData())
const alpha = dataset.places.find((place) => place.id === 'synthetic-alpha-place') as Place
const beta = dataset.places.find((place) => place.id === 'synthetic-beta-place') as Place
const gamma = dataset.places.find((place) => place.id === 'synthetic-gamma-place') as Place

function presentation(place: Place, year = -334) {
  return buildPlacePresentation(place, dataset, year)
}

describe('place activity and selected-year naming', () => {
  it('treats the inclusive existence start as active', () => {
    expect(isPlaceActiveAtYear(alpha, -500)).toBe(true)
  })

  it('treats the inclusive existence end as active', () => {
    expect(isPlaceActiveAtYear(alpha, 10)).toBe(true)
  })

  it('is inactive before existence', () => {
    expect(isPlaceActiveAtYear(alpha, -501)).toBe(false)
  })

  it('is inactive after existence', () => {
    expect(isPlaceActiveAtYear(alpha, 11)).toBe(false)
  })

  it('does not treat an unknown end as active forever', () => {
    const place = structuredClone(alpha)
    place.existence.yearTo = null
    expect(isPlaceActiveAtYear(place, -400)).toBe(false)
  })

  it('selects the early active historical name', () => {
    expect(getPlaceNameAtYear(alpha, -450)).toBe('Synthetic Alpha Old Name')
  })

  it('selects the later active historical name', () => {
    expect(getPlaceNameAtYear(alpha, -334)).toBe('Synthetic Alpha Place')
  })

  it('falls back to the default name with no active name period', () => {
    expect(getPlaceNameAtYear(gamma, -334)).toBe('Synthetic Gamma Haven')
    expect(getPlaceNamePeriodAtYear(gamma, -334)).toBeNull()
  })

  it('does not silently choose overlapping active names', () => {
    const place = structuredClone(alpha)
    place.names.push(structuredClone(place.names[1]))
    expect(() => getPlaceNameAtYear(place, -334)).toThrow('overlapping active name')
  })

  it('keeps inactive selection display deterministic', () => {
    expect(presentation(gamma).displayName).toBe(gamma.defaultName)
  })
})

describe('ownership, importance, and visibility policy', () => {
  it('selects active ownership', () => {
    expect(getPlaceOwnershipAtYear(alpha, -334)?.polityId).toBe('synthetic-alpha-polity')
  })

  it('returns null when no ownership is active', () => {
    expect(getPlaceOwnershipAtYear(beta, -334)).toBeNull()
  })

  it('resolves active owner display name from runtime polities', () => {
    expect(presentation(alpha).ownership?.polityName).toBe('Synthetic Alpha Polity')
  })

  it('fails safely without fabricating a missing polity name', () => {
    expect(buildPlacePresentation(alpha, { sources: dataset.sources, polities: [] }, -334).ownership?.polityName).toBeNull()
  })

  it('selects active importance', () => {
    expect(getPlaceImportanceAtYear(beta, -334)?.importance).toBe(1)
  })

  it('uses null as the no-importance fallback', () => {
    const place = structuredClone(beta)
    place.importance = []
    expect(presentation(place).importance).toBeNull()
    expect(presentation(place).minZoom).toBeNull()
  })

  it.each([
    [1, 5.5], [2, 4.5], [3, 3.5], [4, 2.5], [5, 1.5],
  ])('maps importance %i to zoom %f', (importance, zoom) => {
    expect(getPlaceMinZoom(importance)).toBe(zoom)
    expect(PLACE_IMPORTANCE_MIN_ZOOM[importance as keyof typeof PLACE_IMPORTANCE_MIN_ZOOM]).toBe(zoom)
  })

  it('shows an important active place at low zoom', () => {
    expect(isPlaceNormallyVisible(presentation(alpha), 1.5, true)).toBe(true)
  })

  it('hides a low-importance active place at low zoom', () => {
    expect(isPlaceNormallyVisible(presentation(beta), 3.5, true)).toBe(false)
  })

  it('shows a low-importance place at close zoom', () => {
    expect(isPlaceNormallyVisible(presentation(beta), 5.5, true)).toBe(true)
  })

  it('normally hides an inactive place', () => {
    expect(isPlaceNormallyVisible(presentation(gamma), 7, true)).toBe(false)
  })

  it('keeps a selected inactive place visible', () => {
    expect(isPlaceVisible(presentation(gamma), 1.5, true, gamma.id)).toBe(true)
  })

  it('keeps a selected zoom-hidden place visible', () => {
    expect(isPlaceVisible(presentation(beta), 1.5, true, beta.id)).toBe(true)
  })

  it('hides normal places when the places layer is disabled', () => {
    expect(isPlaceNormallyVisible(presentation(alpha), 7, false)).toBe(false)
  })

  it('keeps an explicitly selected place visible when the layer is disabled', () => {
    expect(isPlaceVisible(presentation(alpha), 1.5, false, alpha.id)).toBe(true)
  })
})

describe('place presentation and GeoJSON generation', () => {
  const presentations = buildPlacePresentations(dataset, -334)

  it('builds presentations in deterministic ID order', () => {
    expect(presentations.map((place) => place.id)).toEqual([
      'synthetic-alpha-place',
      'synthetic-beta-place',
      'synthetic-gamma-place',
    ])
  })

  it('retains uncertainty metadata', () => {
    expect(presentation(beta).uncertainty).toMatchObject({ confidence: 'medium', locationAccuracy: 'approximate' })
  })

  it('retains summary and place type without JSX', () => {
    expect(presentation(alpha)).toMatchObject({ placeType: 'city', summary: expect.stringContaining('synthetic') })
  })

  it('preserves coordinate order as longitude then latitude', () => {
    const collection = buildPlaceFeatureCollection(presentations, true, null)
    expect(collection.features.find((feature) => feature.id === alpha.id)?.geometry.coordinates).toEqual([28, 37])
  })

  it('omits a missing-coordinate place from features', () => {
    const place = presentation(structuredClone(gamma))
    place.coordinates = undefined
    expect(buildPlaceFeatureCollection([place], true, gamma.id).features).toHaveLength(0)
  })

  it('uses stable feature IDs', () => {
    expect(buildPlaceFeatureCollection(presentations, true, alpha.id).features[0].id).toBe(alpha.id)
  })

  it('keeps deterministic feature ordering', () => {
    const first = buildPlaceFeatureCollection(presentations, true, gamma.id)
    const second = buildPlaceFeatureCollection(presentations, true, gamma.id)
    expect(second).toEqual(first)
  })

  it('emits a valid FeatureCollection', () => {
    expect(buildPlaceFeatureCollection(presentations, true, null)).toMatchObject({ type: 'FeatureCollection', features: expect.any(Array) })
  })

  it('emits compact serializable presentation properties', () => {
    const properties = buildPlaceFeatureCollection(presentations, true, alpha.id).features[0].properties
    expect(properties).toMatchObject({ entityType: 'place', placeId: alpha.id, selected: true, active: true })
    expect(JSON.stringify(properties)).not.toContain('sourceRefs')
    expect(JSON.stringify(properties)).not.toContain('ownership')
  })

  it('includes selected inactive place as deterministic highlight input', () => {
    const collection = buildPlaceFeatureCollection(presentations, true, gamma.id)
    expect(collection.features.find((feature) => feature.id === gamma.id)?.properties).toMatchObject({ selected: true, active: false })
  })

  it('includes only selected place when places layer is disabled', () => {
    const collection = buildPlaceFeatureCollection(presentations, false, beta.id)
    expect(collection.features.map((feature) => feature.id)).toEqual([beta.id])
  })

  it('excludes inactive unselected places', () => {
    const collection = buildPlaceFeatureCollection(presentations, true, null)
    expect(collection.features.some((feature) => feature.id === gamma.id)).toBe(false)
  })
})

describe('place selection and URL preservation', () => {
  const state = parseMapUrlState('?year=-334&lat=37&lng=28&zoom=4&layers=places,journeys&collection=sample-collection')
  const selected = withSelectedPlace(state, beta.id)

  it('builds the typed place selection contract', () => {
    expect(createPlaceSelection(beta.id)).toEqual({ type: 'place', id: beta.id })
  })

  it('rejects malformed click-selection IDs', () => {
    expect(() => createPlaceSelection('Bad Place')).toThrow()
  })

  it('extracts only place selection IDs', () => {
    expect(selectedPlaceId(selected.selectedEntity)).toBe(beta.id)
    expect(selectedPlaceId({ type: 'person', id: 'sample-person' })).toBeNull()
  })

  it('preserves selected year during selection', () => {
    expect(selected.year).toBe(-334)
  })

  it('preserves viewport during selection', () => {
    expect(selected).toMatchObject({ latitude: 37, longitude: 28, zoom: 4 })
  })

  it('preserves layers during selection', () => {
    expect(selected.activeLayers).toEqual(['places', 'journeys'])
  })

  it('preserves collection during selection', () => {
    expect(selected.collectionId).toBe('sample-collection')
  })

  it('preserves unrelated parameters through F6 serialization', () => {
    expect(serializeMapUrlState(selected, '?campaign=owner-check').get('campaign')).toBe('owner-check')
  })

  it('clears only a place entity selection', () => {
    expect(withoutSelectedPlace(selected).selectedEntity).toBeNull()
    expect(withoutSelectedPlace(state)).toEqual(state)
  })

  it('preserves a future non-place selection safely', () => {
    const personState = { ...state, selectedEntity: { type: 'person', id: 'sample-person' } as const }
    expect(withoutSelectedPlace(personState)).toBe(personState)
  })

  it('restores a selected place through pure URL derivation', () => {
    const search = serializeMapUrlState(selected).toString()
    expect(parseMapUrlState(search).selectedEntity).toEqual({ type: 'place', id: beta.id })
  })

  it('produces a safe unresolved selection state', () => {
    const unresolved = withSelectedPlace(state, 'synthetic-missing-place')
    expect(dataset.places.find((place) => place.id === selectedPlaceId(unresolved.selectedEntity))).toBeUndefined()
  })

  it('uses push history for discrete selection', () => {
    expect(PLACE_SELECTION_HISTORY_MODE).toBe('push')
  })
})

describe('inactive-period navigation', () => {
  it('exposes the first known year', () => {
    expect(presentation(gamma).firstKnownYear).toBe(-100)
  })

  it('finds the nearest active year before the range', () => {
    expect(buildPlacePresentation(gamma, dataset, -334).nearestActiveYear).toBe(-100)
  })

  it('finds the nearest active year after the range', () => {
    expect(buildPlacePresentation(gamma, dataset, 200).nearestActiveYear).toBe(100)
  })

  it('keeps the current year when already active', () => {
    expect(buildPlacePresentation(gamma, dataset, -50).nearestActiveYear).toBe(-50)
  })

  it('is honest for unknown-ended existence after its start', () => {
    const place = structuredClone(gamma)
    place.existence.yearTo = null
    expect(buildPlacePresentation(place, dataset, 10).nearestActiveYear).toBeNull()
  })

  it('changes year while preserving selection and viewport', () => {
    const state = withSelectedPlace(parseMapUrlState('?lat=40&lng=20&zoom=5'), gamma.id)
    const moved = withSelectedPlaceYear(state, -100)
    expect(moved).toMatchObject({ year: -100, latitude: 40, longitude: 20, zoom: 5, selectedEntity: { type: 'place', id: gamma.id } })
  })
})

describe('selected-year source aggregation', () => {
  it('resolves entity-level sources', () => {
    expect(presentation(alpha).sources.resolved.some(({ reference }) => reference.locator === 'Synthetic place')).toBe(true)
  })

  it('resolves active name-period sources first', () => {
    expect(presentation(alpha).sources.resolved[0].reference.locator).toBe('Synthetic later name')
  })

  it('resolves active ownership sources', () => {
    expect(presentation(alpha).sources.resolved.some(({ reference }) => reference.locator === 'Synthetic ownership')).toBe(true)
  })

  it('resolves active importance sources', () => {
    expect(presentation(alpha).sources.resolved.some(({ reference }) => reference.locator === 'Synthetic importance')).toBe(true)
  })

  it('deduplicates identical references', () => {
    const place = structuredClone(beta)
    place.sourceRefs = [place.sourceRefs[0], structuredClone(place.sourceRefs[0])]
    expect(aggregatePlaceSources(place, null, null, null, dataset.sources).resolved).toHaveLength(1)
  })

  it('retains locator-distinct references', () => {
    const place = structuredClone(beta)
    const second: SourceReference = { ...place.sourceRefs[0], locator: 'Another synthetic locator' }
    place.sourceRefs = [place.sourceRefs[0], second]
    expect(aggregatePlaceSources(place, null, null, null, dataset.sources).resolved).toHaveLength(2)
  })

  it('excludes inactive unrelated name-period sources', () => {
    const locators = presentation(alpha).sources.resolved.map(({ reference }) => reference.locator)
    expect(locators).not.toContain('Synthetic early name')
  })

  it('keeps primary source ordering deterministic', () => {
    expect(presentation(alpha).sources.resolved.map(({ reference }) => reference.locator)).toEqual([
      'Synthetic later name', 'Synthetic ownership', 'Synthetic importance', 'Synthetic place',
    ])
  })

  it('reports unresolved sources without fabricating titles', () => {
    const result = aggregatePlaceSources(beta, null, null, null, [])
    expect(result.resolved).toEqual([])
    expect(result.unresolvedSourceIds).toEqual(['synthetic-fixture-source'])
  })
})

describe('compact presentation formatting', () => {
  it('formats BCE and CE existence ranges through F2', () => {
    expect(formatHistoricalYearRange({ yearFrom: -1, yearTo: 1 })).toBe('1 BCE–1 CE')
  })

  it('exposes different display and default names when period-specific', () => {
    expect(presentation(alpha, -450)).toMatchObject({ displayName: 'Synthetic Alpha Old Name', defaultName: 'Synthetic Alpha Place' })
  })

  it('provides an inactive status input', () => {
    expect(presentation(gamma).active).toBe(false)
  })

  it('preserves missing-coordinate presentation honestly', () => {
    const place = structuredClone(gamma)
    place.coordinates = undefined
    expect(presentation(place).coordinates).toBeUndefined()
  })

  it('contains only clearly synthetic foundation records', () => {
    expect((dataset as RuntimeDataset).places.every((place) =>
      place.id.startsWith('synthetic-') &&
      `${place.defaultName} ${place.summary ?? ''}`.toLowerCase().includes('synthetic'),
    )).toBe(true)
  })
})
