import { useCallback, useMemo } from 'react'
import { HistoricalDataStatus, PlaceDetailsCard } from '../components/PlaceDetails'
import { Timeline, TIMELINE_HISTORY_MODE } from '../components/Timeline'
import { useRuntimeData } from '../data'
import {
  PLACE_SELECTION_HISTORY_MODE,
  buildPlaceFeatureCollection,
  buildPlacePresentations,
  createPlaceSelection,
  selectedPlaceId,
} from '../domain/places'
import type { HistoricalYear } from '../domain/time'
import { MapView } from '../map'
import { useMapUrlState } from '../url'

export function MapPage() {
  const [mapUrlState, updateMapUrlState] = useMapUrlState()
  const runtimeData = useRuntimeData()
  const selectedId = selectedPlaceId(mapUrlState.selectedEntity)
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
          selectedId,
        ),
  [placeResult, placesLayerActive, selectedId])
  const selectedPlace = placeResult?.presentations.find((place) => place.id === selectedId) ?? null
  const unresolvedPlaceId = runtimeData.status === 'ready' && selectedId !== null &&
    placeResult?.error === null && selectedPlace === null
    ? selectedId
    : null
  const activePlaceCount = placeResult?.presentations.filter((place) => place.active).length ?? 0
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
  const handleClearPlace = useCallback(() => {
    if (selectedId !== null) {
      updateMapUrlState(
        { selectedEntity: null },
        { history: PLACE_SELECTION_HISTORY_MODE },
      )
    }
  }, [selectedId, updateMapUrlState])

  return (
    <section className="map-page" aria-labelledby="map-heading">
      <h1 className="visually-hidden" id="map-heading">Physical map</h1>
      <MapView
        urlState={mapUrlState}
        updateUrlState={updateMapUrlState}
        placeFeatures={placeFeatures}
        onSelectPlace={handleSelectPlace}
        onClearPlaceSelection={handleClearPlace}
      />
      {runtimeData.status === 'loading' ? <HistoricalDataStatus status="loading" /> : null}
      {runtimeData.status === 'error' ? (
        <HistoricalDataStatus status="error" message={runtimeData.message} onRetry={runtimeData.retry} />
      ) : null}
      {placeResult?.error === null && placesLayerActive && activePlaceCount === 0 ? (
        <HistoricalDataStatus status="empty" />
      ) : null}
      {placeResult === null || placeResult.error === null ? null : (
        <HistoricalDataStatus status="error" message={placeResult.error} onRetry={runtimeData.retry} />
      )}
      <PlaceDetailsCard
        place={selectedPlace}
        unresolvedPlaceId={unresolvedPlaceId}
        selectedYear={mapUrlState.year}
        onClose={handleClearPlace}
        onGoToYear={handleYearChange}
      />
      <Timeline selectedYear={mapUrlState.year} onYearChange={handleYearChange} />
    </section>
  )
}
