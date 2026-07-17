import {
  intersectsHistoricalYearRange,
  type TemporalRange,
  type UnknownEndOptions,
} from '../time'
import { entityIdSchema } from './common'
import { historicalEventSchema } from './event'
import { placeSchema } from './place'
import { politySchema } from './polity'

export interface TemporalOverlap {
  firstIndex: number
  secondIndex: number
}

export function findTemporalOverlaps<T>(
  records: readonly T[],
  getRange: (record: T) => TemporalRange,
  options: UnknownEndOptions = {},
): TemporalOverlap[] {
  const overlaps: TemporalOverlap[] = []

  for (let firstIndex = 0; firstIndex < records.length; firstIndex += 1) {
    const firstRange = getRange(records[firstIndex])

    for (
      let secondIndex = firstIndex + 1;
      secondIndex < records.length;
      secondIndex += 1
    ) {
      const secondRange = getRange(records[secondIndex])
      if (secondRange.yearTo === null) {
        if (
          options.treatUnknownEndAsOpenEnded &&
          firstRange.yearTo === null
        ) {
          overlaps.push({ firstIndex, secondIndex })
          continue
        }

        if (
          options.treatUnknownEndAsOpenEnded &&
          firstRange.yearTo !== null &&
          intersectsHistoricalYearRange(
            secondRange,
            firstRange.yearFrom,
            firstRange.yearTo,
            options,
          )
        ) {
          overlaps.push({ firstIndex, secondIndex })
        }
        continue
      }

      if (
        intersectsHistoricalYearRange(
          firstRange,
          secondRange.yearFrom,
          secondRange.yearTo,
          options,
        )
      ) {
        overlaps.push({ firstIndex, secondIndex })
      }
    }
  }

  return overlaps
}

export function findMissingReferences(
  references: readonly string[],
  knownIds: ReadonlySet<string>,
): string[] {
  const validReferences = references.map((reference) =>
    entityIdSchema.parse(reference),
  )

  return [...new Set(validReferences.filter((id) => !knownIds.has(id)))].sort()
}

export function parsePlace(input: unknown) {
  return placeSchema.parse(input)
}

export function safeParsePlace(input: unknown) {
  return placeSchema.safeParse(input)
}

export function parsePolity(input: unknown) {
  return politySchema.parse(input)
}

export function safeParseHistoricalEvent(input: unknown) {
  return historicalEventSchema.safeParse(input)
}
