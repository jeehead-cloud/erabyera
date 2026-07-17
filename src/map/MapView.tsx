import { useCallback, useState } from 'react'
import Map, { NavigationControl, type ErrorEvent } from 'react-map-gl/maplibre'
import {
  INITIAL_MAP_VIEW,
  MAPLIBRE_ATTRIBUTION,
  MAP_ZOOM_LIMITS,
  PHYSICAL_BASEMAP_STYLE,
} from './basemap'
import { MapErrorState } from './MapErrorState'
import { MapLoadingState } from './MapLoadingState'

type MapLoadState = 'loading' | 'ready' | 'failed'

export function MapView() {
  const [loadState, setLoadState] = useState<MapLoadState>('loading')
  const [mapAttempt, setMapAttempt] = useState(0)

  const handleRetry = useCallback(() => {
    setLoadState('loading')
    setMapAttempt((attempt) => attempt + 1)
  }, [])

  const handleError = useCallback((event: ErrorEvent) => {
    console.error('The physical basemap failed to load.', event.error)
    setLoadState('failed')
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
        initialViewState={INITIAL_MAP_VIEW}
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
        renderWorldCopies={false}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" showCompass visualizePitch={false} />
      </Map>
      {loadState === 'loading' ? <MapLoadingState /> : null}
    </div>
  )
}
