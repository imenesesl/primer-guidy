import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCloseSidebarOnMobileNav } from './useCloseSidebarOnMobileNav'

const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', { writable: true, value: mockMatchMedia })
})

describe('useCloseSidebarOnMobileNav', () => {
  it('does not close sidebar on initial render', () => {
    const closeSidebar = vi.fn()
    renderHook(() => useCloseSidebarOnMobileNav('/tasks', closeSidebar))
    expect(closeSidebar).not.toHaveBeenCalled()
  })

  it('closes sidebar on mobile when pathname changes', () => {
    const closeSidebar = vi.fn()
    mockMatchMedia.mockReturnValue({ matches: false })
    const { rerender } = renderHook(({ path }) => useCloseSidebarOnMobileNav(path, closeSidebar), {
      initialProps: { path: '/tasks' },
    })
    rerender({ path: '/tasks/ws-1' })
    expect(closeSidebar).toHaveBeenCalledOnce()
  })

  it('does not close sidebar on desktop when pathname changes', () => {
    const closeSidebar = vi.fn()
    mockMatchMedia.mockReturnValue({ matches: true })
    const { rerender } = renderHook(({ path }) => useCloseSidebarOnMobileNav(path, closeSidebar), {
      initialProps: { path: '/tasks' },
    })
    rerender({ path: '/tasks/ws-1' })
    expect(closeSidebar).not.toHaveBeenCalled()
  })
})
