import { createRouter } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

export interface RouterContext {
  queryClient: QueryClient
}

const basePath = (import.meta.env.BASE_PATH as string) ?? '/'

export const createAppRouter = (queryClient: QueryClient) =>
  createRouter({
    routeTree,
    basepath: basePath,
    context: { queryClient },
  })

export type AppRouter = ReturnType<typeof createAppRouter>

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter
  }
}
