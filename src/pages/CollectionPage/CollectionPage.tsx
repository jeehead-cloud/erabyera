import { Link, useParams } from 'react-router-dom'
import { loadBundledSearchIndex, useRuntimeData } from '../../data'
import { createCollectionRecommendedMapHref, getCollectionById, getCollectionCounts, getCollectionMembers, groupCollectionMembers, collectionRecommendedMapState } from '../../domain/collections'
import { createEntityMapHref, entityPagePath } from '../../domain/entityPages'
import { entityIdSchema } from '../../domain/entities'
import { formatHistoricalYear, formatHistoricalYearRange } from '../../domain/time'
import type { SelectedEntityType } from '../../url'
import '../CollectionsPage/Collections.css'

const groupLabels: Readonly<Record<SelectedEntityType, string>> = { place: 'Places', polity: 'Polities', person: 'People', event: 'Events', journey: 'Journeys' }
const missingLabels: Readonly<Record<string, string>> = { 'reviewed-entities': 'Reviewed historical entity membership', territories: 'Reviewed territory coverage', places: 'Additional reviewed places', people: 'Additional reviewed people', events: 'Additional reviewed events', journeys: 'Additional reviewed journeys', 'source-review': 'Historical source review' }

function State({ title, message }: { title: string; message: string }) {
  return <section className="content-page content-page--centered"><div className="state-panel state-panel--in-shell"><p className="eyebrow">Collection</p><h1>{title}</h1><p>{message}</p><div className="state-actions"><Link className="button button--primary" to="/collections">Back to Collections</Link><Link className="button button--secondary" to="/map">Open map</Link></div></div></section>
}

export function CollectionPage() {
  const { collectionId } = useParams()
  const runtime = useRuntimeData()
  if (collectionId === undefined || !entityIdSchema.safeParse(collectionId).success) return <State title="Invalid collection reference" message="This route parameter is not a valid EraByEra collection ID." />
  if (runtime.status === 'loading') return <State title="Loading collection" message="The published runtime dataset is being prepared." />
  if (runtime.status === 'error') return <State title="Collection data unavailable" message={runtime.message} />
  const collection = getCollectionById(runtime.data, collectionId)
  if (collection === null || collection.visibility !== 'public') return <State title="Collection not found" message={`The collection “${collectionId}” is not available in the public runtime catalog.`} />
  const members = getCollectionMembers(runtime.data, collection)
  const groups = groupCollectionMembers(members)
  const counts = getCollectionCounts(members)
  const baseState = collectionRecommendedMapState(collection)
  let searchIndex = null
  try { searchIndex = loadBundledSearchIndex() } catch (error) { console.error('Collection member map links are unavailable.', error) }
  const membershipLabel = collection.membershipKind === 'reviewed' ? 'reviewed historical' : 'synthetic demonstration'
  return (
    <article className="collection-page">
      <nav className="entity-page__breadcrumbs" aria-label="Breadcrumb"><ol><li><Link to="/collections">Collections</Link></li><li aria-current="page">{collection.defaultName}</li></ol></nav>
      <header className="collection-page__header"><div><p className="eyebrow">Content collection</p><h1>{collection.defaultName}</h1><div className="collection-badges"><span>{collection.editorialStatus}</span><span>{collection.completeness.replaceAll('-', ' ')}</span><span>{collection.coverageStatus} coverage</span></div><p>{collection.description}</p></div><Link className="button button--primary" to={createCollectionRecommendedMapHref(collection)}>Open recommended map</Link></header>
      <section className="collection-section"><h2>Scope and recommended state</h2><dl className="collection-facts collection-facts--wide"><div><dt>Documented period</dt><dd>{formatHistoricalYearRange(collection.timeRange)}</dd></div><div><dt>Recommended start</dt><dd>{formatHistoricalYear(collection.recommendedStartYear)}</dd></div><div><dt>Recommended viewport</dt><dd>{collection.recommendedViewport.latitude}, {collection.recommendedViewport.longitude} at zoom {collection.recommendedViewport.zoom}</dd></div><div><dt>Dataset version</dt><dd>{collection.datasetVersion}</dd></div></dl></section>
      <section className="collection-section collection-section--notice" aria-label="Coverage note"><h2>Editorial scope</h2><p>{collection.editorialNotes}</p><p>{collection.coverage.note}</p></section>
      <div className="collection-region-grid"><section className="collection-section"><h2>Detailed focus</h2><ul>{collection.coverage.detailedRegions.map((region) => <li key={region}>{region}</li>)}</ul></section><section className="collection-section"><h2>Partial or route-level context</h2><ul>{collection.coverage.partialRegions.map((region) => <li key={region}>{region}</li>)}</ul></section></div>
      <section className="collection-section"><h2>Current linked content</h2><p>{counts.total} {membershipLabel} records: {counts.active} active at {formatHistoricalYear(collection.recommendedStartYear)} ({counts.activeMapped} mapped and {counts.activeUnmapped} unmapped).</p>{(Object.entries(groups) as [SelectedEntityType, typeof members][]).map(([type, items]) => items.length === 0 ? null : <section className="collection-member-group" key={type}><h3>{groupLabels[type]} ({items.length})</h3><ul>{items.map((item) => { const mapHref = searchIndex === null ? null : createEntityMapHref(searchIndex, item.type, item.id, collection.recommendedStartYear, baseState); return <li key={item.id}><div><strong>{item.name}</strong><span>{item.subtype.replaceAll('-', ' ')} · {item.mapped ? 'mapped' : 'unmapped'} · {membershipLabel}</span></div><div className="collection-member-actions"><Link to={entityPagePath(item.type, item.id)}>Open page</Link>{mapHref === null ? null : <Link to={mapHref}>View on map</Link>}</div></li> })}</ul></section>)}</section>
      <section className="collection-section"><h2>Content still missing</h2><ul>{collection.missingContent.map((item) => <li key={item}>{missingLabels[item] ?? item.replaceAll('-', ' ')}</li>)}</ul></section>
      <section className="collection-section"><h2>Editorial provenance</h2><p>Evidence and record-level uncertainty are listed on each linked entity page.</p></section>
      <div className="collection-actions"><Link className="button button--primary" to={createCollectionRecommendedMapHref(collection)}>Open recommended map</Link><Link className="button button--secondary" to="/explore">Browse Explore catalogs</Link></div>
    </article>
  )
}
