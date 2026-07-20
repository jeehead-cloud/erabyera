import { useCallback, useMemo, useState } from 'react'
import { HistoricalDataStatus, PlaceDetailsCard } from '../components/PlaceDetails'
import { Timeline, TIMELINE_HISTORY_MODE } from '../components/Timeline'
import { PolityDetailsCard } from '../components/PolityDetails'
import { EventDetailsCard } from '../components/EventDetails'
import { PersonAggregateChooser, PersonDetailsCard } from '../components/PersonDetails'
import { JourneyDetailsCard } from '../components/JourneyDetails'
import { YearOverviewPanel } from '../components/YearOverview'
import { GlobalSearch } from '../components/GlobalSearch'
import { ActiveCollectionBadge } from '../components/ActiveCollectionBadge'
import { loadBundledSearchIndex, useRuntimeData } from '../data'
import {
  PLACE_SELECTION_HISTORY_MODE,
  buildPlaceFeatureCollection,
  buildPlacePresentations,
  createPlaceSelection,
  selectedPlaceId,
} from '../domain/places'
import type { HistoricalYear } from '../domain/time'
import {
  POLITY_SELECTION_HISTORY_MODE,
  buildPolityPresentations,
  buildTerritoryFeatureCollection,
  createPolitySelection,
  selectedPolityId,
} from '../domain/polities'
import { MapView } from '../map'
import { useMapUrlState } from '../url'
import {
  EVENT_SELECTION_HISTORY_MODE,
  buildEventFeatureCollection,
  buildEventPresentations,
  createEventSelection,
  selectedEventId,
} from '../domain/events'
import {
  PERSON_SELECTION_HISTORY_MODE,
  buildPersonFeatureCollection,
  buildPersonLocationAggregates,
  buildPersonPresentations,
  createPersonSelection,
  selectedPersonId,
} from '../domain/people'
import {
  JOURNEY_SELECTION_HISTORY_MODE,
  buildJourneyFeatureCollection,
  buildJourneyPresentations,
  createJourneySelection,
  selectedJourneyId,
} from '../domain/journeys'
import {
  YEAR_OVERVIEW_SELECTION_HISTORY_MODE,
  buildYearOverview,
  createYearOverviewSelection,
  getYearOverviewSelectionState,
  type YearOverviewItem,
} from '../domain/overview'
import {
  SEARCH_SELECTION_HISTORY_MODE,
  createSearchNavigationUpdate,
  type SearchResult,
} from '../domain/search'
import {
  buildActiveCollectionPresentation,
  collectionRecommendedMapUpdate,
  COLLECTION_NAVIGATION_HISTORY_MODE,
  leaveCollectionUpdate,
} from '../domain/collections'

export function MapPage() {
  const [mapUrlState, updateMapUrlState] = useMapUrlState()
  const runtimeData = useRuntimeData()
  const [searchIndexResult] = useState(() => {
    try {
      return { index: loadBundledSearchIndex(), error: null }
    } catch (error) {
      console.error('Local historical search index failed safely.', error)
      return {
        index: null,
        error: 'The bundled search index is unavailable or incompatible with this dataset.',
      }
    }
  })
  const [aggregatePlaceId, setAggregatePlaceId] = useState<string | null>(null)
  const selectedPlace = selectedPlaceId(mapUrlState.selectedEntity)
  const selectedPolity = selectedPolityId(mapUrlState.selectedEntity)
  const selectedEvent = selectedEventId(mapUrlState.selectedEntity)
  const selectedPerson = selectedPersonId(mapUrlState.selectedEntity)
  const selectedJourney = selectedJourneyId(mapUrlState.selectedEntity)
  const placeResult = useMemo(() => {
    if (runtimeData.status !== 'ready') return null
    try {
      return {
        presentations: buildPlacePresentations(runtimeData.data, mapUrlState.year),
        error: null,
      }
    } catch (error) {
      console.error('Historical place presentation failed safely.', error)
      return {
        presentations: [],
        error: 'Historical places could not be prepared for this selected year.',
      }
    }
  }, [mapUrlState.year, runtimeData])
  const placesLayerActive = mapUrlState.activeLayers.includes('places')
  const placeFeatures = useMemo(() =>
    placeResult === null || placeResult.error !== null
      ? undefined
      : buildPlaceFeatureCollection(
          placeResult.presentations,
          placesLayerActive,
          selectedPlace,
        ),
  [placeResult, placesLayerActive, selectedPlace])
  const selectedPlacePresentation = placeResult?.presentations.find((place) => place.id === selectedPlace) ?? null
  const unresolvedPlaceId = runtimeData.status === 'ready' && selectedPlace !== null &&
    placeResult?.error === null && selectedPlacePresentation === null
    ? selectedPlace
    : null
  const activePlaceCount = placeResult?.presentations.filter((place) => place.active).length ?? 0
  const polityResult = useMemo(() => {
    if (runtimeData.status !== 'ready') return null
    try {
      return { presentations: buildPolityPresentations(runtimeData.data, mapUrlState.year), error: null }
    } catch (error) {
      console.error('Historical polity presentation failed safely.', error)
      return { presentations: [], error: 'Historical territories could not be prepared for this selected year.' }
    }
  }, [mapUrlState.year, runtimeData])
  const territoriesLayerActive = mapUrlState.activeLayers.includes('territories')
  const territoryFeatures = useMemo(() =>
    polityResult === null || polityResult.error !== null || runtimeData.status !== 'ready'
      ? undefined
      : buildTerritoryFeatureCollection(
          polityResult.presentations,
          runtimeData.data.geometry.territories,
          territoriesLayerActive,
          selectedPolity,
        ),
  [polityResult, runtimeData, selectedPolity, territoriesLayerActive])
  const selectedPolityPresentation = polityResult?.presentations.find((polity) => polity.id === selectedPolity) ?? null
  const unresolvedPolityId = runtimeData.status === 'ready' && selectedPolity !== null && polityResult?.error === null && selectedPolityPresentation === null ? selectedPolity : null
  const activeTerritoryCount = polityResult?.presentations.reduce((count, polity) => count + polity.territories.length, 0) ?? 0
  const hasEmptyPlacesState = placeResult?.error === null && placesLayerActive && activePlaceCount === 0
  const hasEmptyTerritoriesState = polityResult?.error === null && territoriesLayerActive && activeTerritoryCount === 0
  const eventResult = useMemo(() => {
    if (runtimeData.status !== 'ready') return null
    try {
      return { presentations: buildEventPresentations(runtimeData.data, mapUrlState.year), error: null }
    } catch (error) {
      console.error('Historical event presentation failed safely.', error)
      return { presentations: [], error: 'Historical events could not be prepared for this selected year.' }
    }
  }, [mapUrlState.year, runtimeData])
  const eventsLayerActive = mapUrlState.activeLayers.includes('events')
  const eventFeatures = useMemo(() =>
    eventResult === null || eventResult.error !== null
      ? undefined
      : buildEventFeatureCollection(eventResult.presentations, eventsLayerActive, selectedEvent),
  [eventResult, eventsLayerActive, selectedEvent])
  const selectedEventPresentation = eventResult?.presentations.find((event) => event.id === selectedEvent) ?? null
  const unresolvedEventId = runtimeData.status === 'ready' && selectedEvent !== null && eventResult?.error === null && selectedEventPresentation === null ? selectedEvent : null
  const activeMappedEventCount = eventResult?.presentations.filter((event) => event.active && event.locationAvailable).length ?? 0
  const activeUnmappedEventCount = eventResult?.presentations.filter((event) => event.active && !event.locationAvailable).length ?? 0
  const hasEmptyEventsState = eventResult?.error === null && eventsLayerActive && activeMappedEventCount === 0
  const personResult = useMemo(() => {
    if (runtimeData.status !== 'ready') return null
    try { return { presentations: buildPersonPresentations(runtimeData.data, mapUrlState.year), error: null } }
    catch (error) { console.error('Historical person presentation failed safely.', error); return { presentations: [], error: 'Historical people could not be prepared for this selected year.' } }
  }, [mapUrlState.year, runtimeData])
  const peopleLayerActive = mapUrlState.activeLayers.includes('people')
  const personAggregates = useMemo(() => personResult === null || personResult.error !== null ? [] : buildPersonLocationAggregates(personResult.presentations, mapUrlState.zoom, peopleLayerActive, selectedPerson), [mapUrlState.zoom, peopleLayerActive, personResult, selectedPerson])
  const personFeatures = useMemo(() => personResult === null || personResult.error !== null ? undefined : buildPersonFeatureCollection(personAggregates), [personAggregates, personResult])
  const selectedPersonPresentation = personResult?.presentations.find((person) => person.id === selectedPerson) ?? null
  const unresolvedPersonId = runtimeData.status === 'ready' && selectedPerson !== null && personResult?.error === null && selectedPersonPresentation === null ? selectedPerson : null
  const aggregateChooser = personAggregates.find((aggregate) => aggregate.placeId === aggregatePlaceId && aggregate.aggregate) ?? null
  const alivePeopleCount = personResult?.presentations.filter((person) => person.alive).length ?? 0
  const mappedPeopleCount = personResult?.presentations.filter((person) => person.mapped).length ?? 0
  const hasEmptyPeopleState = personResult?.error === null && peopleLayerActive && mappedPeopleCount === 0
  const journeyResult = useMemo(() => {
    if (runtimeData.status !== 'ready') return null
    try { return { presentations: buildJourneyPresentations(runtimeData.data, mapUrlState.year), error: null } }
    catch (error) { console.error('Historical journey presentation failed safely.', error); return { presentations: [], error: 'Historical journeys could not be prepared for this selected year.' } }
  }, [mapUrlState.year, runtimeData])
  const journeysLayerActive = mapUrlState.activeLayers.includes('journeys')
  const journeyFeatures = useMemo(() =>
    journeyResult === null || journeyResult.error !== null || runtimeData.status !== 'ready'
      ? undefined
      : buildJourneyFeatureCollection(journeyResult.presentations, runtimeData.data.geometry.journeys, journeysLayerActive, selectedJourney),
  [journeyResult, journeysLayerActive, runtimeData, selectedJourney])
  const selectedJourneyPresentation = journeyResult?.presentations.find((journey) => journey.id === selectedJourney) ?? null
  const unresolvedJourneyId = runtimeData.status === 'ready' && selectedJourney !== null && journeyResult?.error === null && selectedJourneyPresentation === null ? selectedJourney : null
  const activeJourneyCount = journeyResult?.presentations.filter((journey) => journey.active).length ?? 0
  const activeMappedJourneyCount = journeyResult?.presentations.filter((journey) => journey.active && journey.geometryAvailable).length ?? 0
  const hasEmptyJourneysState = journeyResult?.error === null && journeysLayerActive && activeMappedJourneyCount === 0
  const overviewResult = useMemo(() => {
    if (runtimeData.status !== 'ready') return null
    try {
      return { presentation: buildYearOverview(runtimeData.data, mapUrlState.year, mapUrlState.activeLayers, mapUrlState.collectionId), error: null }
    } catch (error) {
      console.error('Selected-year overview failed safely.', error)
      return { presentation: null, error: 'The selected-year overview could not be prepared.' }
    }
  }, [mapUrlState.activeLayers, mapUrlState.collectionId, mapUrlState.year, runtimeData])
  const activeCollection = useMemo(() => {
    if (runtimeData.status !== 'ready' || mapUrlState.collectionId === null) return null
    return buildActiveCollectionPresentation(runtimeData.data, mapUrlState.collectionId, mapUrlState.year, mapUrlState)
  }, [mapUrlState, runtimeData])
  const emptyStateMessages = [
    hasEmptyPlacesState ? 'No mapped places are active.' : null,
    hasEmptyTerritoriesState ? 'No mapped territories are active.' : null,
    hasEmptyEventsState
      ? activeUnmappedEventCount > 0
        ? 'Active events exist, but none has a reviewed map location.'
        : 'No mapped events are active.'
      : null,
    hasEmptyPeopleState ? alivePeopleCount > 0 ? 'People are alive, but none has an active reviewed map relationship.' : 'No mapped people are active.' : null,
    hasEmptyJourneysState ? activeJourneyCount > 0 ? 'Journeys are active, but none has reviewed route geometry.' : 'No mapped journeys are active.' : null,
  ].filter((message): message is string => message !== null)
  const handleYearChange = useCallback(
    (year: HistoricalYear) => {
      updateMapUrlState({ year }, { history: TIMELINE_HISTORY_MODE })
    },
    [updateMapUrlState],
  )
  const handleSelectPlace = useCallback((placeId: string) => {
    updateMapUrlState(
      { selectedEntity: createPlaceSelection(placeId) },
      { history: PLACE_SELECTION_HISTORY_MODE },
    )
  }, [updateMapUrlState])
  const handleSelectPolity = useCallback((polityId: string) => {
    updateMapUrlState(
      { selectedEntity: createPolitySelection(polityId) },
      { history: POLITY_SELECTION_HISTORY_MODE },
    )
  }, [updateMapUrlState])
  const handleSelectEvent = useCallback((eventId: string) => {
    updateMapUrlState(
      { selectedEntity: createEventSelection(eventId) },
      { history: EVENT_SELECTION_HISTORY_MODE },
    )
  }, [updateMapUrlState])
  const handleSelectPerson = useCallback((personId: string) => {
    setAggregatePlaceId(null)
    updateMapUrlState({ selectedEntity: createPersonSelection(personId) }, { history: PERSON_SELECTION_HISTORY_MODE })
  }, [updateMapUrlState])
  const handleSelectJourney = useCallback((journeyId: string) => {
    updateMapUrlState({ selectedEntity: createJourneySelection(journeyId) }, { history: JOURNEY_SELECTION_HISTORY_MODE })
  }, [updateMapUrlState])
  const handleSelectOverviewItem = useCallback((item: YearOverviewItem) => {
    updateMapUrlState(
      { selectedEntity: createYearOverviewSelection(item.entityType, item.id) },
      { history: YEAR_OVERVIEW_SELECTION_HISTORY_MODE },
    )
  }, [updateMapUrlState])
  const handleSelectSearchResult = useCallback((result: SearchResult) => {
    setAggregatePlaceId(null)
    updateMapUrlState(
      createSearchNavigationUpdate(mapUrlState, result),
      { history: SEARCH_SELECTION_HISTORY_MODE },
    )
  }, [mapUrlState, updateMapUrlState])
  const handleClearOwnedSelection = useCallback(() => {
    setAggregatePlaceId(null)
    if (selectedPlace !== null || selectedPolity !== null || selectedEvent !== null || selectedPerson !== null || selectedJourney !== null) {
      updateMapUrlState(
        { selectedEntity: null },
        { history: POLITY_SELECTION_HISTORY_MODE },
      )
    }
  }, [selectedEvent, selectedJourney, selectedPerson, selectedPlace, selectedPolity, updateMapUrlState])
  const handleResetCollection = useCallback(() => {
    if (activeCollection?.state !== 'resolved') return
    updateMapUrlState(collectionRecommendedMapUpdate(activeCollection.collection), { history: COLLECTION_NAVIGATION_HISTORY_MODE })
  }, [activeCollection, updateMapUrlState])
  const handleLeaveCollection = useCallback(() => {
    updateMapUrlState(leaveCollectionUpdate(), { history: COLLECTION_NAVIGATION_HISTORY_MODE })
  }, [updateMapUrlState])

  return (
    <section className="map-page" aria-labelledby="map-heading">
      <h1 className="visually-hidden" id="map-heading">Physical map</h1>
      <MapView
        urlState={mapUrlState}
        updateUrlState={updateMapUrlState}
        placeFeatures={placeFeatures}
        territoryFeatures={territoryFeatures}
        eventFeatures={eventFeatures}
        personFeatures={personFeatures}
        journeyFeatures={journeyFeatures}
        onSelectPlace={handleSelectPlace}
        onSelectEvent={handleSelectEvent}
        onSelectPerson={handleSelectPerson}
        onSelectPersonAggregate={setAggregatePlaceId}
        onSelectPolity={handleSelectPolity}
        onSelectJourney={handleSelectJourney}
        onClearOwnedSelection={handleClearOwnedSelection}
      />
      <GlobalSearch
        index={searchIndexResult.index}
        error={searchIndexResult.error}
        selectedYear={mapUrlState.year}
        onSelect={handleSelectSearchResult}
      />
      <ActiveCollectionBadge presentation={activeCollection} selectedYear={mapUrlState.year} onReset={handleResetCollection} onLeave={handleLeaveCollection} />
      {runtimeData.status === 'loading' ? <HistoricalDataStatus status="loading" /> : null}
      {runtimeData.status === 'error' ? (
        <HistoricalDataStatus status="error" message={runtimeData.message} onRetry={runtimeData.retry} />
      ) : null}
      {emptyStateMessages.length === 0 ? null : <HistoricalDataStatus status="empty" message={`${emptyStateMessages.join(' ')} This does not imply that no historical entities existed.`} />}
      {placeResult === null || placeResult.error === null ? null : (
        <HistoricalDataStatus status="error" message={placeResult.error} onRetry={runtimeData.retry} />
      )}
      {polityResult === null || polityResult.error === null ? null : (
        <HistoricalDataStatus status="error" message={polityResult.error} onRetry={runtimeData.retry} />
      )}
      {eventResult === null || eventResult.error === null ? null : (
        <HistoricalDataStatus status="error" message={eventResult.error} onRetry={runtimeData.retry} />
      )}
      {personResult === null || personResult.error === null ? null : <HistoricalDataStatus status="error" message={personResult.error} onRetry={runtimeData.retry} />}
      {journeyResult === null || journeyResult.error === null ? null : <HistoricalDataStatus status="error" message={journeyResult.error} onRetry={runtimeData.retry} />}
      {overviewResult === null || overviewResult.error === null ? null : <HistoricalDataStatus status="error" message={overviewResult.error} onRetry={runtimeData.retry} />}
      <YearOverviewPanel
        overview={runtimeData.status === 'ready' && aggregateChooser === null && getYearOverviewSelectionState(runtimeData.data, mapUrlState.selectedEntity) === 'overview' ? overviewResult?.presentation ?? null : null}
        onSelect={handleSelectOverviewItem}
      />
      <PlaceDetailsCard
        place={aggregateChooser === null ? selectedPlacePresentation : null}
        unresolvedPlaceId={aggregateChooser === null ? unresolvedPlaceId : null}
        selectedYear={mapUrlState.year}
        onClose={handleClearOwnedSelection}
        onGoToYear={handleYearChange}
      />
      <PolityDetailsCard
        polity={aggregateChooser === null ? selectedPolityPresentation : null}
        unresolvedPolityId={aggregateChooser === null ? unresolvedPolityId : null}
        selectedYear={mapUrlState.year}
        onClose={handleClearOwnedSelection}
        onGoToYear={handleYearChange}
      />
      <EventDetailsCard
        event={aggregateChooser === null ? selectedEventPresentation : null}
        unresolvedEventId={aggregateChooser === null ? unresolvedEventId : null}
        selectedYear={mapUrlState.year}
        onClose={handleClearOwnedSelection}
        onGoToYear={handleYearChange}
      />
      <PersonDetailsCard person={aggregateChooser === null ? selectedPersonPresentation : null} unresolvedPersonId={aggregateChooser === null ? unresolvedPersonId : null} selectedYear={mapUrlState.year} onClose={handleClearOwnedSelection} onGoToYear={handleYearChange} />
      <JourneyDetailsCard journey={aggregateChooser === null ? selectedJourneyPresentation : null} unresolvedJourneyId={aggregateChooser === null ? unresolvedJourneyId : null} selectedYear={mapUrlState.year} onClose={handleClearOwnedSelection} onGoToYear={handleYearChange} />
      {aggregateChooser === null ? null : <PersonAggregateChooser aggregate={aggregateChooser} onChoose={handleSelectPerson} onClose={() => setAggregatePlaceId(null)} />}
      <Timeline selectedYear={mapUrlState.year} onYearChange={handleYearChange} />
    </section>
  )
}
