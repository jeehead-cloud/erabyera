import { formatHistoricalYear, formatHistoricalYearRange, type HistoricalYear } from '../../domain/time'
import type { PlacePresentation } from '../../domain/places'
import { Link } from 'react-router-dom'
import { entityPagePath } from '../../domain/entityPages'
import { ExternalSourceLink } from '../ExternalSourceLink'
import './PlaceDetailsCard.css'

interface PlaceDetailsCardProps {
  place: PlacePresentation | null
  unresolvedPlaceId: string | null
  selectedYear: HistoricalYear
  onClose: () => void
  onGoToYear: (year: HistoricalYear) => void
}

function humanize(value: string): string {
  return value.replaceAll('-', ' ')
}

export function PlaceDetailsCard({
  place,
  unresolvedPlaceId,
  selectedYear,
  onClose,
  onGoToYear,
}: PlaceDetailsCardProps) {
  if (place === null && unresolvedPlaceId === null) return null

  if (place === null) {
    return (
      <aside className="place-details" aria-label="Selected place details">
        <div className="place-details__header">
          <div>
            <p className="place-details__eyebrow">Place unavailable</p>
            <h2>Selected place could not be resolved</h2>
          </div>
          <button aria-label="Close place details" className="place-details__close" onClick={onClose} type="button">×</button>
        </div>
        <p>The place reference <code>{unresolvedPlaceId}</code> is valid but is not present in this runtime dataset.</p>
      </aside>
    )
  }

  const primarySources = place.sources.resolved.slice(0, 2)

  return (
    <aside className="place-details" aria-label={`Place details for ${place.displayName}`}>
      <div className="place-details__header">
        <div>
          <p className="place-details__eyebrow">Place</p>
          <h2>{place.displayName}</h2>
          {place.displayName === place.defaultName ? null : (
            <p className="place-details__default-name">Default name: {place.defaultName}</p>
          )}
        </div>
        <button aria-label="Close place details" className="place-details__close" onClick={onClose} type="button">×</button>
      </div>

      <div className="place-details__badges">
        <span>{humanize(place.placeType)}</span>
        <span className={place.active ? 'is-active' : 'is-inactive'}>
          {place.active ? `Active in ${formatHistoricalYear(selectedYear)}` : `Inactive in ${formatHistoricalYear(selectedYear)}`}
        </span>
        {place.uncertainty === undefined ? null : <span>{humanize(place.uncertainty.confidence)} confidence</span>}
      </div>

      {place.summary === undefined ? null : <p>{place.summary}</p>}
      <Link className="button button--secondary" to={entityPagePath('place', place.id)}>View full page</Link>

      <dl className="place-details__facts">
        <div><dt>Existence</dt><dd>{formatHistoricalYearRange(place.existence)}</dd></div>
        {place.ownership === null ? null : (
          <div><dt>Owner</dt><dd>{place.ownership.polityName ?? 'Referenced polity unavailable'}{place.ownership.controlType === undefined ? '' : ` · ${humanize(place.ownership.controlType)}`}</dd></div>
        )}
        {place.importance === null ? null : <div><dt>Importance</dt><dd>{place.importance} of 5</dd></div>}
        {place.coordinates === undefined ? (
          <div><dt>Location</dt><dd>Coordinates unavailable</dd></div>
        ) : (
          <div><dt>Location</dt><dd>{place.coordinates[1]}, {place.coordinates[0]}{place.uncertainty === undefined ? '' : ` · ${humanize(place.uncertainty.locationAccuracy)}`}</dd></div>
        )}
      </dl>

      {place.uncertainty?.note === undefined ? null : <p className="place-details__note">{place.uncertainty.note}</p>}

      {!place.active ? (
        <div className="place-details__inactive-actions">
          <p>This place is not active in the selected year. The record remains available because it was explicitly selected.</p>
          <button onClick={() => onGoToYear(place.firstKnownYear)} type="button">Go to first known year</button>
          {place.nearestActiveYear === null || place.nearestActiveYear === place.firstKnownYear ? null : (
            <button onClick={() => onGoToYear(place.nearestActiveYear as HistoricalYear)} type="button">Go to nearest active year</button>
          )}
        </div>
      ) : null}

      <section className="place-details__sources" aria-labelledby="place-sources-heading">
        <h3 id="place-sources-heading">Sources ({place.sources.resolved.length})</h3>
        {primarySources.length === 0 ? <p>No resolved source is available for this selected-year presentation.</p> : (
          <ol>
            {primarySources.map(({ source, reference }) => (
              <li key={[source.id, reference.locator, reference.note, reference.excerptNote].join(':')}>
                {source.url === undefined ? source.title : (
                  <ExternalSourceLink href={source.url}>{source.title}</ExternalSourceLink>
                )}
                {source.author === undefined && source.organization === undefined ? null : <span>{source.author ?? source.organization}</span>}
                {reference.locator === undefined ? null : <span>{reference.locator}</span>}
              </li>
            ))}
          </ol>
        )}
        {place.sources.unresolvedSourceIds.length === 0 ? null : (
          <p className="place-details__source-warning">Some referenced sources could not be resolved.</p>
        )}
      </section>
    </aside>
  )
}
