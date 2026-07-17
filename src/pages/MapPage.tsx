import { MapView } from '../map'

export function MapPage() {
  return (
    <section className="map-page" aria-labelledby="map-heading">
      <h1 className="visually-hidden" id="map-heading">Physical map</h1>
      <MapView />
    </section>
  )
}
