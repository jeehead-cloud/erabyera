import type { RouteStagePresentation } from '../../domain/journeys'
import { formatHistoricalYear, formatHistoricalYearRange } from '../../domain/time'

function stageTitle(stage: RouteStagePresentation): string {
  const names = [stage.place?.name, stage.event?.name].filter((name): name is string => name !== null && name !== undefined)
  if (names.length > 0) return names.join(' / ')
  if (stage.coordinates !== null) return 'Coordinate-only stage'
  return 'Referenced stage unavailable'
}

function stagePosition(index: number, count: number): string {
  if (count === 1) return 'Start and end'
  if (index === 0) return 'Start'
  if (index === count - 1) return 'End'
  return 'Stage'
}

export function RouteStages({ stages }: { stages: readonly RouteStagePresentation[] }) {
  return (
    <section className="journey-details__stages">
      <h3>Route stages</h3>
      <ol>
        {stages.map((stage, index) => {
          const primarySource = stage.sources.resolved[0]
          return (
            <li key={stage.order}>
              <strong>{stage.order}. {stagePosition(index, stages.length)}: {stageTitle(stage)}</strong>
              {stage.year === null ? null : <span>{formatHistoricalYear(stage.year)}</span>}
              {stage.period === null ? null : <span>{formatHistoricalYearRange(stage.period)}</span>}
              {stage.uncertainty === undefined ? null : (
                <span>{stage.uncertainty.confidence} confidence{stage.uncertainty.note === undefined ? '' : ` - ${stage.uncertainty.note}`}</span>
              )}
              {primarySource === undefined ? null : (
                <span>Source: {primarySource.source.title}{primarySource.reference.locator === undefined ? '' : ` - ${primarySource.reference.locator}`}</span>
              )}
              {stage.sources.resolved.length <= 1 ? null : <span>{stage.sources.resolved.length} stage references</span>}
              {stage.sources.unresolvedSourceIds.length === 0 ? null : <span>Some stage references are unavailable.</span>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
