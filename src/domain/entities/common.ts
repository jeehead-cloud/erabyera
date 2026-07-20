import { z } from 'zod'

export const SCHEMA_VERSION = 1 as const
export const schemaVersionSchema = z.literal(SCHEMA_VERSION)
export type SchemaVersion = z.infer<typeof schemaVersionSchema>

export const datasetVersionSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*-\d+\.\d+\.\d+$/,
    'Dataset version must use a lowercase name followed by a semantic version.',
  )

export const entityIdSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Entity ID must contain lowercase letters, digits, and single hyphens only.',
  )

export type EntityId = z.infer<typeof entityIdSchema>

export const nonEmptyTextSchema = z.string().trim().min(1)

export const editorialStatusSchema = z.enum([
  'draft',
  'reviewed',
  'published',
  'deprecated',
])
export type EditorialStatus = z.infer<typeof editorialStatusSchema>

export const importanceSchema = z.number().int().min(1).max(5)

export const contentClassificationSchema = z.enum([
  'reviewed-historical',
  'synthetic-fixture',
])
export type ContentClassification = z.infer<typeof contentClassificationSchema>

export const longitudeLatitudeSchema = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
])
export type LongitudeLatitude = z.infer<typeof longitudeLatitudeSchema>

export const entityCoreSchema = z
  .object({
    id: entityIdSchema,
    defaultName: nonEmptyTextSchema,
    aliases: z.array(nonEmptyTextSchema),
    contentClassification: contentClassificationSchema,
    editorialStatus: editorialStatusSchema,
    summary: nonEmptyTextSchema.optional(),
  })
  .strict()
