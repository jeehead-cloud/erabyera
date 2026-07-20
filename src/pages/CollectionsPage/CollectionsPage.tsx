import { Link } from 'react-router-dom'
import { useRuntimeData } from '../../data'
import { createCollectionRecommendedMapHref, getCollectionCounts, getCollectionMembers, getPublicCollections } from '../../domain/collections'
import { formatHistoricalYear, formatHistoricalYearRange } from '../../domain/time'
import './Collections.css'

export function CollectionsPage() {
  const runtime = useRuntimeData()
  return (
    <section className="content-page collections-page" aria-labelledby="collections-heading">
      <header className="content-page__intro">
        <p className="eyebrow">Curated content scopes</p>
        <h1 id="collections-heading">Collections</h1>
        <p>Collections provide a recommended time, map view, and explicit coverage context without hiding the physical world beyond their current content focus.</p>
      </header>
      {runtime.status === 'loading' ? <p role="status">Loading published collections.</p> : null}
      {runtime.status === 'error' ? <div className="state-panel state-panel--in-shell" role="alert"><h2>Collections unavailable</h2><p>{runtime.message}</p></div> : null}
      {runtime.status === 'ready' ? (
        <div className="collection-list">
          {getPublicCollections(runtime.data).map((collection) => {
            const counts = getCollectionCounts(getCollectionMembers(runtime.data, collection))
            return (
              <article className="collection-card" key={collection.id}>
                <div>
                  <p className="eyebrow">{collection.completeness.replaceAll('-', ' ')}</p>
                  <h2><Link to={`/collections/${collection.id}`}>{collection.defaultName}</Link></h2>
                  <p>{collection.description}</p>
                </div>
                <dl className="collection-facts">
                  <div><dt>Period</dt><dd>{formatHistoricalYearRange(collection.timeRange)}</dd></div>
                  <div><dt>Recommended start</dt><dd>{formatHistoricalYear(collection.recommendedStartYear)}</dd></div>
                  <div><dt>Coverage</dt><dd>{collection.coverageStatus}</dd></div>
                  <div><dt>Foundation demonstrations</dt><dd>{counts.total}</dd></div>
                </dl>
                <p><strong>Detailed focus:</strong> {collection.coverage.detailedRegions.join(', ')}.</p>
                <p className="collection-notice">Linked counts are synthetic foundation demonstrations, not reviewed historical records.</p>
                <div className="collection-actions">
                  <Link className="button button--secondary" to={`/collections/${collection.id}`}>Open collection</Link>
                  <Link className="button button--primary" to={createCollectionRecommendedMapHref(collection)}>Open on map</Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
