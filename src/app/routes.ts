export const APP_ROUTES = Object.freeze({
  map: '/map',
  explore: '/explore',
  collections: '/collections',
  collection: '/collections/:collectionId',
  sources: '/sources',
})

export const PRIMARY_NAVIGATION = Object.freeze([
  { to: APP_ROUTES.map, label: 'Map' },
  { to: APP_ROUTES.explore, label: 'Explore' },
  { to: APP_ROUTES.collections, label: 'Collections' },
  { to: APP_ROUTES.sources, label: 'Sources' },
])
