import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EntityPageShell, EntityRelations, EntitySources } from '../../components/EntityPageShell'
import { loadBundledSearchIndex, useRuntimeData } from '../../data'
import { entityIdSchema } from '../../domain/entities'
import { buildEntityPageModel, createEntityMapHref, type EntityPageModel } from '../../domain/entityPages'
import { eventLocationLabel } from '../../domain/events'
import { journeyDirectionLabel, routeCertaintyLabel } from '../../domain/journeys'
import { formatHistoricalYear, formatHistoricalYearRange, isHistoricalYear } from '../../domain/time'
import type { SelectedEntityType } from '../../url'
import { getCollectionsForEntity } from '../../domain/collections'

function humanize(value: string): string { return value.replaceAll('-', ' ') }

function PageState({ title, message }: { title: string; message: string }) {
  return (
    <section className="content-page content-page--centered" aria-labelledby="entity-state-heading">
      <div className="state-panel state-panel--in-shell">
        <p className="eyebrow">Entity page</p><h1 id="entity-state-heading">{title}</h1><p>{message}</p>
        <div className="state-actions"><Link className="button button--primary" to="/explore">Back to Explore</Link><Link className="button button--secondary" to="/map">Open map</Link></div>
      </div>
    </section>
  )
}

function KeyFacts({ model }: { model: EntityPageModel }) {
  if (model.entityType === 'place') return (
    <section className="entity-section"><h2>Key facts</h2><dl className="entity-facts">
      <div><dt>Type</dt><dd>{humanize(model.record.placeType)}</dd></div>
      <div><dt>Existence</dt><dd>{formatHistoricalYearRange(model.record.existence)}</dd></div>
      <div><dt>Default name</dt><dd>{model.record.defaultName}</dd></div>
      <div><dt>Coordinates</dt><dd>{model.record.coordinates === undefined ? 'Unavailable' : `${model.record.coordinates[1]}, ${model.record.coordinates[0]}`}</dd></div>
      <div><dt>Location accuracy</dt><dd>{model.record.uncertainty === undefined ? 'Unspecified' : humanize(model.record.uncertainty.locationAccuracy)}</dd></div>
      <div><dt>Current page context</dt><dd>{formatHistoricalYear(model.contextYear)}</dd></div>
    </dl></section>
  )
  if (model.entityType === 'polity') return (
    <section className="entity-section"><h2>Key facts</h2><dl className="entity-facts">
      <div><dt>Type</dt><dd>{humanize(model.record.polityType)}</dd></div>
      <div><dt>Active period</dt><dd>{formatHistoricalYearRange(model.record.existence)}</dd></div>
      <div><dt>Territory evidence</dt><dd>{model.territoryPeriods.length} period{model.territoryPeriods.length === 1 ? '' : 's'}</dd></div>
      <div><dt>Mapped territory</dt><dd>{model.mapped ? 'Reviewed geometry available' : 'No reviewed geometry'}</dd></div>
      <div><dt>Control categories</dt><dd>{[...new Set(model.territoryPeriods.map((item) => humanize(item.controlCategory)))].join(', ') || 'None recorded'}</dd></div>
      <div><dt>Current page context</dt><dd>{formatHistoricalYear(model.contextYear)}</dd></div>
    </dl></section>
  )
  if (model.entityType === 'person') return (
    <section className="entity-section"><h2>Key facts</h2><dl className="entity-facts">
      <div><dt>Life</dt><dd>{formatHistoricalYearRange(model.record.life)}</dd></div>
      <div><dt>Roles</dt><dd>{model.record.roles.join(', ')}</dd></div>
      <div><dt>Importance</dt><dd>{model.record.importance} of 5</dd></div>
      <div><dt>Location records</dt><dd>{model.chronology.length}</dd></div>
      <div><dt>Mapped history</dt><dd>{model.mapped ? 'At least one reviewed mapped period' : 'No reviewed mapped period'}</dd></div>
      <div><dt>Current page context</dt><dd>{formatHistoricalYear(model.contextYear)}</dd></div>
    </dl></section>
  )
  if (model.entityType === 'event') return (
    <section className="entity-section"><h2>Key facts</h2><dl className="entity-facts">
      <div><dt>Type</dt><dd>{humanize(model.record.type)}</dd></div>
      <div><dt>Period</dt><dd>{formatHistoricalYearRange(model.record.period)}</dd></div>
      <div><dt>Location</dt><dd>{eventLocationLabel(model.presentation.locationAccuracy, model.presentation.locationAvailable)}</dd></div>
      <div><dt>Coordinates</dt><dd>{model.record.coordinates === undefined ? 'Unavailable' : `${model.record.coordinates[1]}, ${model.record.coordinates[0]}`}</dd></div>
    </dl></section>
  )
  return (
    <section className="entity-section"><h2>Key facts</h2><dl className="entity-facts">
      <div><dt>Type</dt><dd>{humanize(model.record.journeyType)}</dd></div>
      <div><dt>Period</dt><dd>{formatHistoricalYearRange(model.record.period)}</dd></div>
      <div><dt>Route</dt><dd>{model.presentation.geometryAvailable ? 'Reviewed geometry available' : 'No reviewed geometry'}</dd></div>
      <div><dt>Certainty</dt><dd>{routeCertaintyLabel(model.record.routeCertainty)}</dd></div>
      <div><dt>Direction</dt><dd>{journeyDirectionLabel(model.record.directionKnown)}</dd></div>
      <div><dt>Stages</dt><dd>{model.record.stages.length}</dd></div>
    </dl></section>
  )
}

function Specialized({ model }: { model: EntityPageModel }) {
  if (model.entityType === 'place') return (
    <>
      <section className="entity-section"><h2>Historical names</h2>{model.record.names.length === 0 ? <p>No period-specific names are recorded; the default name remains visible.</p> : <ol className="entity-chronology">{[...model.record.names].sort((a, b) => a.period.yearFrom - b.period.yearFrom || a.name.localeCompare(b.name)).map((name) => <li key={`${name.name}:${name.period.yearFrom}`}><strong>{name.name}</strong><span>{formatHistoricalYearRange(name.period)}</span>{name.language === undefined ? null : <span>Language: {name.language}</span>}{name.transliteration === undefined ? null : <span>Transliteration: {name.transliteration}</span>}</li>)}</ol>}</section>
      <section className="entity-section"><h2>Importance periods</h2>{model.record.importance.length === 0 ? <p>No importance period is recorded.</p> : <ol className="entity-chronology">{[...model.record.importance].sort((a, b) => a.period.yearFrom - b.period.yearFrom).map((period) => <li key={`${period.period.yearFrom}:${period.importance}`}><strong>Importance {period.importance} of 5</strong><span>{formatHistoricalYearRange(period.period)}</span>{period.reason === undefined ? null : <span>{period.reason}</span>}</li>)}</ol>}</section>
    </>
  )
  if (model.entityType === 'polity') return (
    <section className="entity-section"><h2>Territory chronology</h2>{model.territoryPeriods.length === 0 ? <p>No territory interpretation is recorded. The polity page remains available independently.</p> : <ol className="entity-chronology">{[...model.territoryPeriods].sort((a, b) => a.period.yearFrom - b.period.yearFrom || a.id.localeCompare(b.id)).map((territory) => <li key={territory.id}><strong>{humanize(territory.controlCategory)} control</strong><span>{formatHistoricalYearRange(territory.period)}</span><span>{territory.uncertainty?.confidence ?? 'unknown'} confidence</span>{territory.uncertainty?.note === undefined ? null : <span>{territory.uncertainty.note}</span>}</li>)}</ol>}</section>
  )
  if (model.entityType === 'person') return (
    <section className="entity-section"><h2>Place chronology</h2>{model.chronology.length === 0 ? <p>No reviewed place relationship is recorded.</p> : <ol className="entity-chronology">{model.chronology.map(({ relationship, placeId, placeName, mapped }, index) => <li key={`${placeId}:${relationship.period.yearFrom}:${index}`}><strong>{humanize(relationship.relationType)} В· {placeName ?? 'Referenced place unavailable'}</strong><span>{formatHistoricalYearRange(relationship.period)}</span><span>{mapped ? 'Mapped through reviewed Place coordinates' : 'Unmapped period'}</span><span>{relationship.uncertainty?.confidence ?? 'unspecified'} relationship confidence</span></li>)}</ol>}<p>Each entry is bounded to its stated period; the page does not imply continuous presence between entries.</p></section>
  )
  if (model.entityType === 'event' && model.presentation.kind === 'battle') return (
    <section className="entity-section"><h2>Battle details</h2><p><strong>Result:</strong> {model.presentation.result}</p>{model.presentation.relatedJourney === null ? null : <p><strong>Campaign:</strong> {model.presentation.relatedJourney.name ?? 'Referenced journey unavailable'}</p>}<ol className="entity-chronology">{model.presentation.sides.map((side) => <li key={side.id}><strong>{side.label}</strong>{side.polities.length === 0 ? null : <span>Polities: {side.polities.map((item) => item.name ?? 'unresolved').join(', ')}</span>}{side.commanders.length === 0 ? null : <span>Commanders: {side.commanders.map((item) => item.name ?? 'unresolved').join(', ')}</span>}{side.outcome === undefined ? null : <span>Outcome: {side.outcome}</span>}</li>)}</ol>{model.presentation.forces === undefined ? null : <p><strong>Forces:</strong> {model.presentation.forces.description}</p>}{model.presentation.losses === undefined ? null : <p><strong>Losses:</strong> {model.presentation.losses.description}</p>}{model.presentation.disputedNotes.map((note) => <p key={note}><strong>Disputed interpretation:</strong> {note}</p>)}</section>
  )
  if (model.entityType === 'event') return <section className="entity-section"><h2>Participants and location</h2><p>{model.presentation.participantPolities.length + model.presentation.participantPeople.length} explicit participant relationship{model.presentation.participantPolities.length + model.presentation.participantPeople.length === 1 ? '' : 's'} recorded.</p>{!model.presentation.locationAvailable ? <p>No coordinate has been invented for this event.</p> : null}</section>
  return (
    <section className="entity-section"><h2>Ordered stages</h2><ol className="entity-chronology">{model.presentation.stages.map((stage) => <li key={stage.order}><strong>{stage.order}. {stage.place?.name ?? stage.event?.name ?? 'Coordinate-only or unresolved stage'}</strong>{stage.year === null ? null : <span>{formatHistoricalYear(stage.year)}</span>}{stage.period === null ? null : <span>{formatHistoricalYearRange(stage.period)}</span>}<span>{stage.sources.resolved.length} resolved stage source{stage.sources.resolved.length === 1 ? '' : 's'}</span></li>)}</ol><p>Stage order is authored and does not imply daily precision or unrecorded intermediate movement.</p></section>
  )
}

export function EntityPage({ entityType }: { entityType: SelectedEntityType }) {
  const { entityId } = useParams()
  const [searchParams] = useSearchParams()
  const runtime = useRuntimeData()
  if (entityId === undefined || !entityIdSchema.safeParse(entityId).success) return <PageState title="Invalid entity reference" message="This route parameter is not a valid EraByEra entity ID." />
  if (runtime.status === 'loading') return <PageState title="Loading entity" message="The published runtime dataset is being prepared." />
  if (runtime.status === 'error') return <PageState title="Historical data unavailable" message={runtime.message} />
  const yearText = searchParams.get('year')
  const preferredYear = yearText !== null && /^[+-]?\d+$/.test(yearText) && isHistoricalYear(Number(yearText)) ? Number(yearText) : undefined
  const model = buildEntityPageModel(runtime.data, entityType, entityId, preferredYear)
  if (model === null) return <PageState title="Entity not found" message={`The valid ${entityType} ID “${entityId}” is not present in this runtime dataset.`} />
  let mapHref: string | null = null
  try { mapHref = createEntityMapHref(loadBundledSearchIndex(), entityType, entityId, preferredYear) } catch (error) { console.error('Entity map navigation is unavailable.', error) }
  const collections = getCollectionsForEntity(runtime.data, entityType, entityId).filter((collection) => collection.visibility === 'public')
  return <EntityPageShell model={model} mapHref={mapHref}><KeyFacts model={model} /><Specialized model={model} />{collections.length === 0 ? null : <section className="entity-section"><h2>Collections</h2><ul>{collections.map((collection) => <li key={collection.id}><Link to={`/collections/${collection.id}`}>Included in {collection.defaultName}</Link> — {collection.membershipKind === 'synthetic-demonstration' ? 'synthetic foundation demonstration, not reviewed historical membership' : 'reviewed membership'}</li>)}</ul></section>}<EntityRelations relations={model.relations} /><EntitySources sources={model.sources} /></EntityPageShell>
}
