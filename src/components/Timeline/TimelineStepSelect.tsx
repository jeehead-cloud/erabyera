import {
  TIMELINE_STEP_SIZES,
  parseTimelineStepSize,
  type TimelineStepSize,
} from './timelineModel'

interface TimelineStepSelectProps {
  value: TimelineStepSize
  onChange: (value: TimelineStepSize) => void
}

export function TimelineStepSelect({
  value,
  onChange,
}: TimelineStepSelectProps) {
  return (
    <label className="timeline-field timeline-field--step">
      <span className="timeline-field__label">Step</span>
      <select
        aria-label="Timeline step size"
        className="timeline-select"
        onChange={(event) => onChange(parseTimelineStepSize(event.target.value))}
        value={value}
      >
        {TIMELINE_STEP_SIZES.map((step) => (
          <option key={step} value={step}>
            {step} {step === 1 ? 'year' : 'years'}
          </option>
        ))}
      </select>
    </label>
  )
}
