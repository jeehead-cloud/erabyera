import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatHistoricalYearRange } from '../../domain/time'
import type { EntityPageModel } from '../../domain/entityPages'
import './EntityPageShell.css'

export function EntityPageShell({
  model,
  mapHref,
  children,
}: {
  model: EntityPageModel
  mapHref: string | null
  children: ReactNode
}) {
  const catalogSlug = model.entityType === 'polity' ? 'polities'
    : model.entityType === 'person' ? 'people'
      : `${model.entityType}s`
  const catalogLabel = model.entityType === 'person' ? 'People'
    : model.entityType === 'polity' ? 'Polities'
      : `${model.entityType[0].toUpperCase()}${model.entityType.slice(1)}s`
  return (
    <article className="entity-page">
      <nav className="entity-page__breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/explore">Explore</Link></li>
          <li><Link to={`/explore/${catalogSlug}`}>{catalogLabel}</Link></li>
          <li aria-current="page">{model.name}</li>
        </ol>
      </nav>
      <header className="entity-page__header">
        <div>
          <p className="eyebrow">{model.entityType === 'event' && model.subtype === 'battle' ? 'Battle' : model.entityType}</p>
          <h1>{model.name}</h1>
          <div className="entity-page__badges">
            <span>{model.subtype.replaceAll('-', ' ')}</span>
            <span>{formatHistoricalYearRange(model.period)}</span>
            <span>{model.mapped ? 'Map context available' : 'No reviewed map geometry'}</span>
            {model.uncertainty === undefined ? null : <span>{model.uncertainty.confidence} confidence</span>}
          </div>
        </div>
        {mapHref === null ? null : (
          <Link className="button button--primary entity-page__map-action" to={mapHref} aria-label={`View ${model.name} on map`}>
            View on map
          </Link>
        )}
      </header>
      {model.summary === undefined ? null : <section className="entity-section"><h2>Summary</h2><p>{model.summary}</p></section>}
      {children}
      <section className="entity-section entity-section--note">
        <h2>Data notes</h2>
        <p>This page uses the immutable published runtime dataset. Unmapped does not mean historically absent, and no location or relationship is inferred from proximity.</p>
        {model.uncertainty?.note === undefined ? null : <p>{model.uncertainty.note}</p>}
      </section>
    </article>
  )
}
