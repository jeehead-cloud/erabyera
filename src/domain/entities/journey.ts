import { z } from 'zod'
import { historicalYearSchema, temporalRangeSchema } from '../time'
import {
  entityCoreSchema,
  entityIdSchema,
  longitudeLatitudeSchema,
} from './common'
import {
  enforcePublishedSources,
  sourceReferenceSchema,
} from './source'
import { uncertaintySchema } from './uncertainty'

export const journeyTypeSchema = z.enum([
  'journey',
  'campaign',
  'expedition',
  'migration',
  'other',
])
export type JourneyType = z.infer<typeof journeyTypeSchema>

export const routeCertaintySchema = z.enum([
  'documented',
  'probable',
  'schematic',
  'uncertain',
])
export type RouteCertainty = z.infer<typeof routeCertaintySchema>

export const routeStageSchema = z
  .object({
    order: z.number().int().positive(),
    placeId: entityIdSchema.optional(),
    eventId: entityIdSchema.optional(),
    coordinates: longitudeLatitudeSchema.optional(),
    period: temporalRangeSchema.optional(),
    year: historicalYearSchema.optional(),
    uncertainty: uncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
  .superRefine((stage, context) => {
    if (!stage.placeId && !stage.eventId && !stage.coordinates) {
      context.addIssue({
        code: 'custom',
        path: ['placeId'],
        message: 'Route stage requires a place, event, or coordinates.',
      })
    }

    if (stage.period && stage.year) {
      context.addIssue({
        code: 'custom',
        path: ['year'],
        message: 'Route stage must use either a period or a year, not both.',
      })
    }
  })
export type RouteStage = z.infer<typeof routeStageSchema>

export const journeySchema = entityCoreSchema
  .extend({
    journeyType: journeyTypeSchema,
    period: temporalRangeSchema,
    participantPersonIds: z.array(entityIdSchema),
    participantPolityIds: z.array(entityIdSchema),
    stages: z.array(routeStageSchema).min(1),
    geometryFeatureId: entityIdSchema.optional(),
    directionKnown: z.boolean(),
    routeCertainty: routeCertaintySchema,
    uncertainty: uncertaintySchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
  .superRefine((journey, context) => {
    enforcePublishedSources(journey, context)
    const orders = journey.stages.map((stage) => stage.order)
    const uniqueOrders = new Set(orders)

    if (uniqueOrders.size !== orders.length) {
      context.addIssue({
        code: 'custom',
        path: ['stages'],
        message: 'Journey stage order values must be unique.',
      })
    }

    const isSequential = orders.every((order, index) => order === index + 1)
    if (!isSequential) {
      context.addIssue({
        code: 'custom',
        path: ['stages'],
        message: 'Journey stage order must form a sequence starting at 1.',
      })
    }
  })
export type Journey = z.infer<typeof journeySchema>
