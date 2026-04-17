import { CoreRoutes } from '@/routes/routes'
import type { TabConfig } from '@/modules/TabLayout'

export const DIRECTORY_TABS: readonly TabConfig[] = [
  { labelKey: 'tabs.users', path: CoreRoutes.DirectoriesUsers },
] as const
