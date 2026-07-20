import type { PolityPresentation } from '../../domain/polities'
import { formatHistoricalYear, formatHistoricalYearRange, type HistoricalYear } from '../../domain/time'
import { Link } from 'react-router-dom'
import { entityPagePath } from '../../domain/entityPages'
import { ExternalSourceLink } from '../ExternalSourceLink'
import './PolityDetailsCard.css'

interface PolityDetailsCardProps {
  polity: PolityPresentation | null
  unresolvedPolityId: string | null
  selectedYear: HistoricalYear
  onClose: () => void
  onGoToYear: (year: HistoricalYear) => void
}

function humanize(value: string): string {
  return value.replaceAll('-', ' ')
}

export function PolityDetailsCard({
  polity,
  unresolvedPolityId,
  selectedYear,
  onClose,
  onGoToYear,
}: PolityDetailsCardProps) {
  if (polity === null && unresolvedPolityId === null) return null

  if (polity === null) {
    return (
      <aside className="polity-details" aria-label="Selected polity details">
        <header className="polity-details__header">
          <div><p className="polity-details__eyebrow">Polity unavailable</p><h2>Selected polity could not be resolved</h2></div>
          <button aria-label="Close polity details" className="polity-details__close" onClick={onClose} type="button">&times;</button>
        </header>
        <p>The polity reference <code>{unresolvedPolityId}</code> is valid but is not present in this runtime dataset.</p>
      </aside>
    )
  }

  const primarySources = polity.sources.resolved.slice(0, 2)
  return (
    <aside className="polity-details" aria-label={`Polity details for ${polity.displayName}`}>
      <header className="polity-details__header">
        <div><p className="polity-details__eyebrow">Polity</p><h2>{polity.displayName}</h2></div>
        <button aria-label="Close polity details" className="polity-details__close" onClick={onClose} type="button">&times;</button>
      </header>

      <div className="polity-details__badges">
        <span>{humanize(polity.polityType)}</span>
        <span className={polity.active ? 'is-active' : 'is-inactive'}>{polity.active ? `Active in ${formatHistoricalYear(selectedYear)}` : `Inactive in ${formatHistoricalYear(selectedYear)}`}</span>
        {polity.uncertainty === undefined ? null : <span>{humanize(polity.uncertainty.confidence)} confidence</span>}
      </div>

      {polity.summary === undefined ? null : <p>{polity.summary}</p>}
      <Link className="button button--secondary" to={entityPagePath('polity', polity.id)}>View full page</Link>
      <dl className="polity-details__facts">
        <div><dt>Existence</dt><dd>{formatHistoricalYearRange(polity.existence)}</dd></div>
        <div><dt>Capital</dt><dd>{polity.capitals.length === 0 ? 'No active capital recorded' : polity.capitals.map((capital) => capital.name ?? 'Referenced place unavailable').join(', ')}</dd></div>
        <div><dt>Ruler</dt><dd>{polity.rulers.length === 0 ? 'No active ruler recorded' : polity.rulers.map((ruler) => `${ruler.name ?? 'Referenced person unavailable'}${ruler.title === undefined ? '' : ` · ${ruler.title}`}`).join(', ')}</dd></div>
        <div><dt>Territory</dt><dd>{polity.territories.length === 0 ? 'No active territory interpretation' : polity.territories.map((territory) => `${humanize(territory.controlCategory)} · ${humanize(territory.uncertainty?.confidence ?? 'unknown')} confidence`).join(', ')}</dd></div>
      </dl>

      {polity.active && !polity.hasActiveGeometry ? (
        <div className="polity-details__notice"><p>This polity is active in the selected year, but no territory geometry is available. Its existence is not inferred from a polygon.</p></div>
      ) : null}
      {!polity.active ? (
        <div className="polity-details__notice">
          <p>This polity is not active in the selected year. The explicitly selected record remains inspectable, without showing inactive territory as current.</p>
          <button onClick={() => onGoToYear(polity.firstActiveYear)} type="button">Go to first active year</button>
          {polity.nearestActiveYear === null || polity.nearestActiveYear === polity.firstActiveYear ? null : <button onClick={() => onGoToYear(polity.nearestActiveYear as HistoricalYear)} type="button">Go to nearest active year</button>}
        </div>
      ) : null}
      {!polity.hasActiveGeometry && polity.nearestMappedYear !== null ? (
        <div className="polity-details__notice"><button onClick={() => onGoToYear(polity.nearestMappedYear as HistoricalYear)} type="button">Go to nearest mapped year</button></div>
      ) : null}

      <section className="polity-details__sources" aria-labelledby="polity-sources-heading">
        <h3 id="polity-sources-heading">Sources ({polity.sources.resolved.length})</h3>
        {primarySources.length === 0 ? <p>No resolved source is available for this selected-year presentation.</p> : (
          <ol>{primarySources.map(({ source, reference }) => (
            <li key={[source.id, reference.locator, reference.note, reference.excerptNote].join(':')}>
              {source.url === undefined ? source.title : <ExternalSourceLink href={source.url}>{source.title}</ExternalSourceLink>}
              {source.author === undefined && source.organization === undefined ? null : <span>{source.author ?? source.organization}</span>}
              {reference.locator === undefined ? null : <span>{reference.locator}</span>}
            </li>
          ))}</ol>
        )}
        {polity.sources.unresolvedSourceIds.length === 0 ? null : <p className="polity-details__source-warning">Some referenced sources could not be resolved.</p>}
      </section>
    </aside>
  )
}
