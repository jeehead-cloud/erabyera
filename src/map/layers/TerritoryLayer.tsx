import { Layer, Source } from 'react-map-gl/maplibre'
import type { TerritoryFeatureCollection } from '../../domain/polities'
import {
  TERRITORY_FILL_LAYER,
  TERRITORY_SELECTED_BOUNDARY_LAYER,
  TERRITORY_SELECTED_FILL_LAYER,
  TERRITORY_SOLID_BOUNDARY_LAYER,
  TERRITORY_SOURCE_ID,
  TERRITORY_UNCERTAIN_BOUNDARY_LAYER,
} from './territoryLayerStyle'

interface TerritoryLayerProps {
  data: TerritoryFeatureCollection
}

export function TerritoryLayer({ data }: TerritoryLayerProps) {
  return (
    <Source id={TERRITORY_SOURCE_ID} type="geojson" data={data}>
      <Layer {...TERRITORY_FILL_LAYER} />
      <Layer {...TERRITORY_SOLID_BOUNDARY_LAYER} />
      <Layer {...TERRITORY_UNCERTAIN_BOUNDARY_LAYER} />
      <Layer {...TERRITORY_SELECTED_FILL_LAYER} />
      <Layer {...TERRITORY_SELECTED_BOUNDARY_LAYER} />
    </Source>
  )
}
