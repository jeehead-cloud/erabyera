import { useCallback, useEffect, useState } from 'react'
import Map, {
  NavigationControl,
  type ErrorEvent,
  type MapLayerMouseEvent,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre'
import type { PlaceFeatureCollection } from '../domain/places'
import type { TerritoryFeatureCollection } from '../domain/polities'
import type { EventFeatureCollection } from '../domain/events'
import type { PersonFeatureCollection } from '../domain/people'
import {
  MAP_MOVEMENT_HISTORY_MODE,
  areMapUrlViewportsEquivalent,
  type MapUrlState,
  type UpdateMapUrlState,
} from '../url'
import {
  INITIAL_MAP_VIEW,
  MAPLIBRE_ATTRIBUTION,
  MAP_ZOOM_LIMITS,
  PHYSICAL_BASEMAP_STYLE,
} from './basemap'
import { MapErrorState } from './MapErrorState'
import { MapLoadingState } from './MapLoadingState'
import {
  PlaceLayer,
  EventLayer,
  PersonLayer,
  TerritoryLayer,
  getHistoricalInteractiveLayerIds,
} from './layers'

type MapLoadState = 'loading' | 'ready' | 'failed'

interface MapViewProps {
  urlState: MapUrlState
  updateUrlState: UpdateMapUrlState
  placeFeatures?: PlaceFeatureCollection
  territoryFeatures?: TerritoryFeatureCollection
  eventFeatures?: EventFeatureCollection
  personFeatures?: PersonFeatureCollection
  onSelectPlace?: (placeId: string) => void
  onSelectEvent?: (eventId: string) => void
  onSelectPerson?: (personId: string) => void
  onSelectPersonAggregate?: (placeId: string) => void
  onSelectPolity?: (polityId: string) => void
  onClearOwnedSelection?: () => void
}

interface LocalViewport {
  latitude: number
  longitude: number
  zoom: number
  bearing: number
  pitch: number
}

export function MapView({
  urlState,
  updateUrlState,
  placeFeatures,
  territoryFeatures,
  eventFeatures,
  personFeatures,
  onSelectPlace,
  onSelectEvent,
  onSelectPerson,
  onSelectPersonAggregate,
  onSelectPolity,
  onClearOwnedSelection,
}: MapViewProps) {
  const [loadState, setLoadState] = useState<MapLoadState>('loading')
  const [mapAttempt, setMapAttempt] = useState(0)
  const [entityPointer, setEntityPointer] = useState(false)
  const [viewport, setViewport] = useState<LocalViewport>({
    latitude: urlState.latitude,
    longitude: urlState.longitude,
    zoom: urlState.zoom,
    bearing: INITIAL_MAP_VIEW.bearing,
    pitch: INITIAL_MAP_VIEW.pitch,
  })

  useEffect(() => {
    setViewport((current) =>
      areMapUrlViewportsEquivalent(current, urlState)
        ? current
        : {
            ...current,
            latitude: urlState.latitude,
            longitude: urlState.longitude,
            zoom: urlState.zoom,
          },
    )
  }, [urlState])

  const handleRetry = useCallback(() => {
    setLoadState('loading')
    setMapAttempt((attempt) => attempt + 1)
  }, [])

  const handleError = useCallback((event: ErrorEvent) => {
    console.error('The physical basemap failed to load.', event.error)
    setLoadState('failed')
  }, [])

  const handleMove = useCallback((event: ViewStateChangeEvent) => {
    const { latitude, longitude, zoom, bearing, pitch } = event.viewState
    setViewport({ latitude, longitude, zoom, bearing, pitch })
  }, [])

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      const { latitude, longitude, zoom, bearing, pitch } = event.viewState
      const nextViewport = { latitude, longitude, zoom, bearing, pitch }
      setViewport(nextViewport)

      if (!areMapUrlViewportsEquivalent(urlState, nextViewport)) {
        updateUrlState(
          { latitude, longitude, zoom },
          { history: MAP_MOVEMENT_HISTORY_MODE },
        )
      }
    },
    [updateUrlState, urlState],
  )

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    const placeId = event.features?.find((feature) => typeof feature.properties?.placeId === 'string')?.properties?.placeId
    if (typeof placeId === 'string') {
      onSelectPlace?.(placeId)
      return
    }
    const personFeature = event.features?.find((feature) => typeof feature.properties?.placeId === 'string' && feature.properties?.entityType === 'person-location')
    if (personFeature !== undefined) {
      const personId = personFeature.properties?.personId
      if (typeof personId === 'string') onSelectPerson?.(personId)
      else onSelectPersonAggregate?.(personFeature.properties?.placeId as string)
      return
    }
    const eventId = event.features?.find((feature) => typeof feature.properties?.eventId === 'string')?.properties?.eventId
    if (typeof eventId === 'string') {
      onSelectEvent?.(eventId)
      return
    }
    const polityId = event.features?.find((feature) => typeof feature.properties?.polityId === 'string')?.properties?.polityId
    if (typeof polityId === 'string') onSelectPolity?.(polityId)
    else onClearOwnedSelection?.()
  }, [onClearOwnedSelection, onSelectEvent, onSelectPerson, onSelectPersonAggregate, onSelectPlace, onSelectPolity])

  const handlePointerMove = useCallback((event: MapLayerMouseEvent) => {
    setEntityPointer(event.features !== undefined && event.features.length > 0)
  }, [])

  if (loadState === 'failed') {
    return (
      <div className="map-view map-view--failed">
        <MapErrorState onRetry={handleRetry} />
      </div>
    )
  }

  return (
    <div className="map-view">
      <Map
        key={mapAttempt}
        {...viewport}
        cursor={entityPointer ? 'pointer' : 'grab'}
        interactiveLayerIds={getHistoricalInteractiveLayerIds({
          places: placeFeatures !== undefined,
          events: eventFeatures !== undefined,
          people: personFeatures !== undefined,
          territories: territoryFeatures !== undefined,
        })}
        mapStyle={PHYSICAL_BASEMAP_STYLE}
        minZoom={MAP_ZOOM_LIMITS.minZoom}
        maxZoom={MAP_ZOOM_LIMITS.maxZoom}
        attributionControl={{
          compact: false,
          customAttribution: MAPLIBRE_ATTRIBUTION,
        }}
        maplibreLogo
        onLoad={() => setLoadState('ready')}
        onError={handleError}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        onClick={handleMapClick}
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setEntityPointer(false)}
        renderWorldCopies={false}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" showCompass visualizePitch={false} />
        {territoryFeatures === undefined ? null : <TerritoryLayer data={territoryFeatures} />}
        {eventFeatures === undefined ? null : <EventLayer data={eventFeatures} />}
        {personFeatures === undefined ? null : <PersonLayer data={personFeatures} />}
        {placeFeatures === undefined ? null : <PlaceLayer data={placeFeatures} />}
      </Map>
      {loadState === 'loading' ? <MapLoadingState /> : null}
    </div>
  )
}
