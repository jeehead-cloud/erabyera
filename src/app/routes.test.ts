import { describe, expect, it } from 'vitest'
import { APP_ROUTES, PRIMARY_NAVIGATION } from './routes'

describe('F16 application routes', () => {
  it('defines stable collection landing and detail paths', () => {
    expect(APP_ROUTES.collections).toBe('/collections')
    expect(APP_ROUTES.collection).toBe('/collections/:collectionId')
  })

  it('adds Collections to primary navigation without removing existing routes', () => {
    expect(PRIMARY_NAVIGATION).toEqual([
      { to: '/map', label: 'Map' },
      { to: '/explore', label: 'Explore' },
      { to: '/collections', label: 'Collections' },
      { to: '/sources', label: 'Sources' },
    ])
  })
})
