import type { BattlePresentation, ResolvedEventRelation } from '../../domain/events'

function relationNames(relations: readonly ResolvedEventRelation[]): string {
  return relations.map((relation) => relation.name ?? 'Referenced entity unavailable').join(', ')
}

export function BattleDetails({ battle }: { battle: BattlePresentation }) {
  return (
    <section className="event-details__battle" aria-labelledby="battle-details-heading">
      <h3 id="battle-details-heading">Battle details</h3>
      <div className="event-details__result"><strong>Result</strong><span>{battle.result}</span></div>
      {battle.relatedJourney === null ? null : (
        <div className="event-details__result"><strong>Campaign</strong><span>{battle.relatedJourney.name ?? 'Referenced journey unavailable'}</span></div>
      )}
      <ol className="event-details__sides">
        {battle.sides.map((side) => (
          <li key={side.id}>
            <h4>{side.label}</h4>
            {side.polities.length === 0 ? null : <p><strong>Polities:</strong> {relationNames(side.polities)}</p>}
            {side.people.length === 0 ? null : <p><strong>Participants:</strong> {relationNames(side.people)}</p>}
            {side.commanders.length === 0 ? null : <p><strong>Commanders:</strong> {relationNames(side.commanders)}</p>}
            {side.outcome === undefined ? null : <p><strong>Outcome:</strong> {side.outcome}</p>}
          </li>
        ))}
      </ol>
      {battle.forces === undefined ? null : <p><strong>Forces:</strong> {battle.forces.description} · {battle.forces.uncertainty.confidence} confidence</p>}
      {battle.losses === undefined ? null : <p><strong>Losses:</strong> {battle.losses.description} · {battle.losses.uncertainty.confidence} confidence</p>}
      {battle.disputedNotes.length === 0 ? null : (
        <div className="event-details__disputed"><strong>Disputed interpretation</strong>{battle.disputedNotes.map((note) => <p key={note}>{note}</p>)}</div>
      )}
    </section>
  )
}
