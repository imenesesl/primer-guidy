import { useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import type { WorkspaceEntry } from '@/services/workspace'
import { extractWorkspaceId } from './ShellGuard.utils'
import { FlowRoutes } from '@/routes/routes'

export const useActiveWorkspaceId = (
  workspaces: readonly WorkspaceEntry[] | undefined,
): string | null => {
  const { pathname } = useLocation()
  const lastIdRef = useRef<string | null>(null)

  const currentId =
    extractWorkspaceId(pathname, FlowRoutes.Tasks) ??
    extractWorkspaceId(pathname, FlowRoutes.Quizes)

  if (currentId !== null) {
    lastIdRef.current = currentId
  }

  return currentId ?? lastIdRef.current ?? workspaces?.[0]?.uid ?? null
}
