import { z } from 'zod'
import {
  battleSchema,
  contentCollectionSchema,
  datasetVersionSchema,
  eventSchema,
  journeySchema,
  personSchema,
  placeSchema,
  politySchema,
  sourceSchema,
  territoryPeriodSchema,
} from '../domain/entities'
import {
  journeyFeatureCollectionSchema,
  territoryFeatureCollectionSchema,
} from '../domain/geometry'

export const runtimeDatasetSchema = z.object({
  schemaVersion: z.literal(1),
  datasetVersion: datasetVersionSchema,
  datasetName: z.string().min(1),
  editorialPolicy: z.literal('published-only'),
  sources: z.array(sourceSchema),
  places: z.array(placeSchema),
  polities: z.array(politySchema),
  territories: z.array(territoryPeriodSchema),
  people: z.array(personSchema),
  events: z.array(z.union([eventSchema, battleSchema])),
  journeys: z.array(journeySchema),
  collections: z.array(contentCollectionSchema),
  geometry: z.object({
    territories: territoryFeatureCollectionSchema,
    journeys: journeyFeatureCollectionSchema,
  }).strict(),
}).strict()

export type RuntimeDataset = z.infer<typeof runtimeDatasetSchema>

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

export function loadRuntimeDataset(input: unknown, expectedDatasetVersion?: string): Readonly<RuntimeDataset> {
  const parsed = runtimeDatasetSchema.parse(input)
  if (expectedDatasetVersion && parsed.datasetVersion !== expectedDatasetVersion) {
    throw new Error(`Runtime dataset version mismatch: expected ${expectedDatasetVersion}, received ${parsed.datasetVersion}.`)
  }
  return deepFreeze(parsed)
}
