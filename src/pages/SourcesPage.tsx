export function SourcesPage() {
  return (
    <section className="content-page" aria-labelledby="sources-heading">
      <div className="content-page__intro">
        <p className="eyebrow">Evidence and interpretation</p>
        <h1 id="sources-heading">Sources belong in the atlas</h1>
        <p>
          EraByEra is designed to keep historical evidence, uncertainty, and
          competing interpretations visible alongside the map.
        </p>
      </div>

      <div className="empty-state" role="status">
        <span className="empty-state__marker" aria-hidden="true">
          I
        </span>
        <div>
          <h2>Evidence is available on each entity page</h2>
          <p>
            The standalone Sources catalog is deferred beyond the foundation.
            Every reviewed record keeps its full bibliographic references,
            locators, and interpretation notes on its stable entity page.
          </p>
        </div>
      </div>
    </section>
  )
}
