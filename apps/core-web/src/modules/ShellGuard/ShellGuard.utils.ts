import {
  HomeIcon,
  HomeFillIcon,
  CommentDiscussionIcon,
  ZapIcon,
  PeopleIcon,
  HashIcon,
  BellIcon,
  ClockIcon,
} from '@primer/octicons-react'
import type { RailItemConfig, SidebarItemConfig } from '@primer-guidy/components-web'
import type { ChannelDocument } from '@/services/channel'
import { CoreRoutes } from '@/routes/routes'

export const RAIL_ITEMS: readonly RailItemConfig[] = [
  {
    icon: HomeIcon,
    activeIcon: HomeFillIcon,
    labelKey: 'rail.items.home',
    path: CoreRoutes.Home,
    fallbackActive: true,
  },
  { icon: CommentDiscussionIcon, labelKey: 'rail.items.channels', path: CoreRoutes.Channels },
  { icon: ZapIcon, labelKey: 'rail.items.activity', path: CoreRoutes.Activity },
]

const STATIC_SIDEBAR: Record<string, readonly SidebarItemConfig[]> = {
  [CoreRoutes.Home]: [
    {
      icon: PeopleIcon,
      labelKey: 'sidebar.items.directories',
      path: CoreRoutes.Directories,
    },
  ],
  [CoreRoutes.Activity]: [
    {
      icon: BellIcon,
      labelKey: 'sidebar.items.notifications',
      path: CoreRoutes.ActivityNotifications,
    },
    {
      icon: ClockIcon,
      labelKey: 'sidebar.items.history',
      path: CoreRoutes.ActivityHistory,
    },
  ],
}

export const buildSidebarItemsMap = (
  channels: readonly ChannelDocument[],
): Record<string, readonly SidebarItemConfig[]> => ({
  ...STATIC_SIDEBAR,
  [CoreRoutes.Channels]: [
    {
      icon: HashIcon,
      labelKey: 'sidebar.items.allChannels',
      path: CoreRoutes.Channels,
      children: channels.map((ch) => ({
        icon: HashIcon,
        label: ch.name,
        path: `${CoreRoutes.Channels}/${ch.id}`,
        disabled: !ch.active,
      })),
    },
  ],
})
