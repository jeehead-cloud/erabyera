import type { RuntimeDataset } from '../../data'
import type {
  Journey,
  JourneyType,
  RouteCertainty,
  RouteStage,
  Source,
  SourceReference,
  Uncertainty,
} from '../entities'
import type { JourneyFeatureCollection } from '../geometry'
import { getPlaceNameAtYear } from '../places'
import {
  isActiveAtYear,
  nearestYearInTemporalRange,
  parseHistoricalYear,
  type HistoricalYear,
  type TemporalRange,
} from '../time'

export interface ResolvedJourneyRelation {
  id: string
  name: string | null
}

export interface ResolvedJourneySource {
  source: Source
  reference: SourceReference
}

export interface JourneySourceAggregation {
  resolved: readonly ResolvedJourneySource[]
  unresolvedSourceIds: readonly string[]
}

export interface RouteStagePresentation {
  order: number
  place: ResolvedJourneyRelation | null
  event: ResolvedJourneyRelation | null
  coordinates: readonly [number, number] | null
  period: TemporalRange | null
  year: HistoricalYear | null
  uncertainty: Uncertainty | undefined
  sourceRefs: readonly SourceReference[]
  sources: JourneySourceAggregation
}

export interface JourneyPresentation {
  id: string
  displayName: string
  journeyType: JourneyType
  period: TemporalRange
  active: boolean
  geometryAvailable: boolean
  geometryFeatureId: string | null
  directionKnown: boolean
  routeCertainty: RouteCertainty
  participantPeople: readonly ResolvedJourneyRelation[]
  participantPolities: readonly ResolvedJourneyRelation[]
  stages: readonly RouteStagePresentation[]
  startStage: RouteStagePresentation
  endStage: RouteStagePresentation
  relatedPlaces: readonly ResolvedJourneyRelation[]
  relatedEvents: readonly ResolvedJourneyRelation[]
  summary: string | undefined
  uncertainty: Uncertainty | undefined
  sources: JourneySourceAggregation
  firstActiveYear: HistoricalYear
  nearestActiveYear: HistoricalYear | null
  firstMappedYear: HistoricalYear | null
  nearestMappedYear: HistoricalYear | null
}

export function isJourneyActiveAtYear(journey: Journey, year: number): boolean {
  return isActiveAtYear(journey.period, year)
}

function relationList(
  ids: readonly string[],
  names: ReadonlyMap<string, string>,
): readonly ResolvedJourneyRelation[] {
  return [...new Set(ids)]
    .sort((first, second) => first.localeCompare(second))
    .map((id) => ({ id, name: names.get(id) ?? null }))
}

function stageYear(stage: RouteStage, selectedYear: HistoricalYear): HistoricalYear {
  if (stage.year !== undefined) return stage.year
  if (stage.period !== undefined) {
    return nearestYearInTemporalRange(stage.period, selectedYear) ?? stage.period.yearFrom
  }
  return selectedYear
}

export function resolveJourneyStages(
  journey: Journey,
  dataset: Pick<RuntimeDataset, 'places' | 'events' | 'sources'>,
  year: number,
): readonly RouteStagePresentation[] {
  const selectedYear = parseHistoricalYear(year)
  const orders = journey.stages.map((stage) => stage.order)
  if (
    new Set(orders).size !== orders.length ||
    orders.some((order, index) => order !== index + 1)
  ) {
    throw new Error(`Journey ${journey.id} has invalid route-stage order.`)
  }

  const placeById = new Map(dataset.places.map((place) => [place.id, place]))
  const eventById = new Map(dataset.events.map((event) => [event.id, event]))
  return journey.stages.map((stage) => {
    const resolvedYear = stageYear(stage, selectedYear)
    const place = stage.placeId === undefined ? undefined : placeById.get(stage.placeId)
    const event = stage.eventId === undefined ? undefined : eventById.get(stage.eventId)
    return {
      order: stage.order,
      place: stage.placeId === undefined
        ? null
        : { id: stage.placeId, name: place === undefined ? null : getPlaceNameAtYear(place, resolvedYear) },
      event: stage.eventId === undefined
        ? null
        : { id: stage.eventId, name: event?.defaultName ?? null },
      coordinates: stage.coordinates ?? null,
      period: stage.period ?? null,
      year: stage.year ?? null,
      uncertainty: stage.uncertainty,
      sourceRefs: stage.sourceRefs,
      sources: aggregateSourceReferences(stage.sourceRefs, dataset.sources),
    }
  })
}

function referenceKey(reference: SourceReference): string {
  return [
    reference.sourceId,
    reference.locator ?? '',
    reference.note ?? '',
    reference.excerptNote ?? '',
    reference.reviewedOn ?? '',
  ].join('\u0000')
}

function aggregateSourceReferences(
  references: readonly SourceReference[],
  sources: readonly Source[],
): JourneySourceAggregation {
  const unique = new Map<string, SourceReference>()
  for (const reference of references) {
    const key = referenceKey(reference)
    if (!unique.has(key)) unique.set(key, reference)
  }
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const resolved: ResolvedJourneySource[] = []
  const unresolved = new Set<string>()
  for (const reference of unique.values()) {
    const source = sourceById.get(reference.sourceId)
    if (source === undefined) unresolved.add(reference.sourceId)
    else resolved.push({ source, reference })
  }
  return { resolved, unresolvedSourceIds: [...unresolved].sort() }
}

export function aggregateJourneySources(
  journey: Journey,
  sources: readonly Source[],
): JourneySourceAggregation {
  return aggregateSourceReferences([
    ...journey.sourceRefs,
    ...journey.stages.flatMap((stage) => stage.sourceRefs),
  ], sources)
}

function hasJourneyGeometry(
  journey: Journey,
  geometry: JourneyFeatureCollection,
): boolean {
  if (journey.geometryFeatureId === undefined) return false
  return geometry.features.some(
    (feature) =>
      feature.id === journey.geometryFeatureId &&
      feature.properties.journeyId === journey.id,
  )
}

export function buildJourneyPresentation(
  journey: Journey,
  dataset: Pick<RuntimeDataset, 'places' | 'events' | 'people' | 'polities' | 'sources'>,
  geometry: JourneyFeatureCollection,
  year: number,
): JourneyPresentation {
  const selectedYear = parseHistoricalYear(year)
  const stages = resolveJourneyStages(journey, dataset, selectedYear)
  const geometryAvailable = hasJourneyGeometry(journey, geometry)
  const personNames = new Map(dataset.people.map((person) => [person.id, person.defaultName]))
  const polityNames = new Map(dataset.polities.map((polity) => [polity.id, polity.defaultName]))
  const relatedPlaces = relationList(
    stages.flatMap((stage) => stage.place === null ? [] : [stage.place.id]),
    new Map(stages.flatMap((stage) => stage.place?.name === null || stage.place === null ? [] : [[stage.place.id, stage.place.name]])),
  )
  const relatedEvents = relationList(
    stages.flatMap((stage) => stage.event === null ? [] : [stage.event.id]),
    new Map(stages.flatMap((stage) => stage.event?.name === null || stage.event === null ? [] : [[stage.event.id, stage.event.name]])),
  )
  const nearestActiveYear = nearestYearInTemporalRange(journey.period, selectedYear)
  return {
    id: journey.id,
    displayName: journey.defaultName,
    journeyType: journey.journeyType,
    period: journey.period,
    active: isJourneyActiveAtYear(journey, selectedYear),
    geometryAvailable,
    geometryFeatureId: journey.geometryFeatureId ?? null,
    directionKnown: journey.directionKnown,
    routeCertainty: journey.routeCertainty,
    participantPeople: relationList(journey.participantPersonIds, personNames),
    participantPolities: relationList(journey.participantPolityIds, polityNames),
    stages,
    startStage: stages[0],
    endStage: stages[stages.length - 1],
    relatedPlaces,
    relatedEvents,
    summary: journey.summary,
    uncertainty: journey.uncertainty,
    sources: aggregateJourneySources(journey, dataset.sources),
    firstActiveYear: journey.period.yearFrom,
    nearestActiveYear,
    firstMappedYear: geometryAvailable ? journey.period.yearFrom : null,
    nearestMappedYear: geometryAvailable ? nearestActiveYear : null,
  }
}

export function buildJourneyPresentations(
  dataset: Pick<RuntimeDataset, 'journeys' | 'places' | 'events' | 'people' | 'polities' | 'sources' | 'geometry'>,
  year: number,
): readonly JourneyPresentation[] {
  return dataset.journeys
    .map((journey) => buildJourneyPresentation(journey, dataset, dataset.geometry.journeys, year))
    .sort((first, second) => first.id.localeCompare(second.id))
}

export function journeyTypeLabel(type: JourneyType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function routeCertaintyLabel(certainty: RouteCertainty): string {
  return `${certainty.charAt(0).toUpperCase()}${certainty.slice(1)} route`
}

export function journeyDirectionLabel(directionKnown: boolean): string {
  return directionKnown ? 'Direction documented' : 'Direction not established'
}
