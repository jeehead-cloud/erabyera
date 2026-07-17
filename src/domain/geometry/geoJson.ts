import { z } from 'zod'
import { datasetVersionSchema, entityIdSchema, longitudeLatitudeSchema } from '../entities/common'

const linearRingSchema = z.array(longitudeLatitudeSchema).min(4).superRefine((ring, context) => {
  const first = ring[0]
  const last = ring.at(-1)
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    context.addIssue({ code: 'custom', message: 'Polygon rings must be closed.' })
  }
})

export const polygonGeometrySchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(linearRingSchema).min(1),
}).strict()

export const multiPolygonGeometrySchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(linearRingSchema).min(1)).min(1),
}).strict()

export const lineStringGeometrySchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(longitudeLatitudeSchema).min(2),
}).strict()

export const multiLineStringGeometrySchema = z.object({
  type: z.literal('MultiLineString'),
  coordinates: z.array(z.array(longitudeLatitudeSchema).min(2)).min(1),
}).strict()

export const territoryFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: entityIdSchema,
  properties: z.object({ territoryPeriodId: entityIdSchema }).strict(),
  geometry: z.union([polygonGeometrySchema, multiPolygonGeometrySchema]),
}).strict()

export const journeyFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: entityIdSchema,
  properties: z.object({ journeyId: entityIdSchema }).strict(),
  geometry: z.union([lineStringGeometrySchema, multiLineStringGeometrySchema]),
}).strict()

function featureCollectionSchema<T extends z.ZodType>(featureSchema: T) {
  return z.object({
    type: z.literal('FeatureCollection'),
    schemaVersion: z.literal(1),
    datasetVersion: datasetVersionSchema,
    features: z.array(featureSchema),
  }).strict()
}

export const territoryFeatureCollectionSchema = featureCollectionSchema(territoryFeatureSchema)
export const journeyFeatureCollectionSchema = featureCollectionSchema(journeyFeatureSchema)

export type TerritoryFeatureCollection = z.infer<typeof territoryFeatureCollectionSchema>
export type JourneyFeatureCollection = z.infer<typeof journeyFeatureCollectionSchema>
