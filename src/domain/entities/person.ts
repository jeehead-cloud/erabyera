import { z } from 'zod'
import { temporalRangeSchema } from '../time'
import {
  entityCoreSchema,
  entityIdSchema,
  importanceSchema,
  nonEmptyTextSchema,
} from './common'
import {
  enforcePublishedSources,
  sourceReferenceSchema,
} from './source'
import { uncertaintySchema } from './uncertainty'

export const personPlaceRelationSchema = z.enum([
  'residence',
  'rule',
  'campaign',
  'visit',
  'birth',
  'death',
  'activity',
  'unknown',
])
export type PersonPlaceRelation = z.infer<typeof personPlaceRelationSchema>

export const personPlacePeriodSchema = z
  .object({
    placeId: entityIdSchema,
    period: temporalRangeSchema,
    relationType: personPlaceRelationSchema,
    eventId: entityIdSchema.optional(),
    journeyId: entityIdSchema.optional(),
    uncertainty: uncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
export type PersonPlacePeriod = z.infer<typeof personPlacePeriodSchema>

export const personSchema = entityCoreSchema
  .extend({
    life: temporalRangeSchema,
    roles: z.array(nonEmptyTextSchema).min(1),
    places: z.array(personPlacePeriodSchema),
    associatedPolityIds: z.array(entityIdSchema),
    importance: importanceSchema,
    uncertainty: uncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
  .superRefine(enforcePublishedSources)
export type Person = z.infer<typeof personSchema>
