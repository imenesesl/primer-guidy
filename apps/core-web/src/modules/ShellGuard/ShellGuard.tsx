import { useMemo } from 'react'
import { Outlet } from '@tanstack/react-router'
import { createLayoutStore, LayoutStoreProvider, Shell } from '@primer-guidy/components-web'
import { useAuthGuard, ContentSkeleton, AuthGuardStatus } from '@/modules/AuthGuard'
import { useChannels } from '@/services/channel'
import { UserProvider } from '@/context/user.context'
import { RAIL_ITEMS, buildSidebarItemsMap } from './ShellGuard.utils'
import { useBreadcrumbResolver } from './useBreadcrumbResolver'

export const ShellGuard = () => {
  const { status, user } = useAuthGuard()
  const layoutStore = useMemo(() => createLayoutStore(), [])
  const { data: channels } = useChannels(user?.uid ?? '')

  const sidebarItemsMap = useMemo(() => buildSidebarItemsMap(channels ?? []), [channels])

  const breadcrumbResolver = useBreadcrumbResolver(channels)

  return (
    <LayoutStoreProvider value={layoutStore}>
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={sidebarItemsMap}
        avatarSrc={user?.avatarUrl ?? undefined}
        avatarName={user?.name}
        userName={user?.name}
        breadcrumbResolver={breadcrumbResolver}
      >
        {status === AuthGuardStatus.Authenticated && user ? (
          <UserProvider value={user}>
            <Outlet />
          </UserProvider>
        ) : (
          <ContentSkeleton />
        )}
      </Shell>
    </LayoutStoreProvider>
  )
}
