import { MapView } from '../map'
import { useMapUrlState } from '../url'

export function MapPage() {
  const [mapUrlState, updateMapUrlState] = useMapUrlState()

  return (
    <section className="map-page" aria-labelledby="map-heading">
      <h1 className="visually-hidden" id="map-heading">Physical map</h1>
      <MapView urlState={mapUrlState} updateUrlState={updateMapUrlState} />
    </section>
  )
}
