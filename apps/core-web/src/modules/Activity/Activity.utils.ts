import { CoreRoutes } from '@/routes/routes'
import type { TabConfig } from '@/modules/TabLayout'

export const ACTIVITY_TABS: readonly TabConfig[] = [
  { labelKey: 'tabs.notifications', path: CoreRoutes.ActivityNotifications },
  { labelKey: 'tabs.history', path: CoreRoutes.ActivityHistory },
] as const
