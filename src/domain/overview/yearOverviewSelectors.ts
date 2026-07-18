import type { RuntimeDataset } from '../../data'
import { buildEventPresentations, eventLocationLabel } from '../events'
import { buildJourneyPresentations, journeyDirectionLabel, routeCertaintyLabel } from '../journeys'
import { buildPersonPresentations } from '../people'
import { buildPlacePresentations } from '../places'
import { buildPolityPresentations } from '../polities'
import { formatHistoricalYear, isActiveAtYear, parseHistoricalYear } from '../time'
import type { MapLayerId } from '../../url'
import {
  rankOverviewEvents,
  rankOverviewJourneys,
  rankOverviewPeople,
  rankOverviewPlaces,
  rankOverviewPolities,
} from './yearOverviewRanking'
import type {
  YearOverviewCollection,
  YearOverviewCount,
  YearOverviewEmptyState,
  YearOverviewItem,
  YearOverviewPresentation,
} from './yearOverviewPresentation'

const FOUNDATION_FIXTURE_WARNING = 'Foundation demonstration dataset. Sparse coverage is intentional and does not represent the absence of historical activity.'

function layerEnabled(activeLayers: readonly MapLayerId[], layer: MapLayerId): boolean {
  return activeLayers.includes(layer)
}

function count(published: number, active: number, mapped: number): YearOverviewCount {
  return { published, active, mapped, unmapped: active - mapped }
}

function resolveCollection(
  dataset: Readonly<RuntimeDataset>,
  collectionId: string | null,
  year: number,
): YearOverviewCollection {
  if (collectionId === null) return {
    state: 'none', id: null, name: null, coverageStatus: null, coverageNote: null,
    detailedRegions: [], partialRegions: [], inSelectedYear: null,
  }
  const collection = dataset.collections.find((candidate) => candidate.id === collectionId)
  if (collection === undefined) return {
    state: 'unresolved', id: collectionId, name: null, coverageStatus: null,
    coverageNote: 'The collection in this URL is not available in the current runtime dataset.',
    detailedRegions: [], partialRegions: [], inSelectedYear: null,
  }
  return {
    state: 'resolved',
    id: collection.id,
    name: collection.defaultName,
    coverageStatus: collection.coverageStatus,
    coverageNote: collection.coverage.note,
    detailedRegions: collection.coverage.detailedRegions,
    partialRegions: collection.coverage.partialRegions,
    inSelectedYear: isActiveAtYear(collection.coverage.timeRange, year),
  }
}

function emptyState(active: number, mapped: number): YearOverviewEmptyState {
  if (active === 0) return 'no-active-records'
  if (mapped === 0) return 'active-but-unmapped'
  return 'content'
}

function coverageMessage(state: YearOverviewEmptyState): string {
  if (state === 'no-active-records') return 'No published records in the current dataset are active for this year. This reflects dataset coverage, not the absence of historical activity.'
  if (state === 'active-but-unmapped') return 'Published records are active for this year, but none has reviewed map geometry. This reflects dataset coverage, not the absence of historical activity.'
  return 'Published fixture records are active for this year. Coverage remains intentionally sparse.'
}

export function buildYearOverview(
  dataset: Readonly<RuntimeDataset>,
  year: number,
  activeLayers: readonly MapLayerId[],
  collectionId: string | null,
): YearOverviewPresentation {
  const selectedYear = parseHistoricalYear(year)
  const eventPresentations = buildEventPresentations(dataset, selectedYear)
  const polityPresentations = buildPolityPresentations(dataset, selectedYear)
  const placePresentations = buildPlacePresentations(dataset, selectedYear)
  const personPresentations = buildPersonPresentations(dataset, selectedYear)
  const journeyPresentations = buildJourneyPresentations(dataset, selectedYear)

  const activeEvents = eventPresentations.filter((event) => event.active)
  const activePolities = polityPresentations.filter((polity) => polity.active)
  const activePlaces = placePresentations.filter((place) => place.active)
  const alivePeople = personPresentations.filter((person) => person.alive)
  const activeJourneys = journeyPresentations.filter((journey) => journey.active)

  const eventCount = count(dataset.events.length, activeEvents.length, activeEvents.filter((event) => event.locationAvailable).length)
  const polityCount = count(dataset.polities.length, activePolities.length, activePolities.filter((polity) => polity.hasActiveGeometry).length)
  const placeCount = count(dataset.places.length, activePlaces.length, activePlaces.filter((place) => place.coordinates !== undefined).length)
  const peopleCount = count(dataset.people.length, alivePeople.length, alivePeople.filter((person) => person.mapped).length)
  const journeyCount = count(dataset.journeys.length, activeJourneys.length, activeJourneys.filter((journey) => journey.geometryAvailable).length)
  const totalActive = eventCount.active + polityCount.active + placeCount.active + peopleCount.active + journeyCount.active
  const totalMapped = eventCount.mapped + polityCount.mapped + placeCount.mapped + peopleCount.mapped + journeyCount.mapped
  const state = emptyState(totalActive, totalMapped)
  const syntheticFixture = dataset.datasetName.toLowerCase().includes('synthetic') || dataset.datasetVersion.includes('fixture')

  const events: YearOverviewItem[] = rankOverviewEvents(eventPresentations).map((event) => ({
    entityType: 'event', entityLabel: event.type === 'battle' ? 'Battle' : 'Event', id: event.id,
    name: event.displayName, subtype: event.type.replaceAll('-', ' '),
    context: eventLocationLabel(event.locationAccuracy, event.locationAvailable),
    mapped: event.locationAvailable, layerActive: layerEnabled(activeLayers, 'events'),
    confidence: event.uncertainty?.confidence ?? null,
  }))
  const polities: YearOverviewItem[] = rankOverviewPolities(polityPresentations).map((polity) => ({
    entityType: 'polity', entityLabel: 'Polity', id: polity.id, name: polity.displayName,
    subtype: polity.polityType.replaceAll('-', ' '),
    context: polity.hasActiveGeometry ? 'Reviewed territory available' : 'No active reviewed territory',
    mapped: polity.hasActiveGeometry, layerActive: layerEnabled(activeLayers, 'territories'),
    confidence: polity.uncertainty?.confidence ?? null,
  }))
  const places: YearOverviewItem[] = rankOverviewPlaces(placePresentations).map((place) => ({
    entityType: 'place', entityLabel: 'Place', id: place.id, name: place.displayName,
    subtype: place.placeType.replaceAll('-', ' '), context: `Importance ${place.importance ?? 'not set'}`,
    mapped: place.coordinates !== undefined, layerActive: layerEnabled(activeLayers, 'places'),
    confidence: place.uncertainty?.confidence ?? null,
  }))
  const people: YearOverviewItem[] = rankOverviewPeople(personPresentations).map((person) => ({
    entityType: 'person', entityLabel: 'Person', id: person.id, name: person.displayName,
    subtype: person.roles.join(', '),
    context: person.primaryLocation === null ? 'No active reviewed location' : `${person.primaryLocation.relationType} at ${person.primaryLocation.placeName ?? 'unresolved place'}`,
    mapped: person.mapped, layerActive: layerEnabled(activeLayers, 'people'),
    confidence: person.uncertainty?.confidence ?? person.primaryLocation?.relationshipUncertainty?.confidence ?? null,
  }))
  const journeys: YearOverviewItem[] = rankOverviewJourneys(journeyPresentations).map((journey) => ({
    entityType: 'journey', entityLabel: 'Journey', id: journey.id, name: journey.displayName,
    subtype: journey.journeyType, context: `${routeCertaintyLabel(journey.routeCertainty)}; ${journeyDirectionLabel(journey.directionKnown)}`,
    mapped: journey.geometryAvailable, layerActive: layerEnabled(activeLayers, 'journeys'),
    confidence: journey.uncertainty?.confidence ?? null,
  }))

  const layerFiltersHideActiveContent =
    (eventCount.active > 0 && !layerEnabled(activeLayers, 'events')) ||
    (polityCount.active > 0 && !layerEnabled(activeLayers, 'territories')) ||
    (placeCount.active > 0 && !layerEnabled(activeLayers, 'places')) ||
    (peopleCount.active > 0 && !layerEnabled(activeLayers, 'people')) ||
    (journeyCount.active > 0 && !layerEnabled(activeLayers, 'journeys'))

  return {
    selectedYear,
    formattedYear: formatHistoricalYear(selectedYear),
    datasetName: dataset.datasetName,
    datasetVersion: dataset.datasetVersion,
    events,
    polities,
    places,
    people,
    journeys,
    coverage: {
      totalPublishedRecords: dataset.sources.length + dataset.places.length + dataset.polities.length +
        dataset.territories.length + dataset.people.length + dataset.events.length + dataset.journeys.length + dataset.collections.length,
      entities: { events: eventCount, polities: polityCount, places: placeCount, people: peopleCount, journeys: journeyCount },
      activeTerritories: polityPresentations.reduce((total, polity) => total + polity.territories.length, 0),
      layerFiltersHideActiveContent,
      sparseCoverage: true,
      syntheticFixture,
      message: coverageMessage(state),
      fixtureWarning: syntheticFixture ? FOUNDATION_FIXTURE_WARNING : null,
    },
    collection: resolveCollection(dataset, collectionId, selectedYear),
    emptyState: state,
  }
}
