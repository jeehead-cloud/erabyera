import type { SelectedEntityType } from '../../url'

export const ENTITY_ROUTE_SEGMENTS = Object.freeze({
  place: 'place',
  polity: 'polity',
  person: 'person',
  event: 'event',
  journey: 'journey',
} satisfies Record<SelectedEntityType, string>)

export function entityPagePath(type: SelectedEntityType, id: string): string {
  return `/${ENTITY_ROUTE_SEGMENTS[type]}/${encodeURIComponent(id)}`
}

