import type { RuntimeDataset } from '../../data'
import type {
  Battle,
  BattleSide,
  EventType,
  HistoricalEvent,
  LocationAccuracy,
  Source,
  SourceReference,
} from '../entities'
import { getPlaceNameAtYear } from '../places'
import {
  isActiveAtYear,
  nearestYearInTemporalRange,
  parseHistoricalYear,
  type HistoricalYear,
  type TemporalRange,
} from '../time'

export interface ResolvedEventSource {
  source: Source
  reference: SourceReference
}

export interface EventSourceAggregation {
  resolved: readonly ResolvedEventSource[]
  unresolvedSourceIds: readonly string[]
}

export interface ResolvedEventRelation {
  id: string
  name: string | null
}

export interface BattleSidePresentation {
  id: string
  label: string
  polities: readonly ResolvedEventRelation[]
  people: readonly ResolvedEventRelation[]
  commanders: readonly ResolvedEventRelation[]
  outcome?: string
}

interface EventPresentationBase {
  id: string
  displayName: string
  type: EventType
  period: TemporalRange
  active: boolean
  coordinates: readonly [number, number] | null
  locationAccuracy: LocationAccuracy | null
  locationAvailable: boolean
  summary?: string
  uncertainty: HistoricalEvent['uncertainty']
  participantPolities: readonly ResolvedEventRelation[]
  participantPeople: readonly ResolvedEventRelation[]
  relatedPlaces: readonly ResolvedEventRelation[]
  sources: EventSourceAggregation
  firstActiveYear: HistoricalYear
  nearestActiveYear: HistoricalYear | null
}

export interface GenericEventPresentation extends EventPresentationBase {
  kind: 'event'
  type: Exclude<EventType, 'battle'>
}

export interface BattlePresentation extends EventPresentationBase {
  kind: 'battle'
  type: 'battle'
  sides: readonly BattleSidePresentation[]
  result: string
  relatedJourney: ResolvedEventRelation | null
  forces: Battle['battle']['forces']
  losses: Battle['battle']['losses']
  disputedNotes: readonly string[]
}

export type EventPresentation = GenericEventPresentation | BattlePresentation

export function isEventActiveAtYear(event: HistoricalEvent, year: number): boolean {
  return isActiveAtYear(event.period, year)
}

export function validateEventLocation(event: HistoricalEvent): void {
  if (event.coordinates === undefined && event.locationAccuracy !== undefined && event.locationAccuracy !== 'unknown') {
    throw new Error(`Event ${event.id} declares ${event.locationAccuracy} location accuracy without coordinates.`)
  }
  if (event.coordinates !== undefined && event.locationAccuracy === 'unknown') {
    throw new Error(`Event ${event.id} supplies coordinates for an unknown location.`)
  }
}

function uniqueRelations(ids: readonly string[], names: ReadonlyMap<string, string>): readonly ResolvedEventRelation[] {
  return [...new Set(ids)]
    .sort((first, second) => first.localeCompare(second))
    .map((id) => ({ id, name: names.get(id) ?? null }))
}

function resolveSide(
  side: BattleSide,
  polityNames: ReadonlyMap<string, string>,
  personNames: ReadonlyMap<string, string>,
): BattleSidePresentation {
  return {
    id: side.id,
    label: side.label,
    polities: uniqueRelations(side.polityIds, polityNames),
    people: uniqueRelations(side.personIds, personNames),
    commanders: uniqueRelations(side.commanderIds, personNames),
    outcome: side.outcome,
  }
}

function sourceReferenceKey(reference: SourceReference): string {
  return [reference.sourceId, reference.locator ?? '', reference.note ?? '', reference.excerptNote ?? '', reference.reviewedOn ?? ''].join('\u0000')
}

export function aggregateEventSources(
  event: HistoricalEvent,
  sources: readonly Source[],
): EventSourceAggregation {
  const unique = new Map<string, SourceReference>()
  for (const reference of event.sourceRefs) {
    const key = sourceReferenceKey(reference)
    if (!unique.has(key)) unique.set(key, reference)
  }
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const resolved: ResolvedEventSource[] = []
  const unresolved = new Set<string>()
  for (const reference of unique.values()) {
    const source = sourceById.get(reference.sourceId)
    if (source === undefined) unresolved.add(reference.sourceId)
    else resolved.push({ source, reference })
  }
  return { resolved, unresolvedSourceIds: [...unresolved].sort() }
}

export function eventLocationLabel(accuracy: LocationAccuracy | null, available: boolean): string {
  if (!available) return 'No reviewed map location'
  if (accuracy === null) return 'Mapped location · accuracy unspecified'
  if (accuracy === 'regional') return 'Regional representative point'
  return `${accuracy.replaceAll('-', ' ')} location`
}

export function eventTypeStyleGroup(type: EventType): 'battle' | 'ordinary' {
  return type === 'battle' ? 'battle' : 'ordinary'
}

export function buildEventPresentation(
  event: HistoricalEvent,
  dataset: Pick<RuntimeDataset, 'places' | 'polities' | 'people' | 'journeys' | 'sources'>,
  year: number,
): EventPresentation {
  const selectedYear = parseHistoricalYear(year)
  validateEventLocation(event)
  const relationYear = nearestYearInTemporalRange(event.period, selectedYear) ?? event.period.yearFrom
  const polityNames = new Map(dataset.polities.map((polity) => [polity.id, polity.defaultName]))
  const personNames = new Map(dataset.people.map((person) => [person.id, person.defaultName]))
  const placeNames = new Map(dataset.places.map((place) => [place.id, getPlaceNameAtYear(place, relationYear)]))
  const journeyNames = new Map(dataset.journeys.map((journey) => [journey.id, journey.defaultName]))
  const base: EventPresentationBase = {
    id: event.id,
    displayName: event.defaultName,
    type: event.type,
    period: event.period,
    active: isEventActiveAtYear(event, selectedYear),
    coordinates: event.coordinates === undefined ? null : event.coordinates,
    locationAccuracy: event.locationAccuracy ?? null,
    locationAvailable: event.coordinates !== undefined,
    summary: event.summary,
    uncertainty: event.uncertainty,
    participantPolities: uniqueRelations(event.participantPolityIds, polityNames),
    participantPeople: uniqueRelations(event.participantPersonIds, personNames),
    relatedPlaces: uniqueRelations(event.relatedPlaceIds, placeNames),
    sources: aggregateEventSources(event, dataset.sources),
    firstActiveYear: event.period.yearFrom,
    nearestActiveYear: nearestYearInTemporalRange(event.period, selectedYear),
  }
  if (event.type !== 'battle') {
    return { ...base, kind: 'event', type: event.type }
  }
  return {
    ...base,
    kind: 'battle',
    type: 'battle',
    sides: event.battle.sides.map((side) => resolveSide(side, polityNames, personNames)),
    result: event.battle.result,
    relatedJourney: event.battle.relatedJourneyId === undefined ? null : {
      id: event.battle.relatedJourneyId,
      name: journeyNames.get(event.battle.relatedJourneyId) ?? null,
    },
    forces: event.battle.forces,
    losses: event.battle.losses,
    disputedNotes: event.battle.disputedNotes,
  }
}

export function buildEventPresentations(
  dataset: Pick<RuntimeDataset, 'events' | 'places' | 'polities' | 'people' | 'journeys' | 'sources'>,
  year: number,
): readonly EventPresentation[] {
  return dataset.events
    .map((event) => buildEventPresentation(event, dataset, year))
    .sort((first, second) => first.id.localeCompare(second.id))
}
