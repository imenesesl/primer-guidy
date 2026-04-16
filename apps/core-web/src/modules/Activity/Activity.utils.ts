import { CoreRoutes } from '@/routes/routes'
import type { TabConfig } from './Activity.types'

export const ACTIVITY_TABS: readonly TabConfig[] = [
  { labelKey: 'tabs.notifications', path: CoreRoutes.ActivityNotifications },
  { labelKey: 'tabs.history', path: CoreRoutes.ActivityHistory },
] as const
