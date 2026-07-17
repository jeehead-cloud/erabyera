import {
  Link,
  Navigate,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom'
import { AppShell } from '../components/AppShell/AppShell'
import { ExplorePage } from '../pages/ExplorePage'
import { MapPage } from '../pages/MapPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SourcesPage } from '../pages/SourcesPage'

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
      { path: 'map', element: <MapPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'sources', element: <SourcesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
