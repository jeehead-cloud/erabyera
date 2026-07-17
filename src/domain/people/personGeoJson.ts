import type { Feature, FeatureCollection, Point } from 'geojson'
import type { PersonLocationAggregate } from './personAggregation'
export interface PersonFeatureProperties { entityType: 'person-location'; placeId: string; personId: string | null; personIds: readonly string[]; visibleCount: number; highestImportance: number; aggregate: boolean; selected: boolean; active: true; locationAccuracy: string | null }
export type PersonFeatureCollection = FeatureCollection<Point, PersonFeatureProperties>
export function buildPersonFeatureCollection(aggregates: readonly PersonLocationAggregate[]): PersonFeatureCollection {
  const features: Feature<Point, PersonFeatureProperties>[] = aggregates.map((aggregate) => ({ type: 'Feature', id: `person-location-${aggregate.placeId}`,
    geometry: { type: 'Point', coordinates: aggregate.coordinates as [number, number] }, properties: { entityType: 'person-location', placeId: aggregate.placeId,
      personId: aggregate.aggregate ? null : aggregate.members[0]?.id ?? null, personIds: aggregate.members.map((member) => member.id), visibleCount: aggregate.visibleCount,
      highestImportance: aggregate.highestImportance, aggregate: aggregate.aggregate, selected: aggregate.selectedPersonId !== null, active: true, locationAccuracy: aggregate.locationAccuracy } }))
  return { type: 'FeatureCollection', features }
}
