import { CoreRoutes } from '@/utils/routes'
import type { TabConfig } from '@primer-guidy/components-web'

export const ACTIVITY_TABS: readonly TabConfig[] = [
  { labelKey: 'tabs.notifications', path: CoreRoutes.ActivityNotifications },
  { labelKey: 'tabs.history', path: CoreRoutes.ActivityHistory },
] as const
