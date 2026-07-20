import type { EntitySourceCollection } from '../../domain/entityPages'
import { formatHistoricalYear } from '../../domain/time'
import { ExternalSourceLink } from '../ExternalSourceLink'

export function EntitySources({ sources }: { sources: EntitySourceCollection }) {
  return (
    <section className="entity-section" aria-labelledby="entity-sources-heading">
      <h2 id="entity-sources-heading">Sources ({sources.resolved.length})</h2>
      {sources.resolved.length === 0 ? <p>No resolved evidence is available for this entity.</p> : (
        <ol className="entity-sources">
          {sources.resolved.map(({ source, reference }) => (
            <li key={[source.id, reference.locator, reference.note, reference.excerptNote, reference.reviewedOn].join(':')}>
              <strong>{source.url === undefined ? source.title : <ExternalSourceLink href={source.url}>{source.title}</ExternalSourceLink>}</strong>
              {source.author === undefined && source.organization === undefined ? null : <span>{source.author ?? source.organization}</span>}
              {source.publisher === undefined && source.publicationYear === undefined ? null : <span>{[source.publisher, source.publicationYear === undefined ? undefined : formatHistoricalYear(source.publicationYear)].filter(Boolean).join(' В· ')}</span>}
              {reference.locator === undefined ? null : <span>Locator: {reference.locator}</span>}
              {reference.note === undefined ? null : <span>{reference.note}</span>}
              {reference.excerptNote === undefined ? null : <span>{reference.excerptNote}</span>}
            </li>
          ))}
        </ol>
      )}
      {sources.unresolvedSourceIds.length === 0 ? null : (
        <div className="entity-page__warning" role="status">Unresolved source references: {sources.unresolvedSourceIds.join(', ')}.</div>
      )}
    </section>
  )
}
