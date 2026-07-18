import { Link, useSearchParams } from 'react-router-dom'
import { useRuntimeData } from '../data'
import { buildExploreLandingCounts, DEFAULT_CATALOG_YEAR } from '../domain/explore'
import { formatHistoricalYear, isHistoricalYear } from '../domain/time'

export function ExplorePage() {
  const runtime = useRuntimeData()
  const [params] = useSearchParams()
  const requested = Number(params.get('year'))
  const year = isHistoricalYear(requested) ? requested : DEFAULT_CATALOG_YEAR
  const catalogs = runtime.status === 'ready' ? buildExploreLandingCounts(runtime.data, year) : []
  return (
    <section className="content-page explore-page" aria-labelledby="explore-heading">
      <div className="content-page__intro">
        <p className="eyebrow">Discovery</p><h1 id="explore-heading">Explore history by subject</h1>
        <p>Browse every published historical entity, including records outside the map year, below zoom thresholds, or without reviewed geometry.</p>
      </div>
      {runtime.status === 'loading' ? <div className="empty-state" role="status"><div><h2>Loading catalogs</h2><p>The immutable runtime dataset is being prepared.</p></div></div> : null}
      {runtime.status === 'error' ? <div className="empty-state" role="alert"><div><h2>Catalogs unavailable</h2><p>{runtime.message}</p></div></div> : null}
      {runtime.status !== 'ready' ? null : (
        <div className="explore-entries" aria-label="Historical entity catalogs">
          {catalogs.map((catalog) => (
            <article key={catalog.type}>
              <div><p className="eyebrow">{catalog.publishedCount} published</p><h2>{catalog.label}</h2><p>{catalog.description}</p></div>
              <p>{catalog.activeCount} active at {formatHistoricalYear(year)}</p>
              <Link className="button button--secondary" to={`/explore/${catalog.slug}?period=current&year=${year}`}>Browse {catalog.label}</Link>
            </article>
          ))}
        </div>
      )}
      <p className="explore-page__deferred">A Sources catalog is deferred beyond F15. Full evidence is available on each entity page.</p>
    </section>
  )
}
