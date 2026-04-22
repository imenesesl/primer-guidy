import { CoreRoutes } from '@/utils/routes'
import type { TabConfig } from '@primer-guidy/components-web'

export const DIRECTORY_TABS: readonly TabConfig[] = [
  { labelKey: 'tabs.users', path: CoreRoutes.DirectoriesUsers },
] as const
