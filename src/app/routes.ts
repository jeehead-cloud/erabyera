export const APP_ROUTES = Object.freeze({
  map: '/map',
  explore: '/explore',
  explorePlaces: '/explore/places',
  explorePolities: '/explore/polities',
  explorePeople: '/explore/people',
  exploreEvents: '/explore/events',
  exploreJourneys: '/explore/journeys',
  place: '/place/:entityId',
  polity: '/polity/:entityId',
  person: '/person/:entityId',
  event: '/event/:entityId',
  journey: '/journey/:entityId',
  collections: '/collections',
  collection: '/collections/:collectionId',
  sources: '/sources',
})

export const STABLE_ROUTE_PATTERNS = Object.freeze(Object.values(APP_ROUTES))

export const PRIMARY_NAVIGATION = Object.freeze([
  { to: APP_ROUTES.map, label: 'Map' },
  { to: APP_ROUTES.explore, label: 'Explore' },
  { to: APP_ROUTES.collections, label: 'Collections' },
  { to: APP_ROUTES.sources, label: 'Sources' },
])
