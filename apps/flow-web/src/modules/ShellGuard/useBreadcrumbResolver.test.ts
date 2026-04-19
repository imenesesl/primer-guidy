import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBreadcrumbResolver } from './useBreadcrumbResolver'

describe('useBreadcrumbResolver', () => {
  const workspaces = [
    { uid: 'ws-1', name: 'Mr. Smith', active: true },
    { uid: 'ws-2', name: 'Ms. Jones', active: true },
  ]

  const channels = [
    { id: 'ch-1', name: 'math', active: true, students: [] as string[] },
    { id: 'ch-2', name: 'science', active: true, students: [] as string[] },
  ]

  it('returns workspace name when segment matches a workspace uid', () => {
    const { result } = renderHook(() => useBreadcrumbResolver(workspaces, channels))
    expect(result.current('ws-1')).toBe('Mr. Smith')
  })

  it('returns capitalized channel name when segment matches a channel id', () => {
    const { result } = renderHook(() => useBreadcrumbResolver(workspaces, channels))
    expect(result.current('ch-1')).toBe('Math')
  })

  it('prefers workspace match over channel match', () => {
    const overlapping = [{ id: 'ws-1', name: 'channel', active: true, students: [] as string[] }]
    const { result } = renderHook(() => useBreadcrumbResolver(workspaces, overlapping))
    expect(result.current('ws-1')).toBe('Mr. Smith')
  })

  it('returns null for unknown segment', () => {
    const { result } = renderHook(() => useBreadcrumbResolver(workspaces, channels))
    expect(result.current('unknown')).toBeNull()
  })

  it('returns null when both workspaces and channels are undefined', () => {
    const { result } = renderHook(() => useBreadcrumbResolver(undefined, undefined))
    expect(result.current('ws-1')).toBeNull()
  })
})
