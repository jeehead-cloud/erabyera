import type { RuntimeDataset } from '../../data'
import type { Person, PersonPlacePeriod, Source, SourceReference } from '../entities'
import { getPlaceNameAtYear } from '../places'
import { isActiveAtYear, nearestYearInTemporalRange, parseHistoricalYear, type HistoricalYear, type TemporalRange } from '../time'

export const PERSON_IMPORTANCE_MIN_ZOOM = Object.freeze({ 1: 5.5, 2: 4.5, 3: 3.5, 4: 2.5, 5: 1.5 })
export const PERSON_RELATIONSHIP_PRIORITY = Object.freeze(['campaign', 'rule', 'activity', 'residence', 'visit', 'birth', 'death', 'unknown'] as const)

export interface ResolvedPersonRelation { id: string; name: string | null }
export interface ResolvedPersonSource { source: Source; reference: SourceReference }
export interface PersonSourceAggregation { resolved: readonly ResolvedPersonSource[]; unresolvedSourceIds: readonly string[] }

export interface ActivePersonLocation {
  placeId: string
  placeName: string | null
  relationType: PersonPlacePeriod['relationType']
  coordinates: readonly [number, number] | null
  relationshipUncertainty: PersonPlacePeriod['uncertainty']
  placeUncertainty: RuntimeDataset['places'][number]['uncertainty']
  eventId?: string
  journeyId?: string
  sourceRefs: readonly SourceReference[]
}

export interface PersonPresentation {
  id: string
  displayName: string
  life: TemporalRange
  alive: boolean
  roles: readonly string[]
  importance: number
  minZoom: number
  summary?: string
  uncertainty: Person['uncertainty']
  activeLocations: readonly ActivePersonLocation[]
  primaryLocation: ActivePersonLocation | null
  mapped: boolean
  associatedPolities: readonly ResolvedPersonRelation[]
  relatedEvents: readonly ResolvedPersonRelation[]
  relatedJourneys: readonly ResolvedPersonRelation[]
  sources: PersonSourceAggregation
  firstLifeYear: HistoricalYear
  nearestLifeYear: HistoricalYear | null
  firstMappedYear: HistoricalYear | null
  nearestMappedYear: HistoricalYear | null
}

export function isPersonAliveAtYear(person: Person, year: number): boolean { return isActiveAtYear(person.life, year) }
export function getActivePersonPlaceRelationships(person: Person, year: number): readonly PersonPlacePeriod[] {
  return person.places.filter((relationship) => isActiveAtYear(relationship.period, year)).sort((first, second) => {
    const priority = PERSON_RELATIONSHIP_PRIORITY.indexOf(first.relationType) - PERSON_RELATIONSHIP_PRIORITY.indexOf(second.relationType)
    return priority || first.placeId.localeCompare(second.placeId)
  })
}
export function getPersonMinZoom(importance: number): number { return PERSON_IMPORTANCE_MIN_ZOOM[importance as keyof typeof PERSON_IMPORTANCE_MIN_ZOOM] }
export function isPersonNormallyVisible(person: Pick<PersonPresentation, 'alive' | 'mapped' | 'minZoom'>, zoom: number, active: boolean): boolean {
  return active && person.alive && person.mapped && zoom >= person.minZoom
}

function uniqueRelations(ids: readonly string[], names: ReadonlyMap<string, string>): readonly ResolvedPersonRelation[] {
  return [...new Set(ids)].sort().map((id) => ({ id, name: names.get(id) ?? null }))
}
function refKey(reference: SourceReference): string { return [reference.sourceId, reference.locator ?? '', reference.note ?? '', reference.excerptNote ?? '', reference.reviewedOn ?? ''].join('\u0000') }
export function aggregatePersonSources(person: Person, active: readonly PersonPlacePeriod[], sources: readonly Source[]): PersonSourceAggregation {
  const unique = new Map<string, SourceReference>()
  for (const reference of [...active.flatMap((relationship) => relationship.sourceRefs), ...person.sourceRefs]) {
    const key = refKey(reference); if (!unique.has(key)) unique.set(key, reference)
  }
  const byId = new Map(sources.map((source) => [source.id, source])); const resolved: ResolvedPersonSource[] = []; const unresolved = new Set<string>()
  for (const reference of unique.values()) { const source = byId.get(reference.sourceId); if (source === undefined) unresolved.add(reference.sourceId); else resolved.push({ source, reference }) }
  return { resolved, unresolvedSourceIds: [...unresolved].sort() }
}
function ordinal(year: HistoricalYear): number { return year < 0 ? year : year - 1 }
function nearestInRanges(ranges: readonly TemporalRange[], year: HistoricalYear): HistoricalYear | null {
  return ranges.map((range) => nearestYearInTemporalRange(range, year)).filter((value): value is HistoricalYear => value !== null)
    .sort((a, b) => Math.abs(ordinal(a) - ordinal(year)) - Math.abs(ordinal(b) - ordinal(year)) || a - b)[0] ?? null
}
export function buildPersonPresentation(person: Person, dataset: Pick<RuntimeDataset, 'places' | 'polities' | 'events' | 'journeys' | 'sources'>, year: number): PersonPresentation {
  const selectedYear = parseHistoricalYear(year); const activeRecords = getActivePersonPlaceRelationships(person, selectedYear)
  const placeById = new Map(dataset.places.map((place) => [place.id, place]))
  const activeLocations = activeRecords.map((relationship): ActivePersonLocation => { const place = placeById.get(relationship.placeId); return {
    placeId: relationship.placeId, placeName: place === undefined ? null : getPlaceNameAtYear(place, selectedYear), relationType: relationship.relationType,
    coordinates: place?.coordinates === undefined ? null : place.coordinates, relationshipUncertainty: relationship.uncertainty,
    placeUncertainty: place?.uncertainty, eventId: relationship.eventId, journeyId: relationship.journeyId, sourceRefs: relationship.sourceRefs,
  } })
  const primaryLocation = activeLocations[0] ?? null; const alive = isPersonAliveAtYear(person, selectedYear)
  const mappedRanges = person.places.filter((relationship) => placeById.get(relationship.placeId)?.coordinates !== undefined).map((relationship) => relationship.period)
  const polityNames = new Map(dataset.polities.map((polity) => [polity.id, polity.defaultName])); const eventNames = new Map(dataset.events.map((event) => [event.id, event.defaultName])); const journeyNames = new Map(dataset.journeys.map((journey) => [journey.id, journey.defaultName]))
  return {
    id: person.id, displayName: person.defaultName, life: person.life, alive, roles: person.roles, importance: person.importance,
    minZoom: getPersonMinZoom(person.importance), summary: person.summary, uncertainty: person.uncertainty, activeLocations, primaryLocation,
    mapped: alive && primaryLocation?.coordinates !== null && primaryLocation !== null,
    associatedPolities: uniqueRelations(person.associatedPolityIds, polityNames),
    relatedEvents: uniqueRelations(person.places.flatMap((relationship) => relationship.eventId === undefined ? [] : [relationship.eventId]), eventNames),
    relatedJourneys: uniqueRelations(person.places.flatMap((relationship) => relationship.journeyId === undefined ? [] : [relationship.journeyId]), journeyNames),
    sources: aggregatePersonSources(person, activeRecords, dataset.sources), firstLifeYear: person.life.yearFrom,
    nearestLifeYear: nearestYearInTemporalRange(person.life, selectedYear),
    firstMappedYear: mappedRanges.map((range) => range.yearFrom).sort((a, b) => a - b)[0] ?? null,
    nearestMappedYear: nearestInRanges(mappedRanges, selectedYear),
  }
}
export function buildPersonPresentations(dataset: Pick<RuntimeDataset, 'people' | 'places' | 'polities' | 'events' | 'journeys' | 'sources'>, year: number): readonly PersonPresentation[] {
  return dataset.people.map((person) => buildPersonPresentation(person, dataset, year)).sort((a, b) => a.id.localeCompare(b.id))
}
