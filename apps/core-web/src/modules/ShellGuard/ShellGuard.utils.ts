import {
  HomeIcon,
  HomeFillIcon,
  CommentDiscussionIcon,
  ZapIcon,
  PeopleIcon,
} from '@primer/octicons-react'
import type { RailItemConfig, SidebarItemConfig } from '@primer-guidy/components-web'
import { CoreRoutes } from '@/routes/routes'

export const RAIL_ITEMS: readonly RailItemConfig[] = [
  {
    icon: HomeIcon,
    activeIcon: HomeFillIcon,
    labelKey: 'rail.items.home',
    path: CoreRoutes.Home,
    alwaysActive: true,
  },
  { icon: CommentDiscussionIcon, labelKey: 'rail.items.channels', path: CoreRoutes.Channels },
  { icon: ZapIcon, labelKey: 'rail.items.activity', path: CoreRoutes.Activity },
]

export const SIDEBAR_ITEMS: readonly SidebarItemConfig[] = [
  {
    icon: PeopleIcon,
    labelKey: 'sidebar.items.directories',
    path: CoreRoutes.Directories,
  },
]
