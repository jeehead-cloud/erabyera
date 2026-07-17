import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { RuntimeDataset } from '../../data'
import type { Confidence, TerritoryControl } from '../entities'
import type { PolityPresentation } from './politySelectors'

export interface TerritoryFeatureProperties {
  entityType: 'polity'
  polityId: string
  territoryPeriodId: string
  displayName: string
  color: string
  controlCategory: TerritoryControl
  confidence: Confidence | null
  selected: boolean
}

export type TerritoryFeatureCollection = FeatureCollection<Polygon | MultiPolygon, TerritoryFeatureProperties>

export function buildTerritoryFeatureCollection(
  presentations: readonly PolityPresentation[],
  geometry: RuntimeDataset['geometry']['territories'],
  territoriesLayerActive: boolean,
  selectedPolityId: string | null,
): TerritoryFeatureCollection {
  const geometryById = new Map(geometry.features.map((feature) => [feature.id, feature.geometry]))
  const features: Feature<Polygon | MultiPolygon, TerritoryFeatureProperties>[] = []
  for (const polity of presentations) {
    const selected = polity.id === selectedPolityId
    if (!territoriesLayerActive && !selected) continue
    for (const territory of polity.territories) {
      const resolvedGeometry = geometryById.get(territory.geometryFeatureId)
      if (resolvedGeometry === undefined) continue
      features.push({
        type: 'Feature',
        id: territory.geometryFeatureId,
        geometry: resolvedGeometry as Polygon | MultiPolygon,
        properties: {
          entityType: 'polity',
          polityId: polity.id,
          territoryPeriodId: territory.id,
          displayName: polity.displayName,
          color: polity.color,
          controlCategory: territory.controlCategory,
          confidence: territory.uncertainty?.confidence ?? null,
          selected,
        },
      })
    }
  }
  features.sort((first, second) => String(first.id).localeCompare(String(second.id)))
  return { type: 'FeatureCollection', features }
}
