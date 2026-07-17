import { useState } from 'react'
import type { HistoricalYear } from '../../domain/time'
import { HistoricalYearInput } from './HistoricalYearInput'
import { TimelineStepSelect } from './TimelineStepSelect'
import {
  DEFAULT_TIMELINE_STEP,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  TIMELINE_SLIDER_MAX,
  TIMELINE_SLIDER_MIN,
  clampHistoricalYearToSlider,
  formatTimelineYear,
  historicalYearToSliderValue,
  isHistoricalYearOutsideSlider,
  shiftTimelineYear,
  shouldCommitTimelineYear,
  sliderValueToHistoricalYear,
  type TimelineStepSize,
} from './timelineModel'
import './Timeline.css'

interface TimelineProps {
  selectedYear: HistoricalYear
  onYearChange: (year: HistoricalYear) => void
}

export function Timeline({ selectedYear, onYearChange }: TimelineProps) {
  const [stepSize, setStepSize] = useState<TimelineStepSize>(DEFAULT_TIMELINE_STEP)
  const sliderYear = clampHistoricalYearToSlider(selectedYear)
  const sliderValue = historicalYearToSliderValue(sliderYear)
  const outsideSlider = isHistoricalYearOutsideSlider(selectedYear)
  const previousYear = shiftTimelineYear(selectedYear, -1)
  const nextYear = shiftTimelineYear(selectedYear, 1)
  const previousStep = shiftTimelineYear(selectedYear, -stepSize)
  const nextStep = shiftTimelineYear(selectedYear, stepSize)

  const commitYear = (year: HistoricalYear | null) => {
    if (year !== null && shouldCommitTimelineYear(selectedYear, year)) {
      onYearChange(year)
    }
  }

  return (
    <section className="timeline" aria-label="Historical timeline controls">
      <div className="timeline__primary">
        <div className="timeline__selected" aria-live="polite">
          <span className="timeline-field__label">Selected year</span>
          <output className="timeline__year">{formatTimelineYear(selectedYear)}</output>
        </div>

        <div className="timeline__navigation" aria-label="Year navigation">
          <button
            aria-label={`Go back ${stepSize} ${stepSize === 1 ? 'year' : 'years'}`}
            className="timeline-button timeline-button--step"
            disabled={previousStep === null}
            onClick={() => commitYear(previousStep)}
            title={`Previous ${stepSize} ${stepSize === 1 ? 'year' : 'years'}`}
            type="button"
          >
            −{stepSize}
          </button>
          <button
            aria-label="Go to previous historical year"
            className="timeline-button"
            disabled={previousYear === null}
            onClick={() => commitYear(previousYear)}
            title="Previous year"
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="Go to next historical year"
            className="timeline-button"
            disabled={nextYear === null}
            onClick={() => commitYear(nextYear)}
            title="Next year"
            type="button"
          >
            ›
          </button>
          <button
            aria-label={`Go forward ${stepSize} ${stepSize === 1 ? 'year' : 'years'}`}
            className="timeline-button timeline-button--step"
            disabled={nextStep === null}
            onClick={() => commitYear(nextStep)}
            title={`Next ${stepSize} ${stepSize === 1 ? 'year' : 'years'}`}
            type="button"
          >
            +{stepSize}
          </button>
        </div>

        <HistoricalYearInput selectedYear={selectedYear} onCommit={commitYear} />
        <TimelineStepSelect value={stepSize} onChange={setStepSize} />
      </div>

      <div className="timeline__slider-group">
        <label className="visually-hidden" htmlFor="historical-year-slider">
          Selected historical year
        </label>
        <input
          aria-valuetext={outsideSlider
            ? `${formatTimelineYear(sliderYear)} slider limit; selected ${formatTimelineYear(selectedYear)}`
            : formatTimelineYear(selectedYear)}
          className="timeline-slider"
          id="historical-year-slider"
          max={TIMELINE_SLIDER_MAX}
          min={TIMELINE_SLIDER_MIN}
          onChange={(event) => commitYear(sliderValueToHistoricalYear(Number(event.target.value)))}
          step="1"
          type="range"
          value={sliderValue}
        />
        <div className="timeline__slider-labels" aria-hidden="true">
          <span>{formatTimelineYear(TIMELINE_MIN_YEAR)}</span>
          <span>{formatTimelineYear(TIMELINE_MAX_YEAR)}</span>
        </div>
        {outsideSlider ? (
          <p className="timeline__range-note">
            Selected year is outside the slider range; direct input remains active.
          </p>
        ) : null}
      </div>
    </section>
  )
}
