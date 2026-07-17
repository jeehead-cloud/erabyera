interface HistoricalDataStatusProps {
  status: 'loading' | 'error' | 'empty'
  message?: string
  onRetry?: () => void
}

export function HistoricalDataStatus({
  status,
  message,
  onRetry,
}: HistoricalDataStatusProps) {
  return (
    <section className={`historical-data-status historical-data-status--${status}`} aria-live="polite">
      <p>{message ?? (status === 'loading'
        ? 'Loading historical place data…'
        : 'No mapped places are active in this selected year.')}</p>
      {status !== 'error' || onRetry === undefined ? null : (
        <button onClick={onRetry} type="button">Retry</button>
      )}
    </section>
  )
}
