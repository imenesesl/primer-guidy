import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import type { StoreApi } from 'zustand'

export interface LayoutStore {
  railVisible: boolean
  sidebarVisible: boolean
  toggleRail: () => void
  toggleSidebar: () => void
  closeSidebar: () => void
}

export const createLayoutStore = (): StoreApi<LayoutStore> =>
  createStore<LayoutStore>((set) => ({
    railVisible: true,
    sidebarVisible: true,
    toggleRail: () => set((s) => ({ railVisible: !s.railVisible })),
    toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
    closeSidebar: () => set({ sidebarVisible: false }),
  }))

const LayoutStoreContext = createContext<StoreApi<LayoutStore> | null>(null)

export const LayoutStoreProvider = LayoutStoreContext.Provider

export const useLayoutStore = <T>(selector: (state: LayoutStore) => T): T => {
  const store = useContext(LayoutStoreContext)
  if (!store) {
    throw new Error('useLayoutStore must be used within a LayoutStoreProvider')
  }
  return useStore(store, selector)
}
