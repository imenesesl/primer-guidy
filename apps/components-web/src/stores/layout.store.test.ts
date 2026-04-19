import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLayoutStore } from './layout.store'

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  })
}

describe('createLayoutStore', () => {
  beforeEach(() => {
    mockMatchMedia(true)
  })

  it('initializes with sidebar visible on desktop viewport', () => {
    mockMatchMedia(true)
    const store = createLayoutStore()

    expect(store.getState().railVisible).toBe(true)
    expect(store.getState().sidebarVisible).toBe(true)
  })

  it('initializes with sidebar hidden on mobile viewport', () => {
    mockMatchMedia(false)
    const store = createLayoutStore()

    expect(store.getState().railVisible).toBe(true)
    expect(store.getState().sidebarVisible).toBe(false)
  })

  it('toggleRail flips railVisible', () => {
    const store = createLayoutStore()

    store.getState().toggleRail()
    expect(store.getState().railVisible).toBe(false)

    store.getState().toggleRail()
    expect(store.getState().railVisible).toBe(true)
  })

  it('toggleSidebar flips sidebarVisible', () => {
    const store = createLayoutStore()

    store.getState().toggleSidebar()
    expect(store.getState().sidebarVisible).toBe(false)

    store.getState().toggleSidebar()
    expect(store.getState().sidebarVisible).toBe(true)
  })

  it('closeSidebar sets sidebarVisible to false', () => {
    const store = createLayoutStore()

    expect(store.getState().sidebarVisible).toBe(true)

    store.getState().closeSidebar()
    expect(store.getState().sidebarVisible).toBe(false)
  })

  it('closeSidebar is idempotent when already closed', () => {
    const store = createLayoutStore()

    store.getState().closeSidebar()
    store.getState().closeSidebar()
    expect(store.getState().sidebarVisible).toBe(false)
  })
})
