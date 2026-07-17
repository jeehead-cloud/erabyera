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
          <h2>The source catalog is not populated yet</h2>
          <p>
            Reviewed bibliographic records and their links to historical
            content will be introduced with the data foundation. No sample
            citations are shown here as real evidence.
          </p>
        </div>
      </div>
    </section>
  )
}
