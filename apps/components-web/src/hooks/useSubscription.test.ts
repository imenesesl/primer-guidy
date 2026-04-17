import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useSubscription } from './useSubscription'
import { AsyncStatus } from './useSubscription.types'

describe('useSubscription', () => {
  it('starts in loading state', () => {
    const subscribeFn = vi.fn(() => vi.fn())

    const { result } = renderHook(() => useSubscription(subscribeFn))

    expect(result.current.status).toBe(AsyncStatus.Loading)
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('transitions to success when callback fires', () => {
    let emitData: ((data: string) => void) | undefined
    const unsubscribe = vi.fn()
    const subscribeFn = vi.fn((cb: (data: string) => void) => {
      emitData = cb
      return unsubscribe
    })

    const { result } = renderHook(() => useSubscription(subscribeFn))

    act(() => {
      emitData?.('hello')
    })

    expect(result.current.status).toBe(AsyncStatus.Success)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBe('hello')
  })

  it('updates data on subsequent emissions', () => {
    let emitData: ((data: number) => void) | undefined
    const subscribeFn = vi.fn((cb: (data: number) => void) => {
      emitData = cb
      return vi.fn()
    })

    const { result } = renderHook(() => useSubscription(subscribeFn))

    act(() => emitData?.(1))
    expect(result.current.data).toBe(1)

    act(() => emitData?.(2))
    expect(result.current.data).toBe(2)
  })

  it('calls unsubscribe on unmount', () => {
    const unsubscribe = vi.fn()
    const subscribeFn = vi.fn(() => unsubscribe)

    const { unmount } = renderHook(() => useSubscription(subscribeFn))

    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('does not subscribe when enabled is false', () => {
    const subscribeFn = vi.fn(() => vi.fn())

    renderHook(() => useSubscription(subscribeFn, { enabled: false }))

    expect(subscribeFn).not.toHaveBeenCalled()
  })

  it('subscribes when enabled transitions from false to true', () => {
    const unsubscribe = vi.fn()
    const subscribeFn = vi.fn(() => unsubscribe)

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useSubscription(subscribeFn, { enabled }),
      { initialProps: { enabled: false } },
    )

    expect(subscribeFn).not.toHaveBeenCalled()

    rerender({ enabled: true })

    expect(subscribeFn).toHaveBeenCalledOnce()
  })

  it('unsubscribes when enabled transitions from true to false', () => {
    const unsubscribe = vi.fn()
    const subscribeFn = vi.fn(() => unsubscribe)

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useSubscription(subscribeFn, { enabled }),
      { initialProps: { enabled: true } },
    )

    rerender({ enabled: false })

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('handles synchronous subscribe error', () => {
    const subscribeFn = vi.fn(() => {
      throw new Error('subscribe failed')
    })

    const { result } = renderHook(() => useSubscription(subscribeFn))

    expect(result.current.status).toBe(AsyncStatus.Error)
    expect(result.current.error?.message).toBe('subscribe failed')
  })

  it('supports null data emissions', () => {
    let emitData: ((data: null) => void) | undefined
    const subscribeFn = vi.fn((cb: (data: null) => void) => {
      emitData = cb
      return vi.fn()
    })

    const { result } = renderHook(() => useSubscription(subscribeFn))

    act(() => emitData?.(null))

    expect(result.current.status).toBe(AsyncStatus.Success)
    expect(result.current.data).toBeNull()
  })
})
