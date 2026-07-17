import { z } from 'zod'
import { temporalRangeSchema } from '../time'
import {
  entityCoreSchema,
  entityIdSchema,
  longitudeLatitudeSchema,
  nonEmptyTextSchema,
} from './common'
import {
  enforcePublishedSources,
  sourceReferenceSchema,
} from './source'
import {
  locationAccuracySchema,
  uncertaintySchema,
} from './uncertainty'

export const eventTypeSchema = z.enum([
  'battle',
  'political',
  'cultural',
  'disaster',
  'epidemic',
  'other',
])
export type EventType = z.infer<typeof eventTypeSchema>

const nonBattleEventTypeSchema = z.enum([
  'political',
  'cultural',
  'disaster',
  'epidemic',
  'other',
])

const eventFields = {
  period: temporalRangeSchema,
  coordinates: longitudeLatitudeSchema.optional(),
  locationAccuracy: locationAccuracySchema.optional(),
  participantPolityIds: z.array(entityIdSchema),
  participantPersonIds: z.array(entityIdSchema),
  relatedPlaceIds: z.array(entityIdSchema),
  uncertainty: uncertaintySchema.optional(),
  sourceRefs: z.array(sourceReferenceSchema),
}

export const eventSchema = entityCoreSchema
  .extend({ type: nonBattleEventTypeSchema, ...eventFields })
  .strict()
  .superRefine(enforcePublishedSources)
export type Event = z.infer<typeof eventSchema>

export const battleSideSchema = z
  .object({
    id: entityIdSchema,
    label: nonEmptyTextSchema,
    polityIds: z.array(entityIdSchema),
    personIds: z.array(entityIdSchema),
    commanderIds: z.array(entityIdSchema),
    outcome: nonEmptyTextSchema.optional(),
  })
  .strict()
  .superRefine((side, context) => {
    if (side.polityIds.length === 0 && side.personIds.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['polityIds'],
        message: 'Battle sides require at least one polity or person.',
      })
    }
  })
export type BattleSide = z.infer<typeof battleSideSchema>

const uncertainQuantitySchema = z
  .object({
    description: nonEmptyTextSchema,
    uncertainty: uncertaintySchema,
  })
  .strict()

export const battleDetailsSchema = z
  .object({
    sides: z.array(battleSideSchema).min(2),
    result: nonEmptyTextSchema,
    relatedJourneyId: entityIdSchema.optional(),
    forces: uncertainQuantitySchema.optional(),
    losses: uncertainQuantitySchema.optional(),
    disputedNotes: z.array(nonEmptyTextSchema),
  })
  .strict()
export type BattleDetails = z.infer<typeof battleDetailsSchema>

export const battleSchema = entityCoreSchema
  .extend({
    type: z.literal('battle'),
    ...eventFields,
    battle: battleDetailsSchema,
  })
  .strict()
  .superRefine(enforcePublishedSources)
export type Battle = z.infer<typeof battleSchema>

export const historicalEventSchema = z.union([eventSchema, battleSchema])
export type HistoricalEvent = z.infer<typeof historicalEventSchema>
