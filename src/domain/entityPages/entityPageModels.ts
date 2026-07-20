import type { RuntimeDataset } from '../../data'
import type {
  HistoricalEvent,
  Journey,
  Person,
  Place,
  Polity,
  Source,
  SourceReference,
} from '../entities'
import { buildEventPresentation, type EventPresentation } from '../events'
import { buildJourneyPresentation, type JourneyPresentation } from '../journeys'
import { buildPersonPresentation, type PersonPresentation } from '../people'
import { buildPlacePresentation, type PlacePresentation } from '../places'
import { buildPolityPresentation, type PolityPresentation } from '../polities'
import {
  parseHistoricalYear,
  type HistoricalYear,
  type TemporalRange,
} from '../time'
import type { SelectedEntityType } from '../../url'

export interface EntityRelationItem {
  entityType: SelectedEntityType
  id: string
  name: string | null
  context: string
}

export interface EntitySourceItem {
  source: Source
  reference: SourceReference
}

export interface EntitySourceCollection {
  resolved: readonly EntitySourceItem[]
  unresolvedSourceIds: readonly string[]
}

interface EntityPageBase {
  entityType: SelectedEntityType
  id: string
  name: string
  subtype: string
  contentClassification: 'reviewed-historical' | 'synthetic-fixture'
  period: TemporalRange
  summary?: string
  contextYear: HistoricalYear
  relations: readonly EntityRelationItem[]
  sources: EntitySourceCollection
  uncertainty: { confidence: string; note?: string } | undefined
  mapped: boolean
}

export interface PlacePageModel extends EntityPageBase {
  entityType: 'place'
  record: Place
  presentation: PlacePresentation
}

export interface PolityPageModel extends EntityPageBase {
  entityType: 'polity'
  record: Polity
  presentation: PolityPresentation
  territoryPeriods: RuntimeDataset['territories']
}

export interface PersonPageModel extends EntityPageBase {
  entityType: 'person'
  record: Person
  presentation: PersonPresentation
  chronology: readonly {
    placeId: string
    placeName: string | null
    mapped: boolean
    relationship: Person['places'][number]
  }[]
}

export interface EventPageModel extends EntityPageBase {
  entityType: 'event'
  record: HistoricalEvent
  presentation: EventPresentation
}

export interface JourneyPageModel extends EntityPageBase {
  entityType: 'journey'
  record: Journey
  presentation: JourneyPresentation
}

export type EntityPageModel =
  | PlacePageModel
  | PolityPageModel
  | PersonPageModel
  | EventPageModel
  | JourneyPageModel

function contextYear(period: TemporalRange, preferredYear?: number): HistoricalYear {
  if (preferredYear !== undefined) {
    return parseHistoricalYear(preferredYear)
  }
  return period.yearFrom
}

function referenceKey(reference: SourceReference): string {
  return [
    reference.sourceId,
    reference.locator ?? '',
    reference.note ?? '',
    reference.excerptNote ?? '',
    reference.reviewedOn ?? '',
    reference.confidence ?? '',
  ].join('\u0000')
}

function collectSources(
  references: readonly SourceReference[],
  sources: readonly Source[],
): EntitySourceCollection {
  const unique = new Map<string, SourceReference>()
  for (const reference of references) {
    const key = referenceKey(reference)
    if (!unique.has(key)) unique.set(key, reference)
  }
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const resolved: EntitySourceItem[] = []
  const unresolved = new Set<string>()
  for (const reference of unique.values()) {
    const source = sourceById.get(reference.sourceId)
    if (source === undefined) unresolved.add(reference.sourceId)
    else resolved.push({ source, reference })
  }
  resolved.sort((first, second) =>
    first.source.title.localeCompare(second.source.title) ||
    first.source.id.localeCompare(second.source.id) ||
    (first.reference.locator ?? '').localeCompare(second.reference.locator ?? '') ||
    referenceKey(first.reference).localeCompare(referenceKey(second.reference)),
  )
  return { resolved, unresolvedSourceIds: [...unresolved].sort() }
}

function relationName(
  dataset: Readonly<RuntimeDataset>,
  type: SelectedEntityType,
  id: string,
): string | null {
  const records = type === 'place' ? dataset.places
    : type === 'polity' ? dataset.polities
      : type === 'person' ? dataset.people
        : type === 'event' ? dataset.events
          : dataset.journeys
  return records.find((record) => record.id === id)?.defaultName ?? null
}

function buildRelations(
  dataset: Readonly<RuntimeDataset>,
  type: SelectedEntityType,
  id: string,
): readonly EntityRelationItem[] {
  const relations = new Map<string, EntityRelationItem>()
  const add = (entityType: SelectedEntityType, relationId: string, context: string) => {
    if (entityType === type && relationId === id) return
    const key = `${entityType}:${relationId}`
    const existing = relations.get(key)
    if (existing === undefined) {
      relations.set(key, {
        entityType,
        id: relationId,
        name: relationName(dataset, entityType, relationId),
        context,
      })
    } else if (!existing.context.split('; ').includes(context)) {
      relations.set(key, { ...existing, context: [...existing.context.split('; '), context].sort().join('; ') })
    }
  }

  if (type === 'place') {
    const place = dataset.places.find((record) => record.id === id)
    place?.ownership.forEach((record) => add('polity', record.polityId, 'Recorded control'))
    dataset.polities.forEach((polity) => polity.capitals
      .filter((capital) => capital.placeId === id)
      .forEach(() => add('polity', polity.id, 'Recorded capital')))
    dataset.people.forEach((person) => person.places
      .filter((relationship) => relationship.placeId === id)
      .forEach((relationship) => add('person', person.id, relationship.relationType.replaceAll('-', ' '))))
    dataset.events.filter((event) => event.relatedPlaceIds.includes(id))
      .forEach((event) => add('event', event.id, 'Recorded location'))
    dataset.journeys.forEach((journey) => journey.stages
      .filter((stage) => stage.placeId === id)
      .forEach(() => add('journey', journey.id, 'Route stage')))
  } else if (type === 'polity') {
    const polity = dataset.polities.find((record) => record.id === id)
    polity?.capitals.forEach((capital) => add('place', capital.placeId, 'Recorded capital'))
    polity?.rulers.forEach((ruler) => add('person', ruler.personId, 'Recorded ruler'))
    dataset.places.forEach((place) => place.ownership
      .filter((ownership) => ownership.polityId === id)
      .forEach(() => add('place', place.id, 'Recorded control')))
    dataset.people.filter((person) => person.associatedPolityIds.includes(id))
      .forEach((person) => add('person', person.id, 'Associated polity'))
    dataset.events.filter((event) => event.participantPolityIds.includes(id))
      .forEach((event) => add('event', event.id, 'Participant'))
    dataset.journeys.filter((journey) => journey.participantPolityIds.includes(id))
      .forEach((journey) => add('journey', journey.id, 'Participant'))
  } else if (type === 'person') {
    const person = dataset.people.find((record) => record.id === id)
    person?.places.forEach((relationship) => {
      add('place', relationship.placeId, relationship.relationType.replaceAll('-', ' '))
      if (relationship.eventId !== undefined) add('event', relationship.eventId, 'Recorded relationship')
      if (relationship.journeyId !== undefined) add('journey', relationship.journeyId, 'Recorded relationship')
    })
    person?.associatedPolityIds.forEach((polityId) => add('polity', polityId, 'Associated polity'))
    dataset.events.filter((event) => event.participantPersonIds.includes(id))
      .forEach((event) => add('event', event.id, 'Participant'))
    dataset.journeys.filter((journey) => journey.participantPersonIds.includes(id))
      .forEach((journey) => add('journey', journey.id, 'Participant'))
  } else if (type === 'event') {
    const event = dataset.events.find((record) => record.id === id)
    event?.relatedPlaceIds.forEach((placeId) => add('place', placeId, 'Recorded location'))
    event?.participantPolityIds.forEach((polityId) => add('polity', polityId, 'Participant'))
    event?.participantPersonIds.forEach((personId) => add('person', personId, 'Participant'))
    if (event?.type === 'battle' && event.battle.relatedJourneyId !== undefined) {
      add('journey', event.battle.relatedJourneyId, 'Campaign')
    }
    dataset.journeys.forEach((journey) => journey.stages
      .filter((stage) => stage.eventId === id)
      .forEach(() => add('journey', journey.id, 'Route stage')))
  } else {
    const journey = dataset.journeys.find((record) => record.id === id)
    journey?.participantPersonIds.forEach((personId) => add('person', personId, 'Participant'))
    journey?.participantPolityIds.forEach((polityId) => add('polity', polityId, 'Participant'))
    journey?.stages.forEach((stage) => {
      if (stage.placeId !== undefined) add('place', stage.placeId, `Stage ${stage.order}`)
      if (stage.eventId !== undefined) add('event', stage.eventId, `Stage ${stage.order}`)
    })
    dataset.events.filter((event) => event.type === 'battle' && event.battle.relatedJourneyId === id)
      .forEach((event) => add('event', event.id, 'Related battle'))
  }

  return [...relations.values()].sort((first, second) =>
    first.entityType.localeCompare(second.entityType) ||
    (first.name ?? first.id).localeCompare(second.name ?? second.id) ||
    first.id.localeCompare(second.id) ||
    first.context.localeCompare(second.context),
  )
}

export function buildEntityPageModel(
  dataset: Readonly<RuntimeDataset>,
  type: SelectedEntityType,
  id: string,
  preferredYear?: number,
): EntityPageModel | null {
  const relations = buildRelations(dataset, type, id)
  if (type === 'place') {
    const record = dataset.places.find((item) => item.id === id)
    if (record === undefined) return null
    const year = contextYear(record.existence, preferredYear)
    return {
      entityType: type, id, name: record.defaultName, subtype: record.placeType, contentClassification: record.contentClassification,
      period: record.existence, summary: record.summary, contextYear: year, relations,
      sources: collectSources([
        ...record.sourceRefs,
        ...record.names.flatMap((item) => item.sourceRefs),
        ...record.ownership.flatMap((item) => item.sourceRefs),
        ...record.importance.flatMap((item) => item.sourceRefs),
      ], dataset.sources),
      uncertainty: record.uncertainty, mapped: record.coordinates !== undefined,
      record, presentation: buildPlacePresentation(record, dataset, year),
    }
  }
  if (type === 'polity') {
    const record = dataset.polities.find((item) => item.id === id)
    if (record === undefined) return null
    const year = contextYear(record.existence, preferredYear)
    const territoryPeriods = dataset.territories.filter((item) => item.polityId === id)
    return {
      entityType: type, id, name: record.defaultName, subtype: record.polityType, contentClassification: record.contentClassification,
      period: record.existence, summary: record.summary, contextYear: year, relations,
      sources: collectSources([
        ...record.sourceRefs,
        ...record.capitals.flatMap((item) => item.sourceRefs),
        ...record.rulers.flatMap((item) => item.sourceRefs),
        ...territoryPeriods.flatMap((item) => item.sourceRefs),
      ], dataset.sources),
      uncertainty: record.uncertainty,
      mapped: territoryPeriods.some((territory) => dataset.geometry.territories.features.some((feature) => feature.id === territory.geometryFeatureId)),
      record, territoryPeriods, presentation: buildPolityPresentation(record, dataset, year),
    }
  }
  if (type === 'person') {
    const record = dataset.people.find((item) => item.id === id)
    if (record === undefined) return null
    const year = contextYear(record.life, preferredYear)
    const presentation = buildPersonPresentation(record, dataset, year)
    return {
      entityType: type, id, name: record.defaultName, subtype: record.roles.join(', '), contentClassification: record.contentClassification,
      period: record.life, summary: record.summary, contextYear: year, relations,
      sources: collectSources([...record.sourceRefs, ...record.places.flatMap((item) => item.sourceRefs)], dataset.sources),
      uncertainty: record.uncertainty, mapped: presentation.firstMappedYear !== null,
      record, presentation,
      chronology: record.places
        .map((relationship) => {
          const place = dataset.places.find((candidate) => candidate.id === relationship.placeId)
          return {
            placeId: relationship.placeId,
            placeName: place?.defaultName ?? null,
            mapped: place?.coordinates !== undefined,
            relationship,
          }
        })
        .sort((first, second) =>
          first.relationship.period.yearFrom - second.relationship.period.yearFrom ||
          first.relationship.relationType.localeCompare(second.relationship.relationType) ||
          first.placeId.localeCompare(second.placeId),
        ),
    }
  }
  if (type === 'event') {
    const record = dataset.events.find((item) => item.id === id)
    if (record === undefined) return null
    const year = contextYear(record.period, preferredYear)
    return {
      entityType: type, id, name: record.defaultName, subtype: record.type, contentClassification: record.contentClassification,
      period: record.period, summary: record.summary, contextYear: year, relations,
      sources: collectSources(record.sourceRefs, dataset.sources),
      uncertainty: record.uncertainty, mapped: record.coordinates !== undefined,
      record, presentation: buildEventPresentation(record, dataset, year),
    }
  }
  const record = dataset.journeys.find((item) => item.id === id)
  if (record === undefined) return null
  const year = contextYear(record.period, preferredYear)
  const presentation = buildJourneyPresentation(record, dataset, dataset.geometry.journeys, year)
  return {
    entityType: type, id, name: record.defaultName, subtype: record.journeyType, contentClassification: record.contentClassification,
    period: record.period, summary: record.summary, contextYear: year, relations,
    sources: collectSources([...record.sourceRefs, ...record.stages.flatMap((item) => item.sourceRefs)], dataset.sources),
    uncertainty: record.uncertainty, mapped: presentation.geometryAvailable,
    record, presentation,
  }
}
