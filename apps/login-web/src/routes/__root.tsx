import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { createCloudServicesFromEnv } from '@primer-guidy/cloud-services'
import { AppProviders } from '@primer-guidy/components-web'

export interface RootContext {
  queryClient: QueryClient
}

const cloudServices = createCloudServicesFromEnv({
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  databaseURL: import.meta.env.PUBLIC_FIREBASE_DATABASE_URL,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
  hostingSite: import.meta.env.PUBLIC_FIREBASE_HOSTING_SITE,
  e2eBypass: import.meta.env.E2E_BYPASS,
})

export const Route = createRootRouteWithContext<RootContext>()({
  component: RootLayout,
})

function RootLayout() {
  const { queryClient } = Route.useRouteContext()

  return (
    <AppProviders queryClient={queryClient} cloudServices={cloudServices}>
      <Outlet />
    </AppProviders>
  )
}
