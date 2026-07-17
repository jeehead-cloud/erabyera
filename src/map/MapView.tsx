import { useCallback, useEffect, useState } from 'react'
import Map, {
  NavigationControl,
  type ErrorEvent,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre'
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

type MapLoadState = 'loading' | 'ready' | 'failed'

interface MapViewProps {
  urlState: MapUrlState
  updateUrlState: UpdateMapUrlState
}

interface LocalViewport {
  latitude: number
  longitude: number
  zoom: number
  bearing: number
  pitch: number
}

export function MapView({ urlState, updateUrlState }: MapViewProps) {
  const [loadState, setLoadState] = useState<MapLoadState>('loading')
  const [mapAttempt, setMapAttempt] = useState(0)
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
        renderWorldCopies={false}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" showCompass visualizePitch={false} />
      </Map>
      {loadState === 'loading' ? <MapLoadingState /> : null}
    </div>
  )
}
