import { FlowRoutes } from '@/routes/routes'

export const getHomeUrl = (): string => {
  const basePath = (import.meta.env.BASE_PATH as string) ?? '/'
  return basePath === '/' ? FlowRoutes.Root : basePath
}
