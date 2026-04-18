import { describe, it, expect } from 'vitest'
import type { WorkspaceEntry } from '@/services/workspace'
import type { ChannelDocument } from '@/services/channel'
import { extractWorkspaceId, buildSidebarItemsMap } from './ShellGuard.utils'

describe('extractWorkspaceId', () => {
  it('extracts workspace ID from tasks path', () => {
    expect(extractWorkspaceId('/tasks/abc123', '/tasks')).toBe('abc123')
  })

  it('extracts workspace ID from nested path', () => {
    expect(extractWorkspaceId('/tasks/abc123/ch456/content', '/tasks')).toBe('abc123')
  })

  it('returns null when pathname does not start with basePath', () => {
    expect(extractWorkspaceId('/quizes/abc', '/tasks')).toBeNull()
  })

  it('returns null when no workspace segment exists', () => {
    expect(extractWorkspaceId('/tasks', '/tasks')).toBeNull()
  })

  it('returns null for trailing slash without workspace', () => {
    expect(extractWorkspaceId('/tasks/', '/tasks')).toBeNull()
  })
})

describe('buildSidebarItemsMap', () => {
  const workspaces: WorkspaceEntry[] = [
    { name: 'Mr. Smith', uid: 'teacher-1', active: true },
    { name: 'Ms. Jones', uid: 'teacher-2', active: false },
  ]

  const channels: ChannelDocument[] = [
    { id: 'ch-1', name: 'Math', active: true, students: ['s1'] },
    { id: 'ch-2', name: 'Science', active: false, students: ['s1'] },
  ]

  it('creates entries for both tasks and quizes paths', () => {
    const result = buildSidebarItemsMap(workspaces, null, [])
    expect(result).toHaveProperty('/tasks')
    expect(result).toHaveProperty('/quizes')
  })

  it('maps workspaces to sidebar items with correct paths', () => {
    const result = buildSidebarItemsMap(workspaces, null, [])
    const taskItems = result['/tasks']

    expect(taskItems).toHaveLength(2)
    expect(taskItems?.at(0)?.path).toBe('/tasks/teacher-1')
    expect(taskItems?.at(1)?.path).toBe('/tasks/teacher-2')
  })

  it('sets disabled based on workspace active status', () => {
    const result = buildSidebarItemsMap(workspaces, null, [])
    const taskItems = result['/tasks']

    expect(taskItems?.at(0)?.disabled).toBe(false)
    expect(taskItems?.at(1)?.disabled).toBe(true)
  })

  it('adds channel children to the active workspace', () => {
    const result = buildSidebarItemsMap(workspaces, 'teacher-1', channels)
    const taskItems = result['/tasks']
    const activeWs = taskItems?.at(0)

    expect(activeWs?.children).toHaveLength(2)
    expect(activeWs?.children?.at(0)?.label).toBe('Math')
    expect(activeWs?.children?.at(0)?.path).toBe('/tasks/teacher-1/ch-1')
    expect(activeWs?.children?.at(1)?.disabled).toBe(true)
  })

  it('does not add children to non-active workspaces', () => {
    const result = buildSidebarItemsMap(workspaces, 'teacher-1', channels)
    const taskItems = result['/tasks']
    const inactiveWs = taskItems?.at(1)

    expect(inactiveWs?.children).toBeUndefined()
  })
})
