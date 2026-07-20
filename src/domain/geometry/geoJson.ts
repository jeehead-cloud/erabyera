import { z } from 'zod'
import { datasetVersionSchema, entityIdSchema, longitudeLatitudeSchema } from '../entities/common'

type Point = readonly [number, number]

function orientation(a: Point, b: Point, c: Point): number {
  return Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
}

function onSegment(a: Point, b: Point, c: Point): boolean {
  return c[0] >= Math.min(a[0], b[0]) && c[0] <= Math.max(a[0], b[0]) &&
    c[1] >= Math.min(a[1], b[1]) && c[1] <= Math.max(a[1], b[1])
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  const first = orientation(a, b, c)
  const second = orientation(a, b, d)
  const third = orientation(c, d, a)
  const fourth = orientation(c, d, b)
  return (first * second < 0 && third * fourth < 0) ||
    (first === 0 && onSegment(a, b, c)) || (second === 0 && onSegment(a, b, d)) ||
    (third === 0 && onSegment(c, d, a)) || (fourth === 0 && onSegment(c, d, b))
}

function selfIntersects(ring: readonly Point[]): boolean {
  const edgeCount = ring.length - 1
  for (let first = 0; first < edgeCount; first += 1) {
    for (let second = first + 1; second < edgeCount; second += 1) {
      if (second === first + 1 || (first === 0 && second === edgeCount - 1)) continue
      if (segmentsIntersect(ring[first]!, ring[first + 1]!, ring[second]!, ring[second + 1]!)) return true
    }
  }
  return false
}

const linearRingSchema = z.array(longitudeLatitudeSchema).min(4).superRefine((ring, context) => {
  const first = ring[0]
  const last = ring.at(-1)
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    context.addIssue({ code: 'custom', message: 'Polygon rings must be closed.' })
  }
  if (first && last && first[0] === last[0] && first[1] === last[1] && selfIntersects(ring)) {
    context.addIssue({ code: 'custom', message: 'Polygon rings must not self-intersect.' })
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
