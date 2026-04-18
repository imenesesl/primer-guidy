import { useLocation } from '@tanstack/react-router'
import { extractWorkspaceId } from './ShellGuard.utils'
import { FlowRoutes } from '@/routes/routes'

export const useActiveWorkspaceId = (): string | null => {
  const { pathname } = useLocation()
  return (
    extractWorkspaceId(pathname, FlowRoutes.Tasks) ??
    extractWorkspaceId(pathname, FlowRoutes.Quizes)
  )
}
