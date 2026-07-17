import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="content-page content-page--centered" aria-labelledby="not-found-heading">
      <div className="state-panel state-panel--in-shell">
        <p className="eyebrow">Page not found</p>
        <h1 id="not-found-heading">This place is not in the atlas.</h1>
        <p>
          The requested EraByEra page does not exist. Return to the primary map
          workspace to continue.
        </p>
        <Link className="button button--primary" to="/map">
          Back to map
        </Link>
      </div>
    </section>
  )
}
