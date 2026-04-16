import { describe, it, expect } from 'vitest'
import { createLayoutStore } from './layout.store'

describe('createLayoutStore', () => {
  it('initializes with rail and sidebar visible', () => {
    const store = createLayoutStore()

    expect(store.getState().railVisible).toBe(true)
    expect(store.getState().sidebarVisible).toBe(true)
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
