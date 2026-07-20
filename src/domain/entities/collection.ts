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
    latitude: z.number().finite().min(-85.051129).max(85.051129),
    zoom: z.number().finite().min(1.5).max(7),
  })
  .strict()
export type CollectionViewport = z.infer<typeof collectionViewportSchema>

export const collectionFocusBoundsSchema = z
  .object({
    west: z.number().finite().min(-180).max(180),
    south: z.number().finite().min(-85.051129).max(85.051129),
    east: z.number().finite().min(-180).max(180),
    north: z.number().finite().min(-85.051129).max(85.051129),
  })
  .strict()
  .refine((bounds) => bounds.west < bounds.east && bounds.south < bounds.north, {
    message: 'Collection focus bounds must have increasing longitude and latitude values.',
  })

export const collectionLayerSchema = z.enum([
  'territories',
  'places',
  'people',
  'events',
  'journeys',
])

const canonicalCollectionLayers = collectionLayerSchema.options

export const collectionRecommendedLayersSchema = z
  .array(collectionLayerSchema)
  .min(1)
  .superRefine((layers, context) => {
    if (new Set(layers).size !== layers.length) {
      context.addIssue({ code: 'custom', message: 'Recommended collection layers must be unique.' })
    }
    const canonical = canonicalCollectionLayers.filter((layer) => layers.includes(layer))
    if (canonical.some((layer, index) => layer !== layers[index])) {
      context.addIssue({ code: 'custom', message: 'Recommended collection layers must use canonical order.' })
    }
  })

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
export const collectionVisibilitySchema = z.enum(['public', 'internal'])
export const collectionCompletenessSchema = z.enum(['foundation-preview', 'partial', 'reviewed'])
export const collectionMembershipKindSchema = z.enum(['synthetic-demonstration', 'reviewed'])
export const collectionMissingContentSchema = z.enum([
  'reviewed-entities',
  'territories',
  'places',
  'people',
  'events',
  'journeys',
  'source-review',
])

export const collectionCoverageSchema = z
  .object({
    detailedRegions: z.array(nonEmptyTextSchema),
    partialRegions: z.array(nonEmptyTextSchema),
    timeRange: temporalRangeSchema,
    note: nonEmptyTextSchema,
  })
  .strict()
  .superRefine((coverage, context) => {
    const regions = [...coverage.detailedRegions, ...coverage.partialRegions]
    if (new Set(regions).size !== regions.length) {
      context.addIssue({ code: 'custom', message: 'Detailed and partial collection regions must be unique.' })
    }
  })

export const contentCollectionSchema = entityCoreSchema
  .extend({
    description: nonEmptyTextSchema,
    timeRange: temporalRangeSchema,
    recommendedStartYear: historicalYearSchema,
    recommendedViewport: collectionViewportSchema,
    recommendedLayers: collectionRecommendedLayersSchema,
    focusBounds: collectionFocusBoundsSchema,
    coverage: collectionCoverageSchema,
    linkedEntities: collectionLinksSchema,
    coverageStatus: coverageStatusSchema,
    visibility: collectionVisibilitySchema,
    completeness: collectionCompletenessSchema,
    membershipKind: collectionMembershipKindSchema,
    missingContent: z.array(collectionMissingContentSchema),
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

    if (
      collection.coverage.timeRange.yearFrom !== collection.timeRange.yearFrom ||
      collection.coverage.timeRange.yearTo !== collection.timeRange.yearTo
    ) {
      context.addIssue({
        code: 'custom',
        path: ['coverage', 'timeRange'],
        message: 'Collection coverage period must match the collection period.',
      })
    }

    const linkedIds = Object.values(collection.linkedEntities).flat()
    if (new Set(linkedIds).size !== linkedIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['linkedEntities'],
        message: 'Collection membership must not contain duplicate entity IDs.',
      })
    }

    if (new Set(collection.missingContent).size !== collection.missingContent.length) {
      context.addIssue({
        code: 'custom',
        path: ['missingContent'],
        message: 'Missing-content categories must be unique.',
      })
    }
  })
export type ContentCollection = z.infer<typeof contentCollectionSchema>
