import { createFileRoute, Outlet } from '@tanstack/react-router'
import { HomeIcon, HomeFillIcon, CommentDiscussionIcon, ZapIcon } from '@primer/octicons-react'
import { Shell } from '@/modules/Shell'
import { useAuthGuard, ContentSkeleton, AuthGuardStatus } from '@/modules/AuthGuard'
import { UserProvider } from '@/context/user.context'
import type { RailItemConfig } from '@primer-guidy/components-web'
import { CoreRoutes } from './routes'

const RAIL_ITEMS: readonly RailItemConfig[] = [
  { icon: HomeIcon, activeIcon: HomeFillIcon, labelKey: 'rail.items.home', path: CoreRoutes.Home },
  { icon: CommentDiscussionIcon, labelKey: 'rail.items.channels', path: CoreRoutes.Channels },
  { icon: ZapIcon, labelKey: 'rail.items.activity', path: CoreRoutes.Activity },
]

export const Route = createFileRoute('/_shell')({
  component: ShellLayout,
})

function ShellLayout() {
  const { status, user } = useAuthGuard()

  return (
    <Shell railItems={RAIL_ITEMS} avatarSrc={user?.avatarUrl ?? undefined} avatarName={user?.name}>
      {status === AuthGuardStatus.Authenticated && user ? (
        <UserProvider value={user}>
          <Outlet />
        </UserProvider>
      ) : (
        <ContentSkeleton />
      )}
    </Shell>
  )
}
