import {
  formatHistoricalYear,
  historicalYearSchema,
  parseHistoricalYear,
  shiftHistoricalYear,
  type HistoricalYear,
} from '../../domain/time'
import type { MapUrlHistoryMode, MapUrlState } from '../../url'

export const TIMELINE_STEP_SIZES = [1, 5, 10, 25, 50, 100] as const
export type TimelineStepSize = (typeof TIMELINE_STEP_SIZES)[number]

export const DEFAULT_TIMELINE_STEP: TimelineStepSize = 1
export const TIMELINE_MIN_YEAR: HistoricalYear = -1000
export const TIMELINE_MAX_YEAR: HistoricalYear = 1000
export const TIMELINE_HISTORY_MODE: MapUrlHistoryMode = 'replace'

export type HistoricalEra = 'BCE' | 'CE'

export interface HistoricalYearDraft {
  magnitude: string
  era: HistoricalEra
}

export type HistoricalYearDraftResult =
  | { success: true; year: HistoricalYear }
  | { success: false; message: string }

const positiveIntegerPattern = /^\d+$/

export function isTimelineStepSize(value: unknown): value is TimelineStepSize {
  return typeof value === 'number' && TIMELINE_STEP_SIZES.includes(value as TimelineStepSize)
}

export function parseTimelineStepSize(value: unknown): TimelineStepSize {
  const parsed = typeof value === 'string' && positiveIntegerPattern.test(value)
    ? Number(value)
    : value
  return isTimelineStepSize(parsed) ? parsed : DEFAULT_TIMELINE_STEP
}

export function historicalYearToDraft(year: number): HistoricalYearDraft {
  const parsedYear = parseHistoricalYear(year)
  return {
    magnitude: String(Math.abs(parsedYear)),
    era: parsedYear < 0 ? 'BCE' : 'CE',
  }
}

export function historicalYearFromDraft(
  draft: HistoricalYearDraft,
): HistoricalYearDraftResult {
  if (!positiveIntegerPattern.test(draft.magnitude)) {
    return {
      success: false,
      message: 'Enter a whole positive year, then choose BCE or CE.',
    }
  }

  const magnitude = Number(draft.magnitude)
  if (!Number.isSafeInteger(magnitude) || magnitude <= 0) {
    return {
      success: false,
      message: 'Year magnitude must be a positive safe integer.',
    }
  }

  const candidate = draft.era === 'BCE' ? -magnitude : magnitude
  const result = historicalYearSchema.safeParse(candidate)
  return result.success
    ? { success: true, year: result.data }
    : { success: false, message: 'Enter a valid historical year.' }
}

export function shiftTimelineYear(
  year: number,
  steps: number,
): HistoricalYear | null {
  try {
    return shiftHistoricalYear(year, steps)
  } catch {
    return null
  }
}

export function historicalYearToSliderValue(year: number): number {
  const parsedYear = parseHistoricalYear(year)
  return parsedYear > 0 ? parsedYear - 1 : parsedYear
}

export function sliderValueToHistoricalYear(value: number): HistoricalYear {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError('Timeline slider value must be a safe integer.')
  }

  return parseHistoricalYear(value >= 0 ? value + 1 : value)
}

export const TIMELINE_SLIDER_MIN = historicalYearToSliderValue(TIMELINE_MIN_YEAR)
export const TIMELINE_SLIDER_MAX = historicalYearToSliderValue(TIMELINE_MAX_YEAR)

export function clampHistoricalYearToSlider(year: number): HistoricalYear {
  const parsedYear = parseHistoricalYear(year)
  if (parsedYear < TIMELINE_MIN_YEAR) {
    return TIMELINE_MIN_YEAR
  }
  if (parsedYear > TIMELINE_MAX_YEAR) {
    return TIMELINE_MAX_YEAR
  }
  return parsedYear
}

export function isHistoricalYearOutsideSlider(year: number): boolean {
  const parsedYear = parseHistoricalYear(year)
  return parsedYear < TIMELINE_MIN_YEAR || parsedYear > TIMELINE_MAX_YEAR
}

export function shouldCommitTimelineYear(
  currentYear: number,
  nextYear: number,
): boolean {
  return parseHistoricalYear(currentYear) !== parseHistoricalYear(nextYear)
}

export function withTimelineYear(
  currentState: MapUrlState,
  year: number,
): MapUrlState {
  return { ...currentState, year: parseHistoricalYear(year) }
}

export function formatTimelineYear(year: number): string {
  return formatHistoricalYear(year)
}
