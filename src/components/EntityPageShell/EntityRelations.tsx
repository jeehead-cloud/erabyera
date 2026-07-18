import { Link } from 'react-router-dom'
import { entityPagePath, type EntityRelationItem } from '../../domain/entityPages'

export function EntityRelations({ relations }: { relations: readonly EntityRelationItem[] }) {
  return (
    <section className="entity-section" aria-labelledby="entity-relations-heading">
      <h2 id="entity-relations-heading">Related entities</h2>
      {relations.length === 0 ? <p>No explicit related entities are recorded.</p> : (
        <ul className="entity-relations">
          {relations.map((relation) => (
            <li key={`${relation.entityType}:${relation.id}:${relation.context}`}>
              <div><span className="entity-relations__type">{relation.entityType}</span><strong>{relation.name ?? 'Referenced entity unavailable'}</strong></div>
              <span>{relation.context}</span>
              {relation.name === null ? <span className="entity-relations__unresolved">Unresolved reference: {relation.id}</span> : <Link to={entityPagePath(relation.entityType, relation.id)}>Open page</Link>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

