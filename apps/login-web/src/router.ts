import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

export interface RouterContext {
  queryClient: QueryClient
}

const ONE_SECOND_MS = 1000
const ONE_MINUTE_S = 60
const STALE_TIME_MS = ONE_SECOND_MS * ONE_MINUTE_S

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
    },
  },
})

const basePath = (import.meta.env.BASE_PATH as string) ?? '/'

export const router = createRouter({
  routeTree,
  basepath: basePath,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
