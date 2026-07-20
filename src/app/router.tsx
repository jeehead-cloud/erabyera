import {
  Link,
  Navigate,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom'
import { AppShell } from '../components/AppShell/AppShell'
import { NotFoundPage } from '../pages/NotFoundPage'
import { APP_ROUTES } from './routes'
import type { ExploreCatalogType } from '../domain/explore'
import type { SelectedEntityType } from '../url'

const lazyCatalog = (catalogType: ExploreCatalogType) => async () => {
  const { ExploreCatalogPage } = await import('../pages/ExploreCatalogPage')
  return { Component: () => <ExploreCatalogPage catalogType={catalogType} /> }
}

const lazyEntity = (entityType: SelectedEntityType) => async () => {
  const { EntityPage } = await import('../pages/EntityPage')
  return { Component: () => <EntityPage entityType={entityType} /> }
}

function RouteErrorPage() {
  const error = useRouteError()
  const heading = isRouteErrorResponse(error)
    ? 'This atlas view is unavailable.'
    : 'The atlas could not open this view.'

  return (
    <main className="standalone-state" role="alert">
      <section className="state-panel">
        <p className="eyebrow">Route recovery</p>
        <h1>{heading}</h1>
        <p>
          EraByEra could not complete the requested navigation. You can safely
          return to the map workspace.
        </p>
        <Link className="button button--primary" to="/map">
          Return to map
        </Link>
      </section>
    </main>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/map" replace /> },
      { path: APP_ROUTES.map.slice(1), lazy: async () => ({ Component: (await import('../pages/MapPage')).MapPage }) },
      { path: APP_ROUTES.explore.slice(1), lazy: async () => ({ Component: (await import('../pages/ExplorePage')).ExplorePage }) },
      { path: APP_ROUTES.explorePlaces.slice(1), lazy: lazyCatalog('place') },
      { path: APP_ROUTES.explorePolities.slice(1), lazy: lazyCatalog('polity') },
      { path: APP_ROUTES.explorePeople.slice(1), lazy: lazyCatalog('person') },
      { path: APP_ROUTES.exploreEvents.slice(1), lazy: lazyCatalog('event') },
      { path: APP_ROUTES.exploreJourneys.slice(1), lazy: lazyCatalog('journey') },
      { path: APP_ROUTES.collections.slice(1), lazy: async () => ({ Component: (await import('../pages/CollectionsPage')).CollectionsPage }) },
      { path: APP_ROUTES.collection.slice(1), lazy: async () => ({ Component: (await import('../pages/CollectionPage')).CollectionPage }) },
      { path: APP_ROUTES.place.slice(1), lazy: lazyEntity('place') },
      { path: APP_ROUTES.polity.slice(1), lazy: lazyEntity('polity') },
      { path: APP_ROUTES.person.slice(1), lazy: lazyEntity('person') },
      { path: APP_ROUTES.event.slice(1), lazy: lazyEntity('event') },
      { path: APP_ROUTES.journey.slice(1), lazy: lazyEntity('journey') },
      { path: APP_ROUTES.sources.slice(1), lazy: async () => ({ Component: (await import('../pages/SourcesPage')).SourcesPage }) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
