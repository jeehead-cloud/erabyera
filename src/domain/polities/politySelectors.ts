import type { RuntimeDataset } from '../../data'
import type {
  Person,
  Place,
  Polity,
  PolityCapitalPeriod,
  PolityRulerPeriod,
  Source,
  SourceReference,
  TerritoryPeriod,
} from '../entities'
import { getPlaceNameAtYear } from '../places'
import {
  isActiveAtYear,
  nearestYearInTemporalRange,
  parseHistoricalYear,
  type HistoricalYear,
  type TemporalRange,
} from '../time'

export interface ResolvedPolitySource {
  source: Source
  reference: SourceReference
}

export interface PolitySourceAggregation {
  resolved: readonly ResolvedPolitySource[]
  unresolvedSourceIds: readonly string[]
}

export interface CapitalPresentation {
  placeId: string
  name: string | null
  status?: string
  uncertainty: PolityCapitalPeriod['uncertainty']
  sourceRefs: readonly SourceReference[]
}

export interface RulerPresentation {
  personId: string
  name: string | null
  title?: string
  uncertainty: PolityRulerPeriod['uncertainty']
  sourceRefs: readonly SourceReference[]
}

export interface TerritoryPresentation {
  id: string
  polityId: string
  period: TemporalRange
  geometryFeatureId: string
  controlCategory: TerritoryPeriod['controlCategory']
  uncertainty: TerritoryPeriod['uncertainty']
  sourceRefs: readonly SourceReference[]
}

export interface PolityPresentation {
  id: string
  displayName: string
  polityType: Polity['polityType']
  color: string
  existence: TemporalRange
  active: boolean
  summary?: string
  uncertainty: Polity['uncertainty']
  capitals: readonly CapitalPresentation[]
  rulers: readonly RulerPresentation[]
  territories: readonly TerritoryPresentation[]
  hasActiveGeometry: boolean
  sources: PolitySourceAggregation
  firstActiveYear: HistoricalYear
  nearestActiveYear: HistoricalYear | null
  firstMappedYear: HistoricalYear | null
  nearestMappedYear: HistoricalYear | null
}

export function isPolityActiveAtYear(polity: Polity, year: number): boolean {
  return isActiveAtYear(polity.existence, year)
}

export function getPolityCapitalsAtYear(
  polity: Polity,
  year: number,
  places: readonly Place[],
): readonly CapitalPresentation[] {
  const placeById = new Map(places.map((place) => [place.id, place]))
  return polity.capitals
    .filter((capital) => isActiveAtYear(capital.period, year))
    .map((capital) => {
      const place = placeById.get(capital.placeId)
      return {
        placeId: capital.placeId,
        name: place === undefined ? null : getPlaceNameAtYear(place, year),
        status: capital.status,
        uncertainty: capital.uncertainty,
        sourceRefs: capital.sourceRefs,
      }
    })
    .sort((first, second) => first.placeId.localeCompare(second.placeId))
}

export function getPolityRulersAtYear(
  polity: Polity,
  year: number,
  people: readonly Person[],
): readonly RulerPresentation[] {
  const personById = new Map(people.map((person) => [person.id, person]))
  return polity.rulers
    .filter((ruler) => isActiveAtYear(ruler.period, year))
    .map((ruler) => ({
      personId: ruler.personId,
      name: personById.get(ruler.personId)?.defaultName ?? null,
      title: ruler.title,
      uncertainty: ruler.uncertainty,
      sourceRefs: ruler.sourceRefs,
    }))
    .sort((first, second) => first.personId.localeCompare(second.personId))
}

export function getActiveTerritoriesAtYear(
  polity: Polity,
  territories: readonly TerritoryPeriod[],
  year: number,
): readonly TerritoryPeriod[] {
  return territories
    .filter((territory) => territory.polityId === polity.id && isActiveAtYear(territory.period, year))
    .sort((first, second) => first.id.localeCompare(second.id))
}

function sourceReferenceKey(reference: SourceReference): string {
  return [reference.sourceId, reference.locator ?? '', reference.note ?? '', reference.excerptNote ?? '', reference.reviewedOn ?? ''].join('\u0000')
}

export function aggregatePolitySources(
  polity: Polity,
  activeTerritories: readonly TerritoryPeriod[],
  activeCapitals: readonly CapitalPresentation[],
  activeRulers: readonly RulerPresentation[],
  sources: readonly Source[],
): PolitySourceAggregation {
  const prioritized = [
    ...activeTerritories.flatMap((territory) => territory.sourceRefs),
    ...activeCapitals.flatMap((capital) => capital.sourceRefs),
    ...activeRulers.flatMap((ruler) => ruler.sourceRefs),
    ...polity.sourceRefs,
  ]
  const unique = new Map<string, SourceReference>()
  for (const reference of prioritized) {
    const key = sourceReferenceKey(reference)
    if (!unique.has(key)) unique.set(key, reference)
  }
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const resolved: ResolvedPolitySource[] = []
  const unresolved = new Set<string>()
  for (const reference of unique.values()) {
    const source = sourceById.get(reference.sourceId)
    if (source === undefined) unresolved.add(reference.sourceId)
    else resolved.push({ source, reference })
  }
  return { resolved, unresolvedSourceIds: [...unresolved].sort() }
}

function historicalOrdinal(year: HistoricalYear): number {
  return year < 0 ? year : year - 1
}

function mappedYears(
  polity: Polity,
  dataset: Pick<RuntimeDataset, 'territories' | 'geometry'>,
): readonly TemporalRange[] {
  const geometryIds = new Set(dataset.geometry.territories.features.map((feature) => feature.id))
  return dataset.territories
    .filter((territory) => territory.polityId === polity.id && geometryIds.has(territory.geometryFeatureId))
    .map((territory) => territory.period)
}

function nearestYearInRanges(ranges: readonly TemporalRange[], year: HistoricalYear): HistoricalYear | null {
  const candidates = ranges
    .map((range) => nearestYearInTemporalRange(range, year))
    .filter((candidate): candidate is HistoricalYear => candidate !== null)
  candidates.sort((first, second) =>
    Math.abs(historicalOrdinal(first) - historicalOrdinal(year)) - Math.abs(historicalOrdinal(second) - historicalOrdinal(year)) || first - second,
  )
  return candidates[0] ?? null
}

export function buildPolityPresentation(
  polity: Polity,
  dataset: Pick<RuntimeDataset, 'places' | 'people' | 'sources' | 'territories' | 'geometry'>,
  year: number,
): PolityPresentation {
  const selectedYear = parseHistoricalYear(year)
  const capitals = getPolityCapitalsAtYear(polity, selectedYear, dataset.places)
  const rulers = getPolityRulersAtYear(polity, selectedYear, dataset.people)
  const activeTerritoryRecords = getActiveTerritoriesAtYear(polity, dataset.territories, selectedYear)
  const geometryIds = new Set(dataset.geometry.territories.features.map((feature) => feature.id))
  const territories = activeTerritoryRecords.map((territory) => ({
    id: territory.id,
    polityId: territory.polityId,
    period: territory.period,
    geometryFeatureId: territory.geometryFeatureId,
    controlCategory: territory.controlCategory,
    uncertainty: territory.uncertainty,
    sourceRefs: territory.sourceRefs,
  }))
  const ranges = mappedYears(polity, dataset)
  return {
    id: polity.id,
    displayName: polity.defaultName,
    polityType: polity.polityType,
    color: polity.color,
    existence: polity.existence,
    active: isPolityActiveAtYear(polity, selectedYear),
    summary: polity.summary,
    uncertainty: polity.uncertainty,
    capitals,
    rulers,
    territories,
    hasActiveGeometry: activeTerritoryRecords.some((territory) => geometryIds.has(territory.geometryFeatureId)),
    sources: aggregatePolitySources(polity, activeTerritoryRecords, capitals, rulers, dataset.sources),
    firstActiveYear: polity.existence.yearFrom,
    nearestActiveYear: nearestYearInTemporalRange(polity.existence, selectedYear),
    firstMappedYear: ranges.length === 0 ? null : ranges.map((range) => range.yearFrom).sort((a, b) => a - b)[0] ?? null,
    nearestMappedYear: nearestYearInRanges(ranges, selectedYear),
  }
}

export function buildPolityPresentations(
  dataset: Pick<RuntimeDataset, 'polities' | 'places' | 'people' | 'sources' | 'territories' | 'geometry'>,
  year: number,
): readonly PolityPresentation[] {
  return dataset.polities
    .map((polity) => buildPolityPresentation(polity, dataset, year))
    .sort((first, second) => first.id.localeCompare(second.id))
}
