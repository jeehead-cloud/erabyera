import type { YearOverviewItem } from '../../domain/overview'

export function YearOverviewSection({
  heading,
  items,
  onSelect,
}: {
  heading: string
  items: readonly YearOverviewItem[]
  onSelect: (item: YearOverviewItem) => void
}) {
  if (items.length === 0) return null
  return (
    <section className="year-overview__section" aria-labelledby={`year-overview-${heading.toLowerCase().replaceAll(' ', '-')}`}>
      <h3 id={`year-overview-${heading.toLowerCase().replaceAll(' ', '-')}`}>{heading}</h3>
      <ul>
        {items.map((item) => (
          <li key={`${item.entityType}:${item.id}`}>
            <button
              aria-label={`Select ${item.entityLabel} ${item.name}`}
              onClick={() => onSelect(item)}
              type="button"
            >
              <span className="year-overview__item-copy">
                <strong>{item.name}</strong>
                <span>{item.subtype} - {item.context}</span>
              </span>
              <span className="year-overview__item-states">
                {item.mapped ? null : <span>Unmapped</span>}
                {item.layerActive ? null : <span>Layer off</span>}
                {item.confidence === null ? null : <span>{item.confidence} confidence</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
