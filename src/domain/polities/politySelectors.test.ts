import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData } from '../../data'
import { syntheticRuntime } from '../../test/syntheticRuntime'
import type { Polity, SourceReference } from '../entities'
import { parseMapUrlState, serializeMapUrlState } from '../../url'
import {
  aggregatePolitySources,
  buildPolityPresentation,
  buildPolityPresentations,
  getActiveTerritoriesAtYear,
  getPolityCapitalsAtYear,
  getPolityRulersAtYear,
  isPolityActiveAtYear,
} from './politySelectors'
import { buildTerritoryFeatureCollection } from './territoryGeoJson'
import {
  POLITY_SELECTION_HISTORY_MODE,
  createPolitySelection,
  selectedPolityId,
  withSelectedPolity,
  withSelectedPolityYear,
  withoutOwnedMapSelection,
} from './selection'

const dataset = syntheticRuntime(loadBundledRuntimeData())
const alpha = dataset.polities.find((polity) => polity.id === 'synthetic-alpha-polity') as Polity
const beta = dataset.polities.find((polity) => polity.id === 'synthetic-beta-polity') as Polity
const at = (polity: Polity, year = -334) => buildPolityPresentation(polity, dataset, year)

describe('polity activity and related records', () => {
  it('is active at the inclusive start', () => expect(isPolityActiveAtYear(alpha, -500)).toBe(true))
  it('is active at the inclusive end', () => expect(isPolityActiveAtYear(alpha, 10)).toBe(true))
  it('is inactive before existence', () => expect(isPolityActiveAtYear(alpha, -501)).toBe(false))
  it('is inactive after existence', () => expect(isPolityActiveAtYear(alpha, 11)).toBe(false))
  it('does not assume an unknown end continues', () => {
    const polity = structuredClone(alpha)
    polity.existence.yearTo = null
    expect(isPolityActiveAtYear(polity, -400)).toBe(false)
  })
  it('derives an active capital', () => expect(getPolityCapitalsAtYear(alpha, -1, dataset.places)[0]?.name).toBe('Synthetic Alpha Place'))
  it('returns no capital outside its period', () => expect(getPolityCapitalsAtYear(alpha, -334, dataset.places)).toEqual([]))
  it('fails unresolved capital references safely', () => expect(getPolityCapitalsAtYear(alpha, -1, [])[0]?.name).toBeNull())
  it('uses the period-appropriate capital place name', () => {
    const polity = structuredClone(alpha)
    polity.capitals[0].period = { yearFrom: -500, yearTo: -400 }
    expect(getPolityCapitalsAtYear(polity, -450, dataset.places)[0]?.name).toBe('Synthetic Alpha Old Name')
  })
  it('derives an active ruler', () => expect(getPolityRulersAtYear(alpha, -1, dataset.people)[0]?.name).toBe('Synthetic Alpha Person'))
  it('returns no ruler outside its period', () => expect(getPolityRulersAtYear(alpha, -334, dataset.people)).toEqual([]))
  it('fails unresolved ruler references safely', () => expect(getPolityRulersAtYear(alpha, -1, [])[0]?.name).toBeNull())
  it('sorts multiple active rulers deterministically', () => {
    const polity = structuredClone(alpha)
    polity.rulers.push({ ...structuredClone(polity.rulers[0]), personId: 'synthetic-beta-person' })
    expect(getPolityRulersAtYear(polity, -1, dataset.people).map((ruler) => ruler.personId)).toEqual(['synthetic-alpha-person', 'synthetic-beta-person'])
  })
})

describe('territory activity and presentation', () => {
  it('selects the early territory', () => expect(getActiveTerritoriesAtYear(alpha, dataset.territories, -450)[0]?.id).toBe('synthetic-alpha-territory-early'))
  it('switches immediately to the late territory', () => expect(getActiveTerritoriesAtYear(alpha, dataset.territories, -399)[0]?.id).toBe('synthetic-alpha-territory-late'))
  it('omits inactive territory periods', () => expect(getActiveTerritoriesAtYear(beta, dataset.territories, -250)).toEqual([]))
  it('keeps two overlapping claims separate at the default year', () => {
    const presentations = buildPolityPresentations(dataset, -334)
    expect(presentations.flatMap((polity) => polity.territories)).toHaveLength(2)
  })
  it('retains control, confidence, and polity color', () => {
    expect(at(beta).territories[0]).toMatchObject({ controlCategory: 'disputed', uncertainty: { confidence: 'disputed' } })
    expect(at(beta).color).toBe('#993366')
  })
  it('presents an active polity without active geometry honestly', () => expect(at(beta, -250)).toMatchObject({ active: true, hasActiveGeometry: false, territories: [] }))
  it('presents an inactive selected polity honestly', () => expect(at(beta, 11).active).toBe(false))
  it('builds presentations in deterministic polity ID order', () => expect(buildPolityPresentations(dataset, -334).map((polity) => polity.id)).toEqual(['synthetic-alpha-polity', 'synthetic-beta-polity']))
  it('exposes the first and nearest active years', () => expect(at(beta, -500)).toMatchObject({ firstActiveYear: -400, nearestActiveYear: -400 }))
  it('finds the nearest mapped year before mapping', () => expect(at(beta, -400).nearestMappedYear).toBe(-350))
  it('finds the nearest mapped year after mapping', () => expect(at(beta, -250).nearestMappedYear).toBe(-300))
  it('returns no mapped action when geometry is unavailable', () => {
    const geometry = structuredClone(dataset.geometry)
    geometry.territories.features = []
    expect(buildPolityPresentation(beta, { ...dataset, geometry }, -250).nearestMappedYear).toBeNull()
  })
})

describe('territory GeoJSON', () => {
  const presentations = buildPolityPresentations(dataset, -334)
  it('emits both Polygon and MultiPolygon features', () => expect(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, true, null).features.map((feature) => feature.geometry.type)).toEqual(['Polygon', 'MultiPolygon']))
  it('uses stable geometry feature IDs', () => expect(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, true, null).features[0]?.id).toBe('synthetic-alpha-territory-late-feature'))
  it('orders features deterministically', () => expect(buildTerritoryFeatureCollection([...presentations].reverse(), dataset.geometry.territories, true, null)).toEqual(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, true, null)))
  it('preserves longitude-latitude coordinate order', () => expect(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, true, null).features[0]?.geometry).toMatchObject({ coordinates: [[[26, 34], [32, 34], [32, 40], [26, 40], [26, 34]]] }))
  it('keeps properties compact', () => {
    const serialized = JSON.stringify(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, true, null).features[0]?.properties)
    expect(serialized).not.toContain('sourceRefs')
    expect(serialized).not.toContain('existence')
  })
  it('hides normal territories when disabled', () => expect(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, false, null).features).toEqual([]))
  it('keeps active selected geometry as the disabled-layer override', () => expect(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, false, alpha.id).features).toHaveLength(1))
  it('does not fabricate selected geometry when none is active', () => expect(buildTerritoryFeatureCollection(buildPolityPresentations(dataset, -250), dataset.geometry.territories, false, beta.id).features).toEqual([]))
  it('marks only the selected polity', () => expect(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, true, beta.id).features.map((feature) => feature.properties.selected)).toEqual([false, true]))
  it('does not merge overlapping claims', () => expect(buildTerritoryFeatureCollection(presentations, dataset.geometry.territories, true, alpha.id).features).toHaveLength(2))
})

describe('polity selection and URL preservation', () => {
  const state = parseMapUrlState('?year=-334&lat=37&lng=28&zoom=4&layers=places,territories&collection=synthetic-alpha-collection')
  const selected = withSelectedPolity(state, beta.id)
  it('creates a typed polity selection', () => expect(createPolitySelection(beta.id)).toEqual({ type: 'polity', id: beta.id }))
  it('rejects malformed IDs', () => expect(() => createPolitySelection('Bad Polity')).toThrow())
  it('extracts only polity IDs', () => {
    expect(selectedPolityId(selected.selectedEntity)).toBe(beta.id)
    expect(selectedPolityId({ type: 'place', id: 'synthetic-alpha-place' })).toBeNull()
  })
  it('preserves year, viewport, layers, and collection', () => expect(selected).toMatchObject({ year: -334, latitude: 37, longitude: 28, zoom: 4, activeLayers: ['territories', 'places'], collectionId: 'synthetic-alpha-collection' }))
  it('preserves unknown URL parameters', () => expect(serializeMapUrlState(selected, '?owner=check').get('owner')).toBe('check'))
  it('restores selection from URL derivation', () => expect(parseMapUrlState(serializeMapUrlState(selected)).selectedEntity).toEqual({ type: 'polity', id: beta.id }))
  it('clears owned polity and place selections', () => {
    expect(withoutOwnedMapSelection(selected).selectedEntity).toBeNull()
    expect(withoutOwnedMapSelection({ ...state, selectedEntity: { type: 'place', id: 'synthetic-alpha-place' } }).selectedEntity).toBeNull()
  })
  it('preserves future entity selections', () => {
    const personState = { ...state, selectedEntity: { type: 'person', id: 'synthetic-alpha-person' } as const }
    expect(withoutOwnedMapSelection(personState)).toBe(personState)
  })
  it('changes year without losing URL-owned state', () => expect(withSelectedPolityYear(selected, -300)).toMatchObject({ year: -300, selectedEntity: { type: 'polity', id: beta.id }, latitude: 37, longitude: 28 }))
  it('uses push history for selection', () => expect(POLITY_SELECTION_HISTORY_MODE).toBe('push'))
})

describe('selected-year polity evidence', () => {
  it('prioritizes active territory evidence', () => expect(at(alpha).sources.resolved[0]?.source.id).toBe('synthetic-fixture-source'))
  it('includes entity evidence when no period is active', () => expect(at(beta, -250).sources.resolved).toHaveLength(1))
  it('excludes inactive period locator evidence', () => {
    const polity = structuredClone(beta)
    const territory = structuredClone(dataset.territories.find((record) => record.polityId === beta.id)!)
    territory.sourceRefs = [{ sourceId: 'synthetic-fixture-source', locator: 'Inactive territory' }]
    expect(aggregatePolitySources(polity, [], [], [], dataset.sources).resolved.some(({ reference }) => reference.locator === 'Inactive territory')).toBe(false)
  })
  it('deduplicates identical references', () => {
    const polity = structuredClone(beta)
    polity.sourceRefs.push(structuredClone(polity.sourceRefs[0]))
    expect(aggregatePolitySources(polity, [], [], [], dataset.sources).resolved).toHaveLength(1)
  })
  it('retains locator-distinct references', () => {
    const polity = structuredClone(beta)
    const distinct: SourceReference = { sourceId: polity.sourceRefs[0].sourceId, locator: 'Distinct synthetic locator' }
    polity.sourceRefs.push(distinct)
    expect(aggregatePolitySources(polity, [], [], [], dataset.sources).resolved).toHaveLength(2)
  })
  it('reports unresolved sources safely', () => expect(aggregatePolitySources(beta, [], [], [], [])).toEqual({ resolved: [], unresolvedSourceIds: ['synthetic-fixture-source'] }))
  it('keeps all polity and territory fixtures unmistakably synthetic', () => {
    expect(dataset.polities.every((polity) => polity.id.startsWith('synthetic-') && polity.defaultName.includes('Synthetic'))).toBe(true)
    expect(dataset.territories.every((territory) => territory.id.startsWith('synthetic-'))).toBe(true)
  })
})
