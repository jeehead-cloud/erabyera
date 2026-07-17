import { describe, expect, it } from 'vitest'
import {
  DATE_PRECISIONS,
  compareHistoricalYears,
  datePrecisionSchema,
  formatHistoricalYear,
  historicalYearSchema,
  intersectsHistoricalYearRange,
  isActiveAtYear,
  isHistoricalYear,
  nearestYearInTemporalRange,
  nextHistoricalYear,
  previousHistoricalYear,
  shiftHistoricalYear,
  temporalRangeSchema,
  type TemporalRange,
} from '.'

describe('historical year validation and formatting', () => {
  it.each([-334, -1, 1, 334])('accepts historical year %i', (year) => {
    expect(historicalYearSchema.safeParse(year).success).toBe(true)
    expect(isHistoricalYear(year)).toBe(true)
  })

  it.each([0, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid historical year %s',
    (year) => {
      expect(historicalYearSchema.safeParse(year).success).toBe(false)
      expect(isHistoricalYear(year)).toBe(false)
    },
  )

  it.each([
    [-334, '334 BCE'],
    [-1, '1 BCE'],
    [1, '1 CE'],
    [334, '334 CE'],
  ])('formats %i as %s', (year, formatted) => {
    expect(formatHistoricalYear(year)).toBe(formatted)
  })

  it('compares validated years in historical order', () => {
    expect(compareHistoricalYears(-1, 1)).toBe(-1)
    expect(compareHistoricalYears(1, -1)).toBe(1)
    expect(compareHistoricalYears(1, 1)).toBe(0)
  })
})

describe('historical year movement', () => {
  it.each([
    [-2, -1],
    [-1, 1],
    [1, 2],
  ])('moves forward from %i to %i', (year, expected) => {
    expect(nextHistoricalYear(year)).toBe(expected)
  })

  it.each([
    [2, 1],
    [1, -1],
    [-1, -2],
  ])('moves backward from %i to %i', (year, expected) => {
    expect(previousHistoricalYear(year)).toBe(expected)
  })

  it.each([
    [-2, 1, -1],
    [-1, 1, 1],
    [-1, 2, 2],
    [1, -1, -1],
    [-3, 5, 3],
    [3, -5, -3],
    [334, 0, 334],
  ])('shifts %i by %i steps to %i', (year, steps, expected) => {
    expect(shiftHistoricalYear(year, steps)).toBe(expected)
  })

  it('rejects a fractional step count', () => {
    expect(() => shiftHistoricalYear(1, 1.5)).toThrow(
      'Historical year step count must be a safe integer.',
    )
  })
})

describe('date precision', () => {
  it.each(DATE_PRECISIONS)('accepts %s precision', (precision) => {
    expect(datePrecisionSchema.parse(precision)).toBe(precision)
  })

  it('rejects unsupported precision without collapsing it', () => {
    expect(datePrecisionSchema.safeParse('circa').success).toBe(false)
  })
})

describe('temporal range validation and activity', () => {
  const bceRange: TemporalRange = { yearFrom: -500, yearTo: -400 }
  const crossingRange: TemporalRange = {
    yearFrom: -2,
    yearTo: 2,
    datePrecision: 'range',
  }

  it('accepts BCE-only and BCE-to-CE ranges', () => {
    expect(temporalRangeSchema.parse(bceRange)).toEqual(bceRange)
    expect(temporalRangeSchema.parse(crossingRange)).toEqual(crossingRange)
  })

  it.each([
    [{ yearFrom: 5, yearTo: 1 }, 'reversed range'],
    [{ yearFrom: 0, yearTo: 1 }, 'zero start'],
    [{ yearFrom: -1, yearTo: 0 }, 'zero end'],
  ])('rejects an invalid %s', (range) => {
    expect(temporalRangeSchema.safeParse(range).success).toBe(false)
  })

  it('uses inclusive start and end boundaries', () => {
    expect(isActiveAtYear(bceRange, -500)).toBe(true)
    expect(isActiveAtYear(bceRange, -400)).toBe(true)
  })

  it('rejects years before and after a closed range', () => {
    expect(isActiveAtYear(bceRange, -501)).toBe(false)
    expect(isActiveAtYear(bceRange, -399)).toBe(false)
  })

  it('handles a range crossing directly from 1 BCE to 1 CE', () => {
    expect(isActiveAtYear(crossingRange, -1)).toBe(true)
    expect(isActiveAtYear(crossingRange, 1)).toBe(true)
    expect(() => isActiveAtYear(crossingRange, 0)).toThrow()
  })

  it('does not treat an unknown end as ongoing by default', () => {
    const range: TemporalRange = { yearFrom: -10, yearTo: null }

    expect(isActiveAtYear(range, -10)).toBe(false)
    expect(isActiveAtYear(range, 10)).toBe(false)
  })

  it('supports an explicit open-ended interpretation', () => {
    const range: TemporalRange = { yearFrom: -10, yearTo: null }
    const options = { treatUnknownEndAsOpenEnded: true }

    expect(isActiveAtYear(range, -11, options)).toBe(false)
    expect(isActiveAtYear(range, -10, options)).toBe(true)
    expect(isActiveAtYear(range, 10, options)).toBe(true)
  })
})

describe('temporal range intersection', () => {
  const range: TemporalRange = { yearFrom: -10, yearTo: 10 }

  it('counts touching start and end boundaries as intersections', () => {
    expect(intersectsHistoricalYearRange(range, -20, -10)).toBe(true)
    expect(intersectsHistoricalYearRange(range, 10, 20)).toBe(true)
  })

  it('rejects non-intersecting ranges', () => {
    expect(intersectsHistoricalYearRange(range, -20, -11)).toBe(false)
    expect(intersectsHistoricalYearRange(range, 11, 20)).toBe(false)
  })

  it('validates query boundaries', () => {
    expect(() => intersectsHistoricalYearRange(range, 2, -2)).toThrow()
    expect(() => intersectsHistoricalYearRange(range, 0, 2)).toThrow()
  })

  it('keeps unknown-end intersection behavior explicit', () => {
    const unknownEnd: TemporalRange = { yearFrom: -10, yearTo: null }

    expect(intersectsHistoricalYearRange(unknownEnd, -5, 5)).toBe(false)
    expect(
      intersectsHistoricalYearRange(unknownEnd, -5, 5, {
        treatUnknownEndAsOpenEnded: true,
      }),
    ).toBe(true)
  })
})

describe('nearest year in a temporal range', () => {
  const range: TemporalRange = { yearFrom: -10, yearTo: 10 }

  it.each([
    [-20, -10],
    [-5, -5],
    [20, 10],
  ])('maps requested year %i to %i', (year, expected) => {
    expect(nearestYearInTemporalRange(range, year)).toBe(expected)
  })

  it('does not invent a later year for an unknown end', () => {
    const unknownEnd: TemporalRange = { yearFrom: -10, yearTo: null }

    expect(nearestYearInTemporalRange(unknownEnd, -20)).toBe(-10)
    expect(nearestYearInTemporalRange(unknownEnd, -10)).toBe(-10)
    expect(nearestYearInTemporalRange(unknownEnd, 5)).toBeNull()
  })

  it('returns the requested year only under explicit open-ended semantics', () => {
    const unknownEnd: TemporalRange = { yearFrom: -10, yearTo: null }

    expect(
      nearestYearInTemporalRange(unknownEnd, 5, {
        treatUnknownEndAsOpenEnded: true,
      }),
    ).toBe(5)
  })
})
