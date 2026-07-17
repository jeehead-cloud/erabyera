import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import type { HistoricalYear } from '../../domain/time'
import {
  historicalYearFromDraft,
  historicalYearToDraft,
  type HistoricalEra,
  type HistoricalYearDraft,
} from './timelineModel'

interface HistoricalYearInputProps {
  selectedYear: HistoricalYear
  onCommit: (year: HistoricalYear) => void
}

export function HistoricalYearInput({
  selectedYear,
  onCommit,
}: HistoricalYearInputProps) {
  const inputId = useId()
  const eraId = useId()
  const errorId = useId()
  const [draft, setDraft] = useState<HistoricalYearDraft>(() =>
    historicalYearToDraft(selectedYear),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(historicalYearToDraft(selectedYear))
    setError(null)
  }, [selectedYear])

  const restoreCommittedYear = () => {
    setDraft(historicalYearToDraft(selectedYear))
    setError(null)
  }

  const commitDraft = () => {
    const result = historicalYearFromDraft(draft)
    if (!result.success) {
      setError(result.message)
      return
    }

    setError(null)
    setDraft(historicalYearToDraft(result.year))
    onCommit(result.year)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitDraft()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      restoreCommittedYear()
    }
  }

  return (
    <div className="timeline-input-group">
      <label className="timeline-field">
        <span className="timeline-field__label">Year</span>
        <input
          aria-describedby={error === null ? undefined : errorId}
          aria-invalid={error !== null}
          className="timeline-year-input"
          id={inputId}
          inputMode="numeric"
          onChange={(event) => {
            setDraft((current) => ({ ...current, magnitude: event.target.value }))
            setError(null)
          }}
          onKeyDown={handleKeyDown}
          type="text"
          value={draft.magnitude}
        />
      </label>

      <label className="timeline-field">
        <span className="timeline-field__label">Era</span>
        <select
          className="timeline-select timeline-era-select"
          id={eraId}
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              era: event.target.value as HistoricalEra,
            }))
            setError(null)
          }}
          value={draft.era}
        >
          <option value="BCE">BCE</option>
          <option value="CE">CE</option>
        </select>
      </label>

      <button className="timeline-apply" onClick={commitDraft} type="button">
        Apply
      </button>

      {error === null ? null : (
        <p className="timeline-input-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
