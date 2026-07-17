import { z } from 'zod'
import { temporalRangeSchema } from '../time'
import {
  editorialStatusSchema,
  entityCoreSchema,
  entityIdSchema,
  nonEmptyTextSchema,
} from './common'
import {
  enforcePublishedSources,
  sourceReferenceSchema,
} from './source'
import {
  territoryControlSchema,
  uncertaintySchema,
} from './uncertainty'

export const polityTypeSchema = z.enum([
  'kingdom',
  'empire',
  'republic',
  'city-state',
  'tribal-confederation',
  'satrapy',
  'league',
  'other',
])
export type PolityType = z.infer<typeof polityTypeSchema>

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a six-digit hexadecimal value.')

const assetPathSchema = z
  .string()
  .regex(/^(?!.*\.\.)(?!\/)[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/)

export const polityCapitalPeriodSchema = z
  .object({
    placeId: entityIdSchema,
    period: temporalRangeSchema,
    status: nonEmptyTextSchema.optional(),
    uncertainty: uncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
export type PolityCapitalPeriod = z.infer<typeof polityCapitalPeriodSchema>

export const polityRulerPeriodSchema = z
  .object({
    personId: entityIdSchema,
    period: temporalRangeSchema,
    title: nonEmptyTextSchema.optional(),
    uncertainty: uncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
export type PolityRulerPeriod = z.infer<typeof polityRulerPeriodSchema>

export const politySchema = entityCoreSchema
  .extend({
    polityType: polityTypeSchema,
    existence: temporalRangeSchema,
    color: hexColorSchema,
    symbolAssetPath: assetPathSchema.optional(),
    capitals: z.array(polityCapitalPeriodSchema),
    rulers: z.array(polityRulerPeriodSchema),
    uncertainty: uncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
  .superRefine(enforcePublishedSources)
export type Polity = z.infer<typeof politySchema>

export const territoryPeriodSchema = z
  .object({
    id: entityIdSchema,
    polityId: entityIdSchema,
    period: temporalRangeSchema,
    controlCategory: territoryControlSchema,
    geometryFeatureId: entityIdSchema,
    uncertainty: uncertaintySchema.optional(),
    editorialStatus: editorialStatusSchema,
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
  .superRefine(enforcePublishedSources)
export type TerritoryPeriod = z.infer<typeof territoryPeriodSchema>
