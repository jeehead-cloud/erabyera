import { z } from 'zod'
import { DATE_PRECISIONS } from './datePrecision'

export const historicalYearSchema = z
  .number()
  .refine(Number.isSafeInteger, {
    message: 'Historical year must be a safe integer.',
  })
  .refine((year) => year !== 0, {
    message: 'Historical year zero is not valid; use -1 for 1 BCE or 1 for 1 CE.',
  })

export type HistoricalYear = z.infer<typeof historicalYearSchema>

export const datePrecisionSchema = z.enum(DATE_PRECISIONS)

export const temporalRangeSchema = z
  .object({
    yearFrom: historicalYearSchema,
    yearTo: historicalYearSchema.nullable(),
    datePrecision: datePrecisionSchema.optional(),
  })
  .superRefine((range, context) => {
    if (range.yearTo !== null && range.yearFrom > range.yearTo) {
      context.addIssue({
        code: 'custom',
        path: ['yearTo'],
        message: 'Temporal range end must not occur before its start.',
      })
    }
  })

export type TemporalRange = z.infer<typeof temporalRangeSchema>
