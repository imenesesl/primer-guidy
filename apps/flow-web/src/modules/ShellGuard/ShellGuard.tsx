import { useMemo, useState } from 'react'
import { Outlet } from '@tanstack/react-router'
import { IconButton, Spinner } from '@primer/react'
import { PlusIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { createLayoutStore, LayoutStoreProvider, Shell } from '@primer-guidy/components-web'
import { useAuthGuard, AuthGuardStatus } from '@/modules/AuthGuard'
import { useStudentProfile } from '@/services/student'
import { JoinWorkspaceDialog } from '@/modules/JoinWorkspaceDialog'
import { RAIL_ITEMS, SIDEBAR_ITEMS_MAP } from './ShellGuard.utils'
import styles from './ShellGuard.module.scss'

export const ShellGuard = () => {
  const { t: tShell } = useTranslation('shell')
  const { status, uid } = useAuthGuard()
  const layoutStore = useMemo(() => createLayoutStore(), [])
  const { data: student } = useStudentProfile(uid)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <LayoutStoreProvider value={layoutStore}>
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarName={student?.name}
        userName={student?.name}
        headerAction={
          <IconButton
            icon={PlusIcon}
            aria-label={tShell('actions.create')}
            variant="invisible"
            onClick={() => setIsDialogOpen(true)}
          />
        }
      >
        {status === AuthGuardStatus.Authenticated ? (
          <Outlet />
        ) : (
          <div className={styles.loading}>
            <Spinner size="large" />
          </div>
        )}
      </Shell>
      <JoinWorkspaceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        student={student ?? null}
      />
    </LayoutStoreProvider>
  )
}
