import { entityIdSchema } from '../entities'
import { parseHistoricalYear } from '../time'
import type { MapUrlState, SelectedEntityReference } from '../../url'

export const EVENT_SELECTION_HISTORY_MODE = 'push' as const

export function createEventSelection(id: string): SelectedEntityReference {
  return { type: 'event', id: entityIdSchema.parse(id) }
}

export function withSelectedEvent(state: MapUrlState, id: string): MapUrlState {
  return { ...state, selectedEntity: createEventSelection(id) }
}

export function withoutImplementedMapSelection(state: MapUrlState): MapUrlState {
  const type = state.selectedEntity?.type
  return type === 'place' || type === 'polity' || type === 'event'
    ? { ...state, selectedEntity: null }
    : state
}

export function withSelectedEventYear(state: MapUrlState, year: number): MapUrlState {
  return { ...state, year: parseHistoricalYear(year) }
}

export function selectedEventId(selection: SelectedEntityReference | null): string | null {
  return selection?.type === 'event' ? selection.id : null
}
