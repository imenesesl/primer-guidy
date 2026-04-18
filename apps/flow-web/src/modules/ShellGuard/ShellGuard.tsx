import { useMemo } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Spinner } from '@primer/react'
import { createLayoutStore, LayoutStoreProvider, Shell } from '@primer-guidy/components-web'
import { useAuthGuard, AuthGuardStatus } from '@/modules/AuthGuard'
import { useStudentProfile } from '@/services/student'
import { RAIL_ITEMS, SIDEBAR_ITEMS_MAP } from './ShellGuard.utils'
import styles from './ShellGuard.module.scss'

export const ShellGuard = () => {
  const { status, uid } = useAuthGuard()
  const layoutStore = useMemo(() => createLayoutStore(), [])
  const { data: student } = useStudentProfile(uid)

  return (
    <LayoutStoreProvider value={layoutStore}>
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarName={student?.name}
        userName={student?.name}
      >
        {status === AuthGuardStatus.Authenticated ? (
          <Outlet />
        ) : (
          <div className={styles.loading}>
            <Spinner size="large" />
          </div>
        )}
      </Shell>
    </LayoutStoreProvider>
  )
}
