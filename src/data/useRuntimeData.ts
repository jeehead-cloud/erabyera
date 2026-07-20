import { useCallback, useEffect, useState } from 'react'
import { loadBundledRuntimeData } from './loadRuntimeData'
import type { RuntimeDataset } from './runtime'

export type RuntimeDataState =
  | { status: 'loading'; retry: () => void }
  | { status: 'ready'; data: Readonly<RuntimeDataset>; retry: () => void }
  | { status: 'error'; message: string; retry: () => void }

export function useRuntimeData(): RuntimeDataState {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ready'; data: Readonly<RuntimeDataset> }
    | { status: 'error'; message: string }
  >({ status: 'loading' })
  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })

    void Promise.resolve().then(() => {
      if (!active) return

      try {
        setState({ status: 'ready', data: loadBundledRuntimeData() })
      } catch (error) {
        console.error('The bundled historical runtime dataset failed validation.', error)
        setState({
          status: 'error',
          message: 'Historical data could not be loaded safely.',
        })
      }
    })

    return () => {
      active = false
    }
  }, [attempt])

  return { ...state, retry }
}
