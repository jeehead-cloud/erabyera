import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MAP_CANONICALIZATION_HISTORY_MODE,
  canonicalizeMapSearch,
  parseMapUrlState,
  serializeMapUrlState,
  shouldReplaceMapUrlHistory,
  type MapUrlHistoryMode,
  type MapUrlState,
  type MapUrlStateInput,
} from './mapUrlState'

export interface MapUrlUpdateOptions {
  history?: MapUrlHistoryMode
}

export type UpdateMapUrlState = (
  update: Partial<MapUrlStateInput>,
  options?: MapUrlUpdateOptions,
) => void

export function useMapUrlState(): readonly [MapUrlState, UpdateMapUrlState] {
  const location = useLocation()
  const navigate = useNavigate()
  const state = useMemo(() => parseMapUrlState(location.search), [location.search])

  useEffect(() => {
    const canonicalSearch = canonicalizeMapSearch(location.search)
    const currentSearch = location.search.startsWith('?')
      ? location.search.slice(1)
      : location.search

    if (canonicalSearch !== currentSearch) {
      void navigate(
        {
          pathname: location.pathname,
          search: canonicalSearch === '' ? '' : `?${canonicalSearch}`,
          hash: location.hash,
        },
        { replace: shouldReplaceMapUrlHistory(MAP_CANONICALIZATION_HISTORY_MODE) },
      )
    }
  }, [location.hash, location.pathname, location.search, navigate])

  const updateState = useCallback<UpdateMapUrlState>(
    (update, options) => {
      const currentState = parseMapUrlState(location.search)
      const nextSearch = serializeMapUrlState(
        { ...currentState, ...update },
        location.search,
      ).toString()
      const currentCanonicalSearch = canonicalizeMapSearch(location.search)

      if (nextSearch === currentCanonicalSearch) {
        return
      }

      const history = options?.history ?? 'push'
      void navigate(
        {
          pathname: location.pathname,
          search: nextSearch === '' ? '' : `?${nextSearch}`,
          hash: location.hash,
        },
        { replace: shouldReplaceMapUrlHistory(history) },
      )
    },
    [location.hash, location.pathname, location.search, navigate],
  )

  return [state, updateState] as const
}
