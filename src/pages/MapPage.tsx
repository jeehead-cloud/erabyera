import { useCallback, useMemo } from 'react'
import { HistoricalDataStatus, PlaceDetailsCard } from '../components/PlaceDetails'
import { Timeline, TIMELINE_HISTORY_MODE } from '../components/Timeline'
import { PolityDetailsCard } from '../components/PolityDetails'
import { EventDetailsCard } from '../components/EventDetails'
import { useRuntimeData } from '../data'
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

export function MapPage() {
  const [mapUrlState, updateMapUrlState] = useMapUrlState()
  const runtimeData = useRuntimeData()
  const selectedPlace = selectedPlaceId(mapUrlState.selectedEntity)
  const selectedPolity = selectedPolityId(mapUrlState.selectedEntity)
  const selectedEvent = selectedEventId(mapUrlState.selectedEntity)
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
  const emptyStateMessages = [
    hasEmptyPlacesState ? 'No mapped places are active.' : null,
    hasEmptyTerritoriesState ? 'No mapped territories are active.' : null,
    hasEmptyEventsState
      ? activeUnmappedEventCount > 0
        ? 'Active events exist, but none has a reviewed map location.'
        : 'No mapped events are active.'
      : null,
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
  const handleClearOwnedSelection = useCallback(() => {
    if (selectedPlace !== null || selectedPolity !== null || selectedEvent !== null) {
      updateMapUrlState(
        { selectedEntity: null },
        { history: POLITY_SELECTION_HISTORY_MODE },
      )
    }
  }, [selectedEvent, selectedPlace, selectedPolity, updateMapUrlState])

  return (
    <section className="map-page" aria-labelledby="map-heading">
      <h1 className="visually-hidden" id="map-heading">Physical map</h1>
      <MapView
        urlState={mapUrlState}
        updateUrlState={updateMapUrlState}
        placeFeatures={placeFeatures}
        territoryFeatures={territoryFeatures}
        eventFeatures={eventFeatures}
        onSelectPlace={handleSelectPlace}
        onSelectEvent={handleSelectEvent}
        onSelectPolity={handleSelectPolity}
        onClearOwnedSelection={handleClearOwnedSelection}
      />
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
      <PlaceDetailsCard
        place={selectedPlacePresentation}
        unresolvedPlaceId={unresolvedPlaceId}
        selectedYear={mapUrlState.year}
        onClose={handleClearOwnedSelection}
        onGoToYear={handleYearChange}
      />
      <PolityDetailsCard
        polity={selectedPolityPresentation}
        unresolvedPolityId={unresolvedPolityId}
        selectedYear={mapUrlState.year}
        onClose={handleClearOwnedSelection}
        onGoToYear={handleYearChange}
      />
      <EventDetailsCard
        event={selectedEventPresentation}
        unresolvedEventId={unresolvedEventId}
        selectedYear={mapUrlState.year}
        onClose={handleClearOwnedSelection}
        onGoToYear={handleYearChange}
      />
      <Timeline selectedYear={mapUrlState.year} onYearChange={handleYearChange} />
    </section>
  )
}
