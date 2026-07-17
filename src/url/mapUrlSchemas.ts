import { entityIdSchema } from '../domain/entities'

export const MAP_LAYER_IDS = [
  'territories',
  'places',
  'people',
  'events',
  'journeys',
] as const

export type MapLayerId = (typeof MAP_LAYER_IDS)[number]

export const SELECTED_ENTITY_TYPES = [
  'place',
  'polity',
  'person',
  'event',
  'journey',
] as const

export type SelectedEntityType = (typeof SELECTED_ENTITY_TYPES)[number]

export interface SelectedEntityReference {
  type: SelectedEntityType
  id: string
}

const mapLayerIds = new Set<string>(MAP_LAYER_IDS)
const selectedEntityTypes = new Set<string>(SELECTED_ENTITY_TYPES)

export function isMapLayerId(value: string): value is MapLayerId {
  return mapLayerIds.has(value)
}

export function isSelectedEntityType(
  value: string,
): value is SelectedEntityType {
  return selectedEntityTypes.has(value)
}

export function isValidEntityId(value: unknown): value is string {
  return entityIdSchema.safeParse(value).success
}
