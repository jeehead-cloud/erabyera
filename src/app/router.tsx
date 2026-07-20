import {
  Link,
  Navigate,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom'
import { AppShell } from '../components/AppShell/AppShell'
import { ExplorePage } from '../pages/ExplorePage'
import { ExploreCatalogPage } from '../pages/ExploreCatalogPage'
import { EntityPage } from '../pages/EntityPage'
import { MapPage } from '../pages/MapPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SourcesPage } from '../pages/SourcesPage'
import { CollectionsPage } from '../pages/CollectionsPage'
import { CollectionPage } from '../pages/CollectionPage'
import { APP_ROUTES } from './routes'

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
      { path: APP_ROUTES.map.slice(1), element: <MapPage /> },
      { path: APP_ROUTES.explore.slice(1), element: <ExplorePage /> },
      { path: 'explore/places', element: <ExploreCatalogPage catalogType="place" /> },
      { path: 'explore/polities', element: <ExploreCatalogPage catalogType="polity" /> },
      { path: 'explore/people', element: <ExploreCatalogPage catalogType="person" /> },
      { path: 'explore/events', element: <ExploreCatalogPage catalogType="event" /> },
      { path: 'explore/journeys', element: <ExploreCatalogPage catalogType="journey" /> },
      { path: APP_ROUTES.collections.slice(1), element: <CollectionsPage /> },
      { path: APP_ROUTES.collection.slice(1), element: <CollectionPage /> },
      { path: 'place/:entityId', element: <EntityPage entityType="place" /> },
      { path: 'polity/:entityId', element: <EntityPage entityType="polity" /> },
      { path: 'person/:entityId', element: <EntityPage entityType="person" /> },
      { path: 'event/:entityId', element: <EntityPage entityType="event" /> },
      { path: 'journey/:entityId', element: <EntityPage entityType="journey" /> },
      { path: APP_ROUTES.sources.slice(1), element: <SourcesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
