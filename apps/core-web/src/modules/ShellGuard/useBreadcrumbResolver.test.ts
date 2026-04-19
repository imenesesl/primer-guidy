import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBreadcrumbResolver } from './useBreadcrumbResolver'

describe('useBreadcrumbResolver', () => {
  const channels = [
    { id: 'ch-1', name: 'math', active: true, students: [] as string[] },
    { id: 'ch-2', name: 'science', active: true, students: [] as string[] },
  ]

  it('returns capitalized channel name when segment matches', () => {
    const { result } = renderHook(() => useBreadcrumbResolver(channels))
    expect(result.current('ch-1')).toBe('Math')
  })

  it('capitalizes first letter of channel name', () => {
    const { result } = renderHook(() => useBreadcrumbResolver(channels))
    expect(result.current('ch-2')).toBe('Science')
  })

  it('returns null for unknown segment', () => {
    const { result } = renderHook(() => useBreadcrumbResolver(channels))
    expect(result.current('unknown')).toBeNull()
  })

  it('returns null when channels is undefined', () => {
    const { result } = renderHook(() => useBreadcrumbResolver(undefined))
    expect(result.current('ch-1')).toBeNull()
  })
})
