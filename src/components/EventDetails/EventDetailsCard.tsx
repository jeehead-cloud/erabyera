import type { EventPresentation, ResolvedEventRelation } from '../../domain/events'
import { eventLocationLabel } from '../../domain/events'
import { formatHistoricalYear, formatHistoricalYearRange, type HistoricalYear } from '../../domain/time'
import { BattleDetails } from './BattleDetails'
import { Link } from 'react-router-dom'
import { entityPagePath } from '../../domain/entityPages'
import { ExternalSourceLink } from '../ExternalSourceLink'
import './EventDetailsCard.css'

interface EventDetailsCardProps {
  event: EventPresentation | null
  unresolvedEventId: string | null
  selectedYear: HistoricalYear
  onClose: () => void
  onGoToYear: (year: HistoricalYear) => void
}

function humanize(value: string): string {
  return value.replaceAll('-', ' ')
}

function names(relations: readonly ResolvedEventRelation[]): string {
  return relations.map((relation) => relation.name ?? 'Referenced entity unavailable').join(', ')
}

export function EventDetailsCard({ event, unresolvedEventId, selectedYear, onClose, onGoToYear }: EventDetailsCardProps) {
  if (event === null && unresolvedEventId === null) return null
  if (event === null) {
    return (
      <aside className="event-details" aria-label="Selected event details">
        <header className="event-details__header">
          <div><p className="event-details__eyebrow">Event unavailable</p><h2>Selected event could not be resolved</h2></div>
          <button aria-label="Close event details" className="event-details__close" onClick={onClose} type="button">&times;</button>
        </header>
        <p>The event reference <code>{unresolvedEventId}</code> is valid but is not present in this runtime dataset.</p>
      </aside>
    )
  }

  const primarySources = event.sources.resolved.slice(0, 2)
  const singleYear = event.period.yearTo === event.period.yearFrom
  return (
    <aside className="event-details" aria-label={`${event.kind === 'battle' ? 'Battle' : 'Event'} details for ${event.displayName}`}>
      <header className="event-details__header">
        <div><p className="event-details__eyebrow">{event.kind === 'battle' ? 'Battle' : 'Event'}</p><h2>{event.displayName}</h2></div>
        <button aria-label="Close event details" className="event-details__close" onClick={onClose} type="button">&times;</button>
      </header>

      <div className="event-details__badges">
        <span>{humanize(event.type)}</span>
        <span className={event.active ? 'is-active' : 'is-inactive'}>{event.active ? `Active in ${formatHistoricalYear(selectedYear)}` : `Inactive in ${formatHistoricalYear(selectedYear)}`}</span>
        <span>{eventLocationLabel(event.locationAccuracy, event.locationAvailable)}</span>
        {event.uncertainty === undefined ? null : <span>{humanize(event.uncertainty.confidence)} confidence</span>}
      </div>

      {event.summary === undefined ? null : <p>{event.summary}</p>}
      <Link className="button button--secondary" to={entityPagePath('event', event.id)}>View full page</Link>
      <dl className="event-details__facts">
        <div><dt>Period</dt><dd>{formatHistoricalYearRange(event.period)}</dd></div>
        {event.participantPolities.length === 0 ? null : <div><dt>Polities</dt><dd>{names(event.participantPolities)}</dd></div>}
        {event.participantPeople.length === 0 ? null : <div><dt>People</dt><dd>{names(event.participantPeople)}</dd></div>}
        {event.relatedPlaces.length === 0 ? null : <div><dt>Places</dt><dd>{names(event.relatedPlaces)}</dd></div>}
      </dl>

      {!event.locationAvailable ? <div className="event-details__notice"><p>No reviewed map location is available. No marker or inferred coordinate is shown.</p></div> : null}
      {event.locationAvailable && event.locationAccuracy !== 'exact' ? <div className="event-details__notice"><p>This point represents a {humanize(event.locationAccuracy ?? 'location with unspecified accuracy')} and must not be read as a precise site.</p></div> : null}
      {event.uncertainty?.note === undefined ? null : <p className="event-details__note">{event.uncertainty.note}</p>}
      {!event.active ? (
        <div className="event-details__notice">
          <p>This event is not active in the selected year. Its card remains available because it was explicitly selected.</p>
          <button onClick={() => onGoToYear(event.firstActiveYear)} type="button">{singleYear ? 'Go to event year' : 'Go to first event year'}</button>
          {singleYear || event.nearestActiveYear === null || event.nearestActiveYear === event.firstActiveYear ? null : <button onClick={() => onGoToYear(event.nearestActiveYear as HistoricalYear)} type="button">Go to nearest event year</button>}
        </div>
      ) : null}

      {event.kind === 'battle' ? <BattleDetails battle={event} /> : null}

      <section className="event-details__sources" aria-labelledby="event-sources-heading">
        <h3 id="event-sources-heading">Sources ({event.sources.resolved.length})</h3>
        {primarySources.length === 0 ? <p>No resolved source is available for this event presentation.</p> : (
          <ol>{primarySources.map(({ source, reference }) => (
            <li key={[source.id, reference.locator, reference.note, reference.excerptNote].join(':')}>
              {source.url === undefined ? source.title : <ExternalSourceLink href={source.url}>{source.title}</ExternalSourceLink>}
              {source.author === undefined && source.organization === undefined ? null : <span>{source.author ?? source.organization}</span>}
              {reference.locator === undefined ? null : <span>{reference.locator}</span>}
            </li>
          ))}</ol>
        )}
        {event.sources.unresolvedSourceIds.length === 0 ? null : <p className="event-details__source-warning">Some referenced sources could not be resolved.</p>}
      </section>
    </aside>
  )
}
