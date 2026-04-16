import { HomeIcon, HomeFillIcon, CommentDiscussionIcon, ZapIcon } from '@primer/octicons-react'
import type { RailItemConfig } from '@primer-guidy/components-web'
import { CoreRoutes } from '@/routes/routes'

export const RAIL_ITEMS: readonly RailItemConfig[] = [
  { icon: HomeIcon, activeIcon: HomeFillIcon, labelKey: 'rail.items.home', path: CoreRoutes.Home },
  { icon: CommentDiscussionIcon, labelKey: 'rail.items.channels', path: CoreRoutes.Channels },
  { icon: ZapIcon, labelKey: 'rail.items.activity', path: CoreRoutes.Activity },
]
