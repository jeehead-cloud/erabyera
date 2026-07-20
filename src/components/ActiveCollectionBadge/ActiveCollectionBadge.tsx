import { Link } from 'react-router-dom'
import type { ActiveCollectionPresentation } from '../../domain/collections'
import { formatHistoricalYear } from '../../domain/time'
import './ActiveCollectionBadge.css'

export function ActiveCollectionBadge({
  presentation,
  selectedYear,
  onReset,
  onLeave,
}: {
  presentation: ActiveCollectionPresentation | null
  selectedYear: number
  onReset: () => void
  onLeave: () => void
}) {
  if (presentation === null) return null
  if (presentation.state === 'unresolved') return (
    <aside className="active-collection active-collection--warning" aria-label="Collection unavailable">
      <strong>Collection unavailable</strong>
      <p>{presentation.messages[0]}</p>
      <button className="button button--secondary" type="button" onClick={onLeave}>Clear unavailable collection</button>
    </aside>
  )
  const collection = presentation.collection
  return (
    <details className="active-collection">
      <summary><span><strong>{collection.defaultName}</strong><small>{formatHistoricalYear(selectedYear)} · {presentation.periodState === 'inside' ? 'within range' : 'outside range'}</small></span></summary>
      <div className="active-collection__body">
        <p><strong>{collection.completeness.replaceAll('-', ' ')}</strong> · {collection.coverageStatus} coverage</p>
        {presentation.messages.map((message) => <p key={message}>{message}</p>)}
        <p>{presentation.counts.active} linked demonstrations active at this year: {presentation.counts.activeMapped} mapped and {presentation.counts.activeUnmapped} unmapped.</p>
        <div className="active-collection__actions">
          <Link className="button button--secondary" to={`/collections/${collection.id}`}>Collection page</Link>
          <button className="button button--secondary" type="button" onClick={onReset}>Reset to recommended view</button>
          <button className="button button--secondary" type="button" onClick={onLeave}>Leave collection</button>
        </div>
      </div>
    </details>
  )
}
