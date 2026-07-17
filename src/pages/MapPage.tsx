export function MapPage() {
  return (
    <section className="map-page" aria-labelledby="map-heading">
      <div className="map-canvas-placeholder">
        <div className="map-canvas-placeholder__frame" aria-hidden="true" />
        <div className="map-canvas-placeholder__content">
          <p className="eyebrow eyebrow--field">Primary workspace</p>
          <h1 id="map-heading">Historical map</h1>
          <p>
            This canvas is reserved for the interactive historical map planned
            for a later foundation milestone.
          </p>
          <span className="map-canvas-placeholder__note">
            No map, timeline, layers, or historical data are loaded yet.
          </span>
        </div>
      </div>
    </section>
  )
}
