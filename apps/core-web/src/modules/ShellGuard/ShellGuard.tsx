import { useMemo } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { createLayoutStore, LayoutStoreProvider, Shell } from '@primer-guidy/components-web'
import { useAuthGuard, AuthGuardStatus } from '@/modules/AuthGuard'
import { useChannels } from '@/services/channel'
import { UserProvider } from '@/context/user.context'
import { RAIL_ITEM_SEEDS, resolveRailItems, buildSidebarItemsMap } from './ShellGuard.utils'
import { useBreadcrumbResolver } from './useBreadcrumbResolver'

export const ShellGuard = () => {
  const { t: tShell } = useTranslation('shell')
  const { status, user } = useAuthGuard()
  const layoutStore = useMemo(() => createLayoutStore(), [])
  const { data: channels } = useChannels(user?.uid ?? '')

  const railItems = useMemo(() => resolveRailItems(RAIL_ITEM_SEEDS, tShell), [tShell])
  const sidebarItemsMap = useMemo(() => buildSidebarItemsMap(channels), [channels])

  const breadcrumbResolver = useBreadcrumbResolver(channels)

  const isReady = status === AuthGuardStatus.Authenticated && user

  return (
    <LayoutStoreProvider value={layoutStore}>
      <Shell
        railItems={railItems}
        sidebarItemsMap={sidebarItemsMap}
        avatarSrc={user?.avatarUrl ?? undefined}
        avatarName={user?.name}
        userName={user?.name}
        breadcrumbResolver={breadcrumbResolver}
      >
        {isReady ? (
          <UserProvider value={user}>
            <Outlet />
          </UserProvider>
        ) : null}
      </Shell>
    </LayoutStoreProvider>
  )
}
