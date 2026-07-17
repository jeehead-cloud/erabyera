import { Layer, Source } from 'react-map-gl/maplibre'
import type { EventFeatureCollection } from '../../domain/events'
import {
  EVENT_BATTLE_LAYER,
  EVENT_ORDINARY_LAYER,
  EVENT_SELECTED_LAYER,
  EVENT_SOURCE_ID,
  EVENT_UNCERTAIN_LAYER,
} from './eventLayerStyle'

interface EventLayerProps {
  data: EventFeatureCollection
}

export function EventLayer({ data }: EventLayerProps) {
  return (
    <Source id={EVENT_SOURCE_ID} type="geojson" data={data}>
      <Layer {...EVENT_ORDINARY_LAYER} />
      <Layer {...EVENT_UNCERTAIN_LAYER} />
      <Layer {...EVENT_BATTLE_LAYER} />
      <Layer {...EVENT_SELECTED_LAYER} />
    </Source>
  )
}
