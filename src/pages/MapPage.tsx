import { useCallback } from 'react'
import { Timeline, TIMELINE_HISTORY_MODE } from '../components/Timeline'
import type { HistoricalYear } from '../domain/time'
import { MapView } from '../map'
import { useMapUrlState } from '../url'

export function MapPage() {
  const [mapUrlState, updateMapUrlState] = useMapUrlState()
  const handleYearChange = useCallback(
    (year: HistoricalYear) => {
      updateMapUrlState({ year }, { history: TIMELINE_HISTORY_MODE })
    },
    [updateMapUrlState],
  )

  return (
    <section className="map-page" aria-labelledby="map-heading">
      <h1 className="visually-hidden" id="map-heading">Physical map</h1>
      <MapView urlState={mapUrlState} updateUrlState={updateMapUrlState} />
      <Timeline selectedYear={mapUrlState.year} onYearChange={handleYearChange} />
    </section>
  )
}
