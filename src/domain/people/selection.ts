import { entityIdSchema } from '../entities'; import { parseHistoricalYear } from '../time'; import type { MapUrlState, SelectedEntityReference } from '../../url'
export const PERSON_SELECTION_HISTORY_MODE = 'push' as const
export function createPersonSelection(id: string): SelectedEntityReference { return { type: 'person', id: entityIdSchema.parse(id) } }
export function withSelectedPerson(state: MapUrlState, id: string): MapUrlState { return { ...state, selectedEntity: createPersonSelection(id) } }
export function selectedPersonId(selection: SelectedEntityReference | null): string | null { return selection?.type === 'person' ? selection.id : null }
export function withSelectedPersonYear(state: MapUrlState, year: number): MapUrlState { return { ...state, year: parseHistoricalYear(year) } }
export function withoutImplementedMapSelection(state: MapUrlState): MapUrlState { return ['place', 'polity', 'event', 'person'].includes(state.selectedEntity?.type ?? '') ? { ...state, selectedEntity: null } : state }
