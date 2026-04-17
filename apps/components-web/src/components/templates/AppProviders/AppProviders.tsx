import { useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, BaseStyles } from '@primer/react'
import { CloudServicesProvider } from '@primer-guidy/cloud-services'
import { createBannerStore, BannerStoreProvider } from '../../../stores/banner.store'
import { AppBanner } from '../../molecules/AppBanner'
import type { AppProvidersProps } from './AppProviders.types'
import { ThemedContent } from './ThemedContent'

export const AppProviders = ({ queryClient, cloudServices, children }: AppProvidersProps) => {
  const bannerStore = useMemo(() => createBannerStore(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider colorMode="night">
        <BaseStyles>
          <CloudServicesProvider value={cloudServices}>
            <BannerStoreProvider value={bannerStore}>
              <ThemedContent>
                <AppBanner />
                {children}
              </ThemedContent>
            </BannerStoreProvider>
          </CloudServicesProvider>
        </BaseStyles>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
