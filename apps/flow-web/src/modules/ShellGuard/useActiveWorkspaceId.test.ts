import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { WorkspaceEntry } from '@/services/workspace'

const mockPathname = vi.fn<() => string>()
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: mockPathname() }),
}))

import { useActiveWorkspaceId } from './useActiveWorkspaceId'

const workspaces: WorkspaceEntry[] = [
  { uid: 'ws-first', name: 'First', active: true },
  { uid: 'ws-second', name: 'Second', active: true },
]

describe('useActiveWorkspaceId', () => {
  it('returns workspace ID from tasks path', () => {
    mockPathname.mockReturnValue('/tasks/ws-123')
    const { result } = renderHook(() => useActiveWorkspaceId(workspaces))
    expect(result.current).toBe('ws-123')
  })

  it('returns workspace ID from quizes path', () => {
    mockPathname.mockReturnValue('/quizes/ws-456')
    const { result } = renderHook(() => useActiveWorkspaceId(workspaces))
    expect(result.current).toBe('ws-456')
  })

  it('prefers tasks path when both could match', () => {
    mockPathname.mockReturnValue('/tasks/ws-789/ch-1/content')
    const { result } = renderHook(() => useActiveWorkspaceId(workspaces))
    expect(result.current).toBe('ws-789')
  })

  it('falls back to first workspace when no workspace in URL', () => {
    mockPathname.mockReturnValue('/tasks')
    const { result } = renderHook(() => useActiveWorkspaceId(workspaces))
    expect(result.current).toBe('ws-first')
  })

  it('returns null when no workspace in URL and no workspaces available', () => {
    mockPathname.mockReturnValue('/tasks')
    const { result } = renderHook(() => useActiveWorkspaceId(undefined))
    expect(result.current).toBeNull()
  })
})
