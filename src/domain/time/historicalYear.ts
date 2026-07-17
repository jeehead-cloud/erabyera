import {
  historicalYearSchema,
  temporalRangeSchema,
  type HistoricalYear,
  type TemporalRange,
} from './schemas'

type HistoricalYearComparison = -1 | 0 | 1

export function parseHistoricalYear(year: number): HistoricalYear {
  return historicalYearSchema.parse(year)
}

export function isHistoricalYear(year: unknown): year is HistoricalYear {
  return historicalYearSchema.safeParse(year).success
}

export function formatHistoricalYear(year: number): string {
  const parsedYear = parseHistoricalYear(year)
  const era = parsedYear < 0 ? 'BCE' : 'CE'

  return `${Math.abs(parsedYear)} ${era}`
}

export function formatHistoricalYearRange(range: TemporalRange): string {
  const parsedRange = temporalRangeSchema.parse(range)
  const start = formatHistoricalYear(parsedRange.yearFrom)

  return parsedRange.yearTo === null
    ? `From ${start}; end unknown`
    : `${start}–${formatHistoricalYear(parsedRange.yearTo)}`
}

export function compareHistoricalYears(
  first: number,
  second: number,
): HistoricalYearComparison {
  const parsedFirst = parseHistoricalYear(first)
  const parsedSecond = parseHistoricalYear(second)

  if (parsedFirst === parsedSecond) {
    return 0
  }

  return parsedFirst < parsedSecond ? -1 : 1
}

export function nextHistoricalYear(year: number): HistoricalYear {
  return shiftHistoricalYear(year, 1)
}

export function previousHistoricalYear(year: number): HistoricalYear {
  return shiftHistoricalYear(year, -1)
}

export function shiftHistoricalYear(
  year: number,
  steps: number,
): HistoricalYear {
  const parsedYear = parseHistoricalYear(year)

  if (!Number.isSafeInteger(steps)) {
    throw new RangeError('Historical year step count must be a safe integer.')
  }

  const ordinal = parsedYear > 0 ? parsedYear - 1 : parsedYear
  const shiftedOrdinal = ordinal + steps
  const shiftedYear = shiftedOrdinal >= 0 ? shiftedOrdinal + 1 : shiftedOrdinal

  return parseHistoricalYear(shiftedYear)
}
