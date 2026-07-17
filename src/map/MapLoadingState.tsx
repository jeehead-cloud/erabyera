export function MapLoadingState() {
  return (
    <div className="map-loading-state" role="status" aria-live="polite">
      <span className="map-loading-state__indicator" aria-hidden="true" />
      Loading physical map
    </div>
  )
}
