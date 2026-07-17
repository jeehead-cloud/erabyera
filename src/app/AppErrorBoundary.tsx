import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EraByEra encountered an unexpected rendering error.', {
      error,
      errorInfo,
    })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="standalone-state" role="alert">
        <section className="state-panel">
          <p className="eyebrow">Application recovery</p>
          <h1>The atlas could not open this view.</h1>
          <p>
            An unexpected problem interrupted the page. Return to the map
            workspace or reload EraByEra to try again.
          </p>
          <div className="state-actions">
            <a className="button button--primary" href="/map">
              Return to map
            </a>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload application
            </button>
          </div>
        </section>
      </main>
    )
  }
}
