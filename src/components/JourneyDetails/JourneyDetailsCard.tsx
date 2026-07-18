import type { JourneyPresentation, ResolvedJourneyRelation } from '../../domain/journeys'
import {
  journeyDirectionLabel,
  journeyTypeLabel,
  routeCertaintyLabel,
} from '../../domain/journeys'
import { formatHistoricalYear, formatHistoricalYearRange, type HistoricalYear } from '../../domain/time'
import { RouteStages } from './RouteStages'
import { Link } from 'react-router-dom'
import { entityPagePath } from '../../domain/entityPages'
import './JourneyDetailsCard.css'

function names(relations: readonly ResolvedJourneyRelation[]): string {
  return relations.map((relation) => relation.name ?? 'Referenced entity unavailable').join(', ')
}

export function JourneyDetailsCard({
  journey,
  unresolvedJourneyId,
  selectedYear,
  onClose,
  onGoToYear,
}: {
  journey: JourneyPresentation | null
  unresolvedJourneyId: string | null
  selectedYear: HistoricalYear
  onClose: () => void
  onGoToYear: (year: HistoricalYear) => void
}) {
  if (journey === null && unresolvedJourneyId === null) return null
  if (journey === null) {
    return (
      <aside className="journey-details" aria-label="Selected journey details">
        <header className="journey-details__header">
          <div><p className="journey-details__eyebrow">Journey unavailable</p><h2>Selected journey could not be resolved</h2></div>
          <button aria-label="Close journey details" className="journey-details__close" onClick={onClose} type="button">&times;</button>
        </header>
        <p>The journey reference <code>{unresolvedJourneyId}</code> is valid but absent from this runtime dataset.</p>
      </aside>
    )
  }

  const primarySources = journey.sources.resolved.slice(0, 2)
  return (
    <aside className="journey-details" aria-label={`Journey details for ${journey.displayName}`}>
      <header className="journey-details__header">
        <div><p className="journey-details__eyebrow">Journey or campaign</p><h2>{journey.displayName}</h2></div>
        <button aria-label="Close journey details" className="journey-details__close" onClick={onClose} type="button">&times;</button>
      </header>
      <div className="journey-details__badges">
        <span>{journeyTypeLabel(journey.journeyType)}</span>
        <span className={journey.active ? 'is-active' : 'is-inactive'}>{journey.active ? `Active in ${formatHistoricalYear(selectedYear)}` : `Inactive in ${formatHistoricalYear(selectedYear)}`}</span>
        <span>{routeCertaintyLabel(journey.routeCertainty)}</span>
      </div>
      {journey.summary === undefined ? null : <p>{journey.summary}</p>}
      <Link className="button button--secondary" to={entityPagePath('journey', journey.id)}>View full page</Link>
      <dl className="journey-details__facts">
        <div><dt>Period</dt><dd>{formatHistoricalYearRange(journey.period)}</dd></div>
        <div><dt>Route</dt><dd>{journey.geometryAvailable ? 'Reviewed route geometry available' : 'No reviewed route geometry available'}</dd></div>
        <div><dt>Direction</dt><dd>{journeyDirectionLabel(journey.directionKnown)}</dd></div>
        {journey.participantPeople.length === 0 ? null : <div><dt>People</dt><dd>{names(journey.participantPeople)}</dd></div>}
        {journey.participantPolities.length === 0 ? null : <div><dt>Polities</dt><dd>{names(journey.participantPolities)}</dd></div>}
        {journey.relatedPlaces.length === 0 ? null : <div><dt>Places</dt><dd>{names(journey.relatedPlaces)}</dd></div>}
        {journey.relatedEvents.length === 0 ? null : <div><dt>Events</dt><dd>{names(journey.relatedEvents)}</dd></div>}
      </dl>
      {journey.uncertainty === undefined ? null : <p className="journey-details__note"><strong>{journey.uncertainty.confidence} confidence.</strong> {journey.uncertainty.note}</p>}
      <RouteStages stages={journey.stages} />
      {!journey.active ? (
        <div className="journey-details__notice">
          <p>This journey is outside its active period. Any selected route line is shown as inactive context, not current movement.</p>
          <button onClick={() => onGoToYear(journey.nearestActiveYear ?? journey.firstActiveYear)} type="button">Go to journey year</button>
        </div>
      ) : null}
      {journey.active && !journey.geometryAvailable ? (
        <div className="journey-details__notice"><p>This journey is active, but no reviewed route geometry is available. No path has been fabricated.</p></div>
      ) : null}
      <section className="journey-details__sources">
        <h3>Sources ({journey.sources.resolved.length})</h3>
        {primarySources.length === 0 ? <p>No resolved journey evidence is available.</p> : (
          <ol>{primarySources.map(({ source, reference }) => (
            <li key={[source.id, reference.locator, reference.note].join(':')}>
              {source.url === undefined ? source.title : <a href={source.url} rel="noreferrer" target="_blank">{source.title}</a>}
              {reference.locator === undefined ? null : <span>{reference.locator}</span>}
            </li>
          ))}</ol>
        )}
        {journey.sources.unresolvedSourceIds.length === 0 ? null : <p className="journey-details__source-warning">Some referenced sources could not be resolved.</p>}
      </section>
    </aside>
  )
}
