import {
  isActiveAtYear,
  nearestYearInTemporalRange,
  parseHistoricalYear,
  type HistoricalYear,
  type TemporalRange,
} from '../time'
import type {
  Place,
  PlaceImportancePeriod,
  PlaceNamePeriod,
  PlaceOwnershipPeriod,
  Source,
  SourceReference,
} from '../entities'
import type { RuntimeDataset } from '../../data'

export const PLACE_IMPORTANCE_MIN_ZOOM = Object.freeze({
  1: 5.5,
  2: 4.5,
  3: 3.5,
  4: 2.5,
  5: 1.5,
})

export interface ResolvedPlaceSource {
  source: Source
  reference: SourceReference
}

export interface PlaceSourceAggregation {
  resolved: readonly ResolvedPlaceSource[]
  unresolvedSourceIds: readonly string[]
}

export interface PlaceOwnershipPresentation {
  polityId: string
  polityName: string | null
  controlType: PlaceOwnershipPeriod['controlType']
  uncertainty: PlaceOwnershipPeriod['uncertainty']
}

export interface PlacePresentation {
  id: string
  defaultName: string
  displayName: string
  placeType: Place['placeType']
  coordinates: Place['coordinates']
  existence: TemporalRange
  active: boolean
  activeName: PlaceNamePeriod | null
  ownership: PlaceOwnershipPresentation | null
  importance: number | null
  minZoom: number | null
  summary: string | undefined
  uncertainty: Place['uncertainty']
  sources: PlaceSourceAggregation
  firstKnownYear: HistoricalYear
  nearestActiveYear: HistoricalYear | null
}

function selectSingleActivePeriod<T>(
  records: readonly T[],
  year: number,
  getPeriod: (record: T) => TemporalRange,
  fieldName: string,
): T | null {
  const active = records.filter((record) => isActiveAtYear(getPeriod(record), year))
  if (active.length > 1) {
    throw new Error(`Place has overlapping active ${fieldName} periods.`)
  }
  return active[0] ?? null
}

export function isPlaceActiveAtYear(place: Place, year: number): boolean {
  return isActiveAtYear(place.existence, year)
}

export function getPlaceNamePeriodAtYear(
  place: Place,
  year: number,
): PlaceNamePeriod | null {
  return selectSingleActivePeriod(place.names, year, (record) => record.period, 'name')
}

export function getPlaceNameAtYear(place: Place, year: number): string {
  return getPlaceNamePeriodAtYear(place, year)?.name ?? place.defaultName
}

export function getPlaceOwnershipAtYear(
  place: Place,
  year: number,
): PlaceOwnershipPeriod | null {
  return selectSingleActivePeriod(place.ownership, year, (record) => record.period, 'ownership')
}

export function getPlaceImportanceAtYear(
  place: Place,
  year: number,
): PlaceImportancePeriod | null {
  return selectSingleActivePeriod(place.importance, year, (record) => record.period, 'importance')
}

export function getPlaceMinZoom(importance: number | null): number | null {
  if (importance === null) return null
  return PLACE_IMPORTANCE_MIN_ZOOM[importance as keyof typeof PLACE_IMPORTANCE_MIN_ZOOM] ?? null
}

export function isPlaceNormallyVisible(
  presentation: Pick<PlacePresentation, 'active' | 'importance' | 'minZoom'>,
  zoom: number,
  placesLayerActive: boolean,
): boolean {
  return placesLayerActive && presentation.active && presentation.importance !== null &&
    presentation.minZoom !== null && zoom >= presentation.minZoom
}

export function isPlaceVisible(
  presentation: Pick<PlacePresentation, 'id' | 'active' | 'importance' | 'minZoom'>,
  zoom: number,
  placesLayerActive: boolean,
  selectedPlaceId: string | null,
): boolean {
  return presentation.id === selectedPlaceId ||
    isPlaceNormallyVisible(presentation, zoom, placesLayerActive)
}

function sourceReferenceKey(reference: SourceReference): string {
  return [
    reference.sourceId,
    reference.locator ?? '',
    reference.note ?? '',
    reference.excerptNote ?? '',
    reference.reviewedOn ?? '',
  ].join('\u0000')
}

export function aggregatePlaceSources(
  place: Place,
  activeName: PlaceNamePeriod | null,
  activeOwnership: PlaceOwnershipPeriod | null,
  activeImportance: PlaceImportancePeriod | null,
  sources: readonly Source[],
): PlaceSourceAggregation {
  const prioritized = [
    ...(activeName?.sourceRefs ?? []),
    ...(activeOwnership?.sourceRefs ?? []),
    ...(activeImportance?.sourceRefs ?? []),
    ...place.sourceRefs,
  ]
  const unique = new Map<string, SourceReference>()
  for (const reference of prioritized) {
    const key = sourceReferenceKey(reference)
    if (!unique.has(key)) unique.set(key, reference)
  }

  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const resolved: ResolvedPlaceSource[] = []
  const unresolved = new Set<string>()
  for (const reference of unique.values()) {
    const source = sourceById.get(reference.sourceId)
    if (source === undefined) unresolved.add(reference.sourceId)
    else resolved.push({ source, reference })
  }

  return {
    resolved,
    unresolvedSourceIds: [...unresolved].sort(),
  }
}

export function buildPlacePresentation(
  place: Place,
  dataset: Pick<RuntimeDataset, 'sources' | 'polities'>,
  year: number,
): PlacePresentation {
  const selectedYear = parseHistoricalYear(year)
  const activeName = getPlaceNamePeriodAtYear(place, selectedYear)
  const activeOwnership = getPlaceOwnershipAtYear(place, selectedYear)
  const activeImportance = getPlaceImportanceAtYear(place, selectedYear)
  const polity = activeOwnership === null
    ? undefined
    : dataset.polities.find((candidate) => candidate.id === activeOwnership.polityId)

  return {
    id: place.id,
    defaultName: place.defaultName,
    displayName: activeName?.name ?? place.defaultName,
    placeType: place.placeType,
    coordinates: place.coordinates,
    existence: place.existence,
    active: isPlaceActiveAtYear(place, selectedYear),
    activeName,
    ownership: activeOwnership === null ? null : {
      polityId: activeOwnership.polityId,
      polityName: polity?.defaultName ?? null,
      controlType: activeOwnership.controlType,
      uncertainty: activeOwnership.uncertainty,
    },
    importance: activeImportance?.importance ?? null,
    minZoom: getPlaceMinZoom(activeImportance?.importance ?? null),
    summary: place.summary,
    uncertainty: place.uncertainty,
    sources: aggregatePlaceSources(
      place,
      activeName,
      activeOwnership,
      activeImportance,
      dataset.sources,
    ),
    firstKnownYear: place.existence.yearFrom,
    nearestActiveYear: nearestYearInTemporalRange(place.existence, selectedYear),
  }
}

export function buildPlacePresentations(
  dataset: Pick<RuntimeDataset, 'places' | 'sources' | 'polities'>,
  year: number,
): readonly PlacePresentation[] {
  return dataset.places
    .map((place) => buildPlacePresentation(place, dataset, year))
    .sort((first, second) => first.id.localeCompare(second.id))
}
