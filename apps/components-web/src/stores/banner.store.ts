import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import type { StoreApi } from 'zustand'

export interface BannerCta {
  label: string
  onClick: () => void
}

export interface BannerConfig {
  variant: 'success' | 'warning' | 'danger'
  message: string
  cta?: BannerCta
}

export interface BannerStore {
  banner: BannerConfig | null
  showBanner: (config: BannerConfig) => void
  dismissBanner: () => void
}

export const createBannerStore = (): StoreApi<BannerStore> =>
  createStore<BannerStore>((set) => ({
    banner: null,
    showBanner: (config) => set({ banner: config }),
    dismissBanner: () => set({ banner: null }),
  }))

const BannerStoreContext = createContext<StoreApi<BannerStore> | null>(null)

export const BannerStoreProvider = BannerStoreContext.Provider

export const useBannerStore = <T>(selector: (state: BannerStore) => T): T => {
  const store = useContext(BannerStoreContext)
  if (!store) {
    throw new Error('useBannerStore must be used within a BannerStoreProvider')
  }
  return useStore(store, selector)
}
