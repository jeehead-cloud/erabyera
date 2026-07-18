import { z } from 'zod'
import {
  datasetVersionSchema,
  entityIdSchema,
  longitudeLatitudeSchema,
  nonEmptyTextSchema,
} from '../entities'
import { historicalYearSchema, temporalRangeSchema } from '../time'
import { MAP_LAYER_IDS, SELECTED_ENTITY_TYPES } from '../../url/mapUrlSchemas'

export const SEARCH_INDEX_VERSION = 1 as const

export const searchNameKindSchema = z.enum([
  'default',
  'historical',
  'alias',
  'transliteration',
])
export type SearchNameKind = z.infer<typeof searchNameKindSchema>

export const searchNameVariantSchema = z.object({
  value: nonEmptyTextSchema,
  normalizedValue: nonEmptyTextSchema,
  kind: searchNameKindSchema,
  period: temporalRangeSchema.optional(),
  relevantYear: historicalYearSchema.optional(),
}).strict()
export type SearchNameVariant = z.infer<typeof searchNameVariantSchema>

export const searchMapPeriodSchema = z.object({
  period: temporalRangeSchema,
  coordinates: longitudeLatitudeSchema.optional(),
}).strict()
export type SearchMapPeriod = z.infer<typeof searchMapPeriodSchema>

export const searchIndexEntrySchema = z.object({
  entityType: z.enum(SELECTED_ENTITY_TYPES),
  entityId: entityIdSchema,
  primaryName: nonEmptyTextSchema,
  names: z.array(searchNameVariantSchema).min(1),
  period: temporalRangeSchema,
  context: nonEmptyTextSchema,
  requiredLayer: z.enum(MAP_LAYER_IDS),
  subtype: nonEmptyTextSchema,
  mapped: z.boolean(),
  mapPeriods: z.array(searchMapPeriodSchema),
}).strict()
export type SearchIndexEntry = z.infer<typeof searchIndexEntrySchema>

export const searchIndexSchema = z.object({
  schemaVersion: z.literal(1),
  searchIndexVersion: z.literal(SEARCH_INDEX_VERSION),
  datasetVersion: datasetVersionSchema,
  entries: z.array(searchIndexEntrySchema),
}).strict()
export type SearchIndex = z.infer<typeof searchIndexSchema>

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

export function loadSearchIndex(
  input: unknown,
  expectedDatasetVersion: string,
): Readonly<SearchIndex> {
  const parsed = searchIndexSchema.parse(input)
  if (parsed.datasetVersion !== expectedDatasetVersion) {
    throw new Error(
      `Search index dataset version mismatch: expected ${expectedDatasetVersion}, received ${parsed.datasetVersion}.`,
    )
  }
  return deepFreeze(parsed)
}
