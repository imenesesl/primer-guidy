import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider, BaseStyles, useTheme } from '@primer/react'
import { CloudServicesProvider, createCloudServices } from '@primer-guidy/cloud-services'
import { buildThemeVars } from '@primer-guidy/components-web'

export interface RootContext {
  queryClient: QueryClient
}

const cloudServices = createCloudServices({
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  databaseURL: import.meta.env.PUBLIC_FIREBASE_DATABASE_URL,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
  hostingSite: import.meta.env.PUBLIC_FIREBASE_HOSTING_SITE,
})

export const Route = createRootRouteWithContext<RootContext>()({
  component: RootLayout,
})

function ThemedRoot() {
  const { theme } = useTheme()
  const themeVars = buildThemeVars(theme?.colors)

  return (
    <div style={themeVars}>
      <Outlet />
    </div>
  )
}

function RootLayout() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider colorMode="night">
        <BaseStyles>
          <CloudServicesProvider value={cloudServices}>
            <ThemedRoot />
          </CloudServicesProvider>
        </BaseStyles>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
