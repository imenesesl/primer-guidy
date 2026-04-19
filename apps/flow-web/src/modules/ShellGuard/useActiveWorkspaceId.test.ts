import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockPathname = vi.fn<() => string>()
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: mockPathname() }),
}))

import { useActiveWorkspaceId } from './useActiveWorkspaceId'

describe('useActiveWorkspaceId', () => {
  it('returns workspace ID from tasks path', () => {
    mockPathname.mockReturnValue('/tasks/ws-123')
    const { result } = renderHook(() => useActiveWorkspaceId())
    expect(result.current).toBe('ws-123')
  })

  it('returns workspace ID from quizes path', () => {
    mockPathname.mockReturnValue('/quizes/ws-456')
    const { result } = renderHook(() => useActiveWorkspaceId())
    expect(result.current).toBe('ws-456')
  })

  it('prefers tasks path when both could match', () => {
    mockPathname.mockReturnValue('/tasks/ws-789/ch-1/content')
    const { result } = renderHook(() => useActiveWorkspaceId())
    expect(result.current).toBe('ws-789')
  })

  it('returns null when pathname does not match tasks or quizes', () => {
    mockPathname.mockReturnValue('/learning')
    const { result } = renderHook(() => useActiveWorkspaceId())
    expect(result.current).toBeNull()
  })

  it('returns null when at root tasks path without workspace', () => {
    mockPathname.mockReturnValue('/tasks')
    const { result } = renderHook(() => useActiveWorkspaceId())
    expect(result.current).toBeNull()
  })
})
