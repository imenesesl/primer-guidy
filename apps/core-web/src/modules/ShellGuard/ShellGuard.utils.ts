import {
  HomeIcon,
  HomeFillIcon,
  CommentDiscussionIcon,
  ZapIcon,
  PeopleIcon,
  MegaphoneIcon,
  HashIcon,
  BellIcon,
  ClockIcon,
} from '@primer/octicons-react'
import type { RailItemConfig, SidebarItemConfig } from '@primer-guidy/components-web'
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

export const SIDEBAR_ITEMS_MAP: Record<string, readonly SidebarItemConfig[]> = {
  [CoreRoutes.Home]: [
    {
      icon: PeopleIcon,
      labelKey: 'sidebar.items.directories',
      path: CoreRoutes.Directories,
    },
  ],
  [CoreRoutes.Channels]: [
    {
      icon: HashIcon,
      labelKey: 'sidebar.items.general',
      path: CoreRoutes.ChannelsGeneral,
    },
    {
      icon: MegaphoneIcon,
      labelKey: 'sidebar.items.announcements',
      path: CoreRoutes.ChannelsAnnouncements,
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
