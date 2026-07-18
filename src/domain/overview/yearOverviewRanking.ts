import type { EventPresentation } from '../events'
import type { JourneyPresentation } from '../journeys'
import type { PersonPresentation } from '../people'
import { PERSON_RELATIONSHIP_PRIORITY } from '../people'
import type { PlacePresentation } from '../places'
import type { PolityPresentation } from '../polities'

export const YEAR_OVERVIEW_LIMITS = Object.freeze({
  events: 5,
  polities: 5,
  places: 5,
  people: 5,
  journeys: 4,
})

const EVENT_TYPE_ORDER = Object.freeze([
  'battle',
  'political',
  'cultural',
  'disaster',
  'epidemic',
  'other',
] as const)

function compareText(
  firstName: string,
  firstId: string,
  secondName: string,
  secondId: string,
): number {
  return firstName.localeCompare(secondName) || firstId.localeCompare(secondId)
}

export function rankOverviewEvents(events: readonly EventPresentation[]): readonly EventPresentation[] {
  return events.filter((event) => event.active).sort((first, second) =>
    EVENT_TYPE_ORDER.indexOf(first.type) - EVENT_TYPE_ORDER.indexOf(second.type) ||
    compareText(first.displayName, first.id, second.displayName, second.id),
  ).slice(0, YEAR_OVERVIEW_LIMITS.events)
}

export function rankOverviewPolities(polities: readonly PolityPresentation[]): readonly PolityPresentation[] {
  return polities.filter((polity) => polity.active).sort((first, second) =>
    Number(second.hasActiveGeometry) - Number(first.hasActiveGeometry) ||
    compareText(first.displayName, first.id, second.displayName, second.id),
  ).slice(0, YEAR_OVERVIEW_LIMITS.polities)
}

export function rankOverviewPlaces(places: readonly PlacePresentation[]): readonly PlacePresentation[] {
  return places.filter((place) => place.active && place.importance !== null).sort((first, second) =>
    (second.importance ?? 0) - (first.importance ?? 0) ||
    compareText(first.displayName, first.id, second.displayName, second.id),
  ).slice(0, YEAR_OVERVIEW_LIMITS.places)
}

function relationshipPriority(person: PersonPresentation): number {
  const relationship = person.primaryLocation?.relationType
  return relationship === undefined ? PERSON_RELATIONSHIP_PRIORITY.length : PERSON_RELATIONSHIP_PRIORITY.indexOf(relationship)
}

export function rankOverviewPeople(people: readonly PersonPresentation[]): readonly PersonPresentation[] {
  return people.filter((person) => person.alive && person.mapped).sort((first, second) =>
    second.importance - first.importance ||
    relationshipPriority(first) - relationshipPriority(second) ||
    compareText(first.displayName, first.id, second.displayName, second.id),
  ).slice(0, YEAR_OVERVIEW_LIMITS.people)
}

export function rankOverviewJourneys(journeys: readonly JourneyPresentation[]): readonly JourneyPresentation[] {
  return journeys.filter((journey) => journey.active).sort((first, second) =>
    Number(second.geometryAvailable) - Number(first.geometryAvailable) ||
    compareText(first.displayName, first.id, second.displayName, second.id),
  ).slice(0, YEAR_OVERVIEW_LIMITS.journeys)
}
