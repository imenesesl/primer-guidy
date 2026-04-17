import { useEffect, useRef, useState } from 'react'
import { AsyncStatus } from './useSubscription.types'
import type { SubscribeFn, SubscriptionOptions, SubscriptionResult } from './useSubscription.types'

interface State<T> {
  data: T | null
  status: AsyncStatus
  error: Error | null
}

export const useSubscription = <T>(
  subscribeFn: SubscribeFn<T>,
  options?: SubscriptionOptions,
): SubscriptionResult<T> => {
  const enabled = options?.enabled ?? true
  const subscribeFnRef = useRef(subscribeFn)
  subscribeFnRef.current = subscribeFn

  const [state, setState] = useState<State<T>>({
    data: null,
    status: AsyncStatus.Loading,
    error: null,
  })

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, status: AsyncStatus.Loading, error: null })
      return
    }

    setState((prev) => ({ ...prev, status: AsyncStatus.Loading, error: null }))

    let cancelled = false

    try {
      const unsubscribe = subscribeFnRef.current((data: T) => {
        if (!cancelled) {
          setState({ data, status: AsyncStatus.Success, error: null })
        }
      })

      return () => {
        cancelled = true
        unsubscribe()
      }
    } catch (err) {
      if (!cancelled) {
        setState({
          data: null,
          status: AsyncStatus.Error,
          error: err instanceof Error ? err : new Error(String(err)),
        })
      }
      return undefined
    }
  }, [enabled])

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    isLoading: state.status === AsyncStatus.Loading,
  }
}
