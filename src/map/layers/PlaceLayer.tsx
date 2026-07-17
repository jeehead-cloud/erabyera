import { Layer, Source } from 'react-map-gl/maplibre'
import type { PlaceFeatureCollection } from '../../domain/places'
import {
  PLACE_SOURCE_ID,
  PLACE_SELECTED_LAYER,
  createPlaceImportanceLayer,
} from './placeLayerStyle'

const IMPORTANCE_LEVELS = [1, 2, 3, 4, 5] as const

interface PlaceLayerProps {
  data: PlaceFeatureCollection
}

export function PlaceLayer({ data }: PlaceLayerProps) {
  return (
    <Source id={PLACE_SOURCE_ID} type="geojson" data={data}>
      {IMPORTANCE_LEVELS.map((importance) => {
        const layer = createPlaceImportanceLayer(importance)
        return <Layer key={layer.id} {...layer} />
      })}
      <Layer {...PLACE_SELECTED_LAYER} />
    </Source>
  )
}
