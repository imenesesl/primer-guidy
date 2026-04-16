import { CoreRoutes } from '@/routes/routes'
import type { TabConfig } from './Directories.types'

export const DIRECTORY_TABS: readonly TabConfig[] = [
  { labelKey: 'tabs.users', path: CoreRoutes.DirectoriesUsers },
] as const
