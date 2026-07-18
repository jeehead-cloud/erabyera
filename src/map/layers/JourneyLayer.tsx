import { Layer, Source } from 'react-map-gl/maplibre'
import type { JourneyMapFeatureCollection } from '../../domain/journeys'
import {
  JOURNEY_CERTAIN_LAYER,
  JOURNEY_SELECTED_INACTIVE_LAYER,
  JOURNEY_SELECTED_LAYER,
  JOURNEY_SOURCE_ID,
  JOURNEY_UNCERTAIN_LAYER,
} from './journeyLayerStyle'

export function JourneyLayer({ data }: { data: JourneyMapFeatureCollection }) {
  return (
    <Source id={JOURNEY_SOURCE_ID} type="geojson" data={data}>
      <Layer {...JOURNEY_CERTAIN_LAYER} />
      <Layer {...JOURNEY_UNCERTAIN_LAYER} />
      <Layer {...JOURNEY_SELECTED_LAYER} />
      <Layer {...JOURNEY_SELECTED_INACTIVE_LAYER} />
    </Source>
  )
}
