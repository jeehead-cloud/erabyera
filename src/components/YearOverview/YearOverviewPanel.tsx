import type { YearOverviewItem, YearOverviewPresentation } from '../../domain/overview'
import { YearOverviewSection } from './YearOverviewSection'
import './YearOverviewPanel.css'

function countSummary(overview: YearOverviewPresentation): string {
  const counts = overview.coverage.entities
  return `${counts.events.active} events, ${counts.polities.active} polities, ${counts.places.active} places, ${counts.people.mapped} mapped people, and ${counts.journeys.active} journeys active in this dataset.`
}

export function YearOverviewPanel({
  overview,
  onSelect,
}: {
  overview: YearOverviewPresentation | null
  onSelect: (item: YearOverviewItem) => void
}) {
  if (overview === null) return null
  const collection = overview.collection
  return (
    <aside className="year-overview" aria-labelledby="year-overview-heading">
      <header className="year-overview__header">
        <p className="year-overview__eyebrow">Selected year overview</p>
        <h2 id="year-overview-heading">{overview.formattedYear}</h2>
        <span className="year-overview__dataset">{collection.state === 'resolved' ? collection.name : overview.datasetName}</span>
      </header>

      <div className="year-overview__coverage-intro" role={overview.emptyState === 'content' ? undefined : 'status'}>
        <p>{overview.coverage.message}</p>
        {overview.coverage.fixtureWarning === null ? null : <p>{overview.coverage.fixtureWarning}</p>}
        {overview.coverage.layerFiltersHideActiveContent ? <p>Some active overview items belong to disabled map layers. Selecting one preserves those filters and opens its existing card.</p> : null}
      </div>

      <YearOverviewSection heading="Key events" items={overview.events} onSelect={onSelect} />
      <YearOverviewSection heading="Major polities" items={overview.polities} onSelect={onSelect} />
      <YearOverviewSection heading="Important places" items={overview.places} onSelect={onSelect} />
      <YearOverviewSection heading="Active people" items={overview.people} onSelect={onSelect} />
      <YearOverviewSection heading="Journeys and campaigns" items={overview.journeys} onSelect={onSelect} />

      <footer className="year-overview__footer">
        <h3>Coverage</h3>
        <p>{countSummary(overview)}</p>
        <p>{overview.coverage.totalPublishedRecords} published runtime records. Dataset {overview.datasetVersion}.</p>
        {collection.state === 'resolved' ? (
          <>
            <p><strong>{collection.coverageStatus} collection coverage.</strong> {collection.coverageNote}</p>
            {collection.detailedRegions.length === 0 ? null : <p>Detailed regions: {collection.detailedRegions.join(', ')}.</p>}
            {collection.partialRegions.length === 0 ? null : <p>Partial regions: {collection.partialRegions.join(', ')}.</p>}
            {collection.inSelectedYear === false ? <p>The selected year is outside this collection's coverage period.</p> : null}
          </>
        ) : null}
        {collection.state === 'unresolved' ? <p>{collection.coverageNote}</p> : null}
      </footer>
    </aside>
  )
}
