import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { loadBundledSearchIndex, useRuntimeData } from '../../data'
import { createEntityMapHref, entityPagePath } from '../../domain/entityPages'
import {
  buildExploreCatalog,
  catalogDefinition,
  parseCatalogQuery,
  serializeCatalogQuery,
  type CatalogPeriodFilter,
  type CatalogSort,
  type ExploreCatalogType,
} from '../../domain/explore'
import { formatHistoricalYear, formatHistoricalYearRange, isHistoricalYear } from '../../domain/time'
import type { SearchIndex } from '../../domain/search'
import './ExploreCatalogPage.css'

function label(value: string): string { return value.replaceAll('-', ' ').replace(/^./, (character) => character.toUpperCase()) }

export function ExploreCatalogPage({ catalogType }: { catalogType: ExploreCatalogType }) {
  const [params, setParams] = useSearchParams()
  const runtime = useRuntimeData()
  const [searchIndex] = useState<Readonly<SearchIndex> | null>(() => {
    try { return loadBundledSearchIndex() } catch (error) { console.error('Catalog search index failed safely.', error); return null }
  })
  const state = parseCatalogQuery(params, catalogType)
  const definition = catalogDefinition(catalogType)
  const model = useMemo(() => runtime.status === 'ready' ? buildExploreCatalog(runtime.data, searchIndex, catalogType, state) : null, [catalogType, runtime, searchIndex, state.period, state.query, state.sort, state.year])
  const update = (change: Partial<typeof state>) => setParams(serializeCatalogQuery({ ...state, ...change }, catalogType, params))

  return (
    <section className="catalog-page" aria-labelledby="catalog-heading">
      <nav className="entity-page__breadcrumbs" aria-label="Breadcrumb"><ol><li><Link to="/explore">Explore</Link></li><li aria-current="page">{definition.label}</li></ol></nav>
      <header className="catalog-page__header"><p className="eyebrow">Explore catalog</p><h1 id="catalog-heading">{definition.label}</h1><p>{definition.description}</p></header>
      <div className="catalog-filters" aria-label="Catalog filters">
        <label>Search this catalog<input type="search" maxLength={200} value={state.query} onChange={(event) => update({ query: event.target.value })} disabled={searchIndex === null} /></label>
        <fieldset><legend>Period</legend>{(['current', 'all'] as CatalogPeriodFilter[]).map((period) => <label key={period}><input type="radio" name="catalog-period" checked={state.period === period} onChange={() => update({ period })} />{period === 'current' ? 'Current year' : 'All periods'}</label>)}</fieldset>
        <label>Catalog year<input type="number" step="1" value={state.year} onChange={(event) => { const year = Number(event.target.value); if (isHistoricalYear(year)) update({ year }) }} /></label>
        <label>Sort<select value={state.sort} onChange={(event) => update({ sort: event.target.value as CatalogSort })}>{(model?.allowedSorts ?? ['name']).map((sort) => <option key={sort} value={sort}>{label(sort)}</option>)}</select></label>
      </div>
      {searchIndex === null ? <p className="catalog-page__notice" role="status">Search unavailable. Unfiltered catalog browsing remains available.</p> : null}
      {runtime.status === 'loading' ? <p role="status">Loading published records.</p> : null}
      {runtime.status === 'error' ? <div className="state-panel state-panel--in-shell" role="alert"><h2>Catalog unavailable</h2><p>{runtime.message}</p></div> : null}
      {model === null ? null : (
        <>
          <p className="catalog-page__count" role="status" aria-live="polite">{model.items.length} result{model.items.length === 1 ? '' : 's'} В· {model.publishedCount} published В· {model.activeCount} active at {formatHistoricalYear(state.year)}</p>
          {model.searchUnavailable ? <p className="catalog-page__notice">The requested search was not applied because the generated search index is unavailable.</p> : null}
          {model.items.length === 0 ? <div className="empty-state"><div><h2>No matching published records</h2><p>No record matches the current catalog filters. This reflects the current dataset and does not imply an absence of historical activity.</p></div></div> : (
            <ul className="catalog-list">
              {model.items.map((item) => {
                const mapHref = searchIndex === null ? null : createEntityMapHref(searchIndex, catalogType, item.model.id, item.match?.targetYear ?? state.year)
                return <li key={item.model.id}><div className="catalog-row__main"><p className="eyebrow">{label(item.model.subtype)} В· {item.mapped ? 'mapped' : 'unmapped'}</p><h2>{item.model.name}</h2><p>{formatHistoricalYearRange(item.model.period)} В· {item.active ? `Active at ${formatHistoricalYear(state.year)}` : `Outside ${formatHistoricalYear(state.year)}`}</p>{item.match === null || item.match.matchedName === item.model.name ? null : <p>Matched historical name: <strong>{item.match.matchedName}</strong></p>}{item.model.uncertainty === undefined ? null : <p>{label(item.model.uncertainty.confidence)} confidence</p>}</div><div className="catalog-row__actions"><Link className="button button--secondary" to={entityPagePath(catalogType, item.model.id)}>Open page</Link>{mapHref === null ? null : <Link className="button button--primary" to={mapHref} aria-label={`View ${item.model.name} on map`}>View on map</Link>}</div></li>
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
