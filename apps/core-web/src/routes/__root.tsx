import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider, BaseStyles } from '@primer/react'

export interface RootContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RootContext>()({
  component: RootLayout,
})

function RootLayout() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider colorMode="night">
        <BaseStyles>
          <Outlet />
        </BaseStyles>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
