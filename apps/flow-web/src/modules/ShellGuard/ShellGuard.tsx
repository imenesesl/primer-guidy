import { useMemo, useState } from 'react'
import { Outlet } from '@tanstack/react-router'
import { IconButton } from '@primer/react'
import { PlusIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { createLayoutStore, LayoutStoreProvider, Shell } from '@primer-guidy/components-web'
import { useAuthGuard, AuthGuardStatus } from '@/modules/AuthGuard'
import { useStudentProfile } from '@/services/student'
import { useStudentWorkspaces } from '@/services/workspace'
import { useStudentChannels } from '@/services/channel'
import { JoinWorkspaceDialog } from '@/modules/JoinWorkspaceDialog'
import { RAIL_ITEM_SEEDS, resolveRailItems, buildSidebarItemsMap } from './ShellGuard.utils'
import { useActiveWorkspaceId } from './useActiveWorkspaceId'
import { useBreadcrumbResolver } from './useBreadcrumbResolver'

export const ShellGuard = () => {
  const { t: tShell } = useTranslation('shell')
  const { status, uid } = useAuthGuard()
  const layoutStore = useMemo(() => createLayoutStore(), [])
  const { data: student } = useStudentProfile(uid)
  const { data: workspaces } = useStudentWorkspaces(student?.identificationNumber ?? null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const activeWorkspaceId = useActiveWorkspaceId(workspaces)

  const { data: channels } = useStudentChannels(
    activeWorkspaceId,
    student?.identificationNumber ?? null,
  )

  const railItems = useMemo(() => resolveRailItems(RAIL_ITEM_SEEDS, tShell), [tShell])
  const sidebarItemsMap = useMemo(
    () => buildSidebarItemsMap(workspaces ?? [], activeWorkspaceId, channels),
    [workspaces, activeWorkspaceId, channels],
  )

  const breadcrumbResolver = useBreadcrumbResolver(workspaces, channels)

  if (status !== AuthGuardStatus.Authenticated) return null

  return (
    <LayoutStoreProvider value={layoutStore}>
      <Shell
        railItems={railItems}
        sidebarItemsMap={sidebarItemsMap}
        avatarName={student?.name}
        userName={student?.name}
        breadcrumbResolver={breadcrumbResolver}
        headerAction={
          <IconButton
            icon={PlusIcon}
            aria-label={tShell('actions.create')}
            variant="invisible"
            onClick={() => setIsDialogOpen(true)}
          />
        }
      >
        <Outlet />
      </Shell>
      <JoinWorkspaceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        student={student ?? null}
      />
    </LayoutStoreProvider>
  )
}
