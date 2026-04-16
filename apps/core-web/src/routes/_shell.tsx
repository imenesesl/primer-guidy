import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { HomeIcon, HomeFillIcon, CommentDiscussionIcon, ZapIcon } from '@primer/octicons-react'
import { Shell } from '@/modules/Shell'
import type { RailItemConfig } from '@primer-guidy/components-web'
import { CoreRoutes } from './routes'

const RAIL_ITEMS: readonly RailItemConfig[] = [
  { icon: HomeIcon, activeIcon: HomeFillIcon, labelKey: 'rail.items.home', path: CoreRoutes.Home },
  { icon: CommentDiscussionIcon, labelKey: 'rail.items.channels', path: CoreRoutes.Channels },
  { icon: ZapIcon, labelKey: 'rail.items.activity', path: CoreRoutes.Activity },
]

const MOCK_AVATAR_SRC = 'https://avatars.githubusercontent.com/u/0?v=4'

export const Route = createFileRoute('/_shell')({
  component: ShellLayout,
})

function ShellLayout() {
  const { t: tShell } = useTranslation('shell')

  return (
    <Shell railItems={RAIL_ITEMS} avatarSrc={MOCK_AVATAR_SRC} avatarAlt={tShell('rail.avatar.alt')}>
      <Outlet />
    </Shell>
  )
}
