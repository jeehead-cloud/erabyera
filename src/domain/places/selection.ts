import { parseHistoricalYear } from '../time'
import { entityIdSchema } from '../entities'
import type { MapUrlState, SelectedEntityReference } from '../../url'

export const PLACE_SELECTION_HISTORY_MODE = 'push' as const

export function createPlaceSelection(id: string): SelectedEntityReference {
  return { type: 'place', id: entityIdSchema.parse(id) }
}

export function withSelectedPlace(state: MapUrlState, id: string): MapUrlState {
  return { ...state, selectedEntity: createPlaceSelection(id) }
}

export function withoutSelectedPlace(state: MapUrlState): MapUrlState {
  return state.selectedEntity?.type === 'place'
    ? { ...state, selectedEntity: null }
    : state
}

export function withSelectedPlaceYear(
  state: MapUrlState,
  year: number,
): MapUrlState {
  return { ...state, year: parseHistoricalYear(year) }
}

export function selectedPlaceId(
  selection: SelectedEntityReference | null,
): string | null {
  return selection?.type === 'place' ? selection.id : null
}
