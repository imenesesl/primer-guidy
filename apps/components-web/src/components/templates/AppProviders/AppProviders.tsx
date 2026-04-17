import { useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, BaseStyles, useTheme } from '@primer/react'
import { CloudServicesProvider } from '@primer-guidy/cloud-services'
import type { ReactNode } from 'react'
import { buildThemeVars } from '../../../utils/theme.utils'
import { createBannerStore, BannerStoreProvider } from '../../../stores/banner.store'
import { AppBanner } from '../../molecules/AppBanner'
import type { AppProvidersProps } from './AppProviders.types'

function ThemedContent({ children }: { readonly children: ReactNode }) {
  const { theme } = useTheme()
  const themeVars = buildThemeVars(theme?.colors)

  return <div style={themeVars}>{children}</div>
}

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
