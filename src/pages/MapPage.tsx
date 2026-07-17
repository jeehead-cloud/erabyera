import { useCallback, useMemo } from 'react'
import { HistoricalDataStatus, PlaceDetailsCard } from '../components/PlaceDetails'
import { Timeline, TIMELINE_HISTORY_MODE } from '../components/Timeline'
import { PolityDetailsCard } from '../components/PolityDetails'
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

export function MapPage() {
  const [mapUrlState, updateMapUrlState] = useMapUrlState()
  const runtimeData = useRuntimeData()
  const selectedPlace = selectedPlaceId(mapUrlState.selectedEntity)
  const selectedPolity = selectedPolityId(mapUrlState.selectedEntity)
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
  const handleClearOwnedSelection = useCallback(() => {
    if (selectedPlace !== null || selectedPolity !== null) {
      updateMapUrlState(
        { selectedEntity: null },
        { history: POLITY_SELECTION_HISTORY_MODE },
      )
    }
  }, [selectedPlace, selectedPolity, updateMapUrlState])

  return (
    <section className="map-page" aria-labelledby="map-heading">
      <h1 className="visually-hidden" id="map-heading">Physical map</h1>
      <MapView
        urlState={mapUrlState}
        updateUrlState={updateMapUrlState}
        placeFeatures={placeFeatures}
        territoryFeatures={territoryFeatures}
        onSelectPlace={handleSelectPlace}
        onSelectPolity={handleSelectPolity}
        onClearOwnedSelection={handleClearOwnedSelection}
      />
      {runtimeData.status === 'loading' ? <HistoricalDataStatus status="loading" /> : null}
      {runtimeData.status === 'error' ? (
        <HistoricalDataStatus status="error" message={runtimeData.message} onRetry={runtimeData.retry} />
      ) : null}
      {hasEmptyPlacesState && hasEmptyTerritoriesState ? (
        <HistoricalDataStatus status="empty" message="No mapped places or territories are active in this selected year. This does not imply that no historical entities existed." />
      ) : hasEmptyPlacesState ? (
        <HistoricalDataStatus status="empty" />
      ) : hasEmptyTerritoriesState ? (
        <HistoricalDataStatus status="empty" message="No mapped territories are active in this selected year. This does not imply that no polities existed." />
      ) : null}
      {placeResult === null || placeResult.error === null ? null : (
        <HistoricalDataStatus status="error" message={placeResult.error} onRetry={runtimeData.retry} />
      )}
      {polityResult === null || polityResult.error === null ? null : (
        <HistoricalDataStatus status="error" message={polityResult.error} onRetry={runtimeData.retry} />
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
      <Timeline selectedYear={mapUrlState.year} onYearChange={handleYearChange} />
    </section>
  )
}
