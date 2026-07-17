interface MapErrorStateProps {
  onRetry: () => void
}

export function MapErrorState({ onRetry }: MapErrorStateProps) {
  return (
    <div className="map-error-state" role="alert">
      <p className="eyebrow eyebrow--field">Map unavailable</p>
      <h2>The physical map could not be loaded.</h2>
      <p>
        The rest of EraByEra is still available. Check your browser’s WebGL
        support or local files, then try loading the map once more.
      </p>
      <button className="button button--primary" type="button" onClick={onRetry}>
        Retry map
      </button>
    </div>
  )
}
