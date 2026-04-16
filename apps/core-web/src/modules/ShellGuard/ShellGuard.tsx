import { useMemo } from 'react'
import { Outlet } from '@tanstack/react-router'
import { createLayoutStore, LayoutStoreProvider } from '@primer-guidy/components-web'
import { Shell } from '@/modules/Shell'
import { useAuthGuard, ContentSkeleton, AuthGuardStatus } from '@/modules/AuthGuard'
import { UserProvider } from '@/context/user.context'
import { RAIL_ITEMS } from './ShellGuard.utils'

export const ShellGuard = () => {
  const { status, user } = useAuthGuard()
  const layoutStore = useMemo(() => createLayoutStore(), [])

  return (
    <LayoutStoreProvider value={layoutStore}>
      <Shell
        railItems={RAIL_ITEMS}
        avatarSrc={user?.avatarUrl ?? undefined}
        avatarName={user?.name}
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
