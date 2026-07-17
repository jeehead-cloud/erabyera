import { entityIdSchema } from '../entities'
import { parseHistoricalYear } from '../time'
import type { MapUrlState, SelectedEntityReference } from '../../url'

export const POLITY_SELECTION_HISTORY_MODE = 'push' as const

export function createPolitySelection(id: string): SelectedEntityReference {
  return { type: 'polity', id: entityIdSchema.parse(id) }
}

export function withSelectedPolity(state: MapUrlState, id: string): MapUrlState {
  return { ...state, selectedEntity: createPolitySelection(id) }
}

export function withoutOwnedMapSelection(state: MapUrlState): MapUrlState {
  return state.selectedEntity?.type === 'place' || state.selectedEntity?.type === 'polity'
    ? { ...state, selectedEntity: null }
    : state
}

export function withSelectedPolityYear(state: MapUrlState, year: number): MapUrlState {
  return { ...state, year: parseHistoricalYear(year) }
}

export function selectedPolityId(selection: SelectedEntityReference | null): string | null {
  return selection?.type === 'polity' ? selection.id : null
}
