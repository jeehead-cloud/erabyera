const plannedAreas = ['Places', 'Polities', 'People', 'Events', 'Journeys']

export function ExplorePage() {
  return (
    <section className="content-page" aria-labelledby="explore-heading">
      <div className="content-page__intro">
        <p className="eyebrow">Discovery</p>
        <h1 id="explore-heading">Explore history by subject</h1>
        <p>
          EraByEra will connect the map to browsable historical subjects. The
          catalogs and their reviewed records arrive in later milestones.
        </p>
      </div>

      <div className="planned-section" aria-labelledby="planned-heading">
        <h2 id="planned-heading">Planned areas</h2>
        <ul className="planned-list">
          {plannedAreas.map((area) => (
            <li key={area}>
              <span>{area}</span>
              <span className="planned-list__status">Planned</span>
            </li>
          ))}
        </ul>
        <p className="planned-section__note">
          Search, filters, catalogs, cards, and historical records are
          intentionally outside this application-shell milestone.
        </p>
      </div>
    </section>
  )
}
