import { describe, expect, it } from 'vitest'
import { formatHistoricalYear, historicalYearSchema } from '../../domain/time'
import {
  DEFAULT_MAP_URL_STATE,
  parseMapUrlState,
  serializeMapUrlState,
} from '../../url'
import {
  DEFAULT_TIMELINE_STEP,
  TIMELINE_HISTORY_MODE,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  TIMELINE_SLIDER_MAX,
  TIMELINE_SLIDER_MIN,
  TIMELINE_STEP_SIZES,
  clampHistoricalYearToSlider,
  formatTimelineYear,
  historicalYearFromDraft,
  historicalYearToDraft,
  historicalYearToSliderValue,
  isHistoricalYearOutsideSlider,
  isTimelineStepSize,
  parseTimelineStepSize,
  shiftTimelineYear,
  shouldCommitTimelineYear,
  sliderValueToHistoricalYear,
  withTimelineYear,
} from './timelineModel'

describe('timeline selected-year display and movement', () => {
  it('displays the F6 default as 334 BCE', () => {
    expect(formatTimelineYear(-334)).toBe('334 BCE')
  })

  it('displays 44 CE', () => {
    expect(formatTimelineYear(44)).toBe('44 CE')
  })

  it('delegates display formatting to the F2 formatter', () => {
    expect(formatTimelineYear(-1)).toBe(formatHistoricalYear(-1))
  })

  it('moves directly from 1 BCE to 1 CE', () => {
    expect(shiftTimelineYear(-1, 1)).toBe(1)
  })

  it('moves directly from 1 CE to 1 BCE', () => {
    expect(shiftTimelineYear(1, -1)).toBe(-1)
  })

  it('moves a five-year step across BCE and CE without zero', () => {
    expect(shiftTimelineYear(-2, 5)).toBe(4)
  })

  it('moves a hundred-year step across BCE and CE without zero', () => {
    expect(shiftTimelineYear(-50, 100)).toBe(51)
  })

  it('moves backward across the era boundary through F2 semantics', () => {
    expect(shiftTimelineYear(3, -5)).toBe(-3)
  })

  it('returns null only at a real safe-integer movement boundary', () => {
    expect(shiftTimelineYear(Number.MAX_SAFE_INTEGER, 1)).toBeNull()
  })

  it('never returns year zero from an ordinary transition', () => {
    expect(historicalYearSchema.safeParse(shiftTimelineYear(-1, 1)).success).toBe(true)
    expect(shiftTimelineYear(-1, 1)).not.toBe(0)
  })
})

describe('timeline step contract', () => {
  it.each(TIMELINE_STEP_SIZES)('accepts allowed step %i', (step) => {
    expect(isTimelineStepSize(step)).toBe(true)
    expect(parseTimelineStepSize(String(step))).toBe(step)
  })

  it.each([0, 2, 20, 101, -1, '5 years', ''])('falls back for invalid step %s', (step) => {
    expect(parseTimelineStepSize(step)).toBe(DEFAULT_TIMELINE_STEP)
  })

  it('changing step size does not itself change a selected year', () => {
    const selectedYear = DEFAULT_MAP_URL_STATE.year
    expect(parseTimelineStepSize('50')).toBe(50)
    expect(selectedYear).toBe(-334)
  })
})

describe('unambiguous BCE and CE draft input', () => {
  it('converts a BCE magnitude to a negative historical year', () => {
    expect(historicalYearFromDraft({ magnitude: '334', era: 'BCE' }))
      .toEqual({ success: true, year: -334 })
  })

  it('converts a CE magnitude to a positive historical year', () => {
    expect(historicalYearFromDraft({ magnitude: '44', era: 'CE' }))
      .toEqual({ success: true, year: 44 })
  })

  it('rejects zero magnitude', () => {
    expect(historicalYearFromDraft({ magnitude: '0', era: 'CE' }).success).toBe(false)
  })

  it('rejects negative magnitude', () => {
    expect(historicalYearFromDraft({ magnitude: '-44', era: 'BCE' }).success).toBe(false)
  })

  it('rejects decimal magnitude', () => {
    expect(historicalYearFromDraft({ magnitude: '44.5', era: 'CE' }).success).toBe(false)
  })

  it('rejects an empty draft without creating a replacement year', () => {
    const result = historicalYearFromDraft({ magnitude: '', era: 'BCE' })
    expect(result.success).toBe(false)
    expect(withTimelineYear(DEFAULT_MAP_URL_STATE, DEFAULT_MAP_URL_STATE.year).year).toBe(-334)
  })

  it('rejects malformed natural-language input', () => {
    expect(historicalYearFromDraft({ magnitude: 'circa 334', era: 'BCE' }).success).toBe(false)
  })

  it('accepts a valid direct-input commit', () => {
    const result = historicalYearFromDraft({ magnitude: '1066', era: 'CE' })
    expect(result).toEqual({ success: true, year: 1066 })
  })

  it('preserves the current year when an invalid draft is not committed', () => {
    const current = parseMapUrlState('?year=-44')
    const result = historicalYearFromDraft({ magnitude: '4.4', era: 'CE' })
    expect(result.success ? withTimelineYear(current, result.year).year : current.year).toBe(-44)
  })

  it('refreshes a draft model when an external URL year changes', () => {
    expect(historicalYearToDraft(-44)).toEqual({ magnitude: '44', era: 'BCE' })
    expect(historicalYearToDraft(476)).toEqual({ magnitude: '476', era: 'CE' })
  })

  it('rejects a magnitude outside the safe-integer contract', () => {
    expect(historicalYearFromDraft({ magnitude: '9007199254740992', era: 'CE' }).success)
      .toBe(false)
  })
})

describe('zero-free slider mapping', () => {
  it('converts a BCE year to its zero-free ordinal', () => {
    expect(historicalYearToSliderValue(-334)).toBe(-334)
  })

  it('converts a CE year to its zero-free ordinal', () => {
    expect(historicalYearToSliderValue(44)).toBe(43)
  })

  it('maps the slider ordinal back to BCE', () => {
    expect(sliderValueToHistoricalYear(-334)).toBe(-334)
  })

  it('maps the slider ordinal back to CE', () => {
    expect(sliderValueToHistoricalYear(43)).toBe(44)
  })

  it('never produces year zero around the slider origin', () => {
    expect(sliderValueToHistoricalYear(-1)).toBe(-1)
    expect(sliderValueToHistoricalYear(0)).toBe(1)
  })

  it('crosses directly from 1 BCE to 1 CE', () => {
    const oneBceOrdinal = historicalYearToSliderValue(-1)
    expect(sliderValueToHistoricalYear(oneBceOrdinal + 1)).toBe(1)
  })

  it('includes 334 BCE in the foundation range', () => {
    expect(historicalYearToSliderValue(-334)).toBeGreaterThanOrEqual(TIMELINE_SLIDER_MIN)
    expect(historicalYearToSliderValue(-334)).toBeLessThanOrEqual(TIMELINE_SLIDER_MAX)
  })

  it('maps the minimum slider boundary to 1000 BCE', () => {
    expect(sliderValueToHistoricalYear(TIMELINE_SLIDER_MIN)).toBe(TIMELINE_MIN_YEAR)
  })

  it('maps the maximum slider boundary to 1000 CE', () => {
    expect(sliderValueToHistoricalYear(TIMELINE_SLIDER_MAX)).toBe(TIMELINE_MAX_YEAR)
  })

  it('rejects a fractional slider ordinal', () => {
    expect(() => sliderValueToHistoricalYear(1.5)).toThrow('safe integer')
  })

  it('keeps a valid direct year outside the slider range selected', () => {
    const state = withTimelineYear(DEFAULT_MAP_URL_STATE, 1066)
    expect(state.year).toBe(1066)
    expect(isHistoricalYearOutsideSlider(state.year)).toBe(true)
    expect(clampHistoricalYearToSlider(state.year)).toBe(TIMELINE_MAX_YEAR)
  })

  it('clamps an early outside year only for slider presentation', () => {
    expect(clampHistoricalYearToSlider(-1200)).toBe(TIMELINE_MIN_YEAR)
    expect(isHistoricalYearOutsideSlider(-1200)).toBe(true)
  })
})

describe('F6 URL preservation and history policy', () => {
  const current = parseMapUrlState(
    '?year=-334&lat=41&lng=29&zoom=5&layers=places,journeys&entity=person:sample-person&collection=sample-collection',
  )
  const updated = withTimelineYear(current, 44)

  it('changes only the selected year in the state model', () => {
    expect(updated.year).toBe(44)
  })

  it('preserves viewport values', () => {
    expect(updated).toMatchObject({ latitude: 41, longitude: 29, zoom: 5 })
  })

  it('preserves active layers', () => {
    expect(updated.activeLayers).toEqual(['places', 'journeys'])
  })

  it('preserves selected entity', () => {
    expect(updated.selectedEntity).toEqual({ type: 'person', id: 'sample-person' })
  })

  it('preserves collection', () => {
    expect(updated.collectionId).toBe('sample-collection')
  })

  it('preserves unrelated query parameters through F6 serialization', () => {
    const search = serializeMapUrlState(updated, '?campaign=owner-check').toString()
    expect(search).toContain('campaign=owner-check')
    expect(parseMapUrlState(search).year).toBe(44)
  })

  it('does not request a redundant write for an equivalent year', () => {
    expect(shouldCommitTimelineYear(-334, -334)).toBe(false)
  })

  it('detects a real external selected-year change', () => {
    expect(shouldCommitTimelineYear(-334, 1)).toBe(true)
  })

  it('uses replacement for slider movement', () => {
    expect(TIMELINE_HISTORY_MODE).toBe('replace')
  })

  it('uses replacement for discrete timeline actions too', () => {
    expect(TIMELINE_HISTORY_MODE).toBe('replace')
  })
})
