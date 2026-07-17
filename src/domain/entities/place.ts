import { z } from 'zod'
import { temporalRangeSchema } from '../time'
import {
  entityCoreSchema,
  entityIdSchema,
  importanceSchema,
  longitudeLatitudeSchema,
  nonEmptyTextSchema,
} from './common'
import {
  enforcePublishedSources,
  sourceReferenceSchema,
} from './source'
import {
  locationUncertaintySchema,
  territoryControlSchema,
  uncertaintySchema,
} from './uncertainty'

export const placeTypeSchema = z.enum([
  'city',
  'settlement',
  'capital',
  'port',
  'fortress',
  'battlefield',
  'region',
  'archaeological-site',
  'other',
])
export type PlaceType = z.infer<typeof placeTypeSchema>

export const placeNamePeriodSchema = z
  .object({
    name: nonEmptyTextSchema,
    period: temporalRangeSchema,
    language: nonEmptyTextSchema.optional(),
    transliteration: nonEmptyTextSchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
export type PlaceNamePeriod = z.infer<typeof placeNamePeriodSchema>

export const placeOwnershipPeriodSchema = z
  .object({
    polityId: entityIdSchema,
    period: temporalRangeSchema,
    controlType: territoryControlSchema.optional(),
    uncertainty: uncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
export type PlaceOwnershipPeriod = z.infer<typeof placeOwnershipPeriodSchema>

export const placeImportancePeriodSchema = z
  .object({
    period: temporalRangeSchema,
    importance: importanceSchema,
    reason: nonEmptyTextSchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
export type PlaceImportancePeriod = z.infer<typeof placeImportancePeriodSchema>

export const placeSchema = entityCoreSchema
  .extend({
    placeType: placeTypeSchema,
    coordinates: longitudeLatitudeSchema.optional(),
    existence: temporalRangeSchema,
    names: z.array(placeNamePeriodSchema),
    ownership: z.array(placeOwnershipPeriodSchema),
    importance: z.array(placeImportancePeriodSchema),
    uncertainty: locationUncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
  .superRefine(enforcePublishedSources)
export type Place = z.infer<typeof placeSchema>
