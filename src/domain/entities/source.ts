import { z } from 'zod'
import { historicalYearSchema } from '../time'
import {
  editorialStatusSchema,
  entityIdSchema,
  nonEmptyTextSchema,
  type EditorialStatus,
} from './common'

export const sourceTypeSchema = z.enum([
  'primary',
  'secondary',
  'dataset',
  'reference',
  'map',
  'website',
  'other',
])
export type SourceType = z.infer<typeof sourceTypeSchema>

export const sourceReviewSchema = z
  .object({
    reviewedBy: nonEmptyTextSchema,
    reviewedOn: z.iso.date(),
    note: nonEmptyTextSchema.optional(),
  })
  .strict()

export const sourceSchema = z
  .object({
    id: entityIdSchema,
    title: nonEmptyTextSchema,
    sourceType: sourceTypeSchema,
    author: nonEmptyTextSchema.optional(),
    organization: nonEmptyTextSchema.optional(),
    publicationYear: historicalYearSchema.optional(),
    publisher: nonEmptyTextSchema.optional(),
    url: z.url().optional(),
    license: nonEmptyTextSchema.optional(),
    bibliographicNote: nonEmptyTextSchema.optional(),
    editorialStatus: editorialStatusSchema,
    review: sourceReviewSchema.optional(),
  })
  .strict()
export type Source = z.infer<typeof sourceSchema>

export const sourceReferenceSchema = z
  .object({
    sourceId: entityIdSchema,
    locator: nonEmptyTextSchema.optional(),
    note: nonEmptyTextSchema.optional(),
    excerptNote: nonEmptyTextSchema.optional(),
    reviewedOn: z.iso.date().optional(),
  })
  .strict()
export type SourceReference = z.infer<typeof sourceReferenceSchema>

export interface SourceBearingRecord {
  editorialStatus: EditorialStatus
  sourceRefs: readonly SourceReference[]
}

export function enforcePublishedSources(
  record: SourceBearingRecord,
  context: z.RefinementCtx,
): void {
  if (record.editorialStatus === 'published' && record.sourceRefs.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['sourceRefs'],
      message: 'Published records require at least one source reference.',
    })
  }
}

export function validatePublishedSources(record: SourceBearingRecord): boolean {
  return record.editorialStatus !== 'published' || record.sourceRefs.length > 0
}
