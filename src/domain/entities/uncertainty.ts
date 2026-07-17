import { z } from 'zod'
import { nonEmptyTextSchema } from './common'

export const confidenceSchema = z.enum([
  'high',
  'medium',
  'low',
  'disputed',
  'unknown',
])
export type Confidence = z.infer<typeof confidenceSchema>

export const locationAccuracySchema = z.enum([
  'exact',
  'approximate',
  'settlement-area',
  'regional',
  'disputed',
  'unknown',
])
export type LocationAccuracy = z.infer<typeof locationAccuracySchema>

export const territoryControlSchema = z.enum([
  'core',
  'direct',
  'claimed',
  'tributary',
  'dependent',
  'sphere-of-influence',
  'disputed',
  'approximate',
])
export type TerritoryControl = z.infer<typeof territoryControlSchema>

export const uncertaintySchema = z
  .object({
    confidence: confidenceSchema,
    note: nonEmptyTextSchema.optional(),
  })
  .strict()
export type Uncertainty = z.infer<typeof uncertaintySchema>

export const locationUncertaintySchema = uncertaintySchema
  .extend({ locationAccuracy: locationAccuracySchema })
  .strict()
export type LocationUncertainty = z.infer<typeof locationUncertaintySchema>
