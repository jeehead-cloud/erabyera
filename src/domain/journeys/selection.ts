import type { MapUrlState, SelectedEntityReference } from '../../url'
import { entityIdSchema } from '../entities'
import { parseHistoricalYear } from '../time'

export const JOURNEY_SELECTION_HISTORY_MODE = 'push' as const

export function createJourneySelection(id: string): SelectedEntityReference {
  return { type: 'journey', id: entityIdSchema.parse(id) }
}

export function withSelectedJourney(state: MapUrlState, id: string): MapUrlState {
  return { ...state, selectedEntity: createJourneySelection(id) }
}

export function selectedJourneyId(selection: SelectedEntityReference | null): string | null {
  return selection?.type === 'journey' ? selection.id : null
}

export function withSelectedJourneyYear(state: MapUrlState, year: number): MapUrlState {
  return { ...state, year: parseHistoricalYear(year) }
}

export function withoutImplementedMapSelection(state: MapUrlState): MapUrlState {
  return ['place', 'polity', 'event', 'person', 'journey'].includes(state.selectedEntity?.type ?? '')
    ? { ...state, selectedEntity: null }
    : state
}
