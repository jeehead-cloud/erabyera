import { Link, NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/map', label: 'Map' },
  { to: '/explore', label: 'Explore' },
  { to: '/sources', label: 'Sources' },
]

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="wordmark" to="/map" aria-label="EraByEra map home">
          <span>Era</span>
          <span className="wordmark__accent">By</span>
          <span>Era</span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? 'primary-nav__link is-active' : 'primary-nav__link'
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <p className="app-header__status" aria-label="Application phase">
          Foundation
        </p>
      </header>

      <main className="app-main" id="main-content">
        <Outlet />
      </main>
    </div>
  )
}
