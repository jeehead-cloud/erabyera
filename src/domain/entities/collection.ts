import { z } from 'zod'
import {
  historicalYearSchema,
  isActiveAtYear,
  temporalRangeSchema,
} from '../time'
import {
  datasetVersionSchema,
  entityCoreSchema,
  entityIdSchema,
  nonEmptyTextSchema,
} from './common'
import {
  enforcePublishedSources,
  sourceReferenceSchema,
} from './source'

export const collectionViewportSchema = z
  .object({
    longitude: z.number().finite().min(-180).max(180),
    latitude: z.number().finite().min(-90).max(90),
    zoom: z.number().finite().min(0).max(22),
  })
  .strict()
export type CollectionViewport = z.infer<typeof collectionViewportSchema>

export const collectionLinksSchema = z
  .object({
    placeIds: z.array(entityIdSchema),
    polityIds: z.array(entityIdSchema),
    personIds: z.array(entityIdSchema),
    eventIds: z.array(entityIdSchema),
    journeyIds: z.array(entityIdSchema),
  })
  .strict()

export const coverageStatusSchema = z.enum(['planned', 'partial', 'reviewed'])

export const collectionCoverageSchema = z
  .object({
    detailedRegions: z.array(nonEmptyTextSchema),
    partialRegions: z.array(nonEmptyTextSchema),
    timeRange: temporalRangeSchema,
    note: nonEmptyTextSchema,
  })
  .strict()

export const contentCollectionSchema = entityCoreSchema
  .extend({
    description: nonEmptyTextSchema,
    timeRange: temporalRangeSchema,
    recommendedStartYear: historicalYearSchema,
    recommendedViewport: collectionViewportSchema,
    coverage: collectionCoverageSchema,
    linkedEntities: collectionLinksSchema,
    coverageStatus: coverageStatusSchema,
    datasetVersion: datasetVersionSchema,
    editorialNotes: nonEmptyTextSchema.optional(),
    sourceRefs: z.array(sourceReferenceSchema),
  })
  .strict()
  .superRefine((collection, context) => {
    enforcePublishedSources(collection, context)

    if (collection.timeRange.yearTo === null) {
      context.addIssue({
        code: 'custom',
        path: ['timeRange', 'yearTo'],
        message: 'Collection time range requires a known end year.',
      })
      return
    }

    if (!isActiveAtYear(collection.timeRange, collection.recommendedStartYear)) {
      context.addIssue({
        code: 'custom',
        path: ['recommendedStartYear'],
        message: 'Recommended start year must fall within the collection range.',
      })
    }
  })
export type ContentCollection = z.infer<typeof contentCollectionSchema>
