import { CoreRoutes } from '@/routes/routes'
import type { TabConfig } from './Channels.types'

export const CHANNEL_TABS: readonly TabConfig[] = [
  { labelKey: 'tabs.general', path: CoreRoutes.ChannelsGeneral },
  { labelKey: 'tabs.announcements', path: CoreRoutes.ChannelsAnnouncements },
] as const
