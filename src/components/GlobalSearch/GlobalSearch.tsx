import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  MAX_SEARCH_QUERY_LENGTH,
  MIN_SEARCH_QUERY_LENGTH,
  searchEntities,
  searchResultMapLabel,
  searchResultPeriodLabel,
  type SearchIndex,
  type SearchResult,
} from '../../domain/search'
import type { HistoricalYear } from '../../domain/time'
import './GlobalSearch.css'

interface GlobalSearchProps {
  index: Readonly<SearchIndex> | null
  error: string | null
  selectedYear: HistoricalYear
  onSelect: (result: SearchResult) => void
}

export function GlobalSearch({ index, error, selectedYear, onSelect }: GlobalSearchProps) {
  const inputId = useId()
  const listId = useId()
  const openerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const response = useMemo(
    () => index === null ? null : searchEntities(index, query, selectedYear),
    [index, query, selectedYear],
  )
  const results = response?.results ?? []

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    setActiveIndex((current) => results.length === 0 ? 0 : Math.min(current, results.length - 1))
  }, [results.length])

  const close = () => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
    requestAnimationFrame(() => openerRef.current?.focus())
  }

  const select = (result: SearchResult) => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
    onSelect(result)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (results.length === 0) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => (current + direction + results.length) % results.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(results.length - 1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const active = results[activeIndex]
      if (active !== undefined) select(active)
    }
  }

  return (
    <div className="global-search">
      <button
        ref={openerRef}
        className="global-search__open"
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        Search records
      </button>
      {open ? (
        <section
          className="global-search__panel"
          role="dialog"
          aria-labelledby={`${inputId}-title`}
          onKeyDown={handleKeyDown}
        >
          <header className="global-search__header">
            <div>
              <p className="eyebrow">Local historical search</p>
              <h2 id={`${inputId}-title`}>Search records</h2>
            </div>
            <button className="global-search__close" type="button" onClick={close} aria-label="Close search">
              Close
            </button>
          </header>
          <label className="global-search__label" htmlFor={inputId}>Name or historical name</label>
          <div className="global-search__input-row">
            <input
              ref={inputRef}
              id={inputId}
              className="global-search__input"
              type="search"
              role="searchbox"
              autoComplete="off"
              maxLength={MAX_SEARCH_QUERY_LENGTH}
              value={query}
              aria-controls={listId}
              aria-activedescendant={results[activeIndex] === undefined ? undefined : `${listId}-option-${activeIndex}`}
              onChange={(event) => {
                setQuery(event.target.value.slice(0, MAX_SEARCH_QUERY_LENGTH))
                setActiveIndex(0)
              }}
            />
            <button
              className="global-search__clear"
              type="button"
              disabled={query.length === 0}
              onClick={() => {
                setQuery('')
                setActiveIndex(0)
                inputRef.current?.focus()
              }}
            >
              Clear
            </button>
          </div>
          <p className="global-search__status" role="status" aria-live="polite">
            {error !== null
              ? 'Historical search is unavailable. The map and layers remain usable.'
              : query.trim() === ''
                ? `Enter at least ${MIN_SEARCH_QUERY_LENGTH} characters.`
                : response?.state === 'below-minimum'
                  ? `Enter at least ${MIN_SEARCH_QUERY_LENGTH} normalized characters.`
                  : response?.state === 'no-results'
                    ? 'No matching records were found in the current dataset.'
                    : `${response?.total ?? 0} matching records.`}
          </p>
          {error !== null ? <p className="global-search__error">{error}</p> : null}
          <div className="global-search__results" id={listId} role="listbox" aria-label="Search results">
            {response?.groups.map((group) => (
              <section key={group.entityType} className="global-search__group" role="group" aria-labelledby={`${listId}-${group.entityType}`}>
                <h3 id={`${listId}-${group.entityType}`}>{group.label}</h3>
                {group.results.map((result) => {
                  const indexInResults = results.indexOf(result)
                  const historical = result.matchKind !== 'default'
                  return (
                    <div
                      key={`${result.entityType}:${result.entityId}`}
                      id={`${listId}-option-${indexInResults}`}
                      className={indexInResults === activeIndex ? 'global-search__option is-active' : 'global-search__option'}
                      role="option"
                      aria-selected={indexInResults === activeIndex}
                      onMouseEnter={() => setActiveIndex(indexInResults)}
                      onClick={() => select(result)}
                    >
                      <strong>{result.matchedName}</strong>
                      {result.matchedName === result.primaryName ? null : <span>Historical name of {result.primaryName}</span>}
                      <span>{historical ? `${result.matchKind} name · ` : ''}{result.subtype.replaceAll('-', ' ')} · {searchResultPeriodLabel(result)}</span>
                      <span>{result.activeAtSelectedYear ? 'Active in the selected year' : 'Outside the selected year; selection will move to a relevant year'}</span>
                      <span>{result.context} · {searchResultMapLabel(result)}</span>
                    </div>
                  )
                })}
              </section>
            ))}
          </div>
          <p className="global-search__coverage">Foundation demonstration data is intentionally sparse. No match does not imply no historical activity.</p>
        </section>
      ) : null}
    </div>
  )
}
