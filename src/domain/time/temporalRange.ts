import { parseHistoricalYear } from './historicalYear'
import {
  temporalRangeSchema,
  type HistoricalYear,
  type TemporalRange,
} from './schemas'

export interface UnknownEndOptions {
  treatUnknownEndAsOpenEnded?: boolean
}

export function parseTemporalRange(range: TemporalRange): TemporalRange {
  return temporalRangeSchema.parse(range)
}

export function isActiveAtYear(
  range: TemporalRange,
  year: number,
  options: UnknownEndOptions = {},
): boolean {
  const parsedRange = parseTemporalRange(range)
  const parsedYear = parseHistoricalYear(year)

  if (parsedRange.yearTo === null) {
    return (
      options.treatUnknownEndAsOpenEnded === true &&
      parsedYear >= parsedRange.yearFrom
    )
  }

  return (
    parsedYear >= parsedRange.yearFrom && parsedYear <= parsedRange.yearTo
  )
}

export function intersectsHistoricalYearRange(
  range: TemporalRange,
  queryFrom: number,
  queryTo: number,
  options: UnknownEndOptions = {},
): boolean {
  const parsedRange = parseTemporalRange(range)
  const parsedQuery = temporalRangeSchema.parse({
    yearFrom: queryFrom,
    yearTo: queryTo,
  })

  if (parsedQuery.yearTo === null) {
    throw new TypeError('Historical range queries require a known end year.')
  }

  if (parsedRange.yearTo === null) {
    return (
      options.treatUnknownEndAsOpenEnded === true &&
      parsedQuery.yearTo >= parsedRange.yearFrom
    )
  }

  return (
    parsedRange.yearFrom <= parsedQuery.yearTo &&
    parsedQuery.yearFrom <= parsedRange.yearTo
  )
}

export function nearestYearInTemporalRange(
  range: TemporalRange,
  year: number,
  options: UnknownEndOptions = {},
): HistoricalYear | null {
  const parsedRange = parseTemporalRange(range)
  const parsedYear = parseHistoricalYear(year)

  if (parsedYear <= parsedRange.yearFrom) {
    return parsedRange.yearFrom
  }

  if (parsedRange.yearTo === null) {
    return options.treatUnknownEndAsOpenEnded === true ? parsedYear : null
  }

  if (parsedYear > parsedRange.yearTo) {
    return parsedRange.yearTo
  }

  return parsedYear
}
